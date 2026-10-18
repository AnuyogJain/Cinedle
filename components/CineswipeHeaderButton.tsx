"use client";

import { Clapperboard } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CineswipeAboutDialog } from "./CineswipeAboutDialog";
import { useCineswipeAppUrl } from "./CineswipeAppUrlProvider";

export function CineswipeHeaderButton() {
  const appUrl = useCineswipeAppUrl();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="appearance-toggle shrink-0"
        onClick={() => setOpen(true)}
        aria-label="About CineSwipe"
        title="CineSwipe"
      >
        <Clapperboard className="h-5 w-5" aria-hidden />
      </Button>
      <CineswipeAboutDialog
        open={open}
        onClose={() => setOpen(false)}
        appUrl={appUrl}
      />
    </>
  );
}
