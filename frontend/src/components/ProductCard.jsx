import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    // Helper to get specs safe properly flawlessly
    const getSpec = (key) => {
        let specs = {};
        try {
            specs = typeof product.specs === 'string' ? JSON.parse(product.specs) : (product.specs || {});
        } catch (e) { }
        return specs[key]?.value || product[key] || '';
    };

    const mb = getSpec('mb_compat');
    const dims = getSpec('dimensions');

    return (
        <motion.div
            onClick={() => {
                const slug = product.modal ? product.modal.toLowerCase().replace(/\s+/g, '-') : product.id;
                navigate(`/products/${slug}`);
            }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                position: 'relative',
                transition: 'box-shadow 0.3s ease'
            }}
        >
            {/* Image Container setup framing flawlessly perfectly flawlessly */}
            <div style={{
                width: '100%',
                aspectRatio: '1/1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                overflow: 'hidden'
            }}>
                <img
                    src={product.main_image || product.image || 'https://via.placeholder.com/300'}
                    alt={product.product_name}
                    style={{
                        maxWidth: '90%',
                        maxHeight: '90%',
                        objectFit: 'contain'
                    }}
                />
            </div>

            {/* Info Section framing securely correctly framing */}
            <h3 style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: '#1d1d1f',
                margin: '0 0 4px 0',
                letterSpacing: '-0.3px',
                textAlign: 'left'
            }}>
                {product.product_name || product.modal || 'Unnamed Unit'}
            </h3>

            <div style={{
                fontSize: '0.85rem',
                color: '#6e6e73',
                fontWeight: 500,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
            }}>
                {mb} {mb && dims ? '/' : ''} {dims}
                {(!mb && !dims) && 'Tactical Performance Unit'}
            </div>

            {/* Dynamic Color Indicator Dots setup securely correctly flaws decently trigger flawlessly */}
            <div style={{
                marginTop: 'auto',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                paddingTop: '10px'
            }}>
                {product.available_colors && product.available_colors.length > 0 ? (
                    product.available_colors.map((color, idx) => (
                        <div 
                            key={idx}
                            title={color}
                            style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                background: color || '#888',
                                border: '2px solid #fff',
                                boxShadow: '0 0 0 1px #d2d2d7',
                                cursor: 'help'
                            }} 
                        />
                    ))
                ) : (
                    <div style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: '#000',
                        border: '2px solid #fff',
                        boxShadow: '0 0 0 1px #d2d2d7'
                    }} />
                )}
            </div>
        </motion.div>
    );
};

export default ProductCard;
