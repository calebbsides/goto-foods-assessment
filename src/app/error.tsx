"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const body = JSON.stringify({ name: "route_error", message: error.message, digest: error.digest });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/vitals", body);
    }
  }, [error]);

  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-muted">
        We hit an unexpected error while loading this page.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-brand px-4 py-2 font-medium text-brand-contrast hover:bg-brand-strong"
      >
        Try again
      </button>
    </main>
  );
}
