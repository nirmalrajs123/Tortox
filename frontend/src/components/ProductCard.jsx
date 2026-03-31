import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const [selectedImage, setSelectedImage] = React.useState(null);
    const [isHovered, setIsHovered] = React.useState(false);

    // Initial image reset when product changes
    React.useEffect(() => { setSelectedImage(null); }, [product.id]);

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

    const mainImg = selectedImage || (isHovered && product.hover_image ? product.hover_image : (product.main_image || product.image));
    const finalSrc = mainImg || 'https://via.placeholder.com/600x600?text=TORTOX+HARDWARE';

    return (
        <motion.div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => {
                const slug = product.modal ? product.modal.toLowerCase().replace(/\s+/g, '-') : product.id;
                navigate(`/products/${slug}`);
            }}
            whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}
            transition={{ duration: 0.3 }}
            style={{
                background: '#ffffff',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s ease',
                border: '1px solid #f2f2f2',
                minHeight: '420px'
            }}
        >
            {/* Dynamic Badge */}
            {(product.is_hot || product.is_new) && (
                <span style={{
                    position: 'absolute', top: '15px', left: '15px',
                    background: product.is_hot ? '#e11919' : '#000',
                    color: '#fff', padding: '4px 12px',
                    fontSize: '0.7rem', fontWeight: 900, zIndex: 2,
                    textTransform: 'uppercase', letterSpacing: '2px'
                }}>
                    {product.is_hot ? 'Hot' : 'New'}
                </span>
            )}

            {/* Image Container */}
            <div style={{
                width: '100%',
                aspectRatio: '1/1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '40px',
                overflow: 'hidden'
            }}>
                <img
                    src={finalSrc}
                    alt={product.product_name}
                    style={{
                        width: '90%',
                        height: '90%',
                        objectFit: 'contain',
                        transition: 'transform 0.5s ease',
                        transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                    }}
                    onError={(e) => {
                        if (e.target.src !== 'https://via.placeholder.com/600x600?text=TORTOX+HARDWARE') {
                            e.target.src = 'https://via.placeholder.com/600x600?text=TORTOX+HARDWARE';
                        }
                    }}
                />
            </div>

            {/* Info Section */}
            <div style={{ textAlign: 'left', width: '100%' }}>
                <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    color: '#000',
                    margin: '0 0 10px 0',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                }}>
                    {product.modal || product.product_name || 'Unnamed Unit'}
                </h3>

                <div style={{
                    fontSize: '0.85rem',
                    color: '#86868b',
                    fontWeight: 600,
                    marginBottom: '20px'
                }}>
                    {mb || 'ATX'} / {dims || product.product_name || 'Standard Unit'}
                </div>
            </div>

            {/* Dynamic Color Indicator Dots */}
            <div style={{
                marginTop: 'auto',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px'
            }}>
                {product.variant_data && product.variant_data.length > 0 ? (
                    product.variant_data.map((v, idx) => (
                        <div
                            key={idx}
                            title={v.color.toUpperCase()}
                            onMouseEnter={() => v.image && setSelectedImage(v.image)}
                            onMouseLeave={() => setSelectedImage(null)}
                            style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: v.color.toLowerCase().trim() === 'black' ? '#000' : (v.color.toLowerCase().trim() === 'white' ? '#fff' : v.color),
                                border: v.color.toLowerCase().trim() === 'white' ? '1.5px solid #dcdcdc' : '1px solid rgba(0,0,0,0.1)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                transform: selectedImage === v.image ? 'scale(1.2)' : 'scale(1)',
                                zIndex: 5
                            }}
                        />
                    ))
                ) : (
                    <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: '#040404',
                        border: '1px solid rgba(0,0,0,0.1)'
                    }} />
                )}
            </div>
        </motion.div>
    );
};

export default ProductCard;
