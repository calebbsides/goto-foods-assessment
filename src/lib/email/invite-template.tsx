import type { InviteEmail } from "@/lib/email/types";

export function renderInviteEmail(invite: InviteEmail): { subject: string; html: string; text: string } {
  const subject = `${invite.hostName} invited you to a group order`;
  const text = `${invite.hostName} invited you to join a group Pokemon card order. Join here: ${invite.joinUrl}`;
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h1 style="font-size: 20px; margin: 0 0 12px;">You are invited to a group order</h1>
      <p style="font-size: 15px; line-height: 1.5; color: #374151;">
        ${invite.hostName} invited you to build a cart of Pokemon cards together.
      </p>
      <a href="${invite.joinUrl}"
         style="display: inline-block; margin-top: 16px; padding: 12px 20px; background: #dc2626; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
        Join the order
      </a>
      <p style="font-size: 13px; color: #6b7280; margin-top: 20px;">
        Or paste this link into your browser: ${invite.joinUrl}
      </p>
    </div>
  `;
  return { subject, html, text };
}
