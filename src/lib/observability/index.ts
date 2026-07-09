import { isGcpLoggingConfigured } from "@/lib/config";
import { createConsoleLogger } from "@/lib/observability/providers/console";
import { createGcpLogger } from "@/lib/observability/providers/gcp";
import type { Logger } from "@/lib/observability/types";

let cached: Logger | null = null;

function select(): Logger {
  if (!isGcpLoggingConfigured()) {
    return createConsoleLogger();
  }
  try {
    return createGcpLogger();
  } catch {
    const fallback = createConsoleLogger();
    fallback.warn("observability.gcp_init_failed", { fallback: "console" });
    return fallback;
  }
}

export function getLogger(): Logger {
  if (cached) return cached;
  cached = select();
  return cached;
}
