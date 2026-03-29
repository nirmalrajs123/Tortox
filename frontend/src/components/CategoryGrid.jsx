import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// High-quality stock images mapped by normalized category name
const categoryImages = {
    'PC CASES':       'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=800',
    'POWER SUPPLY':   'https://images.unsplash.com/photo-1591489378430-ef2f4c626bc1?auto=format&fit=crop&q=80&w=800',
    'LIQUID COOLER':  'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=800',
    'AIR COOLER':     'https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&q=80&w=800',
};

const fallbackImage = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800';

const CategoryGrid = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/categories')
            .then(res => {
                if (res.data.success) setCategories(res.data.data);
            })
            .catch(console.error);
    }, []);

    if (!categories.length) return null;

    return (
        <section style={{ padding: '60px 60px', maxWidth: '1400px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1d1d1f', marginBottom: '30px' }}>
                Categories
            </h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '20px',
            }}>
                {categories.map((cat, idx) => {
                    const img = categoryImages[cat.category_name.toUpperCase()] || fallbackImage;
                    return (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.08 }}
                            onClick={() => navigate(`/products?category=${cat.id}`)}
                            whileHover="hover"
                            style={{
                                height: '220px',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                position: 'relative',
                                cursor: 'pointer',
                                background: '#1a1a1a',
                            }}
                        >
                            {/* Background Image */}
                            <motion.div
                                variants={{ hover: { scale: 1.08 } }}
                                transition={{ duration: 0.5 }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundImage: `url(${img})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    position: 'absolute',
                                    inset: 0,
                                    opacity: 0.85,
                                }}
                            />

                            {/* Dark Gradient Overlay */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.05) 60%)',
                            }} />

                            {/* Label */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'flex-end',
                                padding: '18px 20px',
                            }}>
                                <span style={{
                                    color: '#ffffff',
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    letterSpacing: '-0.2px',
                                    textShadow: '0 1px 4px rgba(0,0,0,0.5)'
                                }}>
                                    {cat.category_name}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
};

export default CategoryGrid;
