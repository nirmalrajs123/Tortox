import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, PlusCircle, Edit, X, Trash2 } from 'lucide-react';
import { productService } from '../services/product'; // ➕ Use productService
import logo from '../assets/logo.png';
import AddProductModal from './product'; // ➕ Import Extracted Modal

const Dashboard = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [user, setUser] = useState(null);
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'products'
    const [showAddForm, setShowAddForm] = useState(false);

    // 🔬 View Modal States flawlessly flaws flawlessly
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    const loadProducts = async () => {
        try {
            const res = await productService.getAll();
            console.log("Dashboard loaded products:", res.data); // 📢 Debug node flaws flawlessly
            setProducts(res.data?.data || []); // 🛡️ Added fallback safety
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (!loggedInUser) {
            navigate('/login');
            return;
        }
        try {
            setUser(JSON.parse(loggedInUser));
            loadProducts();
        } catch (err) {
            console.error("Session parse error:", err);
            localStorage.removeItem('user');
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleEdit = async (id) => {
        try {
            const res = await productService.getById(id);
            if (res.data && res.data.success) {
                setSelectedProduct(res.data.data);
                setShowAddForm(true);
            }
        } catch (e) {
            console.error('Failed to load product for editing', e);
            alert('Failed to load full product details');
        }
    };

    if (!user) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f5f7' }}>

            {/* Sidebar dashboard options indexing properly framing securely */}
            <aside style={{
                width: '260px', background: '#ffffff', borderRight: '1px solid #e2e8f0',
                display: 'flex', flexDirection: 'column', padding: '1.5rem 1.2rem'
            }}>
                <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center' }}>
                    <img src={logo} alt="Tortox Logo" style={{ height: '35px', objectFit: 'contain' }} />
                </div>

                <nav style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {[
                        { title: 'Dashboard', icon: <LayoutDashboard size={19} />, view: 'dashboard' },
                        { title: 'Products', icon: <ShoppingBag size={19} />, view: 'products' },
                        { title: 'Users', icon: <Users size={19} />, view: 'users' },
                        { title: 'Settings', icon: <Settings size={19} />, view: 'settings' }
                    ].map((item) => (
                        <div
                            key={item.view}
                            onClick={() => { if (item.view === 'dashboard' || item.view === 'products') setCurrentView(item.view); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px',
                                background: currentView === item.view ? 'rgba(225, 25, 25, 0.05)' : 'transparent',
                                color: currentView === item.view ? '#e11919' : '#4b5563',
                                fontWeight: currentView === item.view ? 600 : 500, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s'
                            }}
                        >
                            {item.icon} {item.title}
                        </div>
                    ))}
                </nav>

                <button onClick={handleLogout} style={{ padding: '11px', background: 'none', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                    <LogOut size={17} /> Logout
                </button>
            </aside>

            {/* Main Content Dashboard indexes layout framing correctly setup decently */}
            <main style={{ flexGrow: 1, padding: '2.5rem 3rem', overflowY: 'auto' }}>

                {currentView === 'dashboard' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827' }}>Overview</h1>
                                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Welcome back, {user.email}</p>
                            </div>
                        </div>

                        {/* Stats Cards grid view indices framing decently correctly */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            {[
                                { title: 'Total Products', value: products.length, icon: <ShoppingBag size={26} />, color: '#e11919' },
                                { title: 'Total Users', value: '1', icon: <Users size={26} />, color: '#10b981' },
                                { title: 'Active Views', value: '142', icon: <LayoutDashboard size={26} />, color: '#3b82f6' }
                            ].map((item, index) => (
                                <div key={index} style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '14px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 500 }}>{item.title}</p>
                                        <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', marginTop: '4px' }}>{item.value}</p>
                                    </div>
                                    <div style={{ width: '46px', height: '46px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${item.color}10`, color: item.color }}>{item.icon}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {(currentView === 'products' || currentView === 'dashboard') && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827' }}>{currentView === 'products' ? 'Manage Products' : 'Product Overview List'}</h2>
                            <button onClick={() => setShowAddForm(true)} style={{ padding: '8px 16px', borderRadius: '8px', background: '#e11919', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }}><PlusCircle size={16} /> Add Product</button>
                        </div>

                        {/* 🛠️ Extracted Add Product Modal overlay support trigger framing */}
                        <AddProductModal
                            isOpen={showAddForm}
                            onClose={() => { setShowAddForm(false); setSelectedProduct(null); }}
                            onSuccess={loadProducts}
                            productToEdit={selectedProduct}
                        />

                        {/* 👁️ Product View Modal flawless flawlessly trigger */}
                        {showViewModal && selectedProduct && (
                            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }} onClick={() => setShowViewModal(false)}>
                                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff', padding: '2.5rem', borderRadius: '16px', width: '92%', maxWidth: '850px', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.12)', position: 'relative' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827' }}>Product Details</h3>
                                        <button type="button" onClick={() => setShowViewModal(false)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><X size={20} /></button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.88rem' }}>
                                        <div><strong style={{ color: '#4b5563' }}>Product Name:</strong> <span style={{ color: '#111827', fontWeight: 600 }}>{selectedProduct.product_name}</span></div>
                                        <div><strong style={{ color: '#4b5563' }}>Model No:</strong> <span style={{ color: '#1e293b' }}>{selectedProduct.modal}</span></div>
                                        <div><strong style={{ color: '#4b5563' }}>Model Name:</strong> <span style={{ color: '#1e293b' }}>{selectedProduct.modal_name}</span></div>

                                    </div>

                                    <div style={{ marginTop: '1rem' }}>
                                        <strong style={{ fontSize: '0.85rem', color: '#4b5563' }}>Description:</strong>
                                        <p style={{ marginTop: '4px', fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.5 }}>{selectedProduct.product_description}</p>
                                    </div>

                                    {selectedProduct.specs && typeof selectedProduct.specs === 'object' && (
                                        <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <p style={{ fontWeight: 800, color: '#e11919', marginBottom: '10px', textTransform: 'uppercase', fontSize: '0.75rem' }}>Case Specs</p>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.82rem' }}>
                                                {Object.entries(selectedProduct.specs).map(([k, v]) => (
                                                    v && String(v).trim() !== '' && (
                                                        <div key={k} style={{ color: '#4b5563' }}>
                                                            <strong style={{ textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}:</strong> {v}
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        )}
                           <style>{`
                            .hover-row { transition: all 0.22s ease-out; }
                            .hover-row:hover { background-color: rgba(225, 25, 25, 0.015) !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
                        `}</style>

                        {Array.isArray(products) && products.length === 0 ? (
                            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '5rem 2rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(225, 25, 25, 0.05)', color: '#e11919', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem' }}>
                                    <ShoppingBag size={28} />
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>No Products Setup</h3>
                                <p style={{ fontSize: '0.85rem', color: '#6b7280', maxWidth: '300px', lineHeight: 1.5, marginBottom: '1.5rem' }}>Your product catalog is currently empty. Start building your portfolio today.</p>
                                <button onClick={() => setShowAddForm(true)} style={{ padding: '8px 16px', borderRadius: '8px', background: '#e11919', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600 }}><PlusCircle size={16} /> Add First Product </button>
                            </div>
                        ) : (
                            <div style={{ background: '#ffffff', borderRadius: '14px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                        <tr>{['Product ID', 'Modal No', 'Modal Name', 'Product Name', 'Actions'].map((head) => (<th key={head} style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase' }}>{head}</th>))}</tr>
                                    </thead>
                                    <tbody>
                                        {products.map((prod) => (
                                            <tr key={prod.id} className="hover-row" style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '14px 20px', color: '#6b7280', fontSize: '0.85rem' }}>{prod.id}</td>
                                                <td style={{ padding: '14px 20px', fontWeight: 600, color: '#1e293b', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {prod.modal}
                                                </td>
                                                <td style={{ padding: '14px 20px', color: '#111827', fontWeight: 600, fontSize: '0.85rem' }}>{prod.modal_name}</td>
                                                <td style={{ padding: '14px 20px', color: '#6b7280', fontSize: '0.85rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '280px' }}>{prod.product_name}</td>
                                                <td style={{ padding: '14px 20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <button onClick={() => handleEdit(prod.id)} style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(225,25,25,0.08)', color: '#e11919', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600 }}><Edit size={14} /> Edit</button>
                                                    <button onClick={async () => { if(window.confirm("Delete product?")) { try { await productService.delete(prod.id); loadProducts(); } catch(e){ console.error(e); } } }} style={{ padding: '6px 12px', borderRadius: '6px', background: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600 }}><Trash2 size={14} /> Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
