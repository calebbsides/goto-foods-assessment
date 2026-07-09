import { getLogger } from "@/lib/observability";
import type { Email } from "@/lib/email/types";

export function createLogEmail(): Email {
  return {
    configured: false,
    async sendInvite(invite) {
      getLogger().info("email.not_configured", {
        to: invite.to,
        joinUrl: invite.joinUrl,
      });
      return { delivered: false, reason: "email_not_configured" };
    },
  };
}
