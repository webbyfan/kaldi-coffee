/**
 * copy-images.js
 * Run this ONCE from the /client folder with: node copy-images.js
 *
 * It copies the generated coffee images from the Antigravity brain folder
 * into the public/images/ folder so they can be served by Vite.
 */
const fs   = require('fs');
const path = require('path');

const SRC = 'C:/Users/ertyhj/.gemini/antigravity-ide/brain/a12b59c9-6625-4b2b-8f8d-14f3367ca6bc/';
const DST = path.join(__dirname, 'public/images/');

const IMAGES = [
  ['hero_coffee_1790963921175.jpg',        'hero-coffee.jpg'],
  ['product_yirgacheffe_1790963971136.jpg', 'product-yirgacheffe.jpg'],
  ['product_sidamo_1790963981215.jpg',      'product-sidamo.jpg'],
  ['product_guji_1790963992672.jpg',        'product-guji.jpg'],
  ['product_harrar_1790964041154.jpg',      'product-harrar.jpg'],
  ['story_roastery_1790964051456.jpg',      'story-roastery.jpg'],
];

if (!fs.existsSync(DST)) {
  fs.mkdirSync(DST, { recursive: true });
  console.log('Created public/images/');
}

IMAGES.forEach(([src, dst]) => {
  try {
    fs.copyFileSync(SRC + src, DST + dst);
    console.log(`✓  Copied  →  public/images/${dst}`);
  } catch (err) {
    console.error(`✗  Failed  →  ${dst}:`, err.message);
  }
});

console.log('\nDone! Now run:  npm run dev\n');
