"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  type Ref,
} from "react";
import type { TileState } from "@/lib/grading";
import { flatCellIndex, type DraftGrid } from "@/lib/draft-grid";

type CellState = TileState | "empty" | "active";

function tileClass(state: CellState) {
  if (state === "empty") return "tile";
  if (state === "active") return "tile ring-2 ring-accent-text/60";
  return `tile tile-${state}`;
}

function draftTileClass(hasLetter: boolean, isActive: boolean) {
  if (isActive) {
    return hasLetter
      ? "tile tile-filled ring-2 ring-accent-text/70"
      : "tile tile-empty ring-2 ring-accent-text/70";
  }
  return hasLetter ? "tile tile-filled" : "tile tile-empty";
}

export interface GuessRow {
  words: string[];
  states: TileState[][];
}

export function SubmittedGuessLine({
  wordLengths,
  row,
}: {
  wordLengths: number[];
  row: GuessRow;
}) {
  return <GuessLine wordLengths={wordLengths} row={row} />;
}

export function DraftGuessRow({
  wordLengths,
  draftGrid,
  activeWordIndex,
  activeLetterIndex,
  onFocusCell,
  onCellLetter,
  onCellBackspace,
  onSubmit,
  inputEnabled,
}: {
  wordLengths: number[];
  draftGrid: DraftGrid;
  activeWordIndex: number;
  activeLetterIndex: number;
  onFocusCell: (wordIndex: number, letterIndex: number) => void;
  onCellLetter: (
    wordIndex: number,
    letterIndex: number,
    letter: string
  ) => void;
  onCellBackspace: (wordIndex: number, letterIndex: number) => void;
  onSubmit: () => void;
  inputEnabled: boolean;
}) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const totalCells = wordLengths.reduce((sum, n) => sum + n, 0);

  const focusCell = useCallback(
    (wordIndex: number, letterIndex: number) => {
      const flat = flatCellIndex(wordIndex, letterIndex, wordLengths);
      inputRefs.current[flat]?.focus();
    },
    [wordLengths]
  );

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, totalCells);
  }, [totalCells]);

  useEffect(() => {
    if (!inputEnabled) return;
    focusCell(activeWordIndex, activeLetterIndex);
  }, [activeWordIndex, activeLetterIndex, focusCell, inputEnabled]);

  return (
    <DraftLine
      wordLengths={wordLengths}
      draftGrid={draftGrid}
      activeWordIndex={activeWordIndex}
      activeLetterIndex={activeLetterIndex}
      inputEnabled={inputEnabled}
      inputRefs={inputRefs}
      onFocusCell={onFocusCell}
      onCellLetter={onCellLetter}
      onCellBackspace={onCellBackspace}
      onSubmit={onSubmit}
    />
  );
}

export function getTileMetrics(wordLengths: number[]) {
  const maxLen = wordLengths.length > 0 ? Math.max(...wordLengths) : 5;

  if (maxLen <= 8) {
    return {
      cellSize: 40,
      cellSizeSm: 44,
      fontSize: 16,
      fontSizeSm: 18,
      gap: 4,
      gapSm: 4,
      radius: 8,
      radiusSm: 8,
    };
  }

  // Safe width on standard mobile viewports (e.g. 360px - 390px minus container padding)
  const targetMobileWidth = 316;
  const mobileGap = maxLen >= 11 ? 2 : 3;
  const calculatedMobileSize = Math.floor(
    (targetMobileWidth - (maxLen - 1) * mobileGap) / maxLen
  );
  const cellSize = Math.min(40, Math.max(18, calculatedMobileSize));
  const fontSize = Math.max(10, Math.round(cellSize * 0.46));
  const radius = cellSize < 28 ? 5 : 6;

  // On desktop / sm breakpoint, allow up to 460px width
  const targetDesktopWidth = 460;
  const desktopGap = maxLen >= 11 ? 3 : 4;
  const calculatedDesktopSize = Math.floor(
    (targetDesktopWidth - (maxLen - 1) * desktopGap) / maxLen
  );
  const cellSizeSm = Math.min(44, Math.max(24, calculatedDesktopSize));
  const fontSizeSm = Math.max(12, Math.round(cellSizeSm * 0.45));
  const radiusSm = cellSizeSm < 32 ? 6 : 8;

  return {
    cellSize,
    cellSizeSm,
    fontSize,
    fontSizeSm,
    gap: mobileGap,
    gapSm: desktopGap,
    radius,
    radiusSm,
  };
}

function WordFlowShell({
  children,
  wordLengths,
}: {
  children: ReactNode;
  wordLengths?: number[];
}) {
  const metrics = wordLengths ? getTileMetrics(wordLengths) : null;
  const maxLen =
    wordLengths && wordLengths.length > 0 ? Math.max(...wordLengths) : 0;
  const isCompact = maxLen > 8;

  const style = metrics
    ? ({
        "--cell-size": `${metrics.cellSize}px`,
        "--cell-size-sm": `${metrics.cellSizeSm}px`,
        "--cell-font-size": `${metrics.fontSize}px`,
        "--cell-font-size-sm": `${metrics.fontSizeSm}px`,
        "--cell-gap": `${metrics.gap}px`,
        "--cell-gap-sm": `${metrics.gapSm}px`,
        "--cell-radius": `${metrics.radius}px`,
        "--cell-radius-sm": `${metrics.radiusSm}px`,
      } as React.CSSProperties)
    : undefined;

  return (
    <div
      style={style}
      className={`flex w-full max-w-full flex-wrap items-center justify-center px-0.5 ${
        isCompact
          ? "gap-x-3 gap-y-2 sm:gap-x-5 sm:gap-y-2.5"
          : "gap-x-5 gap-y-2.5 sm:gap-x-6"
      }`}
    >
      {children}
    </div>
  );
}

function WordTileGroup({ children }: { children: ReactNode }) {
  return (
    <div className="flex shrink-0 gap-[var(--cell-gap,0.25rem)] sm:gap-[var(--cell-gap-sm,0.25rem)]">
      {children}
    </div>
  );
}

function GuessLine({
  wordLengths,
  row,
}: {
  wordLengths: number[];
  row: GuessRow;
}) {
  return (
    <WordFlowShell wordLengths={wordLengths}>
      {wordLengths.map((len, wi) => (
        <WordTileGroup key={`w-${wi}`}>
          {Array.from({ length: len }).map((_, li) => {
            const ch = row.words[wi]?.[li] ?? "";
            const state = row.states[wi]?.[li] ?? "absent";
            return <StaticCell key={`${wi}-${li}`} letter={ch} state={state} />;
          })}
        </WordTileGroup>
      ))}
    </WordFlowShell>
  );
}

function DraftLine({
  wordLengths,
  draftGrid,
  activeWordIndex,
  activeLetterIndex,
  inputEnabled,
  inputRefs,
  onFocusCell,
  onCellLetter,
  onCellBackspace,
  onSubmit,
}: {
  wordLengths: number[];
  draftGrid: DraftGrid;
  activeWordIndex: number;
  activeLetterIndex: number;
  inputEnabled: boolean;
  inputRefs: React.MutableRefObject<Array<HTMLInputElement | null>>;
  onFocusCell: (wordIndex: number, letterIndex: number) => void;
  onCellLetter: (
    wordIndex: number,
    letterIndex: number,
    letter: string
  ) => void;
  onCellBackspace: (wordIndex: number, letterIndex: number) => void;
  onSubmit: () => void;
}) {
  return (
    <WordFlowShell wordLengths={wordLengths}>
      {wordLengths.map((len, wi) => (
        <WordTileGroup key={`dw-${wi}`}>
          {Array.from({ length: len }).map((_, li) => {
            const letter = draftGrid[wi]?.[li] ?? "";
            const isActive =
              inputEnabled &&
              wi === activeWordIndex &&
              li === activeLetterIndex;
            const flat = flatCellIndex(wi, li, wordLengths);
            return (
              <DraftCell
                key={`${wi}-${li}`}
                ref={(el) => {
                  inputRefs.current[flat] = el;
                }}
                letter={letter}
                isActive={isActive}
                disabled={!inputEnabled}
                onFocus={() => onFocusCell(wi, li)}
                onLetter={(value) => onCellLetter(wi, li, value)}
                onBackspace={() => onCellBackspace(wi, li)}
                onSubmit={onSubmit}
              />
            );
          })}
        </WordTileGroup>
      ))}
    </WordFlowShell>
  );
}

const DraftCell = forwardRef(function DraftCell(
  {
    letter,
    isActive,
    disabled,
    onFocus,
    onLetter,
    onBackspace,
    onSubmit,
  }: {
    letter: string;
    isActive: boolean;
    disabled: boolean;
    onFocus: () => void;
    onLetter: (value: string) => void;
    onBackspace: () => void;
    onSubmit: () => void;
  },
  ref: Ref<HTMLInputElement>
) {
  const hasLetter = letter.length > 0;

  return (
    <div
      className={`tile-cell relative flex shrink-0 items-center justify-center ${draftTileClass(
        hasLetter,
        isActive
      )}`}
    >
      <input
        ref={ref}
        type="text"
        inputMode="none"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        aria-label="Letter"
        disabled={disabled}
        value={letter}
        maxLength={1}
        className="absolute inset-0 z-10 cursor-text rounded-[inherit] bg-transparent text-center font-bold uppercase text-foreground caret-transparent outline-none disabled:cursor-default"
        style={{ fontSize: "inherit" }}
        onFocus={onFocus}
        onChange={(e) => {
          const raw = e.target.value;
          if (!raw) {
            onBackspace();
            return;
          }
          onLetter(raw);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          } else if (e.key === "Backspace" && !letter) {
            e.preventDefault();
            onBackspace();
          }
        }}
      />
      <span
        className={`pointer-events-none font-bold uppercase ${
          hasLetter ? "text-foreground" : "text-transparent"
        }`}
        style={{ fontSize: "inherit" }}
      >
        {letter}
      </span>
    </div>
  );
});

function StaticCell({ letter, state }: { letter: string; state: CellState }) {
  return (
    <span
      className={`tile-cell flex shrink-0 items-center justify-center font-bold uppercase ${tileClass(
        state
      )}`}
    >
      {letter}
    </span>
  );
}
