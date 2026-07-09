export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getLogger } = await import("@/lib/observability");
    getLogger().info("app.startup", { runtime: process.env.NEXT_RUNTIME });
  }
}

export async function onRequestError(
  error: unknown,
  request: { path: string; method: string },
): Promise<void> {
  const { getLogger } = await import("@/lib/observability");
  getLogger().error("request.error", {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    path: request.path,
    method: request.method,
  });
}
