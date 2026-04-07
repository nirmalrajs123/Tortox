import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productService } from '../services/product';
import { categoryService } from '../services/category';
import { ChevronRight, Trash2, Search, Filter as FilterIcon, SlidersHorizontal } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import ProductCard from './ProductCard';

const ProductListPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const categoryFromUrl = searchParams.get('category');

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filterConfig, setFilterConfig] = useState([]); // Array of { id, filter_label, values: [{id, filter_value}] }
    const [selectedFilters, setSelectedFilters] = useState({}); // { labelId: [value1, value2] }
    const [loading, setLoading] = useState(true);
    const [hoveredId, setHoveredId] = useState(null);

    useEffect(() => {
        const loadPageData = async () => {
            try {
                setLoading(true);
                // 1. Load Categories & Products (filtered by cat if present)
                const [prodRes, catRes] = await Promise.all([
                    productService.getAll({ category: categoryFromUrl }),
                    categoryService.getAll()
                ]);
                setProducts(prodRes.data?.data || []);
                setCategories(catRes.data?.data || []);

                // 2. Load Dynamic Filter Config for this category
                if (categoryFromUrl && categoryFromUrl !== 'all') {
                    const filterRes = await productService.getFilterConfig(categoryFromUrl);
                    setFilterConfig(filterRes.data?.data || []);
                } else {
                    setFilterConfig([]);
                }

                // Reset active filters when category changes
                setSelectedFilters({});
            } catch (err) {
                console.error('Relay fetch failed:', err);
            } finally {
                setLoading(false);
            }
        };
        loadPageData();
        window.scrollTo(0, 0);
    }, [categoryFromUrl]);

    const toggleFilter = (labelId, value) => {
        const current = selectedFilters[labelId] || [];
        if (current.includes(value)) {
            setSelectedFilters({ ...selectedFilters, [labelId]: current.filter(v => v !== value) });
        } else {
            setSelectedFilters({ ...selectedFilters, [labelId]: [...current, value] });
        }
    };

    const resetFilters = () => setSelectedFilters({});

    const currentCategoryName = categories.find(c => String(c.id) === String(categoryFromUrl))?.category_name || 'All Products';

    const filteredProducts = products.filter(p => {
        // Multi-dimensional filter logic
        return Object.entries(selectedFilters).every(([labelId, activeValues]) => {
            if (activeValues.length === 0) return true;
            // A product matches if any of its filters match any of the active values for this labelId
            const productFilters = p.active_filters || [];
            return activeValues.some(val =>
                productFilters.some(pf => String(pf.filter_type_id) === String(labelId) && pf.filter_value === val)
            );
        });
    });

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
            <Navbar theme="light" />

            {/* 🌌 Dynamic Category Hero Banner */}
            <div style={{
                position: 'relative',
                height: '380px',
                width: '100%',
                overflow: 'hidden',
                background: `#000 url('/pc-case-banner.png') no-repeat center center/cover`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '80px' // Offset for fixed navbar
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)'
                }} />
                <h1 style={{
                    position: 'relative',
                    color: '#fff',
                    fontSize: '3.5rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    margin: 0
                }}>
                    {currentCategoryName}
                </h1>
            </div>

            {/* Tactical Breadcrumb */}
            <div style={{ padding: '20px 60px', borderBottom: '1px solid #f0f0f0', background: '#fff' }}>
                <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px', color: '#86868b', fontSize: '0.85rem' }}>
                    <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</span> 
                    <ChevronRight size={14} />
                    <span onClick={() => navigate('/products')} style={{ cursor: 'pointer' }}>Products</span>
                    {categoryFromUrl && (
                        <>
                            <ChevronRight size={14} />
                            <span style={{ color: '#000', fontWeight: 700 }}>{currentCategoryName}</span>
                        </>
                    )}
                </div>
            </div>

            <main style={{ maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '40px 60px', display: 'flex', gap: '50px', boxSizing: 'border-box' }}>

                {/* 📂 Sidebar Filters */}
                <aside style={{ width: '280px', flexShrink: 0, paddingRight: '40px', position: 'sticky', top: '100px', height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
                        <SlidersHorizontal size={24} color="#e11919" />
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Filter</h2>
                        <button onClick={resetFilters} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <Trash2 size={16} color="#999" />
                        </button>
                    </div>

                    {filterConfig.map(group => (
                        <div key={group.id} style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '20px', color: '#1d1d1f', textTransform: 'uppercase', letterSpacing: '1px' }}>{group.filter_label}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {group.values.map(val => (
                                    <label key={val.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', color: '#424245', cursor: 'pointer', fontWeight: 500 }}>
                                        <input
                                            type="checkbox"
                                            checked={(selectedFilters[group.id] || []).includes(val.filter_value)}
                                            onChange={() => toggleFilter(group.id, val.filter_value)}
                                            style={checkboxStyle}
                                        />
                                        {val.filter_value}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}

                    {filterConfig.length === 0 && !loading && (
                        <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '12px', textAlign: 'center', fontSize: '0.85rem', color: '#999' }}>
                            Select a specific category to load tactical filtering dimensions.
                        </div>
                    )}
                </aside>

                {/* 📦 Product Grid Section */}
                <section style={{ flexGrow: 1 }}>
                    {loading ? (
                        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="loader" />
                        </div>
                    ) : (
                        <>
                            {/* 🔥 NEW ARRIVALS SHOWCASE */}
                            {products.filter(p => p.is_new).length > 0 && (
                                <div style={{ marginBottom: '60px', padding: '40px', background: '#fcfcfc', borderRadius: '24px', border: '1px solid #f0f0f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
                                        <div style={{ padding: '8px', background: '#000', borderRadius: '8px' }}>
                                            <Search size={20} color="#fff" />
                                        </div>
                                        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>New Arrivals</h2>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                                        {products.filter(p => p.is_new).map((p) => (
                                            <ProductCard key={`new-${p.id}`} product={p} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p style={{ color: '#86868b', fontSize: '0.9rem', fontWeight: 500 }}>
                                    Showing <span style={{ color: '#000', fontWeight: 700 }}>{filteredProducts.length}</span> individual tactical units
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                                {filteredProducts.map((p) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>

                            {filteredProducts.length === 0 && (
                                <div style={{ padding: '100px', textAlign: 'center', background: '#f9fafb', borderRadius: '24px' }}>
                                    <Search size={40} color="#ccc" style={{ marginBottom: '20px' }} />
                                    <h3 style={{ fontWeight: 800 }}>No Units Found</h3>
                                    <p style={{ color: '#86868b' }}>Try adjusting your tactical filters or selection.</p>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </main>

            <Footer />

            <style>{`
                .loader { width: 35px; height: 35px; border: 4px solid #f3f3f3; border-top: 4px solid #e11919; border-radius: 50%; animation: spin 0.8s linear infinite; }
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
    accentColor: '#e11919'
};

export default ProductListPage;
