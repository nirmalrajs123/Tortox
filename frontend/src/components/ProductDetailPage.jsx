import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '../services/product';
import {
    ChevronLeft,
    ChevronRight,
    Check,
    Maximize2,
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

// ─── SEO Head Manager ────────────────────────────────────────────────────────
const useSEO = ({ title, description, image, url, category }) => {
    useEffect(() => {
        if (!title) return;
        document.title = `${title} - ${category || 'PC Components'} | Tortox`;

        const setMeta = (name, content, prop = false) => {
            const attr = prop ? 'property' : 'name';
            let el = document.querySelector(`meta[${attr}="${name}"]`);
            if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
            el.content = content;
        };

        setMeta('description', description || `${title} - Premium gaming hardware by Tortox.`);
        setMeta('keywords', `tortox, ${title}, ${category || 'gaming PC'}, pc case, gaming hardware`);
        setMeta('og:title', `${title} | Tortox`, true);
        setMeta('og:description', description || `Discover the ${title} from Tortox.`, true);
        setMeta('og:image', image || '', true);
        setMeta('og:url', url || window.location.href, true);
        setMeta('og:type', 'product', true);
        setMeta('twitter:card', 'summary_large_image');
        setMeta('twitter:title', `${title} | Tortox`);
        setMeta('twitter:description', description || `Discover the ${title} from Tortox.`);
        setMeta('twitter:image', image || '');

        // Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
        canonical.href = url || window.location.href;

        return () => { document.title = 'Tortox | Gaming Hardware'; };
    }, [title, description, image, url, category]);
};

// ─── JSON-LD Structured Data ─────────────────────────────────────────────────
const StructuredData = ({ product }) => {
    if (!product) return null;
    const json = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.product_name || product.modal,
        description: product.product_description,
        brand: { '@type': 'Brand', name: 'Tortox' },
        image: product.image,
        sku: product.modal,
        category: product.category_name,
    };
    return (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductDetailPage = ({ usesSlug }) => {
    const { id, slug } = useParams();
    const navigate = useNavigate();
    const identifier = usesSlug ? slug : id;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('View');
    const [activeVariantIndex, setActiveVariantIndex] = useState(-1);
    const [activeImage, setActiveImage] = useState(0);
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, show: false });
    const imageRef = useRef(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await productService.getById(identifier);
                const data = res.data?.data;
                setProduct(data || null);
                if (data?.variants?.length > 0) setActiveVariantIndex(0);
            } catch (err) {
                console.error('Failed to fetch product:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
        window.scrollTo(0, 0);
    }, [identifier]);

    // Dynamic SEO
    useSEO({
        title: product ? (product.product_name || product.modal) : '',
        description: product?.product_description,
        image: product?.image,
        url: `${window.location.origin}/products/${product?.modal?.toLowerCase()}`,
        category: product?.category_name,
    });

    if (loading) {
        return (
            <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loader" />
                <style>{`.loader{width:40px;height:40px;border:4px solid #f3f3f3;border-top:4px solid #e11919;border-radius:50%;animation:spin 1s linear infinite;}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Navbar />
                <h2 style={{ color: '#111827' }}>Product Not Found</h2>
                <button onClick={() => navigate('/products')} style={{ marginTop: '20px', padding: '10px 20px', background: '#e11919', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                    Back to Products
                </button>
                <Footer />
            </div>
        );
    }

    const normalizePath = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `http://${window.location.hostname}:5000${path.startsWith('/') ? '' : '/'}${path.trim()}`;
    };

    const currentVariant = activeVariantIndex >= 0 ? product.variants?.[activeVariantIndex] : null;
    const allImages = currentVariant
        ? (currentVariant.previews || []).map(normalizePath)
        : [product.image, ...(product.product_images?.map(img => img.image_path) || [])].filter(Boolean).map(normalizePath);
    const specs = currentVariant ? (currentVariant.specs || []) : (Array.isArray(product.specifications) ? product.specifications : []);
    const features = currentVariant ? (currentVariant.features || []) : (Array.isArray(product.featuresList) ? product.featuresList : []);

    const handleMouseMove = (e) => {
        if (!imageRef.current) return;
        const { left, top, width, height } = imageRef.current.getBoundingClientRect();
        const x = ((e.pageX - left - window.scrollX) / width) * 100;
        const y = ((e.pageY - top - window.scrollY) / height) * 100;
        setZoomPos({ x, y, show: true });
    };

    const pageTitle = product.product_name || product.modal;
    const categoryName = (product.category_name || 'PC CASE').toUpperCase();
    const categoryId = product.category_id;

    const accentColor = '#ff6b00'; // darkFlash Orange

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh', color: '#1d1d1f', fontFamily: 'Inter, sans-serif', paddingTop: '75px' }}>
            <StructuredData product={product} />
            <Navbar theme="light" />

            {/* ── BREADCRUMB + TABS BAR ────────────────────────── */}
            <div style={{
                borderBottom: '1px solid #f2f2f2',
                padding: '0 80px',
                background: '#fafafa',
                position: 'sticky',
                top: '75px',
                zIndex: 100,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '60px'
            }}>
                <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#86868b' }}>
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
                    <ChevronRight size={12} />
                    <Link to="/products" style={{ textDecoration: 'none', color: 'inherit' }}>Products</Link>
                    <ChevronRight size={12} />
                    <span style={{ color: 'inherit' }}>{categoryName}</span>
                    <ChevronRight size={12} />
                    <span style={{ color: '#1d1d1f', fontWeight: 600 }}>{pageTitle}</span>
                </nav>


            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'View' && (
                    <motion.div
                        key="view-tab"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ maxWidth: '1440px', margin: '0 auto', padding: '60px 80px', display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '100px' }}
                    >
                        {/* LEFT COLUMN: GALLERY */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                            <div style={{ width: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {/* Nav Arrows */}
                                <button
                                    onClick={() => setActiveImage(prev => (prev > 0 ? prev - 1 : allImages.length - 1))}
                                    style={{ position: 'absolute', left: '-40px', background: '#f5f5f7', border: 'none', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#86868b' }}
                                >
                                    <ChevronLeft size={24} />
                                </button>

                                <div style={{ width: '100%', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <motion.img
                                        key={activeImage}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        src={allImages[activeImage]}
                                        alt={pageTitle}
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                    />
                                </div>

                                <button
                                    onClick={() => setActiveImage(prev => (prev < allImages.length - 1 ? prev + 1 : 0))}
                                    style={{ position: 'absolute', right: '-40px', background: '#f5f5f7', border: 'none', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#86868b' }}
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>

                            {/* Dots */}
                            <div style={{ display: 'flex', gap: '8px', marginTop: '30px' }}>
                                {allImages.map((_, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === activeImage ? '#1d1d1f' : '#d2d2d7', cursor: 'pointer' }}
                                    />
                                ))}
                            </div>

                            {/* Gallery/Video Buttons */}
                            <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>


                            </div>
                        </div>

                        {/* RIGHT COLUMN: INFO */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                            <div>
                                <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#1d1d1f', marginBottom: '30px', lineHeight: 1.1 }}>
                                    {pageTitle}
                                </h1>

                                <ul style={{ paddingLeft: '20px', color: '#424245', lineHeight: '2', fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {features.length > 0 ? features.map((f, i) => (
                                        <li key={i}>{f}</li>
                                    )) : (
                                        <>
                                            <li>Professional grade airflow design for optimal cooling.</li>
                                            <li>Spacious interior supporting latest hardware components.</li>
                                            <li>Tool-less panel design for easy access and maintenance.</li>
                                            <li>Premium aesthetics with tempered glass panels.</li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            {/* Separator */}
                            <div style={{ height: '1px', background: '#f2f2f2', width: '100%' }} />

                            {/* Variant Selectors */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                {/* Colors */}
                                <div>
                                    <p style={{ fontWeight: 700, marginBottom: '15px' }}>Colors - {currentVariant?.Color || 'Black'}</p>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        {product.variants?.map((v, i) => (
                                            <div
                                                key={i}
                                                onClick={() => { setActiveVariantIndex(i); setActiveImage(0); }}
                                                style={{
                                                    width: '36px', height: '36px', borderRadius: '50%',
                                                    background: v.Color?.toLowerCase() === 'white' ? '#fff' : '#000',
                                                    border: v.Color?.toLowerCase() === 'white' ? '1px solid #dcdcdc' : 'none',
                                                    padding: '3px', cursor: 'pointer',
                                                    outline: activeVariantIndex === i ? `2px solid #000` : 'none',
                                                    outlineOffset: '3px'
                                                }}
                                            />
                                        ))}
                                        {(!product.variants || product.variants.length === 0) && (
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#000', outline: '2px solid #000', outlineOffset: '3px' }} />
                                        )}
                                    </div>
                                </div>

                                {/* Category Specific Selectors: Edition vs Wattage */}
                                <div>
                                    <p style={{ fontWeight: 700, marginBottom: '15px' }}>
                                        {categoryId === 2 ? 'Wattage' : 'Edition'}
                                    </p>
                                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                        {categoryId === 2 ? (
                                            ['1250W', '1050W', '850W', '750W'].map((w, idx) => (
                                                <div
                                                    key={idx}
                                                    style={{
                                                        padding: '16px 24px',
                                                        border: idx === 0 ? `1.5px solid ${accentColor}` : '1.5px solid #e5e5e5',
                                                        borderRadius: '8px',
                                                        color: idx === 0 ? accentColor : '#86868b',
                                                        fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                                                        minWidth: '100px', textAlign: 'center'
                                                    }}
                                                >
                                                    {w}
                                                </div>
                                            ))
                                        ) : (
                                            <>
                                                <div style={{
                                                    padding: '16px 24px', border: `1.5px solid ${accentColor}`, borderRadius: '8px',
                                                    color: accentColor, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                                                    flex: 1, textAlign: 'center'
                                                }}>
                                                    Standard Edition
                                                </div>
                                                <div style={{
                                                    padding: '16px 24px', border: '1.5px solid #e5e5e5', borderRadius: '8px',
                                                    color: '#86868b', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                                                    flex: 1, textAlign: 'center'
                                                }}>
                                                    Elite Edition
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Find Retailer */}
                                <div
                                    onClick={() => navigate('/contact')}
                                    style={{
                                        marginTop: '10px', padding: '16px 20px', border: '1px solid #d2d2d7',
                                        borderRadius: '8px', display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'center', cursor: 'pointer', color: '#424245'
                                    }}
                                >
                                    <span style={{ fontWeight: 600 }}>Shop Now</span>
                                    <ChevronDown size={20} />
                                </div>
                            </div>
                        </div>

                        {/* ── LOWER SECTION: FEATURE HIGHLIGHTS ──────────────── */}

                    </motion.div>
                )}






            </AnimatePresence>
            {/* 🛠️ Industrial Control Strip */}
            <div style={{
                borderTop: '1px solid #f2f2f2',
                borderBottom: '1px solid #f2f2f2',
                background: '#ffffff',
                height: '70px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '60px',
                marginTop: '60px'
            }}>
                {['View', 'Spec', 'Galleries'].map(tab => (
                    <div
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            fontSize: '0.85rem',
                            fontWeight: activeTab === tab ? 800 : 600,
                            cursor: 'pointer',
                            color: activeTab === tab ? '#1d1d1f' : '#86868b',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            height: '100%',
                            transition: 'color 0.2s',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div
                                layoutId="tab-underline-bottom"
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                style={{
                                    position: 'absolute',
                                    bottom: '-1px',
                                    left: '-5px',
                                    right: '-5px',
                                    height: '3px',
                                    background: accentColor,
                                    zIndex: 2
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>
            {activeTab === 'Spec' && (
                <motion.div
                    key="spec-tab"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ maxWidth: '1000px', margin: '0 auto', padding: '80px 20px' }}
                >
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '40px', textAlign: 'center' }}>Technical Specifications</h2>
                    <div style={{ borderTop: '1px solid #f2f2f2' }}>
                        {specs.length > 0 ? specs.map((s, i) => (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr', padding: '24px 0', borderBottom: '1px solid #f2f2f2' }}>
                                <span style={{ fontWeight: 700, color: '#86868b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>{s.label || s.specification_name}</span>
                                <span style={{ fontWeight: 600, color: '#1d1d1f' }}>{s.value || s.specification_value}</span>
                            </div>
                        )) : (
                            <div style={{ padding: '60px', textAlign: 'center', color: '#86868b' }}>Technical specifications coming soon.</div>
                        )}
                    </div>
                </motion.div>
            )}
            {activeTab === 'Galleries' && (
                <motion.div
                    key="galleries-tab"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ maxWidth: '1440px', margin: '0 auto', padding: '80px' }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
                        {allImages.map((img, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.02, y: -5 }}
                                style={{ background: '#f5f5f7', borderRadius: '15px', overflow: 'hidden', aspectRatio: '4/3' }}
                            >
                                <img src={img} alt={`Gallery ${i}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
            <Footer />
        </div>
    );
};

const ChevronDown = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
);

export default ProductDetailPage;
