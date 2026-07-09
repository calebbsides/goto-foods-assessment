import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">Order not found</h1>
      <p className="text-sm text-muted">
        This order does not exist or has been removed.
      </p>
      <Link href="/" className="text-sm font-medium text-accent hover:underline">
        Go home
      </Link>
    </main>
  );
}
