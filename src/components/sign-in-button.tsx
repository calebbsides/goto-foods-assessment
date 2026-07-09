"use client";

import { useRouter } from "next/navigation";
import { useSignIn } from "@/lib/firebase/use-sign-in";
import { Button, type ButtonProps } from "@/components/ui/button";

interface SignInButtonProps extends Omit<ButtonProps, "onClick"> {
  label?: string;
}

export function SignInButton({
  label = "Sign in",
  variant = "outline",
  size = "sm",
  ...props
}: SignInButtonProps) {
  const router = useRouter();
  const { signIn, pending } = useSignIn();

  async function onClick() {
    const ok = await signIn();
    if (ok) {
      router.refresh();
    }
  }

  return (
    <Button onClick={onClick} disabled={pending} variant={variant} size={size} {...props}>
      {pending ? "Signing in..." : label}
    </Button>
  );
}
