const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const imgDir = path.join(__dirname, 'assets', 'images');

// Config: [filename, maxWidth, maxHeight, quality]
const images = [
  // Hero background - will be used as CSS bg at full viewport, keep 1600w
  ['hero-bg.png',           1600, 900,  82],
  // Logo hero - displayed at h-14 (56px) in navbar, h-36~h-56 in hero (desktop)
  ['logo-hero.png',          480, 480,  90],
  // Logo transparente - displayed at h-24 in footer, h-36~56 in hero
  ['logo-transparente.png',  480, 480,  90],
  // Service carousel images - displayed at max ~800x600
  ['servico1.png',           900, 680,  82],
  ['servico2.png',           900, 680,  82],
  ['servico3.png',           900, 680,  82],
  ['servico4.png',           900, 680,  82],
  // Battery carousel images - same dimensions
  ['bateria1.png',           900, 680,  82],
  ['bateria2.png',           900, 680,  82],
  ['bateria3.png',           900, 680,  82],
  ['bateria4.png',           900, 680,  82],
];

async function convert() {
  let totalBefore = 0;
  let totalAfter = 0;
  const results = [];

  for (const [filename, w, h, q] of images) {
    const inputPath = path.join(imgDir, filename);
    const baseName = path.basename(filename, path.extname(filename));
    const outputPath = path.join(imgDir, baseName + '.webp');

    if (!fs.existsSync(inputPath)) {
      console.log(`[SKIP] ${filename} — não encontrado`);
      continue;
    }

    const statBefore = fs.statSync(inputPath);
    totalBefore += statBefore.size;

    await sharp(inputPath)
      .resize(w, h, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: q })
      .toFile(outputPath);

    const statAfter = fs.statSync(outputPath);
    totalAfter += statAfter.size;

    const pct = Math.round((1 - statAfter.size / statBefore.size) * 100);
    console.log(`[OK] ${filename} => ${baseName}.webp | ${Math.round(statBefore.size/1024)}KB → ${Math.round(statAfter.size/1024)}KB (-${pct}%)`);
    results.push({ from: filename, to: baseName + '.webp', before: statBefore.size, after: statAfter.size });
  }

  console.log(`\n=== TOTAL ===`);
  console.log(`Antes:  ${Math.round(totalBefore/1024)}KB (${Math.round(totalBefore/1024/1024*10)/10}MB)`);
  console.log(`Depois: ${Math.round(totalAfter/1024)}KB (${Math.round(totalAfter/1024/1024*10)/10}MB)`);
  console.log(`Economia: ${Math.round((1-totalAfter/totalBefore)*100)}%`);
}

convert().catch(console.error);
