import { createOrder } from "@/actions/create-order";

export function StartOrderButton() {
  return (
    <form action={createOrder}>
      <button
        type="submit"
        className="inline-flex w-fit items-center gap-2 rounded-lg bg-brand px-5 py-3 font-semibold text-brand-contrast transition hover:bg-brand-strong"
      >
        Start a group order
      </button>
    </form>
  );
}
