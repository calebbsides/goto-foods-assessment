import * as React from "react";
import { cn } from "@/lib/cn";

function initialsFrom(name: string, email: string): string {
  const source = name.trim() || email.trim();
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  email: string;
}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ name, email, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "flex size-9 shrink-0 select-none items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary",
        className,
      )}
      aria-hidden
      {...props}
    >
      {initialsFrom(name, email)}
    </span>
  ),
);
Avatar.displayName = "Avatar";

export { Avatar, initialsFrom };
