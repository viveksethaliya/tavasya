const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.join(__dirname, 'public');
const minSize = 300 * 1024; // 300KB

async function processDir(currentDir) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const fullPath = path.join(currentDir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      await processDir(fullPath);
    } else if (stat.isFile() && /\.(png|jpe?g)$/i.test(file)) {
      if (stat.size > minSize) {
        try {
          const metadata = await sharp(fullPath).metadata();
          console.log(JSON.stringify({
            file: fullPath.replace(dir, '').replace(/\\/g, '/'),
            sizeKB: Math.round(stat.size / 1024),
            width: metadata.width,
            height: metadata.height
          }));
        } catch (e) {
          console.error(`Error processing ${fullPath}: ${e.message}`);
        }
      }
    }
  }
}

processDir(dir).catch(console.error);
