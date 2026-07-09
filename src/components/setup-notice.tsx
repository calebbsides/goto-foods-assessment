export function SetupNotice() {
  return (
    <div className="rounded-xl border border-warning/40 bg-warning/10 p-5 text-sm">
      <h2 className="text-base font-semibold text-foreground">Finish the setup</h2>
      <p className="mt-1 text-muted">
        Firebase is not configured yet, so sign-in and orders are disabled. The catalog
        still loads from the public Pokemon TCG API.
      </p>
      <p className="mt-3 text-muted">
        Copy <code className="rounded bg-surface-muted px-1">.env.example</code> to{" "}
        <code className="rounded bg-surface-muted px-1">.env.local</code> and fill in the
        Firebase block, then restart the dev server.
      </p>
    </div>
  );
}
