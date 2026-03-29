import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '../services/product';
import { ChevronLeft, ChevronRight, Check, Info, Box, Shield, Package } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await productService.getById(id);
                setProduct(res.data?.data || null);
            } catch (err) {
                console.error("Failed to fetch product:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loader" />
                <style>{`
                    .loader { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #e11919; border-radius: 50%; animation: spin 1s linear infinite; }
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Navbar />
                <h2 style={{ color: '#111827' }}>Product not found</h2>
                <button onClick={() => navigate('/products')} style={{ marginTop: '20px', padding: '10px 20px', background: '#e11919', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Back to Products</button>
                <Footer />
            </div>
        );
    }

    const normalizePath = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const allImages = [
        product.image,
        ...(product.product_images?.map(img => img.image_path) || [])
    ].filter(Boolean).map(normalizePath);

    let specs = [];
    try {
        const parsed = typeof product.specifications === 'string' ? JSON.parse(product.specifications) : (product.specifications || []);
        specs = Array.isArray(parsed) ? parsed : Object.entries(parsed).map(([k, v]) => ({ specification_name: k, specification_value: typeof v === 'object' ? v.value : v }));
    } catch(e) {}

    let features = [];
    try {
        features = typeof product.featuresList === 'string' ? JSON.parse(product.featuresList) : (product.featuresList || []);
    } catch(e) {}

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh', color: '#111827', fontFamily: 'Inter, sans-serif' }}>
            <Navbar />
            
            <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '120px 60px 80px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '80px' }}>
                
                {/* 📸 Left: Sticky Image Gallery */}
                <div style={{ position: 'sticky', top: '120px', alignSelf: 'start' }}>
                    <div style={{ background: '#f8fafc', borderRadius: '24px', overflow: 'hidden', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', border: '1px solid rgba(0,0,0,0.03)' }}>
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={activeImage}
                                src={allImages[activeImage]}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.4 }}
                                style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }}
                            />
                        </AnimatePresence>
                        
                        {allImages.length > 1 && (
                            <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
                                {allImages.map((_, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => setActiveImage(i)}
                                        style={{ 
                                            width: i === activeImage ? '24px' : '8px', 
                                            height: '8px', 
                                            borderRadius: '4px', 
                                            background: i === activeImage ? '#e11919' : 'rgba(0,0,0,0.2)', 
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginTop: '20px' }}>
                        {allImages.map((img, i) => (
                            <div 
                                key={i}
                                onClick={() => setActiveImage(i)}
                                style={{ 
                                    aspectRatio: '1', 
                                    borderRadius: '12px', 
                                    overflow: 'hidden', 
                                    cursor: 'pointer', 
                                    border: i === activeImage ? '2px solid #e11919' : '1px solid rgba(0,0,0,0.05)',
                                    background: '#f8fafc',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '5px'
                                }}
                            >
                                <img src={img} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 📄 Right: Content Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                            <span style={{ padding: '4px 12px', background: 'rgba(225,25,25,0.08)', color: '#e11919', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800 }}>KINETIC SERIES</span>
                            <span style={{ padding: '4px 12px', background: '#f3f4f6', color: '#4b5563', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 }}>ID: #{product.id}</span>
                        </div>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#111827', margin: '0 0 10px 0', lineHeight: '1.2' }}>{product.product_name || product.name}</h1>
                        <p style={{ fontSize: '1.25rem', color: '#4b5563', fontWeight: 500 }}>{product.modal || 'Standard Edition'}</p>
                    </div>

                    <div style={{ fontSize: '1.1rem', color: '#374151', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                        {product.product_description || product.description || 'No description provided for this professional grade tactical hardware.'}
                    </div>

                    {/* Features List */}
                    {features.length > 0 && (
                        <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {features.map((feat, i) => (
                                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#e11919', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                        <Check size={12} color="#fff" strokeWidth={3} />
                                    </div>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1f2937' }}>{feat}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Professional Specs */}
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Info size={24} color="#e11919" />
                            Technical Specifications
                        </h3>
                        <div style={{ border: '1px solid rgba(0,0,0,0.05)', borderRadius: '20px', overflow: 'hidden' }}>
                            {specs.length > 0 ? specs.map((spec, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', padding: '20px 30px', borderBottom: i === specs.length - 1 ? 'none' : '1px solid rgba(0,0,0,0.05)', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                    <span style={{ fontWeight: 800, color: '#6b7280', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{spec.specification_name}</span>
                                    <span style={{ fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>{spec.specification_value}</span>
                                </div>
                            )) : (
                                <div style={{ padding: '30px', textAlign: 'center', color: '#9ca3af' }}>No specifications available.</div>
                            )}
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '20px' }}>
                        <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #f1f5f9', borderRadius: '16px' }}>
                            <Shield size={24} color="#e11919" style={{ margin: '0 auto 10px' }} />
                            <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>PRO BUILD</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #f1f5f9', borderRadius: '16px' }}>
                            <Package size={24} color="#e11919" style={{ margin: '0 auto 10px' }} />
                            <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>PREMIUM BOX</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #f1f5f9', borderRadius: '16px' }}>
                            <Box size={24} color="#e11919" style={{ margin: '0 auto 10px' }} />
                            <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>KINETIC PACK</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <button className="kinetic-buy-btn" style={{ width: '100%', padding: '24px', background: '#000', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '1.2rem', fontWeight: 900, cursor: 'pointer', transition: 'all 0.3s' }}>
                            INQUIRE ABOUT THIS GEAR
                        </button>
                    </div>
                </div>
            </main>

            <Footer />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                .kinetic-buy-btn:hover { background: #e11919; transform: translateY(-4px); box-shadow: 0 15px 30px rgba(225,25,25,0.25); }
            `}</style>
        </div>
    );
};

export default ProductDetailPage;
