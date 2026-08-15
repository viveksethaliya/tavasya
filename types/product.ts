export interface Product {
  id: number;
  slug: string;
  name: string;
  image: string;
  shortDescription: string;
  longDescription: string;
  keyFeatures: string[];
  applications: string[];
  notes?: Record<string, string>;
}
