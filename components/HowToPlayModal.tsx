"use client";

import { X } from "lucide-react";
import type { TileState } from "@/lib/grading";

export function HowToPlayModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal
      aria-labelledby="how-to-play-title"
    >
      <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900 p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="how-to-play-title" className="text-lg font-semibold">
            How to play
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted hover:bg-surface-hover"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-muted">
          Guess the secret <strong className="text-foreground">movie title</strong>.
          The blanks show how many letters are in each word. Use A–Z only—type
          spaces between words when you submit.
        </p>

        <ul className="mb-5 space-y-2 text-sm text-muted">
          <LegendItem state="correct" label="Green — correct letter and spot in that word" />
          <LegendItem state="present" label="Yellow — in that word, wrong spot" />
          <LegendItem
            state="elsewhere"
            label="Purple — in the title, but a different word"
          />
          <LegendItem state="absent" label="Gray — not in the title" />
        </ul>

        <section className="space-y-4 border-t border-white/10 pt-4">
          <ExampleBlock
            scenario='Answer is "To You". You guess the first word:'
            words={[{ letters: "BY", states: ["absent", "elsewhere"] }]}
            caption="Y is somewhere in the title, just not in this word."
          />

          <ExampleBlock
            scenario='Same answer. You guess "TO" and "UOY":'
            words={[
              { letters: "TO", states: ["correct", "correct"] },
              { letters: "UOY", states: ["present", "correct", "present"] },
            ]}
            caption="O is locked in on the second word. U and the other letters are in that word but not in those spots."
          />

          <ExampleBlock
            scenario="You found it:"
            words={[
              { letters: "NO", states: ["correct", "correct"] },
              { letters: "WAY", states: ["correct", "correct", "correct"] },
            ]}
            caption="Every letter green — that’s the title."
          />
        </section>
      </div>
    </div>
  );
}

function LegendItem({
  state,
  label,
}: {
  state: TileState;
  label: string;
}) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${tileClass(state)}`}
        aria-hidden
      >
        A
      </span>
      <span>{label}</span>
    </li>
  );
}

function ExampleBlock({
  scenario,
  words,
  caption,
}: {
  scenario: string;
  words: Array<{ letters: string; states: TileState[] }>;
  caption: string;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-foreground">{scenario}</p>
      <ExampleRow words={words} />
      <p className="text-xs text-subtle">{caption}</p>
    </div>
  );
}

function tileClass(state: TileState | "empty") {
  if (state === "empty") return "tile text-transparent";
  return `tile tile-${state} text-sm font-bold uppercase`;
}

function ExampleRow({
  words,
}: {
  words: Array<{ letters: string; states: TileState[] }>;
}) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      {words.map((w) => (
        <div key={w.letters} className="flex gap-1">
          {w.letters.split("").map((ch, i) => (
            <span
              key={`${w.letters}-${i}`}
              className={`flex h-9 w-9 items-center justify-center rounded-md ${tileClass(w.states[i] ?? "absent")}`}
            >
              {ch}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
