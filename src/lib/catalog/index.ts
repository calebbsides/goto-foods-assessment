import { createPokemonTcgCatalog } from "@/lib/catalog/providers/pokemontcg";
import type { Catalog } from "@/lib/catalog/types";

let cached: Catalog | null = null;

export function getCatalog(): Catalog {
  if (cached) return cached;
  cached = createPokemonTcgCatalog();
  return cached;
}
