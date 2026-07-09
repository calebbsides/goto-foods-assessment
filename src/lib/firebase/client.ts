import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { firebaseClientConfig } from "@/lib/config";

let app: FirebaseApp | null = null;

export function getClientAuth(): Auth {
  if (!app) {
    app = getApps()[0] ?? initializeApp(firebaseClientConfig);
  }
  return getAuth(app);
}

export function googleProvider(): GoogleAuthProvider {
  return new GoogleAuthProvider();
}
