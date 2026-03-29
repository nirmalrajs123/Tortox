import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { productService } from '../services/product';
import { motion } from 'framer-motion';

const ProductGrid = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const res = await productService.getAll();
                setProducts(res.data.data);
                setLoading(false);
            } catch (err) {
                setError("Failed to load products from API backend.");
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    if (loading) return (
        <p style={{ textAlign: 'center', color: '#4b5563', padding: '4rem' }}>
            Loading products...
        </p>
    );

    if (error) return (
        <p style={{ textAlign: 'center', color: '#ff471a', padding: '4rem' }}>
            {error}
        </p>
    );

    return (
        <section style={{ padding: '80px 60px', maxWidth: '1400px', margin: '0 auto' }}>
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ marginBottom: '3rem', textAlign: 'center' }}
            >
                <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1d1d1f', margin: 0 }}>
                    Hot Products
                </h2>
                <p style={{ color: '#4b5563', fontSize: '1rem', marginTop: '8px' }}>
                    Tailored performance components engineered for extreme ultimate workflow setups correctly.
                </p>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '2rem',
                }}
            >
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </motion.div>
        </section>
    );
};

export default ProductGrid;
