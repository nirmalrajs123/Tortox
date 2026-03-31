import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { productService } from '../services/product';
import { motion } from 'framer-motion';

const LatestGear = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const res = await productService.getAll();
                // Filter for products that are NOT marked as 'is_hot'
                setProducts(res.data.data.filter(p => p.is_new));
                setLoading(false);
            } catch (err) {
                console.error("Failed to load latest gear:", err);
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    if (loading || products.length === 0) return null;

    return (
        <section style={{ padding: '80px 60px 120px 60px', maxWidth: '1440px', margin: '0 auto', borderTop: '1px solid #f2f2f2' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ marginBottom: '4rem', textAlign: 'left' }}
            >
                <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#e11919', margin: '0 0 10px 0', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    New Arrivals
                </h3>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#000', margin: 0 }}>
                    Just Landed
                </h2>
            </motion.div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '40px',
            }}>
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
};

export default LatestGear;
