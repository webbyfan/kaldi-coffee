const fs = require('fs');
const path = require('path');
const https = require('https');

const DST = path.join(__dirname, 'public/images/');
if (!fs.existsSync(DST)) {
  fs.mkdirSync(DST, { recursive: true });
}

// 1. Local generated images
const LOCAL_COPIES = [
  // Newly generated hero
  ['C:/Users/ertyhj/.gemini/antigravity-ide/brain/3ca8af04-37c7-4001-a6b1-8106dd54160f/hero_coffee_1791023109059.jpg', 'hero-coffee.jpg'],
  // Roastery craft
  ['C:/Users/ertyhj/.gemini/antigravity-ide/brain/a12b59c9-6625-4b2b-8f8d-14f3367ca6bc/story_roastery_1790964051456.jpg', 'story-roastery.jpg'],
  // Product placeholders until user supplies their custom product pics
  ['C:/Users/ertyhj/.gemini/antigravity-ide/brain/a12b59c9-6625-4b2b-8f8d-14f3367ca6bc/product_yirgacheffe_1790963971136.jpg', 'product-yirgacheffe.jpg'],
  ['C:/Users/ertyhj/.gemini/antigravity-ide/brain/a12b59c9-6625-4b2b-8f8d-14f3367ca6bc/product_sidamo_1790963981215.jpg', 'product-sidamo.jpg'],
  ['C:/Users/ertyhj/.gemini/antigravity-ide/brain/a12b59c9-6625-4b2b-8f8d-14f3367ca6bc/product_guji_1790963992672.jpg', 'product-guji.jpg'],
  ['C:/Users/ertyhj/.gemini/antigravity-ide/brain/a12b59c9-6625-4b2b-8f8d-14f3367ca6bc/product_harrar_1790964041154.jpg', 'product-harrar.jpg'],
  ['C:/Users/ertyhj/.gemini/antigravity-ide/brain/a12b59c9-6625-4b2b-8f8d-14f3367ca6bc/product_sidamo_1790963981215.jpg', 'product-kaffa.jpg'],
  ['C:/Users/ertyhj/.gemini/antigravity-ide/brain/a12b59c9-6625-4b2b-8f8d-14f3367ca6bc/hero_coffee_1790963921175.jpg', 'product-addis.jpg'],
  ['C:/Users/ertyhj/.gemini/antigravity-ide/brain/a12b59c9-6625-4b2b-8f8d-14f3367ca6bc/product_yirgacheffe_1790963971136.jpg', 'product-limu.jpg'],
  ['C:/Users/ertyhj/.gemini/antigravity-ide/brain/a12b59c9-6625-4b2b-8f8d-14f3367ca6bc/product_guji_1790963992672.jpg', 'product-flight.jpg'],
];

LOCAL_COPIES.forEach(([src, dst]) => {
  try {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(DST, dst));
      console.log(`✓ Copied: ${dst}`);
    } else {
      console.warn(`! Not found: ${src}`);
    }
  } catch (err) {
    console.error(`✗ Copy error for ${dst}:`, err.message);
  }
});

// 2. Curated Unsplash images for Brewing, Gallery, and Journal
const REMOTE_IMAGES = [
  // Brewing Mosaic
  { url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&auto=format&fit=crop&q=80', name: 'brewing-espresso.jpg' },
  { url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000&auto=format&fit=crop&q=80', name: 'brewing-pourover.jpg' },
  { url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=800&auto=format&fit=crop&q=80', name: 'brewing-cup.jpg' },

  // Instagram Gallery (6 items)
  { url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80', name: 'gallery-beans.jpg' },
  { url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&auto=format&fit=crop&q=80', name: 'gallery-pour.jpg' },
  { url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80', name: 'gallery-roastery.jpg' },
  { url: 'https://images.unsplash.com/photo-1524350876685-274059332603?w=800&auto=format&fit=crop&q=80', name: 'gallery-cherries.jpg' },
  { url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80', name: 'gallery-lifestyle.jpg' },
  { url: 'https://images.unsplash.com/photo-1506372023823-741c83b836fe?w=800&auto=format&fit=crop&q=80', name: 'gallery-steam.jpg' },

  // Journal Articles (4 items)
  { url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&auto=format&fit=crop&q=80', name: 'journal-ceremony.jpg' },
  { url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1200&auto=format&fit=crop&q=80', name: 'journal-v60.jpg' },
  { url: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=1200&auto=format&fit=crop&q=80', name: 'journal-processing.jpg' },
  { url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=1200&auto=format&fit=crop&q=80', name: 'journal-water-lab.jpg' },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

async function run() {
  console.log('Downloading remote images...');
  for (const img of REMOTE_IMAGES) {
    const dest = path.join(DST, img.name);
    try {
      await download(img.url, dest);
      console.log(`✓ Downloaded: ${img.name}`);
    } catch (err) {
      console.error(`✗ Failed downloading ${img.name}:`, err.message);
    }
  }
  console.log('Finished image setup!');
}

run();
