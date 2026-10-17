import { useState, useEffect, useCallback } from 'react';
import { PRODUCTS } from '../data/products';

export function useProducts() {
  const [products, setProducts] = useState(() => {
    try {
      const custom = JSON.parse(localStorage.getItem('kaldi_custom_products') || '[]');
      if (Array.isArray(custom) && custom.length > 0) {
        // Merge custom products on top of default PRODUCTS
        const baseMap = new Map(PRODUCTS.map((p) => [String(p.id), p]));
        custom.forEach((cp) => baseMap.set(String(cp.id || cp._id), cp));
        return Array.from(baseMap.values());
      }
    } catch (e) {}
    return PRODUCTS;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const syncProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const mappedData = data.map((item) => ({
            ...item,
            id: item.id || item._id,
          }));
          setProducts(mappedData);
          return;
        }
      }
    } catch (err) {
      // Backend offline or running lightweight
    }

    try {
      const custom = JSON.parse(localStorage.getItem('kaldi_custom_products') || '[]');
      const baseMap = new Map(PRODUCTS.map((p) => [String(p.id), p]));
      if (Array.isArray(custom)) {
        custom.forEach((cp) => {
          if (cp._deleted) {
            baseMap.delete(String(cp.id || cp._id));
          } else {
            baseMap.set(String(cp.id || cp._id), cp);
          }
        });
      }
      setProducts(Array.from(baseMap.values()));
    } catch (e) {
      setProducts(PRODUCTS);
    }
  }, []);

  useEffect(() => {
    syncProducts();

    const handleUpdate = () => {
      syncProducts();
    };

    window.addEventListener('kaldi_products_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('kaldi_products_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [syncProducts]);

  return { products, loading, error, refreshProducts: syncProducts };
}

