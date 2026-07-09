import { Logging } from "@google-cloud/logging";
import { gcpLoggingConfig } from "@/lib/config";
import type { Logger, LogSeverity } from "@/lib/observability/types";

const LOG_NAME = "group-order";

function toGcpSeverity(severity: LogSeverity): string {
  if (severity === "warning") return "WARNING";
  if (severity === "error") return "ERROR";
  return "INFO";
}

export function createGcpLogger(): Logger {
  const logging = new Logging({
    projectId: gcpLoggingConfig.projectId,
    credentials: {
      client_email: gcpLoggingConfig.clientEmail,
      private_key: gcpLoggingConfig.privateKey,
    },
  });

  const log = logging.logSync(LOG_NAME);

  function write(severity: LogSeverity, message: string, context?: Record<string, unknown>): void {
    try {
      const entry = log.entry(
        { severity: toGcpSeverity(severity), resource: { type: "global" } },
        { message, ...context },
      );
      log.write(entry);
    } catch {
      console.log(JSON.stringify({ severity: toGcpSeverity(severity), message, ...context }));
    }
  }

  return {
    info: (message, context) => write("info", message, context),
    warn: (message, context) => write("warning", message, context),
    error: (message, context) => write("error", message, context),
  };
}
