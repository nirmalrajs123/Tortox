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
                borderRadius: '16px',
                padding: '24px',
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
                    top: '0px',
                    left: '0px',
                    backgroundColor: '#000',
                    color: '#fff',
                    padding: '10px 24px',
                    fontSize: '1.2rem',
                    fontWeight: '900',
                    borderTopLeftRadius: '16px',
                    borderBottomRightRadius: '12px',
                    zIndex: 2,
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
                marginBottom: '20px',
                position: 'relative',
                padding: '0px'
            }}>
                <img
                    src={finalSrc}
                    alt={product.product_name || product.modal}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
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
                    fontSize: '1.4rem', 
                    fontWeight: '800', 
                    color: '#000000', 
                    marginBottom: '8px',
                    lineHeight: '1.2',
                    wordBreak: 'break-word',
                    letterSpacing: '-0.2px'
                }}>
                    {product.product_name || product.modal}
                </h3>
                
                <p style={{ 
                    fontSize: '1rem', 
                    color: '#333333', 
                    fontWeight: '500',
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
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        border: isThisSelected ? '2px solid #ff7a00' : '2px solid transparent',
                                        padding: '3px',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        background: displayColor === 'black' ? '#000' : (displayColor === 'white' ? '#fff' : displayColor),
                                        border: displayColor === 'white' ? '1px solid #dcdcdc' : (displayColor === 'black' ? 'none' : '1px solid rgba(0,0,0,0.1)'),
                                        boxShadow: isThisSelected ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
                                    }} />
                                </div>
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
