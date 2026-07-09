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

let featuredMemo: CatalogCard[] | null = null;
let inFlight: Promise<CatalogCard[]> | null = null;

async function loadFeatured(): Promise<CatalogCard[]> {
  if (featuredMemo) return featuredMemo;
  if (inFlight) return inFlight;
  inFlight = fetchFeatured()
    .then((cards) => {
      featuredMemo = cards;
      return cards;
    })
    .catch((error) => {
      getLogger().error("catalog.fetch_failed", {
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

export function createPokemonTcgCatalog(): Catalog {
  return {
    async getFeatured() {
      return loadFeatured();
    },
    async getCard(id) {
      const cards = await loadFeatured();
      return cards.find((card) => card.id === id) ?? null;
    },
    async priceOf(id) {
      const cards = await loadFeatured();
      return cards.find((card) => card.id === id)?.priceCents ?? null;
    },
  };
}
