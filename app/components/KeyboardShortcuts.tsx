"use client";

import { useEffect } from "react";

interface KeyboardShortcutsProps {
  onPlayPause: () => void;
  onSeekBackward: () => void;
  onSeekForward: () => void;
  onNext: () => void;
  onPrev: () => void;
  onQueueToggle: () => void;
}

export function KeyboardShortcuts({
  onPlayPause,
  onSeekBackward,
  onSeekForward,
  onNext,
  onPrev,
  onQueueToggle,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          onPlayPause();
          break;
        case "arrowleft":
          e.preventDefault();
          onSeekBackward();
          break;
        case "arrowright":
          e.preventDefault();
          onSeekForward();
          break;
        case "n":
          onNext();
          break;
        case "p":
          onPrev();
          break;
        case "q":
          onQueueToggle();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onPlayPause, onSeekBackward, onSeekForward, onNext, onPrev, onQueueToggle]);

  return null;
}
