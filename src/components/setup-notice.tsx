import { TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SetupNotice() {
  return (
    <Card className="border-warning/40 bg-warning/5">
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <span className="flex size-8 items-center justify-center rounded-lg bg-warning/15 text-warning">
          <TriangleAlert className="size-4" />
        </span>
        <CardTitle className="text-base">Finish the setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>
          Firebase is not configured yet, so sign-in and orders are disabled. The catalog
          still loads from the public Pokémon TCG API.
        </p>
        <p>
          Copy <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.env.example</code>{" "}
          to <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.env.local</code>,
          fill in the Firebase block, then restart the dev server.
        </p>
      </CardContent>
    </Card>
  );
}
