export interface Collection {
  slug: string;
  name: string;
  description: string;
  productSlugs: string[];
  products: any[];
}

export const COLLECTIONS: Collection[] = [];

export function getCollectionBySlug(slug: string): Collection | undefined {
  return COLLECTIONS.find(c => c.slug === slug);
}
