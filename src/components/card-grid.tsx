"use client";

import Image from "next/image";
import { useState } from "react";
import type { CatalogCard } from "@/lib/catalog/types";
import { formatCents } from "@/lib/money";

interface CardGridProps {
  cards: CatalogCard[];
  disabled: boolean;
  disabledReason?: string;
  onAdd: (card: CatalogCard) => Promise<void>;
}

export function CardGrid({ cards, disabled, disabledReason, onAdd }: CardGridProps) {
  return (
    <section aria-label="Card catalog" className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Featured cards</h2>
        {disabled && disabledReason ? (
          <p className="text-sm text-muted">{disabledReason}</p>
        ) : null}
      </div>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <CatalogTile key={card.id} card={card} disabled={disabled} onAdd={onAdd} />
        ))}
      </ul>
    </section>
  );
}

function CatalogTile({
  card,
  disabled,
  onAdd,
}: {
  card: CatalogCard;
  disabled: boolean;
  onAdd: (card: CatalogCard) => Promise<void>;
}) {
  const [pending, setPending] = useState(false);

  async function add() {
    setPending(true);
    try {
      await onAdd(card);
    } finally {
      setPending(false);
    }
  }

  return (
    <li className="flex flex-col rounded-xl border border-border bg-surface p-3">
      {card.imageSmall ? (
        <Image
          src={card.imageSmall}
          alt={card.name}
          width={245}
          height={342}
          className="mx-auto h-auto w-full max-w-[180px] rounded-lg"
        />
      ) : null}
      <div className="mt-3 flex flex-1 flex-col">
        <p className="font-medium leading-tight">{card.name}</p>
        <p className="text-xs text-muted">
          {card.setName} · {card.rarity}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-semibold">{formatCents(card.priceCents)}</span>
          <button
            onClick={add}
            disabled={disabled || pending}
            className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-brand-contrast transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </li>
  );
}
