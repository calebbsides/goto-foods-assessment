import { isEmailConfigured } from "@/lib/config";
import { createLogEmail } from "@/lib/email/providers/log";
import { createSmtpEmail } from "@/lib/email/providers/smtp";
import type { Email } from "@/lib/email/types";

let cached: Email | null = null;

export function getEmail(): Email {
  if (cached) return cached;
  cached = isEmailConfigured() ? createSmtpEmail() : createLogEmail();
  return cached;
}
