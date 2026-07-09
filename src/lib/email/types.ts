export interface InviteEmail {
  to: string;
  hostName: string;
  joinUrl: string;
}

export interface EmailResult {
  delivered: boolean;
  reason?: string;
}

export interface Email {
  configured: boolean;
  sendInvite(invite: InviteEmail): Promise<EmailResult>;
}
