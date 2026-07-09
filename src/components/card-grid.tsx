"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Plus } from "lucide-react";
import type { CatalogCard } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { formatCents } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CardGridProps {
  cards: CatalogCard[];
  disabled: boolean;
  disabledReason?: string;
  onAdd: (card: CatalogCard) => Promise<void>;
}

export function CardGrid({ cards, disabled, disabledReason, onAdd }: CardGridProps) {
  return (
    <section aria-label="Card catalog" className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Featured cards</h2>
          <p className="text-sm text-muted-foreground">
            Live market prices from the Pokémon TCG API.
          </p>
        </div>
        {disabled && disabledReason ? (
          <Badge variant="muted" className="shrink-0">
            {disabledReason}
          </Badge>
        ) : null}
      </div>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
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
  const [added, setAdded] = useState(false);

  async function add() {
    setPending(true);
    try {
      await onAdd(card);
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    } finally {
      setPending(false);
    }
  }

  return (
    <li className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {card.imageSmall ? (
          <Image
            src={card.imageSmall}
            alt={card.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        {card.rarity ? (
          <Badge
            variant="secondary"
            className="absolute left-2 top-2 backdrop-blur supports-[backdrop-filter]:bg-secondary/70"
          >
            {card.rarity}
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-0.5">
          <p className="line-clamp-1 font-medium leading-tight">{card.name}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">{card.setName}</p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-lg font-semibold tabular-nums">
            {formatCents(card.priceCents)}
          </span>
          <Button
            onClick={add}
            disabled={disabled || pending}
            size="sm"
            variant={added ? "secondary" : "default"}
            className={cn(added && "text-success")}
            aria-label={`Add ${card.name} to cart`}
          >
            {added ? (
              <>
                <Check /> Added
              </>
            ) : (
              <>
                <Plus /> {pending ? "Adding" : "Add"}
              </>
            )}
          </Button>
        </div>
      </div>
    </li>
  );
}
