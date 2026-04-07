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
            whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
                background: '#ffffff',
                borderRadius: '8px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                position: 'relative',
                border: '1px solid #f2f2f2',
                transition: 'all 0.3s ease',
                width: '100%',
                boxSizing: 'border-box'
            }}
        >
            {/* 🏷️ "NEW" BADGE (darkFlash style) */}
            {product.is_new !== false && (
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    backgroundColor: '#000',
                    color: '#fff',
                    padding: '4px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 900,
                    borderRadius: '4px',
                    zIndex: 2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    New
                </div>
            )}

            {/* 🖼️ Image Section */}
            <div style={{
                width: '100%',
                aspectRatio: '1/1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '35px',
                position: 'relative',
                padding: '10px'
            }}>
                <img
                    src={finalSrc}
                    alt={product.product_name || product.modal}
                    style={{
                        maxWidth: '95%',
                        maxHeight: '95%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.05))',
                        transition: 'transform 0.5s ease',
                        transform: isHovered ? 'scale(1.08)' : 'scale(1)'
                    }}
                />
            </div>

            {/* 📝 Technical Info */}
            <div style={{ marginTop: 'auto' }}>
                <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 900, 
                    color: '#1d1d1f', 
                    marginBottom: '6px',
                    lineHeight: '1.2',
                    textTransform: 'uppercase',
                    wordBreak: 'break-word'
                }}>
                    {product.product_name || product.modal}
                </h3>
                
                <p style={{ 
                    fontSize: '0.85rem', 
                    color: '#86868b', 
                    fontWeight: 500,
                    marginBottom: '20px'
                }}>
                    {mb || 'ATX'} / {dims || 'Technical Dimension'}
                </p>

                {/* 🎨 Color Variants (Bottom Right) */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    alignItems: 'center'
                }}>
                    {product.variant_data && product.variant_data.length > 0 ? (
                        [...new Map(product.variant_data.map(v => [v.color, v])).values()].map((v, idx) => {
                            const isThisSelected = (selectedImage === v.image) || (!selectedImage && idx === 0);
                            const displayColor = v.color?.toLowerCase().trim();
                            return (
                                <div
                                    key={idx}
                                    onMouseEnter={() => v.image && setSelectedImage(v.image)}
                                    onMouseLeave={() => setSelectedImage(null)}
                                    style={{
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        background: displayColor === 'black' ? '#000' : (displayColor === 'white' ? '#fff' : displayColor),
                                        border: displayColor === 'white' ? '1px solid #dcdcdc' : (isThisSelected ? '2px solid #ff6b00' : '1px solid #eeeeee'),
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s ease',
                                        transform: isHovered && isThisSelected ? 'scale(1.2)' : 'scale(1)',
                                        outline: isThisSelected ? '2px solid #ff6b00' : 'none',
                                        outlineOffset: '2px'
                                    }}
                                />
                            );
                        })
                    ) : (
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#000', border: '1px solid #eee' }} />
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
