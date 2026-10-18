"use client";

import { Delete } from "lucide-react";
import type { TileState } from "@/lib/grading";

const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"] as const;

function bestState(
  current: TileState | undefined,
  next: TileState,
): TileState {
  const rank: Record<TileState, number> = {
    absent: 0,
    elsewhere: 1,
    present: 2,
    correct: 3,
  };
  if (!current) return next;
  return rank[next] > rank[current] ? next : current;
}

export function GameKeyboard({
  letterStates,
  onKey,
  onEnter,
  onBackspace,
  disabled,
}: {
  letterStates: Map<string, TileState>;
  onKey: (letter: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-lg space-y-1.5 px-2 pb-4 pt-2">
      {ROWS.map((row, ri) => (
        <div
          key={row}
          className={`flex justify-center gap-1 ${ri === 1 ? "px-4" : ""}`}
        >
          {row.split("").map((letter) => {
            const state = letterStates.get(letter);
            return (
              <button
                key={letter}
                type="button"
                disabled={disabled}
                onClick={() => onKey(letter)}
                className={`key-btn flex h-12 min-w-[2rem] flex-1 items-center justify-center rounded-lg text-sm font-bold uppercase disabled:opacity-50 ${keyClass(state)}`}
              >
                {letter}
              </button>
            );
          })}
          {ri === 1 ? (
            <button
              type="button"
              disabled={disabled}
              onClick={onBackspace}
              aria-label="Backspace"
              className="key-btn flex h-12 w-12 items-center justify-center rounded-lg disabled:opacity-50"
            >
              <Delete className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      ))}
      <div className="flex justify-center gap-1 px-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onEnter}
          className="key-btn h-12 flex-1 max-w-[12rem] rounded-lg text-sm font-bold uppercase disabled:opacity-50"
        >
          Enter
        </button>
      </div>
    </div>
  );
}

function keyClass(state: TileState | undefined) {
  if (!state) return "key-btn-unused";
  if (state === "absent") return "key-btn-absent";
  if (state === "correct") return "key-btn-correct";
  if (state === "present") return "key-btn-present";
  return "key-btn-elsewhere";
}

export function mergeLetterStates(
  rows: Array<{ states: TileState[][]; words: string[] }>,
): Map<string, TileState> {
  const map = new Map<string, TileState>();
  for (const row of rows) {
    row.words.forEach((word, wi) => {
      word.split("").forEach((letter, li) => {
        const state = row.states[wi]?.[li];
        if (!state) return;
        map.set(letter, bestState(map.get(letter), state));
      });
    });
  }
  return map;
}
