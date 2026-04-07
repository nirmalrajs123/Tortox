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
            whileHover={{ y: -12, boxShadow: '0 40px 100px rgba(0,0,0,0.15)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
                background: '#ffffff',
                borderRadius: '32px',
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                border: '1px solid #f0f0f0',
                boxShadow: '0 15px 45px rgba(0,0,0,0.08)',
                minHeight: '440px',
                overflow: 'hidden'
            }}
        >
            {/* Image Container */}
            <div style={{
                width: '100%',
                aspectRatio: '1/1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '25px',
                overflow: 'hidden',
                padding: '10px'
            }}>
                <img
                    src={finalSrc}
                    alt={product.product_name || product.modal}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
                        transform: isHovered ? 'scale(1.08)' : 'scale(1)'
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
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: '#1d1d1f',
                    margin: '0 0 6px 0',
                    lineHeight: 1.2
                }}>
                    {product.product_name || product.modal || `Unit ${product.id}`} {product.category_name === 'PC CASES' ? 'PC Case' : ''}
                </h3>

                <div style={{
                    fontSize: '0.9rem',
                    color: '#86868b',
                    fontWeight: 500,
                    letterSpacing: '0.1px'
                }}>
                    {mb || 'ATX'} / {dims || 'Standard Unit'}
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
                    // Deduplicate colors for the card dots using variant_data from backend
                    [...new Map(product.variant_data.map(v => [v.color, v])).values()].map((v, idx) => {
                        const isThisSelected = (selectedImage === v.image) || (!selectedImage && idx === 0);
                        const displayColor = v.color?.toLowerCase().trim();
                        return (
                            <div
                                key={idx}
                                onMouseEnter={() => v.image && setSelectedImage(v.image)}
                                onMouseLeave={() => setSelectedImage(null)}
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: isThisSelected ? '2px solid #ff7e3b' : '2px solid transparent',
                                    padding: '2px',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    background: displayColor === 'black' ? '#000' : (displayColor === 'white' ? '#fff' : displayColor),
                                    border: displayColor === 'white' ? '1px solid #e5e5e5' : 'none',
                                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                                }} />
                            </div>
                        );
                    })
                ) : (
                    <div style={{
                        width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #ff7e3b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px'
                    }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#000' }} />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ProductCard;
