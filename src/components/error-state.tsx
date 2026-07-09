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
    <div className="rounded-xl border border-brand/40 bg-brand/5 p-6 text-sm">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-muted">{message}</p>
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}
