export interface CatalogCard {
  id: string;
  name: string;
  setName: string;
  rarity: string;
  imageSmall: string;
  imageLarge: string;
  priceCents: number;
}

export interface Catalog {
  getFeatured(): Promise<CatalogCard[]>;
  getCard(id: string): Promise<CatalogCard | null>;
  priceOf(id: string): Promise<number | null>;
}
