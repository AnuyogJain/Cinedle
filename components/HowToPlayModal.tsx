"use client";

import type { TileState } from "@/lib/grading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export function HowToPlayModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90dvh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>How to play</DialogTitle>
          <DialogDescription>
            Guess the secret{" "}
            <strong className="text-foreground">movie title</strong>. The blanks
            show how many letters are in each word. Use A–Z only—type spaces
            between words when you submit.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 text-sm text-muted-foreground">
          <LegendItem
            state="correct"
            label="Green — correct letter and spot in that word"
          />
          <LegendItem
            state="present"
            label="Yellow — in that word, wrong spot"
          />
          <LegendItem
            state="elsewhere"
            label="Purple — in the title, but a different word"
          />
          <LegendItem state="absent" label="Gray — not in the title" />
        </ul>

        <Separator className="bg-border" />

        <section className="space-y-4">
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
      </DialogContent>
    </Dialog>
  );
}

function LegendItem({ state, label }: { state: TileState; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${tileClass(
          state,
        )}`}
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
              className={`flex h-9 w-9 items-center justify-center rounded-md ${tileClass(
                w.states[i] ?? "absent",
              )}`}
            >
              {ch}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
