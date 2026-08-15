export interface Collection {
  slug: string;
  name: string;
  description: string;
  productSlugs: string[];
}

export const COLLECTIONS: Collection[] = [];
