import { isEmailConfigured } from "@/lib/config";
import { createLogEmail } from "@/lib/email/providers/log";
import { createSendgridEmail } from "@/lib/email/providers/sendgrid";
import type { Email } from "@/lib/email/types";

let cached: Email | null = null;

export function getEmail(): Email {
  if (cached) return cached;
  cached = isEmailConfigured() ? createSendgridEmail() : createLogEmail();
  return cached;
}
