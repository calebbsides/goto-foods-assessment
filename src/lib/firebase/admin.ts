import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { firebaseAdminConfig } from "@/lib/config";

let app: App | null = null;

export function getAdminApp(): App {
  if (app) return app;
  const existing = getApps();
  if (existing.length > 0) {
    app = existing[0];
    return app;
  }
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    app = initializeApp({ projectId: firebaseAdminConfig.projectId });
    return app;
  }
  app = initializeApp({
    credential: cert({
      projectId: firebaseAdminConfig.projectId,
      clientEmail: firebaseAdminConfig.clientEmail,
      privateKey: firebaseAdminConfig.privateKey,
    }),
  });
  return app;
}
