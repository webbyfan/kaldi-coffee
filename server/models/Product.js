import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  subtitle: { type: String },
  origin: { type: String },
  region: { type: String },
  altitude: { type: String },
  varietal: { type: String },
  process: { type: String },
  harvest: { type: String },
  producer: { type: String },
  roast: { type: String },
  roastLevel: { type: Number },
  notes: { type: String },
  tastingNotes: [String],
  body: { type: String },
  acidity: { type: String },
  badge: { type: String },
  badgeVariant: { type: String },
  image: { type: String },
  colorAccent: { type: String },
  description: { type: String },
  prices: {
    '250g': { type: Number },
    '500g': { type: Number },
    '1kg': { type: Number }
  },
  inStock: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  brewGuide: {
    preferredMethod: String,
    dose: String,
    waterTemp: String,
    grind: String,
    brewTime: String,
    tastingTip: String
  }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
