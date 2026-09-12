const fs = require('fs');
const path = require('path');

const mapping = require('./image-mapping.json');

const root = __dirname;
const publicDir = path.join(root, 'public');
const rawAssetsDir = path.join(root, 'raw_assets');
const tempImagesDir = path.join(root, 'temp_images');

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function run() {
  console.log("Executing Swap...");
  for (const [oldPath, newPath] of Object.entries(mapping)) {
    const pubOldPath = path.join(publicDir, oldPath);
    const rawOldPath = path.join(rawAssetsDir, oldPath);
    const tempNewPath = path.join(tempImagesDir, newPath);
    const pubNewPath = path.join(publicDir, newPath);

    // 1. Move original from public/ to raw_assets/
    if (fs.existsSync(pubOldPath)) {
      await ensureDir(path.dirname(rawOldPath));
      fs.renameSync(pubOldPath, rawOldPath);
    }

    // 2. Copy optimized from temp_images/ to public/
    if (fs.existsSync(tempNewPath)) {
      await ensureDir(path.dirname(pubNewPath));
      fs.copyFileSync(tempNewPath, pubNewPath);
    }
  }

  // 3. Update all code references
  const searchDirs = ['app', 'components', 'data'];
  for (const dir of searchDirs) {
    const dirPath = path.join(root, dir);
    if (!fs.existsSync(dirPath)) continue;
    
    function processCodeDir(currentDir) {
      const files = fs.readdirSync(currentDir);
      for (const file of files) {
        const fullPath = path.join(currentDir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          processCodeDir(fullPath);
        } else if (/\.(tsx|ts|json)$/.test(file)) {
          let content = fs.readFileSync(fullPath, 'utf8');
          let changed = false;
          
          for (const [oldPath, newPath] of Object.entries(mapping)) {
            // we have oldPath like '/images/products/vibrating-grader.jpeg'
            // we want to replace all occurrences.
            // Split it if we need, but standard string replaceAll works for exact paths
            if (content.includes(oldPath)) {
              content = content.split(oldPath).join(newPath);
              changed = true;
            }
            // Some Next.js imports might be relative or omit leading slash, 
            // but in this codebase they are mostly absolute '/images/...'.
            // Let's also check without leading slash just in case
            const oldPathNoSlash = oldPath.substring(1);
            const newPathNoSlash = newPath.substring(1);
            if (content.includes(`"${oldPathNoSlash}"`)) {
              content = content.split(`"${oldPathNoSlash}"`).join(`"${newPathNoSlash}"`);
              changed = true;
            }
          }
          
          if (changed) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`Updated references in ${fullPath.replace(root, '')}`);
          }
        }
      }
    }
    processCodeDir(dirPath);
  }
  
  // Update next.config.ts for images.unoptimized = true
  const nextConfigPath = path.join(root, 'next.config.ts');
  if (fs.existsSync(nextConfigPath)) {
    let configStr = fs.readFileSync(nextConfigPath, 'utf8');
    // If images block doesn't exist, we must add it.
    if (configStr.includes('images: {')) {
        configStr = configStr.replace('images: {', 'images: { unoptimized: true,');
    } else {
        // Find inside NextConfig object
        configStr = configStr.replace('const nextConfig: NextConfig = {', 'const nextConfig: NextConfig = {\n  images: { unoptimized: true },');
    }
    fs.writeFileSync(nextConfigPath, configStr, 'utf8');
    console.log("Updated next.config.ts");
  }

  console.log("Swap Complete!");
}

run().catch(console.error);
