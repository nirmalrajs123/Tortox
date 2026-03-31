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

    const hotProducts = products.filter(p => p.is_hot);

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
        <section style={{ padding: '100px 60px', maxWidth: '1440px', margin: '0 auto' }}>
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ marginBottom: '4.5rem', textAlign: 'center' }}
            >
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1d1d1f', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                    Hot Products
                </h2>
                <div style={{ width: '40px', height: '4px', background: '#e11919', margin: '20px auto' }} />
                <p style={{ color: '#86868b', fontSize: '1.1rem', marginTop: '8px', maxWidth: '600px', margin: '0 auto' }}>
                    Tailored performance components engineered for extreme ultimate workflow setups.
                </p>
            </motion.div>

            {hotProducts.length > 0 ? (
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '20px',
                    }}
                >
                    {hotProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </motion.div>
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#999', fontSize: '0.9rem', border: '1px dashed #eee', borderRadius: '12px' }}>
                    NO UNITS CURRENTLY PROMOTED
                </div>
            )}
        </section>
    );
};

export default ProductGrid;
