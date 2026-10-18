"use client";

import { forwardRef, useCallback, useEffect, useRef, type Ref } from "react";
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

export function SubmittedGuessHistory({
  wordLengths,
  submitted,
}: {
  wordLengths: number[];
  submitted: GuessRow[];
}) {
  return (
    <div className="flex min-h-min flex-col items-center justify-end gap-6 py-3">
      {submitted.map((row, ri) => (
        <GuessLine key={`sub-${ri}`} wordLengths={wordLengths} row={row} />
      ))}
    </div>
  );
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

function GuessLine({
  wordLengths,
  row,
}: {
  wordLengths: number[];
  row: GuessRow;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      {wordLengths.map((len, wi) => (
        <div key={`w-${wi}`} className="flex max-w-full justify-center gap-1">
          {Array.from({ length: len }).map((_, li) => {
            const ch = row.words[wi]?.[li] ?? "";
            const state = row.states[wi]?.[li] ?? "absent";
            return <StaticCell key={`${wi}-${li}`} letter={ch} state={state} />;
          })}
        </div>
      ))}
    </div>
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
    <div className="flex flex-col items-center gap-2">
      {wordLengths.map((len, wi) => (
        <div key={`dw-${wi}`} className="flex max-w-full justify-center gap-1">
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
        </div>
      ))}
    </div>
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
      className={`relative flex h-10 w-10 items-center justify-center rounded-lg sm:h-11 sm:w-11 ${draftTileClass(
        hasLetter,
        isActive
      )}`}
    >
      <input
        ref={ref}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        aria-label="Letter"
        disabled={disabled}
        value={letter}
        maxLength={1}
        className="absolute inset-0 z-10 cursor-text rounded-lg bg-transparent text-center text-base font-bold uppercase text-foreground caret-transparent outline-none disabled:cursor-default"
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
        className={`pointer-events-none text-base font-bold uppercase ${
          hasLetter ? "text-foreground" : "text-transparent"
        }`}
      >
        {letter}
      </span>
    </div>
  );
});

function StaticCell({ letter, state }: { letter: string; state: CellState }) {
  return (
    <span
      className={`flex h-10 w-10 items-center justify-center rounded-lg text-base font-bold uppercase sm:h-11 sm:w-11 ${tileClass(
        state
      )}`}
    >
      {letter}
    </span>
  );
}
