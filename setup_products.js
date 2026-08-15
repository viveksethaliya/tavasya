const fs = require('fs');
const path = require('path');

const rawDataPath = path.join(__dirname, 'docss/products/tavasya_products.json');
const imgSourceDir = path.join(__dirname, 'docss/products');
const imgDestDir = path.join(__dirname, 'public/images/products');
const typesDestPath = path.join(__dirname, 'types/product.ts');
const dataDestDir = path.join(__dirname, 'data');
const dataDestPath = path.join(__dirname, 'data/products.ts');

// Create destination dirs
if (!fs.existsSync(imgDestDir)) fs.mkdirSync(imgDestDir, { recursive: true });
if (!fs.existsSync(dataDestDir)) fs.mkdirSync(dataDestDir, { recursive: true });
const typesDir = path.join(__dirname, 'types');
if (!fs.existsSync(typesDir)) fs.mkdirSync(typesDir, { recursive: true });

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));
const products = [];

rawData.products.forEach(item => {
  let slug = slugify(item.name);
  // Special case for meyer thinker which has parentheses
  if (item.name.includes('Thinker CG')) slug = 'meyer-thinker-cg';
  if (item.name.includes('Thinker CS')) slug = 'meyer-thinker-cs';

  const oldImageName = item.image_path.split('/').pop(); // e.g. "01-mega-vibro-destoner.png"
  const newImageName = oldImageName.replace(/^\d+-/, ''); // e.g. "mega-vibro-destoner.png"
  
  // Copy image
  const oldImagePath = path.join(imgSourceDir, oldImageName);
  const newImagePath = path.join(imgDestDir, newImageName);
  
  if (fs.existsSync(oldImagePath)) {
    fs.copyFileSync(oldImagePath, newImagePath);
    console.log(`Copied ${oldImageName} -> ${newImageName}`);
  } else {
    console.warn(`Missing image: ${oldImagePath}`);
  }

  products.push({
    id: item.id,
    slug: slug,
    name: item.name,
    image: `/images/products/${newImageName}`,
    shortDescription: item.short_description,
    longDescription: item.long_description,
    keyFeatures: item.key_features || [],
    applications: item.applications || [],
    notes: item.notes || {}
  });
});

const typesContent = `export interface Product {
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
`;

fs.writeFileSync(typesDestPath, typesContent, 'utf8');

const dataContent = `import { Product } from "@/types/product";

export const PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find(p => p.slug === slug);
}
`;

fs.writeFileSync(dataDestPath, dataContent, 'utf8');

console.log('Successfully generated types/product.ts and data/products.ts');
