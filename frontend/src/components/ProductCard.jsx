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
            whileHover={{ y: -10, boxShadow: '0 30px 60px rgba(0,0,0,0.12)' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                border: '1px solid #f0f0f0',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                minHeight: '420px',
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
                marginBottom: '20px',
                overflow: 'hidden',
                padding: '5px'
            }}>
                <img
                    src={finalSrc}
                    alt={product.product_name || product.modal}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
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
            <div style={{ textAlign: 'left', width: '100%', padding: '0 5px' }}>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#000',
                    margin: '0 0 4px 0',
                    lineHeight: 1.2,
                    letterSpacing: '-0.3px'
                }}>
                    {product.product_name || product.modal || `Unit ${product.id}`}
                </h3>

                <div style={{
                    fontSize: '0.85rem',
                    color: '#71717a',
                    fontWeight: 600,
                    opacity: 0.8
                }}>
                    {mb || 'ATX'} / {dims || 'Standard Unit'}
                </div>
            </div>

            {/* Dynamic Color Indicator Dots */}
            <div style={{
                marginTop: 'auto',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                paddingBottom: '5px'
            }}>
                {product.variant_data && product.variant_data.length > 0 ? (
                    // Deduplicate colors for the card dots
                    [...new Map(product.variant_data.map(v => [v.color, v])).values()].map((v, idx) => {
                        const isThisSelected = (selectedImage === v.image) || (!selectedImage && idx === 0);
                        const displayColor = v.color?.toLowerCase().trim();
                        return (
                            <div
                                key={idx}
                                onMouseEnter={() => v.image && setSelectedImage(v.image)}
                                onMouseLeave={() => setSelectedImage(null)}
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: isThisSelected ? '1.5px solid #ff7e3b' : '1.5px solid transparent',
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
                                    border: displayColor === 'white' ? '1px solid #e1e1e1' : 'none'
                                }} />
                            </div>
                        );
                    })
                ) : (
                    <div style={{
                        width: '20px', height: '20px', borderRadius: '50%', border: '1.5px solid #ff7e3b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px'
                    }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#000' }} />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ProductCard;
