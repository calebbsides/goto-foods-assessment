import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isFirebaseConfigured } from "@/lib/config";
import { GoogleSignIn } from "@/components/google-sign-in";
import { SetupNotice } from "@/components/setup-notice";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (!isFirebaseConfigured()) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <SetupNotice />
      </main>
    );
  }

  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Sign in to host an order</h1>
        <p className="text-sm text-muted">
          Hosts sign in so they can invite people and check out. Guests never need an
          account.
        </p>
      </header>
      <GoogleSignIn />
    </main>
  );
}
