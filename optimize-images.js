const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputDir = path.join(__dirname, 'public');
const outputDir = path.join(__dirname, 'temp_images');

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function processDir(currentDir) {
  let results = [];
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const fullPath = path.join(currentDir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      results = results.concat(await processDir(fullPath));
    } else if (stat.isFile() && /\.(png|jpe?g)$/i.test(file)) {
      const relPath = fullPath.replace(inputDir, '').replace(/^[\\\/]/, '');
      const parsedPath = path.parse(relPath);
      const slugifiedName = slugify(parsedPath.name);
      
      const isLogo = /logo/i.test(relPath);
      const ext = isLogo ? '.png' : '.webp'; // keep logos as png
      const newRelPath = path.join(parsedPath.dir, `${slugifiedName}${ext}`).replace(/\\/g, '/');
      const outPath = path.join(outputDir, newRelPath);
      
      await ensureDir(path.dirname(outPath));

      const isProduct = /product/i.test(relPath);
      const isContext = /context/i.test(relPath);
      const targetWidth = isProduct ? 1600 : (isContext ? 1600 : 2000);
      const quality = isContext ? 75 : 80;

      try {
        const metadata = await sharp(fullPath).metadata();
        const width = metadata.width;
        
        const resizeOpt = width > targetWidth ? { width: targetWidth, withoutEnlargement: true } : undefined;

        let sharpInst = sharp(fullPath);
        if (resizeOpt) {
          sharpInst = sharpInst.resize(resizeOpt);
        }

        if (isLogo) {
          await sharpInst.png().toFile(outPath); // leave format alone, just resize if needed
        } else {
          await sharpInst.webp({ quality }).toFile(outPath);
        }

        const outStat = fs.statSync(outPath);
        const outMetadata = await sharp(outPath).metadata();

        results.push({
          oldPath: '/' + relPath.replace(/\\/g, '/'),
          newPath: '/' + newRelPath,
          originalSizeKB: Math.round(stat.size / 1024),
          originalWidth: metadata.width,
          newSizeKB: Math.round(outStat.size / 1024),
          newWidth: outMetadata.width
        });
      } catch (e) {
        console.error(`Error processing ${fullPath}: ${e.message}`);
      }
    }
  }
  return results;
}

ensureDir(outputDir).then(async () => {
  console.log("Processing images...");
  const results = await processDir(inputDir);
  
  results.sort((a, b) => b.newSizeKB - a.newSizeKB);
  
  console.table(results);
  
  const mapping = {};
  results.forEach(r => { mapping[r.oldPath] = r.newPath; });
  fs.writeFileSync('image-mapping.json', JSON.stringify(mapping, null, 2));
  console.log("Saved mapping to image-mapping.json");

}).catch(console.error);
