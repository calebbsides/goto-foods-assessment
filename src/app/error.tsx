"use client";

import { useEffect } from "react";
import { RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const body = JSON.stringify({
      name: "route_error",
      message: error.message,
      digest: error.digest,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/vitals", body);
    }
  }, [error]);

  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <TriangleAlert className="size-6" />
      </span>
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        We hit an unexpected error while loading this page.
      </p>
      <Button onClick={reset}>
        <RotateCw />
        Try again
      </Button>
    </main>
  );
}
