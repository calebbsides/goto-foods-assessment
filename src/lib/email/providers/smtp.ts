import nodemailer from "nodemailer";
import { emailConfig } from "@/lib/config";
import { getLogger } from "@/lib/observability";
import { renderInviteEmail } from "@/lib/email/invite-template";
import type { Email } from "@/lib/email/types";

export function createSmtpEmail(): Email {
  const transport = nodemailer.createTransport({
    host: emailConfig.host as string,
    port: emailConfig.port,
    secure: emailConfig.port === 465,
    auth: { user: emailConfig.user as string, pass: emailConfig.pass as string },
  });

  return {
    configured: true,
    async sendInvite(invite) {
      const { subject, html, text } = renderInviteEmail(invite);
      try {
        await transport.sendMail({
          to: invite.to,
          from: { name: invite.hostName, address: emailConfig.from as string },
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
