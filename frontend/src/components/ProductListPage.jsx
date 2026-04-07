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
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar theme="light" fixed={false} />

            {/* ── BREADCRUMB / UTILITY ── */}
            <div style={{ padding: '30px 60px 10px 60px', background: '#fff' }}>
                <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px', color: '#86868b', fontSize: '0.8rem' }}>
                    <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</span> 
                    <ChevronRight size={12} />
                    <span onClick={() => navigate('/products')} style={{ cursor: 'pointer' }}>Products</span>
                    {categoryFromUrl && (
                        <>
                            <ChevronRight size={12} />
                            <span style={{ color: '#1d1d1f', fontWeight: 600 }}>{currentCategoryName}</span>
                        </>
                    )}
                </div>
            </div>

            <main style={{ maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '20px 60px 100px 60px', display: 'flex', gap: '80px', boxSizing: 'border-box' }}>

                {/* 📂 SIDEBAR FILTERS (darkFlash style) */}
                <aside style={{ width: '220px', flexShrink: 0, position: 'sticky', top: '20px', height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', paddingBottom: '15px', borderBottom: '2px solid #1d1d1f' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, textTransform: 'uppercase' }}>Filter</h2>
                        <Trash2 size={18} color="#999" style={{ cursor: 'pointer' }} onClick={resetFilters} />
                    </div>

                    {filterConfig.map(group => (
                        <div key={group.id} style={{ marginBottom: '35px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '20px', color: '#1d1d1f', lineHeight: '1.2' }}>{group.filter_label}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {group.values.map(val => (
                                    <label key={val.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#424245', cursor: 'pointer', fontWeight: 500 }}>
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

                    {!loading && filterConfig.length === 0 && (
                        <div style={{ fontSize: '0.85rem', color: '#86868b', fontStyle: 'italic' }}>
                            Refine selection by choosing a category.
                        </div>
                    )}
                </aside>

                {/* 📦 PRODUCT GRID (darkFlash style) */}
                <section style={{ flexGrow: 1 }}>
                    {loading ? (
                        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="loader" />
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: '30px', borderBottom: '1px solid #f2f2f2', paddingBottom: '20px' }}>
                                <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{currentCategoryName}</h1>
                                <p style={{ color: '#86868b', fontSize: '0.9rem' }}>
                                    Showing <span style={{ color: '#1d1d1f', fontWeight: 700 }}>{filteredProducts.length}</span> individual tactical units
                                </p>
                            </div>

                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(3, 1fr)', 
                                gap: '30px',
                                gapY: '50px' 
                            }}>
                                {filteredProducts.map((p) => (
                                    <ProductCard key={p.id} product={p} hideBadge={false} />
                                ))}
                            </div>

                            {filteredProducts.length === 0 && (
                                <div style={{ padding: '100px', textAlign: 'center', background: '#fcfcfc', borderRadius: '12px', border: '1px dashed #d2d2d7' }}>
                                    <Search size={40} color="#d2d2d7" style={{ marginBottom: '20px' }} />
                                    <h3 style={{ fontWeight: 800 }}>No Units Found</h3>
                                    <p style={{ color: '#86868b' }}>Technical match not found. Try adjusting filters.</p>
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
