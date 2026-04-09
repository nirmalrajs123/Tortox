import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import { productService } from '../services/product';
import { aplusService } from '../services/aplus';
import {
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    Check,
    Maximize2,
    Download,
    Search,
    FileText,
    LayoutGrid,
    X
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollVideoSection from './ScrollVideoSection';
import TortoxLogo from './TortoxLogo';

gsap.registerPlugin(ScrollTrigger);

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

// ─── Scroll Reveal Image (A+ cinematic entrance) ─────────────────────────────
const ScrollRevealImage = ({ src, alt, delay = 0, style = {} }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px 0px' });
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1.05, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    return (
        <motion.div
            ref={ref}
            style={{ 
                width: '100%', 
                maxWidth: '1920px', 
                overflow: 'hidden', 
                scale,
                opacity,
                ...style 
            }}
        >
            <img
                src={src}
                alt={alt}
                style={{ width: '100%', display: 'block', margin: 0, padding: 0, objectFit: 'cover' }}
            />
        </motion.div>
    );
};

const ImageMagnifier = ({ src, alt }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const zoomLevel = 2.5;

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left - window.pageXOffset) / width) * 100;
        const y = ((e.pageY - top - window.pageYOffset) / height) * 100;
        setMousePos({ x, y });
    };

    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                background: '#fff',
                borderRadius: '16px',
                cursor: 'zoom-in'
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setIsHovering(false)}
        >
            <motion.img
                key={src}
                src={src}
                alt={alt}
                animate={{
                    scale: isHovering ? zoomLevel : 1,
                    transformOrigin: `${mousePos.x}% ${mousePos.y}%`
                }}
                transition={{ type: 'spring', stiffness: 100, damping: 20, mass: 0.5 }}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
            />
            {!isHovering && (
                <div style={{ position: 'absolute', bottom: '20px', right: '20px', background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '50%', backdropFilter: 'blur(4px)', color: '#1d1d1f' }}>
                    <Search size={18} />
                </div>
            )}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductDetailPage = ({ usesSlug }) => {
    const { id, slug } = useParams();
    const navigate = useNavigate();
    const identifier = usesSlug ? slug : id;
    const [product, setProduct] = useState(null);
    const [aplusContents, setAplusContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('View');
    const [activeVariantIndex, setActiveVariantIndex] = useState(-1);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('');
    const [activeImage, setActiveImage] = useState(0);
    const [isAtTop, setIsAtTop] = useState(false);
    const [galleryIndex, setGalleryIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const sentinelRef = useRef(null);
    const galleryContainerRef = useRef(null);

    const sectionRefs = {
        View: useRef(null),
        Views: useRef(null),
        Description: useRef(null),
        Spec: useRef(null),
        Galleries: useRef(null),
        Downloadables: useRef(null)
    };

    const normalizePath = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `http://${window.location.hostname}:5000${path.startsWith('/') ? '' : '/'}${path.trim()}`;
    };

    const currentVariant = (product && activeVariantIndex >= 0) ? product.variants?.[activeVariantIndex] : null;
    const allImages = product ? [
        ...(currentVariant ? (currentVariant.previews || []) : [product.image, ...(product.product_images?.map(img => img.image_path) || [])].filter(Boolean)),
        product.desktop_banner,
        product.mobile_banner
    ].filter(Boolean).map(normalizePath) : [];
    const specs = currentVariant ? (currentVariant.specs || []) : (product ? (Array.isArray(product.specifications) ? product.specifications : []) : []);
    const features = currentVariant ? (currentVariant.features || []) : (product ? (Array.isArray(product.featuresList) ? product.featuresList : []) : []);

    const scrollToSection = (tab) => {
        setActiveTab(tab);
        const target = tab === 'product' ? 'View' : tab;
        sectionRefs[target].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsAtTop(!entry.isIntersecting);
            },
            { threshold: 0 }
        );

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (sentinelRef.current) {
                observer.unobserve(sentinelRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (galleryContainerRef.current) {
            gsap.to(galleryContainerRef.current, {
                x: `-${Math.min(galleryIndex, Math.max(0, allImages.length - 5)) * (100 / 5)}%`,
                duration: 0.6,
                ease: "power2.out"
            });
        }
    }, [galleryIndex, allImages.length]);

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

                if (data?.id) {
                    try {
                        const aplusRes = await aplusService.getForProduct(data.id);
                        setAplusContents(aplusRes.data?.data || []);
                    } catch (aplusErr) {
                        console.error('Failed to fetch A+ Content:', aplusErr);
                    }
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

    const pageTitle = product.product_name || product.modal;
    const categoryName = (product.category_name || 'PC CASE').toUpperCase();
    const accentColor = '#ff6b00'; // darkFlash Orange

    const handleDownloadAll = async () => {
        if (!allImages || allImages.length === 0) return;

        for (let i = 0; i < allImages.length; i++) {
            const url = allImages[i];
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = `${product.modal || 'tortox'}_gallery_${i + 1}.jpg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
                // Pause slightly to prevent the browser from blocking multiple simultaneous downloads
                await new Promise(r => setTimeout(r, 250));
            } catch (err) {
                console.error("Failed to download image", url, err);
            }
        }
    };

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh', color: '#1d1d1f' }}>
            <StructuredData product={product} />

            {/* LIGHTBOX MODAL TRIGGERED BY VIEW ALL IMAGES */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(15px)', zIndex: 100000, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
                    >
                        <div style={{ position: 'sticky', top: 0, padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.9)', zIndex: 10, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#111827', textTransform: 'uppercase', letterSpacing: '2px' }}>Product Gallery / <span style={{ color: '#ff9800' }}>{allImages.length} ITEMS</span></h2>
                            <button onClick={() => setIsLightboxOpen(false)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#ef4444'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}>
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
                            {allImages.map((src, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => { setGalleryIndex(index); setIsLightboxOpen(false); window.scrollTo({ top: document.getElementById('tortox-galleries-section').offsetTop - 100, behavior: 'smooth' }); }}
                                    style={{ background: '#000', borderRadius: '16px', overflow: 'hidden', aspectRatio: '1/1', position: 'relative', cursor: 'zoom-in', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
                                >
                                    <img src={src} alt={`Gallery grid ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9, transition: 'transform 0.4s ease, opacity 0.4s ease' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.opacity = '1'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '0.9'; }} />
                                    <div style={{ position: 'absolute', bottom: '15px', right: '15px', background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, backdropFilter: 'blur(5px)' }}>IMG-{index + 1}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FULL SCREEN IMAGE PREVIEW MODAL */}
            <AnimatePresence>
                {selectedPreviewImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedPreviewImage(null)}
                        style={{ 
                            position: 'fixed', 
                            inset: 0, 
                            background: 'rgba(0,0,0,0.95)', 
                            backdropFilter: 'blur(10px)', 
                            zIndex: 200000, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            cursor: 'zoom-out',
                            padding: '40px'
                        }}
                    >
                        <motion.button 
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ 
                                position: 'absolute', 
                                top: '40px', 
                                right: '40px', 
                                background: 'rgba(255,255,255,0.1)', 
                                border: 'none', 
                                color: '#fff', 
                                borderRadius: '50%', 
                                width: '50px', 
                                height: '50px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                cursor: 'pointer'
                            }}
                        >
                            <X size={24} />
                        </motion.button>
                        
                        <motion.img 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            src={selectedPreviewImage} 
                            alt="Full Preview" 
                            style={{ 
                                maxWidth: '90%', 
                                maxHeight: '90%', 
                                objectFit: 'contain', 
                                boxShadow: '0 30px 100px rgba(0,0,0,0.5)' 
                            }} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            <Navbar theme="light" fixed={false} />

            {/* ── BREADCRUMB ── */}
            <div style={{
                borderBottom: '1px solid #f2f2f2',
                padding: '0 80px',
                background: '#fafafa',
                position: 'relative',
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

            {/* ── SECTION: VIEW (Main Product Content) ── */}
            <div ref={sectionRefs.View} style={{ maxWidth: '1600px', margin: '0 auto', padding: '40px 60px', display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '60px' }}>
                {/* LEFT COLUMN: GALLERY */}
                <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
                    {/* Vertical Thumbnails */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                        <div style={{ cursor: 'pointer', opacity: 0.5 }}><ChevronUp size={20} /></div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            maxHeight: '650px',
                            overflowY: 'auto',
                            padding: '5px',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }}>
                            {allImages.map((img, i) => (
                                <div
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    style={{
                                        width: '80px',
                                        height: '80px',
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
                                    <img src={img} alt={`Thumb ${i}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </div>
                            ))}
                        </div>
                        <div style={{ cursor: 'pointer', opacity: 0.5 }}><ChevronDown size={20} /></div>
                    </div>

                    {/* Main Image View */}
                    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <button
                            onClick={() => setActiveImage(prev => (prev > 0 ? prev - 1 : allImages.length - 1))}
                            style={{ position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: 'none', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d1d1f', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        >
                            <ChevronLeft size={28} />
                        </button>
                        <div style={{ width: '100%', height: '700px', background: '#fbfbfb', borderRadius: '24px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            <ImageMagnifier src={allImages[activeImage]} alt={pageTitle} />
                        </div>
                        <button
                            onClick={() => setActiveImage(prev => (prev < allImages.length - 1 ? prev + 1 : 0))}
                            style={{ position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: 'none', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d1d1f', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        >
                            <ChevronRight size={28} />
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: INFO */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#1d1d1f', marginBottom: '30px', lineHeight: 1.1 }}>{pageTitle}</h1>
                        <ul style={{ paddingLeft: '20px', color: '#424245', lineHeight: '2', fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {features.length > 0 ? features.map((f, i) => <li key={i}>{f}</li>) : (
                                <>
                                    <li>Professional grade airflow design for optimal cooling.</li>
                                    <li>Spacious interior supporting latest hardware components.</li>
                                    <li>Tool-less panel design for easy access and maintenance.</li>
                                    <li>Premium aesthetics with tempered glass panels.</li>
                                </>
                            )}
                        </ul>
                    </div>
                    <div style={{ height: '1px', background: '#f2f2f2', width: '100%' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div>
                            <p style={{ fontWeight: 700, marginBottom: '15px' }}>Colors - {currentVariant?.Color || 'Black'}</p>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                {[...new Map(product.variants?.map(v => [v.Color, v])).values()].map((v, i) => (
                                    <div key={i} onClick={() => {
                                        const firstMatch = product.variants.find(pv => pv.Color === v.Color);
                                        if (firstMatch) {
                                            const idx = product.variants.indexOf(firstMatch);
                                            setActiveVariantIndex(idx);
                                            setActiveImage(0);
                                            setSelectedSize(firstMatch.Size || '');
                                            setSelectedStyle(firstMatch.Style || '');
                                        }
                                    }} style={{ width: '36px', height: '36px', borderRadius: '50%', background: v.Color?.toLowerCase() === 'white' ? '#fff' : (v.Color?.toLowerCase() === 'black' ? '#1d1d1f' : v.Color), border: v.Color?.toLowerCase() === 'white' ? '1px solid #d2d2d7' : 'none', padding: '3px', cursor: 'pointer', outline: currentVariant?.Color === v.Color ? `2px solid #00dccc` : 'none', outlineOffset: '2px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }} />
                                ))}
                            </div>
                        </div>
                        {product.variants?.some(v => v.Style) && (
                            <div>
                                <p style={{ fontWeight: 700, marginBottom: '15px' }}>Style</p>
                                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                    {[...new Set(product.variants.filter(v => v.Color === currentVariant?.Color).map(v => v.Style).filter(Boolean))].map((style, idx) => {
                                        const isActive = selectedStyle === style;
                                        return (
                                            <div key={idx} onClick={() => { setSelectedStyle(style); const newIndex = product.variants.findIndex(v => v.Color === currentVariant?.Color && v.Style === style && (v.Size === selectedSize || !v.Size)); if (newIndex !== -1) setActiveVariantIndex(newIndex); }} style={{ padding: '16px 24px', border: isActive ? `1.5px solid ${accentColor}` : '1.5px solid #e5e5e5', borderRadius: '8px', color: isActive ? accentColor : '#86868b', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', minWidth: '100px', textAlign: 'center', background: isActive ? `${accentColor}08` : 'transparent', transition: 'all 0.2s' }}>{style}</div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {product.variants?.some(v => v.Size) && (
                            <div>
                                <p style={{ fontWeight: 700, marginBottom: '15px' }}>Size</p>
                                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                    {[...new Set(product.variants.filter(v => v.Color === currentVariant?.Color && v.Style === selectedStyle).map(v => v.Size).filter(Boolean))].map((size, idx) => {
                                        const isActive = selectedSize === size;
                                        return (
                                            <div key={idx} onClick={() => { setSelectedSize(size); const newIndex = product.variants.findIndex(v => v.Color === currentVariant?.Color && v.Style === selectedStyle && v.Size === size); if (newIndex !== -1) setActiveVariantIndex(newIndex); }} style={{ padding: '16px 24px', border: isActive ? `1.5px solid ${accentColor}` : '1.5px solid #e5e5e5', borderRadius: '8px', color: isActive ? accentColor : '#86868b', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', minWidth: '100px', textAlign: 'center', background: isActive ? `${accentColor}08` : 'transparent', transition: 'all 0.2s' }}>{size}</div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.05, background: '#e11919' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/contact')}
                            style={{ marginTop: '10px', padding: '14px 40px', background: '#1d1d1f', borderRadius: '25px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: '#fff', border: 'none', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', width: 'fit-content', transition: 'background 0.2s' }}
                        >
                            Shop Now
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* 🛠️ Sticky Navigation Strip (Unified Scroll Parent) */}
            <div ref={sentinelRef} style={{ height: '1px', width: '100%', marginTop: '60px' }} />
            <div style={{
                borderTop: '1px solid #f2f2f2',
                borderBottom: '1px solid #f2f2f2',
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)',
                height: '70px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 8%',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                boxShadow: isAtTop ? '0 10px 40px rgba(0,0,0,0.06)' : 'none'
            }}>
                <div style={{ display: 'flex', gap: '60px', height: '100%' }}>
                    {['product', 'Views', 'Description', 'Spec', 'Galleries', 'Downloadables'].map(tab => (
                        <div
                            key={tab}
                            onClick={() => scrollToSection(tab)}
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
                                <motion.div layoutId="tab-underline" style={{ position: 'absolute', bottom: '-1px', left: '-5px', right: '-5px', height: '3px', background: accentColor, zIndex: 2 }} />
                            )}
                        </div>
                    ))}
                </div>
                <AnimatePresence>
                    {isAtTop && (
                        <motion.button
                            initial={{ opacity: 0, x: 20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            whileHover={{ scale: 1.05, background: '#e11919' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/contact')}
                            style={{
                                padding: '12px 36px',
                                background: '#1d1d1f',
                                borderRadius: '100px',
                                color: '#fff',
                                border: 'none',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                letterSpacing: '1.5px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                marginLeft: 'auto' // Force to right end
                            }}
                        >
                            Shop Now
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            <div ref={sectionRefs.Views} style={{ maxWidth: '1440px', margin: '0 auto', padding: '100px 80px', borderBottom: '1px solid #f2f2f2' }}>
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <h2 className="tortox-heading" style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '-1px' }}>Studio Perspectives</h2>
                    <p style={{ fontSize: '1.2rem', color: '#86868b' }}>Every detail captured from our engineering desk to your screen.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                    {allImages.slice(0, 3).map((img, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: i * 0.2 }}
                            viewport={{ once: true }}
                            style={{ borderRadius: '24px', overflow: 'hidden', background: '#f5f5f7' }}
                        >
                            <img src={img} alt={`Perspective ${i}`} style={{ width: '100%', height: '400px', objectFit: 'contain' }} />
                        </motion.div>
                    ))}
                </div>
            </div>
            
            {/* ── SECTION: CINEMATIC SCROLL REVEAL ── */}
            <ScrollVideoSection 
                src="https://assets.mixkit.co/videos/preview/mixkit-futuristic-computer-components-and-lights-42512-large.mp4"
                title={`${product?.product_name || "Premium Hardware"}`}
                description={`Engineered for high-performance computing. Experience the future of industrial design with the ${product?.product_name || "Tortox Series"}. Optimized airflow, modular flexibility, and signature Tortox aesthetics.`}
            />

            {/* ── SECTION: A+ MARKETING CAPTURES (Vertical Poster) ── */}
            {aplusContents.length > 0 && (
                <div style={{ width: '100%', background: '#fff', borderBottom: '1px solid #f2f2f2', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {aplusContents.map(block => {
                        // 🛠️ Responsive selection logic
                        const mediaSource = (isMobile && block.mobile_media_path) 
                            ? normalizePath(block.mobile_media_path) 
                            : (block.image_paths?.[0] ? normalizePath(block.image_paths[0]) : null);

                        if (!mediaSource) return null;

                        return (
                            <div key={block.id} style={{ width: '100%' }}>
                                {mediaSource.match(/\.(mp4|webm|ogg)$/i) ? (
                                    <ScrollVideoSection 
                                        src={mediaSource}
                                        title={block.title || product?.product_name || "Premium Series"}
                                        description={block.description || "Cinematic marketing reveal."}
                                    />
                                ) : (
                                    <ScrollRevealImage
                                        src={mediaSource}
                                        alt="Marketing Detail"
                                        delay={0.1}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── SECTION: DESCRIPTION (Deep Dive) ── */}
            <div ref={sectionRefs.Description} style={{ maxWidth: '1100px', margin: '0 auto', padding: '100px 20px', borderBottom: '1px solid #f2f2f2' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 className="tortox-heading" style={{ fontSize: '3.5rem', fontWeight: 900, color: '#1d1d1f', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '-1px' }}>Deep Dive</h2>
                    <p style={{ fontSize: '1.1rem', color: '#86868b', maxWidth: '600px', margin: '0 auto' }}>Design philosophy behind this unit.</p>
                </div>
                <div style={{ background: '#ffffff', borderRadius: '32px', padding: '60px', boxShadow: '0 20px 80px rgba(0,0,0,0.03)', border: '1px solid #f2f2f2', lineHeight: '1.8', fontSize: '1.15rem', color: '#4b5563', whiteSpace: 'pre-wrap' }}>
                    {currentVariant?.description || product.description || "Detailed narrative overview coming soon."}
                </div>
            </div>

            {/* ── SECTION: SPEC (Specifications) ── */}
            <div ref={sectionRefs.Spec} style={{ maxWidth: '1000px', margin: '0 auto', padding: '100px 20px', borderBottom: '1px solid #f2f2f2' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <style>{`
                        .tortox-heading {
                            display: inline-block;
                            background: linear-gradient(to bottom, #e11919 50%, #1d1d1f 50%);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            padding: 10px 0;
                        }
                    `}</style>
                    <h2 className="tortox-heading" style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '-1px' }}>Technical Specifications</h2>
                </div>
                <div style={{ borderTop: '1px solid #f2f2f2' }}>
                    {specs.length > 0 ? specs.map((s, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr', padding: '24px 0', borderBottom: '1px solid #f2f2f2' }}>
                            <span style={{ fontWeight: 700, color: '#86868b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>{s.label || s.specification_name}</span>
                            <span style={{ fontWeight: 600, color: '#1d1d1f' }}>{s.value || s.specification_value}</span>
                        </div>
                    )) : <div style={{ padding: '60px', textAlign: 'center', color: '#86868b' }}>Technical specifications coming soon.</div>}
                </div>
            </div>

            {/* ── SECTION: GALLERIES ── */}
            <div ref={sectionRefs.Galleries} style={{ width: '100%', padding: '100px 0', borderBottom: '1px solid #f2f2f2', background: '#fff' }}>
                <h2 className="tortox-heading" style={{ display: 'block', fontSize: '3.5rem', fontWeight: 900, textAlign: 'center', marginBottom: '50px', color: '#1d1d1f', textTransform: 'uppercase', letterSpacing: '-1px' }}>Product Galleries</h2>

                <div style={{ position: 'relative', width: '100%', maxWidth: '1920px', margin: '0 auto', overflow: 'hidden' }}>
                    <div
                        ref={galleryContainerRef}
                        style={{ display: 'flex', gap: '8px', padding: '0 8px' }}
                    >
                        {allImages.map((img, i) => (
                            <div 
                                key={i} 
                                onClick={() => setSelectedPreviewImage(img)} 
                                style={{ 
                                    flex: '0 0 calc(20% - 6.4px)', aspectRatio: '1/1', 
                                    background: '#0a0a0a', overflow: 'hidden', 
                                    cursor: 'pointer', position: 'relative',
                                    group: 'true' // Logical flag for hover interactions
                                }}
                                onMouseEnter={(e) => {
                                    const btn = e.currentTarget.querySelector('.single-dl-btn');
                                    if(btn) btn.style.opacity = '1';
                                }}
                                onMouseLeave={(e) => {
                                    const btn = e.currentTarget.querySelector('.single-dl-btn');
                                    if(btn) btn.style.opacity = '0';
                                }}
                            >
                                <img src={img} alt={`Gallery ${i}`} style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.95, transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.95; e.currentTarget.style.transform = 'scale(1)'; }} />
                                
                                <motion.button
                                    className="single-dl-btn"
                                    whileHover={{ scale: 1.1, background: '#e11919' }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const a = document.createElement('a');
                                        a.href = img;
                                        a.download = `tortox_${product.modal}_${i+1}.jpg`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                    }}
                                    style={{
                                        position: 'absolute', bottom: '15px', right: '15px',
                                        width: '38px', height: '38px', borderRadius: '50%',
                                        background: 'rgba(29, 29, 31, 0.8)', color: '#fff',
                                        border: 'none', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', cursor: 'pointer',
                                        opacity: 0, transition: 'all 0.3s',
                                        backdropFilter: 'blur(10px)', zIndex: 6
                                    }}
                                >
                                    <Download size={18} />
                                </motion.button>
                            </div>
                        ))}
                    </div>

                    {galleryIndex > 0 && (
                        <motion.button 
                            whileHover={{ background: 'rgba(225, 25, 25, 0.4)' }}
                            onClick={() => setGalleryIndex(p => Math.max(0, p - 1))} 
                            style={{ 
                                position: 'absolute', left: 0, top: 0, bottom: 0, 
                                width: '60px', background: 'rgba(0,0,0,0.2)', 
                                border: 'none', color: '#fff', cursor: 'pointer', 
                                zIndex: 5, display: 'flex', alignItems: 'center', 
                                justifyContent: 'center', backdropFilter: 'blur(4px)',
                                transition: 'background 0.3s'
                            }}
                        >
                            <motion.div whileHover={{ scale: 1.2 }}>
                                <ChevronLeft size={44} strokeWidth={2.5} />
                            </motion.div>
                        </motion.button>
                    )}
                    {galleryIndex < Math.max(0, allImages.length - 5) && (
                        <motion.button 
                            whileHover={{ background: 'rgba(225, 25, 25, 0.4)' }}
                            onClick={() => setGalleryIndex(p => p + 1)} 
                            style={{ 
                                position: 'absolute', right: 0, top: 0, bottom: 0, 
                                width: '60px', background: 'rgba(0,0,0,0.2)', 
                                border: 'none', color: '#fff', cursor: 'pointer', 
                                zIndex: 5, display: 'flex', alignItems: 'center', 
                                justifyContent: 'center', backdropFilter: 'blur(4px)',
                                transition: 'background 0.3s'
                            }}
                        >
                            <motion.div whileHover={{ scale: 1.2 }}>
                                <ChevronRight size={44} strokeWidth={2.5} />
                            </motion.div>
                        </motion.button>
                    )}
                </div>

                {/* Dots */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '30px' }}>
                    {allImages.map((_, i) => (
                        <div key={i} onClick={() => setGalleryIndex(i)} style={{ width: i === galleryIndex ? '8px' : '6px', height: i === galleryIndex ? '8px' : '6px', borderRadius: '50%', background: i === galleryIndex ? '#1d1d1f' : '#d2d2d7', cursor: 'pointer', transition: 'all 0.2s' }} />
                    ))}
                </div>

                {/* Bottom Buttons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '60px' }}>
                    <motion.button 
                        whileHover={{ scale: 1.05, y: -2, background: '#e11919' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsLightboxOpen(true)} 
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '12px', 
                            padding: '16px 40px', background: '#1d1d1f', color: '#fff', 
                            border: 'none', borderRadius: '40px', fontWeight: 800, 
                            fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                            letterSpacing: '0.5px'
                        }}
                    >
                        <LayoutGrid size={20} />
                        View All Images
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.05, background: 'rgba(225, 25, 25, 0.05)', borderColor: '#e11919', color: '#e11919' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDownloadAll} 
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '12px', 
                            padding: '16px 40px', background: '#fff', color: '#1d1d1f', 
                            border: '2px solid #1d1d1f', borderRadius: '40px', 
                            fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', 
                            transition: 'all 0.2s', letterSpacing: '0.5px'
                        }}
                    >
                        <Download size={20} />
                        Download Asset Pack
                    </motion.button>
                </div>
            </div>

            {/* ── SECTION: DOWNLOADABLES ── */}
            <div ref={sectionRefs.Downloadables} style={{ maxWidth: '1000px', margin: '0 auto', padding: '100px 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 className="tortox-heading" style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '-1px' }}>Downloads & Support</h2>
                </div>
                <div style={{ marginBottom: '60px' }}>
                    <h3 style={{ fontSize: '0.9rem', color: '#86868b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '25px', fontWeight: 800 }}>Documentation</h3>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {(product.technical_manuals || []).map((m, idx) => (
                            <motion.a 
                                key={idx} 
                                whileHover={{ x: 5, background: '#f5f5f7', borderColor: '#d2d2d7' }}
                                href={m.download_path || normalizePath(m.preview)} 
                                download 
                                target="_blank" 
                                rel="noreferrer" 
                                style={{ 
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                                    padding: '24px 30px', background: '#fff', 
                                    borderRadius: '20px', border: '1px solid #f2f2f2',
                                    textDecoration: 'none', color: '#1d1d1f',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ padding: '12px', background: 'rgba(225,25,25,0.05)', borderRadius: '12px' }}>
                                        <FileText size={22} color="#e11919" />
                                    </div>
                                    <div>
                                        <span style={{ display: 'block', fontWeight: 800, fontSize: '1rem' }}>{m.download_label || 'Product Manual'}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#86868b', fontWeight: 600 }}>Technical Documentation (PDF)</span>
                                    </div>
                                </div>
                                <Download size={20} color="#1d1d1f" />
                            </motion.a>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 style={{ fontSize: '0.9rem', color: '#86868b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '25px', fontWeight: 800 }}>Software & Drivers</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {(product.downloads || []).map((dl, idx) => (
                            <motion.a 
                                key={idx} 
                                whileHover={{ y: -5, background: '#f5f5f7', borderColor: '#d2d2d7' }}
                                href={dl.download_path || normalizePath(dl.preview)} 
                                download 
                                target="_blank" 
                                rel="noreferrer" 
                                style={{ 
                                    display: 'flex', flexDirection: 'column', gap: '20px', 
                                    padding: '30px', background: '#fff', 
                                    borderRadius: '24px', border: '1px solid #f2f2f2',
                                    textDecoration: 'none', color: '#1d1d1f',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div style={{ padding: '12px', background: '#1d1d1f', borderRadius: '12px' }}>
                                        <Download size={22} color="#fff" />
                                    </div>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 900, background: 'rgba(0,0,0,0.05)', padding: '4px 10px', borderRadius: '20px', color: '#86868b' }}>FW/SW</span>
                                </div>
                                <div>
                                    <span style={{ display: 'block', fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px' }}>{dl.download_label}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#86868b', fontWeight: 600 }}>Windows Compatible</span>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ProductDetailPage;
