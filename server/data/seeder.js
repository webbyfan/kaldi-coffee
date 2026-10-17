import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import { PRODUCTS } from './products.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kaldicoffee';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected for seeding');
    
    try {
      await Product.deleteMany(); // Clear existing products
      
      // We don't need the 'id' field from frontend since Mongo creates '_id',
      // but it's okay if it stays.
      await Product.insertMany(PRODUCTS);
      
      console.log('Data Imported!');
      process.exit();
    } catch (error) {
      console.error('Error with data import:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
