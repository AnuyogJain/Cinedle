"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TileState } from "@/lib/grading";
import {
  clearDraftCell,
  draftGridToGuessText,
  draftGridToWords,
  emptyDraftGrid,
  isDraftComplete,
  nextCell,
  prevCell,
  setDraftCell,
  type DraftGrid,
} from "@/lib/draft-grid";
import {
  getLocalProgress,
  upsertLocalProgress,
  type StoredGuessRow,
  type StoredProgress,
} from "@/lib/progress-local";
import {
  persistEntryToServer,
  pullServerProgressIntoLocal,
} from "@/lib/progress-remote-sync";
import { GameHeader } from "./GameHeader";
import { mergeKeyboardHints } from "@/lib/keyboard-hints";
import { GameKeyboard } from "./GameKeyboard";
import { HowToPlayModal } from "./HowToPlayModal";
import { DraftGuessRow, SubmittedGuessLine, type GuessRow } from "./PuzzleGrid";
import { PuzzleLoadError } from "./PuzzleLoadError";
import { WinModal } from "./WinModal";
import type { PuzzleErrorCode } from "@/lib/puzzle-errors";

interface PuzzleView {
  puzzleKey: string;
  mode: "daily" | "unlimited";
  date: string | null;
  wordLengths: number[];
  letterCounts: Record<string, number>;
}

interface FilterQuery {
  genres: string;
  country: string;
}

export function GamePlay({
  puzzleKey,
  filterQuery,
  backHref,
  subtitle,
}: {
  puzzleKey: string;
  filterQuery: FilterQuery;
  backHref: string;
  subtitle?: string;
}) {
  const [puzzle, setPuzzle] = useState<PuzzleView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    message: string;
    code?: PuzzleErrorCode | string;
  } | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [submitted, setSubmitted] = useState<GuessRow[]>([]);
  const [draftGrid, setDraftGrid] = useState<DraftGrid>([]);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [activeLetterIndex, setActiveLetterIndex] = useState(0);
  const [won, setWon] = useState(false);
  const [reveal, setReveal] = useState<{
    displayTitle: string;
    year: number;
    posterPath: string | null;
    tmdbId: number | null;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(false);
  const boardScrollRef = useRef<HTMLElement>(null);

  const scrollBoardToBottom = useCallback(() => {
    const el = boardScrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    });
  }, []);

  useEffect(() => {
    scrollBoardToBottom();
  }, [submitted.length, scrollBoardToBottom]);

  const loadPuzzle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await pullServerProgressIntoLocal();

      const params = new URLSearchParams({ key: puzzleKey });
      if (filterQuery.genres) params.set("genres", filterQuery.genres);
      if (filterQuery.country) params.set("country", filterQuery.country);
      const res = await fetch(`/api/puzzle?${params}`);
      const data: unknown = await res.json();
      if (!res.ok) {
        const err = data as { error?: string; code?: PuzzleErrorCode | string };
        setError({
          message: err.error ?? "Failed to load puzzle",
          code: err.code,
        });
        setPuzzle(null);
        return;
      }
      const puzzleData = data as PuzzleView;
      setPuzzle(puzzleData);
      setDraftGrid(emptyDraftGrid(puzzleData.wordLengths));
      setActiveWordIndex(0);
      setActiveLetterIndex(0);

      const local = getLocalProgress(puzzleKey);
      if (local?.guesses?.length) {
        setSubmitted(
          local.guesses.map((g) => ({
            words: g.words,
            states: g.states as TileState[][],
          }))
        );
        setWon(local.solved);
        if (local.solved && local.revealTitle) {
          setReveal({
            displayTitle: local.revealTitle,
            year: local.revealYear ?? 0,
            posterPath: null,
            tmdbId: null,
          });

          const last = local.guesses[local.guesses.length - 1];
          if (last?.words.length) {
            const guessText = last.words.join(" ");
            const guessesJson = JSON.stringify(
              local.guesses.map((g) => ({ words: g.words, states: g.states }))
            );
            const gradeRes = await fetch("/api/puzzle/grade", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                puzzleKey,
                guess: guessText,
                genres: filterQuery.genres || undefined,
                country: filterQuery.country || undefined,
                guessesJson,
              }),
            });
            const gradeData = await gradeRes.json();
            if (
              gradeRes.ok &&
              gradeData.won &&
              gradeData.reveal?.displayTitle
            ) {
              setReveal(gradeData.reveal);
              upsertLocalProgress({
                ...local,
                revealTitle: gradeData.reveal.displayTitle,
                revealYear: gradeData.reveal.year,
              });
            }
          }
        }
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : "Failed to load",
      });
      setPuzzle(null);
    } finally {
      setLoading(false);
    }
  }, [puzzleKey, filterQuery.country, filterQuery.genres]);

  useEffect(() => {
    void loadPuzzle();
  }, [loadPuzzle]);

  const letterStates = useMemo(
    () => mergeKeyboardHints(puzzle?.letterCounts ?? {}, submitted),
    [puzzle?.letterCounts, submitted]
  );

  const persist = useCallback(
    (
      rows: GuessRow[],
      solved: boolean,
      revealData?: {
        displayTitle: string;
        year: number;
        posterPath: string | null;
        tmdbId?: number | null;
      }
    ) => {
      const guesses: StoredGuessRow[] = rows.map((r) => ({
        words: r.words,
        states: r.states,
      }));
      const entry: StoredProgress = {
        puzzleKey,
        mode: puzzle?.mode ?? "daily",
        solved,
        guessCount: rows.length,
        guesses,
        completedAt: solved ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
        revealTitle: revealData?.displayTitle,
        revealYear: revealData?.year,
      };
      upsertLocalProgress(entry);
      void persistEntryToServer(entry);
    },
    [puzzle?.mode, puzzleKey]
  );

  const submitGuess = useCallback(async () => {
    if (!puzzle || won || busy) return;
    if (!isDraftComplete(draftGrid, puzzle.wordLengths)) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    const guessText = draftGridToGuessText(draftGrid);

    setBusy(true);
    try {
      const nextGuesses = [...submitted];
      const guessesJson = JSON.stringify(
        nextGuesses.map((r) => ({ words: r.words, states: r.states }))
      );

      const res = await fetch("/api/puzzle/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          puzzleKey,
          guess: guessText,
          genres: filterQuery.genres || undefined,
          country: filterQuery.country || undefined,
          guessesJson,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setShake(true);
        setTimeout(() => setShake(false), 400);
        setError(data.error ?? "Invalid guess");
        return;
      }

      const row: GuessRow = {
        words: draftGridToWords(draftGrid),
        states: data.states as TileState[][],
      };
      const rows = [...submitted, row];
      setSubmitted(rows);
      setDraftGrid(emptyDraftGrid(puzzle.wordLengths));
      setActiveWordIndex(0);
      setActiveLetterIndex(0);

      if (data.won) {
        setWon(true);
        setReveal(data.reveal);
        persist(rows, true, data.reveal ?? undefined);
      } else {
        persist(rows, false);
      }
    } finally {
      setBusy(false);
    }
  }, [
    puzzle,
    won,
    busy,
    draftGrid,
    submitted,
    puzzleKey,
    filterQuery,
    persist,
  ]);

  const focusCell = useCallback((wordIndex: number, letterIndex: number) => {
    setActiveWordIndex(wordIndex);
    setActiveLetterIndex(letterIndex);
  }, []);

  const applyLetter = useCallback(
    (wordIndex: number, letterIndex: number, letter: string) => {
      if (!puzzle || won) return;
      setDraftGrid((grid) =>
        setDraftCell(grid, wordIndex, letterIndex, letter)
      );
      const next = nextCell(wordIndex, letterIndex, puzzle.wordLengths);
      if (next) {
        setActiveWordIndex(next.wordIndex);
        setActiveLetterIndex(next.letterIndex);
      }
    },
    [puzzle, won]
  );

  const applyBackspace = useCallback(
    (wordIndex: number, letterIndex: number) => {
      if (!puzzle || won) return;
      const current = draftGrid[wordIndex]?.[letterIndex] ?? "";
      if (current) {
        setDraftGrid((grid) => clearDraftCell(grid, wordIndex, letterIndex));
        setActiveWordIndex(wordIndex);
        setActiveLetterIndex(letterIndex);
        return;
      }
      const prev = prevCell(wordIndex, letterIndex, puzzle.wordLengths);
      if (!prev) return;
      setDraftGrid((grid) =>
        clearDraftCell(grid, prev.wordIndex, prev.letterIndex)
      );
      setActiveWordIndex(prev.wordIndex);
      setActiveLetterIndex(prev.letterIndex);
    },
    [draftGrid, puzzle, won]
  );

  const typeLetter = useCallback(
    (letter: string) => {
      applyLetter(activeWordIndex, activeLetterIndex, letter);
    },
    [activeLetterIndex, activeWordIndex, applyLetter]
  );

  const backspace = useCallback(() => {
    applyBackspace(activeWordIndex, activeLetterIndex);
  }, [activeLetterIndex, activeWordIndex, applyBackspace]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4">
        <GameHeader
          backHref={backHref}
          onHelp={() => setHelpOpen(true)}
          subtitle={subtitle}
        />
        <p className="py-20 text-center text-sm text-muted">Loading puzzle…</p>
      </div>
    );
  }

  if (error || !puzzle) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4">
        <GameHeader
          backHref={backHref}
          onHelp={() => setHelpOpen(true)}
          subtitle={subtitle}
        />
        <PuzzleLoadError
          code={error?.code}
          message={
            error?.message ?? "Something went wrong loading this puzzle."
          }
          backHref={backHref}
          filterQuery={filterQuery}
          onRetry={() => void loadPuzzle()}
        />
        <HowToPlayModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-dvh max-h-dvh w-full max-w-lg flex-col overflow-hidden px-4">
      <GameHeader
        backHref={backHref}
        onHelp={() => setHelpOpen(true)}
        subtitle={subtitle}
      />
      <main
        ref={boardScrollRef}
        className={`scrollbar-hidden flex min-h-0 w-full flex-1 flex-col overflow-y-auto overscroll-contain ${
          shake ? "animate-pulse" : ""
        }`}
      >
        <div className="flex w-full flex-col items-center gap-6 py-3">
          {submitted.map((row, ri) => (
            <SubmittedGuessLine
              key={`sub-${ri}`}
              wordLengths={puzzle.wordLengths}
              row={row}
            />
          ))}
          {!won ? (
            <DraftGuessRow
              wordLengths={puzzle.wordLengths}
              draftGrid={draftGrid}
              activeWordIndex={activeWordIndex}
              activeLetterIndex={activeLetterIndex}
              onFocusCell={focusCell}
              onCellLetter={applyLetter}
              onCellBackspace={applyBackspace}
              onSubmit={() => void submitGuess()}
              inputEnabled={!won && !busy}
            />
          ) : null}
        </div>
        <div className="glass-panel sticky bottom-0 z-10 mt-auto rounded-t-2xl border-x-0 border-b-0 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-8px_32px_rgb(0_0_0/0.35)]">
          <GameKeyboard
            letterStates={letterStates}
            onKey={typeLetter}
            onEnter={() => void submitGuess()}
            onBackspace={backspace}
            disabled={busy || won}
          />
        </div>
      </main>
      <HowToPlayModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <WinModal
        open={won && reveal != null}
        guessCount={submitted.length}
        title={reveal?.displayTitle ?? ""}
        year={reveal?.year ?? 0}
        posterPath={reveal?.posterPath ?? null}
        tmdbId={reveal?.tmdbId ?? null}
        onClose={() => setReveal(null)}
      />
    </div>
  );
}
