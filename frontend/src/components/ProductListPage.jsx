import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '../services/product';
import { categoryService } from '../services/category';
import { ChevronRight, Trash2, Search } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [hoveredId, setHoveredId] = useState(null);
    
    // Filter states
    const [mbSupport, setMbSupport] = useState([]);
    const [liquidCooler, setLiquidCooler] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [prodRes, catRes] = await Promise.all([
                    productService.getAll(),
                    categoryService.getAll()
                ]);
                setProducts(prodRes.data?.data || []);
                setCategories(catRes.data?.data || []);
            } catch (err) {
                console.error('Failed to load products:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const toggleFilter = (list, setList, value) => {
        if (list.includes(value)) {
            setList(list.filter(item => item !== value));
        } else {
            setList([...list, value]);
        }
    };

    const resetFilters = () => {
        setMbSupport([]);
        setLiquidCooler([]);
        setSelectedCategory('All');
    };

    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory === 'All' || String(p.category_id) === String(selectedCategory);
        
        // Advanced filtering based on specs in DB
        let specs = {};
        try {
            specs = typeof p.specs === 'string' ? JSON.parse(p.specs) : (p.specs || {});
        } catch(e) {}

        const mbValue = specs.mb_compat?.value || p.mb_compat;
        const matchesMb = mbSupport.length === 0 || mbSupport.some(m => mbValue?.includes(m));

        const coolerValue = specs.cooler_compat?.value || p.cooler_compat;
        const matchesCooler = liquidCooler.length === 0 || liquidCooler.some(c => coolerValue?.includes(c));

        return matchesCategory && matchesMb && matchesCooler;
    });

    return (
        <div style={{ backgroundColor: '#f5f5f7', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            {/* Breadcrumb Section */}
            <div style={{ marginTop: '80px', padding: '20px 60px', backgroundColor: '#f5f5f7' }}>
                <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px', color: '#86868b', fontSize: '0.8rem' }}>
                    <span>Home</span> <ChevronRight size={12} />
                    <span>Products</span> <ChevronRight size={12} />
                    <span style={{ color: '#1d1d1f', fontWeight: 500 }}>PC Case</span>
                </div>
            </div>

            <main style={{ maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '0 60px 80px', display: 'flex', gap: '40px', boxSizing: 'border-box' }}>
                
                {/* 🛡️ Sidebar Filters */}
                <aside style={{ width: '240px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #d2d2d7', paddingBottom: '15px' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#1d1d1f' }}>Filter</h2>
                        <Trash2 size={18} style={{ color: '#86868b', cursor: 'pointer' }} onClick={resetFilters} />
                    </div>

                    {/* Mb Support */}
                    <div style={{ marginBottom: '35px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '15px', color: '#1d1d1f' }}>Motherboard Support</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {['E-ATX', 'ATX', 'M-ATX', 'ITX'].map(mb => (
                                <label key={mb} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#424245', cursor: 'pointer' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={mbSupport.includes(mb)} 
                                        onChange={() => toggleFilter(mbSupport, setMbSupport, mb)}
                                        style={checkboxStyle} 
                                    />
                                    {mb}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ height: '1px', background: '#d2d2d7', marginBottom: '30px' }} />

                    {/* Liquid Cooler Support */}
                    <div style={{ marginBottom: '35px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '15px', color: '#1d1d1f' }}>Liquid Cooler Support</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {['120mm', '140mm', '240mm', '280mm', '360mm', '480mm'].map(sz => (
                                <label key={sz} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#424245', cursor: 'pointer' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={liquidCooler.includes(sz)} 
                                        onChange={() => toggleFilter(liquidCooler, setLiquidCooler, sz)}
                                        style={checkboxStyle} 
                                    />
                                    {sz}
                                </label>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* 📦 Product Grid */}
                <section style={{ flexGrow: 1 }}>
                    {loading ? (
                        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="loader" />
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {filteredProducts.map((p) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onMouseEnter={() => setHoveredId(p.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    whileHover={{ boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
                                    style={{
                                        background: '#fff',
                                        borderRadius: '12px',
                                        padding: '24px',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <span style={{
                                        position: 'absolute', top: '15px', left: '15px',
                                        background: '#000', color: '#fff', padding: '4px 12px',
                                        borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, zIndex: 2
                                    }}>New</span>

                                    <div style={{ width: '100%', aspectRatio: '1/1', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', position: 'relative' }}>
                                        <img 
                                            src={(hoveredId === p.id && p.hover_image) ? (p.hover_image.startsWith('http') ? p.hover_image : `http://localhost:5000${p.hover_image}`) : (p.product_images?.[0]?.image_path || p.image || 'https://via.placeholder.com/300')} 
                                            alt={p.alt_text || p.product_name} 
                                            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', transition: 'all 0.3s' }}
                                        />
                                    </div>

                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#000', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                                        {p.product_name}
                                    </h3>
                                    
                                    <div style={{ fontSize: '0.85rem', color: '#86868b', fontWeight: 500, marginBottom: '20px' }}>
                                        {p.modal} / {(() => {
                                             let specs = {};
                                             try { specs = typeof p.specs === 'string' ? JSON.parse(p.specs) : (p.specs || {}); } catch(e) {}
                                             return specs.dimensions?.value || 'Standard Size';
                                        })()}
                                    </div>

                                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#000', border: '2px solid #fff', boxShadow: '0 0 0 1px #d2d2d7' }} />
                                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#f5f5f7', border: '2px solid #fff', boxShadow: '0 0 0 1px #d2d2d7' }} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <Footer />

            <style>{`
                .loader { width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #000; border-radius: 50%; animation: spin 0.8s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

const checkboxStyle = {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    border: '1px solid #d2d2d7',
    cursor: 'pointer',
    accentColor: '#000'
};

export default ProductListPage;
