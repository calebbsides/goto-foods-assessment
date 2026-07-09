export type LogSeverity = "info" | "warning" | "error";

export interface LogEntry {
  severity: LogSeverity;
  message: string;
  context?: Record<string, unknown>;
}

export interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}
