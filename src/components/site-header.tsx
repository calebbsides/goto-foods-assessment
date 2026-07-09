import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { AuthUser } from "@/lib/auth/types";
import { SignInButton } from "@/components/sign-in-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";

interface SiteHeaderProps {
  user?: AuthUser | null;
}

export function SiteHeader({ user }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="text-base">
            Card<span className="text-primary">Cart</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? <UserMenu user={user} /> : <SignInButton />}
        </div>
      </div>
    </header>
  );
}
