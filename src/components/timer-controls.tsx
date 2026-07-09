"use client";

import { useState } from "react";
import { Timer } from "lucide-react";
import { setTimer } from "@/actions/set-timer";
import { Button } from "@/components/ui/button";

const PRESETS = [1, 5, 10];

export function TimerControls({ orderId, active }: { orderId: string; active: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function apply(minutes: number | null) {
    setPending(true);
    setError(null);
    const formData = new FormData();
    formData.set("orderId", orderId);
    if (minutes !== null) {
      formData.set("minutes", String(minutes));
    }
    const result = await setTimer(formData);
    if (!result.ok) {
      setError(result.error);
    }
    setPending(false);
  }

  return (
    <section aria-label="Order timer" className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-1 flex items-center gap-2">
        <Timer className="size-4 text-muted-foreground" />
        <h2 className="font-semibold">Close on a timer</h2>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        When it runs out, every cart locks and you move to checkout.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((minutes) => (
          <Button
            key={minutes}
            onClick={() => apply(minutes)}
            disabled={pending}
            variant="outline"
            size="sm"
          >
            {minutes} min
          </Button>
        ))}
        {active ? (
          <Button
            onClick={() => apply(null)}
            disabled={pending}
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
          >
            Clear
          </Button>
        ) : null}
      </div>
      {error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
