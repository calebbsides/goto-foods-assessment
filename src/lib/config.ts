function readKey(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.replace(/\\n/g, "\n");
}

export const firebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

export const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: readKey(process.env.FIREBASE_PRIVATE_KEY),
};

export const gcpLoggingConfig = {
  projectId: process.env.GCP_PROJECT_ID ?? process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.GCP_CLIENT_EMAIL ?? process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: readKey(process.env.GCP_PRIVATE_KEY ?? process.env.FIREBASE_PRIVATE_KEY),
};

export const emailConfig = {
  apiKey: process.env.SENDGRID_API_KEY,
  from: process.env.EMAIL_FROM,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseClientConfig.apiKey &&
      firebaseClientConfig.authDomain &&
      firebaseClientConfig.projectId &&
      firebaseAdminConfig.clientEmail &&
      firebaseAdminConfig.privateKey,
  );
}

export function isEmailConfigured(): boolean {
  return Boolean(emailConfig.apiKey && emailConfig.from);
}

export function isGcpLoggingConfigured(): boolean {
  return Boolean(
    gcpLoggingConfig.projectId &&
      gcpLoggingConfig.clientEmail &&
      gcpLoggingConfig.privateKey,
  );
}

export function appBaseUrl(fallbackOrigin: string): string {
  return process.env.APP_BASE_URL?.replace(/\/$/, "") ?? fallbackOrigin;
}
