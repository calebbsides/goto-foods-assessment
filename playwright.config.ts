import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `firebase emulators:exec --only firestore --project demo-group-order "next build && next start -p ${PORT}"`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      E2E_TEST_MODE: "1",
      FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
      FIREBASE_PROJECT_ID: "demo-group-order",
      NEXT_PUBLIC_FIREBASE_API_KEY: "test",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "demo-group-order.firebaseapp.com",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-group-order",
      FIREBASE_CLIENT_EMAIL: "test@demo-group-order.iam.gserviceaccount.com",
      FIREBASE_PRIVATE_KEY: "test",
    },
  },
});
