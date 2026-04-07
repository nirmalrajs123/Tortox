import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '../services/product';
import {
    ChevronLeft,
    ChevronRight,
    Check,
    Maximize2,
    Download,
    Search,
    FileText
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
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('');
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
                if (data?.variants?.length > 0) {
                    setActiveVariantIndex(0);
                    setSelectedSize(data.variants[0].Size || '');
                    setSelectedStyle(data.variants[0].Style || '');
                }
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
    const allImages = [
        ...(currentVariant ? (currentVariant.previews || []) : [product.image, ...(product.product_images?.map(img => img.image_path) || [])].filter(Boolean)),
        product.desktop_banner,
        product.mobile_banner
    ].filter(Boolean).map(normalizePath);
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

                                <div style={{ width: '100%', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                    <motion.img
                                        key={activeImage}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        src={allImages[activeImage]}
                                        alt={pageTitle}
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                    />



                                    {/* Zoom Visual */}
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', opacity: 0.8 }}>
                                        <Search size={20} color="#d2d2d7" />
                                    </div>
                                </div>

                                <button
                                    onClick={() => setActiveImage(prev => (prev < allImages.length - 1 ? prev + 1 : 0))}
                                    style={{ position: 'absolute', right: '-40px', background: '#f5f5f7', border: 'none', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#86868b' }}
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>

                            {/* Thumbnail Gallery Navigation */}
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                marginTop: '40px',
                                overflowX: 'auto',
                                maxWidth: '100%',
                                padding: '10px 0',
                                scrollbarWidth: 'none',
                                justifyContent: 'center'
                            }}>
                                {allImages.map((img, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        style={{
                                            width: '64px',
                                            height: '64px',
                                            borderRadius: '12px',
                                            border: i === activeImage ? '2px solid #1d1d1f' : '1px solid #d2d2d7',
                                            padding: '4px',
                                            cursor: 'pointer',
                                            background: '#fff',
                                            flexShrink: 0,
                                            transition: 'all 0.2s',
                                            boxShadow: i === activeImage ? '0 4px 12px rgba(0,0,0,0.08)' : 'none'
                                        }}
                                    >
                                        <img
                                            src={img}
                                            alt={`Thumb ${i}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        />
                                    </div>
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
                                        {[...new Map(product.variants?.map(v => [v.Color, v])).values()].map((v, i) => (
                                            <div
                                                key={i}
                                                onClick={() => {
                                                    const firstMatch = product.variants.find(pv => pv.Color === v.Color);
                                                    if (firstMatch) {
                                                        const idx = product.variants.indexOf(firstMatch);
                                                        setActiveVariantIndex(idx);
                                                        setActiveImage(0);
                                                        setSelectedSize(firstMatch.Size || '');
                                                        setSelectedStyle(firstMatch.Style || '');
                                                    }
                                                }}
                                                style={{
                                                    width: '36px', height: '36px', borderRadius: '50%',
                                                    background: v.Color?.toLowerCase() === 'white' ? '#fff' : (v.Color?.toLowerCase() === 'black' ? '#1d1d1f' : v.Color),
                                                    border: v.Color?.toLowerCase() === 'white' ? '1px solid #d2d2d7' : 'none',
                                                    padding: '3px', cursor: 'pointer',
                                                    outline: currentVariant?.Color === v.Color ? `2px solid #00dccc` : 'none',
                                                    outlineOffset: '2px',
                                                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                        ))}
                                        {(!product.variants || product.variants.length === 0) && (
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#000', outline: '2px solid #000', outlineOffset: '3px' }} />
                                        )}
                                    </div>
                                </div>

                                {/* Dynamic Style Selector */}
                                {product.variants?.some(v => v.Style) && (
                                    <div>
                                        <p style={{ fontWeight: 700, marginBottom: '15px' }}>Style</p>
                                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                            {[...new Set(product.variants.filter(v => v.Color === currentVariant?.Color).map(v => v.Style).filter(Boolean))].map((style, idx) => {
                                                const isActive = selectedStyle === style;
                                                return (
                                                    <div
                                                        key={idx}
                                                        onClick={() => {
                                                            setSelectedStyle(style);
                                                            const newIndex = product.variants.findIndex(v => v.Color === currentVariant?.Color && v.Style === style && (v.Size === selectedSize || !v.Size));
                                                            if (newIndex !== -1) setActiveVariantIndex(newIndex);
                                                        }}
                                                        style={{
                                                            padding: '16px 24px',
                                                            border: isActive ? `1.5px solid ${accentColor}` : '1.5px solid #e5e5e5',
                                                            borderRadius: '8px',
                                                            color: isActive ? accentColor : '#86868b',
                                                            fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                                                            minWidth: '100px', textAlign: 'center',
                                                            background: isActive ? `${accentColor}08` : 'transparent',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {style}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Dynamic Size Selector */}
                                {product.variants?.some(v => v.Size) && (
                                    <div>
                                        <p style={{ fontWeight: 700, marginBottom: '15px' }}>Size</p>
                                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                            {[...new Set(product.variants.filter(v => v.Color === currentVariant?.Color && v.Style === selectedStyle).map(v => v.Size).filter(Boolean))].map((size, idx) => {
                                                const isActive = selectedSize === size;
                                                return (
                                                    <div
                                                        key={idx}
                                                        onClick={() => {
                                                            setSelectedSize(size);
                                                            const newIndex = product.variants.findIndex(v => v.Color === currentVariant?.Color && v.Style === selectedStyle && v.Size === size);
                                                            if (newIndex !== -1) setActiveVariantIndex(newIndex);
                                                        }}
                                                        style={{
                                                            padding: '16px 24px',
                                                            border: isActive ? `1.5px solid ${accentColor}` : '1.5px solid #e5e5e5',
                                                            borderRadius: '8px',
                                                            color: isActive ? accentColor : '#86868b',
                                                            fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                                                            minWidth: '100px', textAlign: 'center',
                                                            background: isActive ? `${accentColor}08` : 'transparent',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {size}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => navigate('/contact')}
                                    style={{
                                        marginTop: '10px', padding: '14px 40px', background: '#1d1d1f',
                                        borderRadius: '25px', display: 'inline-flex', justifyContent: 'center',
                                        alignItems: 'center', cursor: 'pointer', color: '#fff',
                                        border: 'none', fontWeight: 800, textTransform: 'uppercase',
                                        letterSpacing: '1px', fontSize: '0.85rem', width: 'fit-content'
                                    }}
                                >
                                    Shop Now
                                </button>
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
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)',
                height: '70px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '60px',
                padding: '0 8%',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
                <div style={{ display: 'flex', gap: '60px', height: '100%' }}>
                    {['View', 'Views', 'Description', 'Spec', 'Galleries', 'Downloadables'].map(tab => (
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

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/contact')}
                    style={{
                        padding: '10px 32px',
                        background: '#1d1d1f',
                        borderRadius: '100px',
                        color: '#fff',
                        border: 'none',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        letterSpacing: '1px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                >
                    Shop Now
                </motion.button>
            </div>

            {activeTab === 'Views' && (
                <motion.div
                    key="views-tab"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    style={{ maxWidth: '1440px', margin: '0 auto', padding: '100px 80px' }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '20px' }}>Studio Perspectives</h2>
                        <p style={{ fontSize: '1.2rem', color: '#86868b' }}>Every detail captured from our engineering desk to your screen.</p>
                    </div>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(4, 1fr)', 
                        gap: '24px',
                        padding: '20px'
                    }}>
                        {allImages.slice(0, 8).map((img, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -8 }}
                                style={{
                                    background: '#ffffff',
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    aspectRatio: '1/1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    padding: '30px',
                                    border: '1px solid #f2f2f2',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                                }}
                            >
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                    <img src={img} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                </div>
                                <span style={{ 
                                    marginTop: '20px', 
                                    fontSize: '0.7rem', 
                                    fontWeight: 800, 
                                    textTransform: 'uppercase', 
                                    letterSpacing: '2px',
                                    color: i === 0 ? accentColor : '#86868b'
                                }}>
                                    {i === 0 ? 'Master Angle' : `Perspective 0${i + 1}`}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
            {activeTab === 'Description' && (
                <motion.div
                    key="description-tab"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    style={{ maxWidth: '1100px', margin: '0 auto', padding: '100px 20px' }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{ fontSize: '3rem', fontWeight: 900, color: '#1d1d1f', marginBottom: '20px' }}>Deep Dive</h2>
                        <p style={{ fontSize: '1.1rem', color: '#86868b', maxWidth: '600px', margin: '0 auto' }}>Everything you need to know about the engineering and design philosophy behind this unit.</p>
                    </div>
                    
                    <div style={{ 
                        background: '#ffffff',
                        borderRadius: '32px',
                        padding: '60px',
                        boxShadow: '0 20px 80px rgba(0,0,0,0.03)',
                        border: '1px solid #f2f2f2',
                        lineHeight: '1.8',
                        fontSize: '1.15rem',
                        color: '#4b5563',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {currentVariant?.description || product.description || "This high-performance hardware piece is designed to push the boundaries of modern PC building. Detailed narrative overview coming soon."}
                    </div>
                </motion.div>
            )}
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
                                whileHover={{ scale: 1.02 }}
                                style={{ background: '#f5f5f7', borderRadius: '24px', overflow: 'hidden', aspectRatio: '4/3', border: '1px solid #f2f2f2', position: 'relative' }}
                            >
                                <img src={img} alt={`Gallery ${i}`} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '20px' }} />

                                <a
                                    href={img}
                                    download
                                    style={{
                                        position: 'absolute', bottom: '15px', right: '15px',
                                        background: '#fff', border: 'none', width: '36px', height: '36px',
                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer', color: '#1d1d1f'
                                    }}
                                >
                                    <Download size={16} />
                                </a>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {activeTab === 'Downloadables' && (
                <motion.div
                    key="download-tab"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ maxWidth: '1000px', margin: '0 auto', padding: '80px 20px' }}
                >
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '40px', textAlign: 'center' }}>Downloads & Support</h2>

                    {/* Manuals Section */}
                    <div style={{ marginBottom: '60px' }}>
                        <h3 style={{ fontSize: '0.9rem', color: '#86868b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '25px', fontWeight: 800 }}>Technical Documentation</h3>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {(product.technical_manuals || []).map((m, idx) => (
                                <a
                                    key={idx}
                                    href={m.download_path || normalizePath(m.preview)}
                                    download
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '24px 30px', background: '#fafafa', borderRadius: '16px',
                                        textDecoration: 'none', color: '#1d1d1f', border: '1px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d2d2d7'; e.currentTarget.style.background = '#fff'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = '#fafafa'; }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ padding: '10px', background: '#f5f5f7', borderRadius: '10px' }}>
                                            <FileText size={20} color="#e11919" />
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{m.download_label || 'Product Manual'}</span>
                                    </div>
                                    <Download size={18} color="#86868b" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* General Downloads */}
                    <div>
                        <h3 style={{ fontSize: '0.9rem', color: '#86868b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '25px', fontWeight: 800 }}>Software & Drivers</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {(product.downloads || []).map((dl, idx) => (
                                <a
                                    key={idx}
                                    href={dl.download_path || normalizePath(dl.preview)}
                                    download
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        display: 'flex', flexDirection: 'column', gap: '15px',
                                        padding: '25px', background: '#fafafa', borderRadius: '16px',
                                        textDecoration: 'none', color: '#1d1d1f', border: '1px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d2d2d7'; e.currentTarget.style.background = '#fff'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = '#fafafa'; }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ padding: '10px', background: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                            <Download size={20} color="#e11919" />
                                        </div>
                                        <span style={{ fontSize: '0.7rem', color: '#86868b', fontWeight: 700, textTransform: 'uppercase' }}>File</span>
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{dl.download_label}</span>
                                </a>
                            ))}
                        </div>
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
