import { isGcpLoggingConfigured } from "@/lib/config";
import { createConsoleLogger } from "@/lib/observability/providers/console";
import { createGcpLogger } from "@/lib/observability/providers/gcp";
import type { Logger } from "@/lib/observability/types";

let cached: Logger | null = null;

export function getLogger(): Logger {
  if (cached) return cached;
  cached = isGcpLoggingConfigured() ? createGcpLogger() : createConsoleLogger();
  return cached;
}
