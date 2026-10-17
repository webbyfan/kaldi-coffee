import { useState, useEffect } from 'react';
import { PRODUCTS } from '../data/products';

export function useProducts() {
  const [products, setProducts] = useState(PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const mappedData = data.map(item => ({
            ...item,
            id: item.id || item._id
          }));
          setProducts(mappedData);
        }
      } catch (err) {
        // Fallback gracefully to static catalog if MongoDB or server is not running
        setProducts(PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
}
