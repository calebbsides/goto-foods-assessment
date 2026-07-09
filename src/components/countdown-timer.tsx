"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/cn";
import { useNow } from "@/lib/use-now";

function format(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function CountdownTimer({ closesAt }: { closesAt: number }) {
  const now = useNow(1000);
  const remaining = now > 0 ? closesAt - now : closesAt;
  const expired = now > 0 && remaining <= 0;
  const urgent = !expired && remaining <= 30_000;

  return (
    <div
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium tabular-nums",
        expired
          ? "border-transparent bg-destructive/10 text-destructive"
          : urgent
            ? "border-transparent bg-warning/15 text-warning"
            : "bg-card text-foreground",
      )}
    >
      <Clock className="size-3.5" />
      {expired ? "Ordering closed" : format(remaining)}
    </div>
  );
}
