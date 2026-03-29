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
    const categoryName = product.category_name || 'Products';
    const categoryId = product.category_id;

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh', color: '#111827', fontFamily: 'Inter, sans-serif' }}>
            {/* Inject JSON-LD for search engine crawlers */}
            <StructuredData product={product} />

            <Navbar />

            {/* ── BREADCRUMB + TAB BAR ────────────────────────── */}
            <div style={{ borderBottom: '1px solid #eee', padding: '14px 80px', background: '#fff', position: 'sticky', top: '70px', zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#888' }}>
                    <Link to="/" style={{ textDecoration: 'none', color: '#888' }}>Home</Link>
                    <span>›</span>
                    <Link to={`/products?category=${categoryId}`} style={{ textDecoration: 'none', color: '#888' }}>{categoryName}</Link>
                    <span>›</span>
                    <span style={{ color: '#1d1d1f', fontWeight: 600 }}>{pageTitle}</span>
                </nav>

                {/* Sub-tabs */}
                <div style={{ display: 'flex', gap: '40px' }}>
                    {['View', 'Spec', 'Galleries'].map(tab => (
                        <div
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                                color: activeTab === tab ? '#e11919' : '#1d1d1f',
                                position: 'relative', paddingBottom: '5px'
                            }}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div layoutId="tab-underline" style={{ position: 'absolute', bottom: -15, left: 0, right: 0, height: '3px', background: '#e11919' }} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* ── VIEW TAB ──────────────────────────────────── */}
                {activeTab === 'View' && (
                    <motion.div
                        key="view-tab"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        style={{ maxWidth: '1440px', margin: '0 auto', padding: '60px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}
                    >
                        {/* LEFT: Gallery + Zoom */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div
                                style={{ position: 'relative', cursor: 'crosshair', overflow: 'hidden', borderRadius: '4px', border: '1px solid #f0f0f0' }}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={() => setZoomPos(prev => ({ ...prev, show: false }))}
                                ref={imageRef}
                            >
                                <img
                                    src={allImages[activeImage]}
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                    alt={`${pageTitle} - ${categoryName} by Tortox`}
                                />
                                {zoomPos.show && (
                                    <div style={{ position: 'absolute', top: 0, right: '-105%', width: '100%', height: '100%', border: '1px solid #eee', background: '#fff', zIndex: 50, overflow: 'hidden', pointerEvents: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                                        <div style={{ width: '200%', height: '200%', backgroundImage: `url(${allImages[activeImage]})`, backgroundSize: 'cover', backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%` }} />
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {allImages.map((img, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        style={{ width: '70px', height: '70px', border: i === activeImage ? '2px solid #e11919' : '1px solid #eee', cursor: 'pointer', padding: '5px' }}
                                    >
                                        <img src={img} alt={`${pageTitle} view ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                ))}
                            </div>

                            <button style={{ alignSelf: 'center', background: '#f8f8f8', border: 'none', padding: '12px 30px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 800, color: '#e11919', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Maximize2 size={16} /> OPEN GALLERY
                            </button>
                        </div>

                        {/* RIGHT: Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                                    {categoryName}
                                </div>
                                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 10px 0', color: '#1d1d1f' }}>
                                    {product.modal}
                                </h1>
                                <p style={{ fontSize: '1.1rem', color: '#6e6e73', lineHeight: 1.6 }}>
                                    {currentVariant?.productName || product.product_name || ''}
                                </p>
                            </div>

                            {/* Variant Selector */}
                            {product.variants?.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <p style={{ fontWeight: 800, fontSize: '0.8rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>Available Configurations</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                        {product.variants.map((v, i) => (
                                            <div
                                                key={i}
                                                onClick={() => { setActiveVariantIndex(i); setActiveImage(0); }}
                                                style={{
                                                    padding: '14px 28px', border: activeVariantIndex === i ? '2px solid #e11919' : '1px solid #eee',
                                                    borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem',
                                                    color: activeVariantIndex === i ? '#e11919' : '#1d1d1f', transition: 'all 0.2s'
                                                }}
                                            >
                                                {v.Size || v.Color || v.Style || `Variant ${i + 1}`}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Key Features */}
                            {features.length > 0 && (
                                <div style={{ padding: '24px', background: '#f5f5f7', borderRadius: '12px' }}>
                                    <h3 style={{ fontWeight: 800, marginBottom: '15px', color: '#1d1d1f', fontSize: '1rem' }}>Key Features</h3>
                                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {features.slice(0, 5).map((f, i) => (
                                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem', color: '#4b5563' }}>
                                                <Check size={15} color="#e11919" strokeWidth={3} style={{ marginTop: '2px', flexShrink: 0 }} /> {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Description */}
                            {product.product_description && (
                                <p style={{ fontSize: '0.9rem', color: '#6e6e73', lineHeight: 1.7, borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
                                    {product.product_description}
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ── SPEC TAB ──────────────────────────────────── */}
                {activeTab === 'Spec' && (
                    <motion.div
                        key="spec-tab"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ maxWidth: '1000px', margin: '0 auto', padding: '80px 20px' }}
                    >
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '40px', textAlign: 'center', color: '#1d1d1f' }}>
                            Technical Specifications
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #eee' }}>
                            {specs.length > 0 ? specs.map((s, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', padding: '22px 0', borderBottom: '1px solid #eee', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 700, color: '#999', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
                                        {s.label || s.specification_name}
                                    </span>
                                    <span style={{ fontWeight: 600, fontSize: '1rem', color: '#1d1d1f' }}>
                                        {s.value || s.specification_value}
                                    </span>
                                </div>
                            )) : (
                                <div style={{ padding: '100px', textAlign: 'center', color: '#999' }}>Specifications not yet available.</div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ── GALLERIES TAB ─────────────────────────────── */}
                {activeTab === 'Galleries' && (
                    <motion.div
                        key="gallery-tab"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ maxWidth: '1440px', margin: '0 auto', padding: '80px' }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '30px' }}>
                            {allImages.map((img, i) => (
                                <motion.div key={i} whileHover={{ scale: 1.02 }} style={{ background: '#f5f5f7', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={img} alt={`${pageTitle} gallery image ${i + 1}`} style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default ProductDetailPage;
