import sgMail from "@sendgrid/mail";
import { emailConfig } from "@/lib/config";
import { getLogger } from "@/lib/observability";
import { renderInviteEmail } from "@/lib/email/invite-template";
import type { Email } from "@/lib/email/types";

export function createSendgridEmail(): Email {
  sgMail.setApiKey(emailConfig.apiKey as string);

  return {
    configured: true,
    async sendInvite(invite) {
      const { subject, html, text } = renderInviteEmail(invite);
      try {
        await sgMail.send({
          to: invite.to,
          from: emailConfig.from as string,
          subject,
          html,
          text,
        });
        return { delivered: true };
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        getLogger().error("email.send_failed", { to: invite.to, reason });
        return { delivered: false, reason };
      }
    },
  };
}
