import { CircleAlert } from "lucide-react";

export function ErrorState({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <CircleAlert className="size-5" />
        </span>
        <div className="space-y-1">
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
          {children ? <div className="pt-2">{children}</div> : null}
        </div>
      </div>
    </div>
  );
}
