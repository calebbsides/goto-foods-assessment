import { dollarsToCents } from "@/lib/money";
import { getLogger } from "@/lib/observability";
import { FEATURED_CARD_IDS } from "@/lib/catalog/featured-ids";
import type { Catalog, CatalogCard } from "@/lib/catalog/types";

const API_BASE = "https://api.pokemontcg.io/v2";
const CACHE_TAG = "catalog:featured";
const REVALIDATE_SECONDS = 3600;
const FALLBACK_PRICE_CENTS = 499;

interface ApiPriceBucket {
  market?: number | null;
  mid?: number | null;
  low?: number | null;
}

interface ApiCard {
  id: string;
  name: string;
  rarity?: string;
  set?: { name?: string };
  images?: { small?: string; large?: string };
  tcgplayer?: { prices?: Record<string, ApiPriceBucket> };
}

function extractPriceCents(card: ApiCard): number {
  const buckets = card.tcgplayer?.prices;
  if (!buckets) return FALLBACK_PRICE_CENTS;
  for (const bucket of Object.values(buckets)) {
    const dollars = bucket.market ?? bucket.mid ?? bucket.low;
    if (typeof dollars === "number" && dollars > 0) {
      return dollarsToCents(dollars);
    }
  }
  return FALLBACK_PRICE_CENTS;
}

function normalize(card: ApiCard): CatalogCard {
  return {
    id: card.id,
    name: card.name,
    setName: card.set?.name ?? "Unknown set",
    rarity: card.rarity ?? "Unknown",
    imageSmall: card.images?.small ?? "",
    imageLarge: card.images?.large ?? card.images?.small ?? "",
    priceCents: extractPriceCents(card),
  };
}

async function fetchFeatured(): Promise<CatalogCard[]> {
  const query = FEATURED_CARD_IDS.map((id) => `id:${id}`).join(" OR ");
  const url = `${API_BASE}/cards?q=${encodeURIComponent(query)}&pageSize=${FEATURED_CARD_IDS.length}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] },
  });
  if (!response.ok) {
    throw new Error(`Pokemon TCG API responded ${response.status}`);
  }
  const payload = (await response.json()) as { data: ApiCard[] };
  const order = new Map<string, number>(FEATURED_CARD_IDS.map((id, index) => [id, index]));
  return payload.data
    .map(normalize)
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

let memo: Map<string, CatalogCard> | null = null;

async function loadIntoMemo(): Promise<Map<string, CatalogCard>> {
  const cards = await fetchFeatured();
  memo = new Map(cards.map((card) => [card.id, card]));
  return memo;
}

export function createPokemonTcgCatalog(): Catalog {
  return {
    async getFeatured() {
      try {
        return await fetchFeatured();
      } catch (error) {
        getLogger().error("catalog.fetch_failed", {
          message: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    async getCard(id) {
      const store = memo ?? (await loadIntoMemo());
      return store.get(id) ?? null;
    },
    async priceOf(id) {
      const store = memo ?? (await loadIntoMemo());
      return store.get(id)?.priceCents ?? null;
    },
  };
}
