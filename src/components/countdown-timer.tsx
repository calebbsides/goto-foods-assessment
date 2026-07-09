"use client";

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

  return (
    <div
      aria-live="polite"
      className={`rounded-lg px-3 py-2 text-sm font-medium ${
        expired ? "bg-brand/10 text-brand" : "bg-surface-muted text-foreground"
      }`}
    >
      {expired ? "Ordering closed" : `Closes in ${format(remaining)}`}
    </div>
  );
}
