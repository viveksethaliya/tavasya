const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'public/photos');
const destDir = path.join(__dirname, 'public/images/context');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const mappings = {
  '2148215856.jpg': 'wheat-grains-closeup.jpg',
  '2150361174.jpg': 'raw-peanuts-closeup.jpg',
  'ChatGPT Image Jul 26, 2026, 02_18_33 AM.png': 'peanut-processing-line.png',
  'ChatGPT Image Jul 26, 2026, 02_36_57 AM.png': 'rice-processing-line.png',
  'pexels-nc-farm-bureau-mark-9799037.jpg': 'harvested-peanut-plant.jpg',
  'pexels-tuan-vy-903011268-31699602.jpg': 'field-irrigation.jpg'
};

for (const [oldName, newName] of Object.entries(mappings)) {
  const oldPath = path.join(sourceDir, oldName);
  const newPath = path.join(destDir, newName);
  
  if (fs.existsSync(oldPath)) {
    fs.copyFileSync(oldPath, newPath);
    console.log(`Copied ${oldName} to ${newName}`);
  } else {
    console.warn(`File not found: ${oldPath}`);
  }
}
