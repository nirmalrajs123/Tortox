import React from 'react';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
    return (
        <motion.div
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid rgba(0, 0, 0, 0.04)',
                background: '#ffffff',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                flexDirection: 'column',
                display: 'flex',
                gap: '15px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* HOT Badge */}
            <span style={{
                position: 'absolute',
                top: '15px',
                left: '15px',
                background: 'linear-gradient(135deg, #ff1a1a, #ff6a00)',
                color: '#ffffff',
                padding: '3px 9px',
                borderRadius: '8px',
                fontSize: '0.65rem',
                fontWeight: 800,
                boxShadow: '0 2px 10px rgba(255, 26, 26, 0.2)',
                letterSpacing: '0.5px',
                zIndex: 10
            }}>
                HOT
            </span>

            {/* category badge */}
            <span style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.02)',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                color: '#4b5563',
                zIndex: 10
            }}>
                {product.category}
            </span>

            {/* image container */}
            <div style={{
                width: '100%',
                height: '180px',
                borderRadius: '12px',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
            }}>
                <motion.img
                    src={product.image}
                    alt={product.name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease'
                    }}
                    whileHover={{ scale: 1.06 }}
                />
            </div>

            {/* Content */}
            <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
                    {product.product_name || product.name || 'Unnamed Product'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.4', marginBottom: '15px' }}>
                    {product.product_description || product.description || 'No description available.'}
                </p>
            </div>

            {/* specs */}
            <div style={{
                marginTop: 'auto',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px'
            }}>
                {(() => {
                    let parsedSpecs = {};
                    try {
                        parsedSpecs = typeof product.specs === 'string' ? JSON.parse(product.specs) : (product.specs || {});
                    } catch (e) {}
                    if (parsedSpecs && typeof parsedSpecs === 'object') {
                        return Object.entries(parsedSpecs).slice(0, 3).map(([key, item]) => {
                            const val = item && typeof item === 'object' ? item.value : item;
                            if (!val) return null;
                            return (
                                <span key={key} style={{
                                    background: 'rgba(255, 71, 26, 0.04)',
                                    border: '1px solid rgba(255, 71, 26, 0.15)',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.7rem',
                                    color: '#ff6a33'
                                }}>
                                    {key.replace(/([A-Z])/g, ' $1').toUpperCase().trim()}: {val}
                                </span>
                            );
                        });
                    }
                    return null;
                })()}
            </div>

            {/* footer price */}
            <div style={{
                borderTop: '1px solid rgba(0,0,0,0.04)',
                paddingTop: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '10px'
            }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
                    ${product.price}
                </span>
                <button style={{
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '8px',
                    color: '#4b5563',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                }}>
                    Add +
                </button>
            </div>
        </motion.div>
    );
};

export default ProductCard;
