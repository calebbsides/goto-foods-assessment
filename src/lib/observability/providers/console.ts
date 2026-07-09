import type { Logger, LogSeverity } from "@/lib/observability/types";

function emit(severity: LogSeverity, message: string, context?: Record<string, unknown>): void {
  const line = JSON.stringify({
    severity: severity.toUpperCase(),
    message,
    ...context,
  });
  if (severity === "error") {
    console.error(line);
  } else if (severity === "warning") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export function createConsoleLogger(): Logger {
  return {
    info: (message, context) => emit("info", message, context),
    warn: (message, context) => emit("warning", message, context),
    error: (message, context) => emit("error", message, context),
  };
}
