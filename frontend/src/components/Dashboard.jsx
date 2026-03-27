import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, ShoppingBag, Users, Settings, LogOut, PlusCircle, Edit, X, Trash2,
    Search, Bell, Package, Box, Activity, FileText, LayoutGrid, ListFilter, ChevronRight
} from 'lucide-react';
import { productService } from '../services/product'; // ➕ Use productService
import TortoxLogo from './TortoxLogo';
import AddProductModal from './product';
import CategorySettings from './dashboard/CategorySettings';
import SpecificationsSettings from './dashboard/SpecificationsSettings';

import FilterSettings from './dashboard/FilterSettings';
import { Moon, Sun } from 'lucide-react';


const Dashboard = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [user, setUser] = useState(null);
    const [currentView, setCurrentView] = useState('dashboard');
    const [settingsTab, setSettingsTab] = useState('categories');
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    const loadProducts = async () => {
        try {
            const res = await productService.getAll();
            setProducts(res.data?.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (!loggedInUser) { navigate('/login'); return; }
        try {
            setUser(JSON.parse(loggedInUser));
            loadProducts();
        } catch (err) {
            localStorage.removeItem('user'); navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user'); navigate('/login');
    };

    const handleEdit = async (id) => {
        try {
            const res = await productService.getById(id);
            if (res.data && res.data.success) {
                setSelectedProduct(res.data.data);
                setShowAddForm(true);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to load product details');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            display: 'flex',
        }}>
            {/* 🌅 Horizon Full-Screen Horizon Rail Architecture setup correctly properly */}
            <div className="page-portal" style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                background: 'var(--bg-primary)',
                borderRadius: 0,
                boxShadow: 'none',
                border: 'none',
                margin: 0
            }}>
                {/* 🛸 Horizon Mini Sidebar - Clean, thin architecture setup for minimal focus redirection */}
                <aside style={{
                    width: '100px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0',
                    borderRight: '1px solid var(--border-ghost)',
                    zIndex: 10,
                    background: 'var(--bg-surface)'
                }}>
                    <div style={{ marginBottom: '3rem', cursor: 'pointer' }} onClick={() => setCurrentView('dashboard')}>
                        <TortoxLogo size="70px" />
                    </div>

                    <nav style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                        {[
                            { icon: <LayoutDashboard size={22} />, view: 'dashboard' },
                            { icon: <ShoppingBag size={22} />, view: 'products' },
                            { icon: <Users size={22} />, view: 'users' },
                            { icon: <Settings size={22} />, view: 'settings' }
                        ].map((item) => (
                            <motion.div
                                key={item.view}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => { if (['dashboard', 'products', 'settings'].includes(item.view)) setCurrentView(item.view); }}
                                style={{
                                    padding: '12px', borderRadius: '12px',
                                    background: currentView === item.view ? '#f8fafc' : 'transparent',
                                    color: currentView === item.view ? 'var(--accent-primary)' : '#94a3b8',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                {item.icon}
                            </motion.div>
                        ))}
                    </nav>

                    <button onClick={handleLogout} style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'none', border: '1px solid #f1f5f9', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <LogOut size={18} />
                    </button>
                </aside>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* 🏔️ Horizon Toolbar - High-precision breadcrumb navigation framing structure correctly */}
                    <header style={{
                        height: '64px',
                        borderBottom: '1px solid var(--border-ghost)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 2rem',
                        justifyContent: 'space-between',
                        background: 'var(--bg-surface)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <TortoxLogo size="160px" />
                            <div style={{ width: '1px', height: '20px', background: 'var(--border-ghost)' }} />
                            <span style={{ padding: '2px 10px', borderRadius: '20px', background: 'rgba(22, 101, 52, 0.2)', color: '#4ade80', fontSize: '0.65rem', fontWeight: 800 }}>ONLINE</span>
                        </div>
                    </header>

                    {!user ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
                            <div className="energy-dot" style={{ width: '12px', height: '12px' }} />
                        </div>
                    ) : (
                        <main style={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
                            {/* Main Viewport Panel - Action workspace for TORTOX operations accurate framing index correctly */}
                            <div style={{ flex: 1, padding: '3.5rem', overflowY: 'auto', background: 'var(--bg-primary)' }}>
                                {currentView === 'dashboard' && (
                                    <div style={{ width: '100%' }}>
                                        <header style={{ marginBottom: '3rem' }}>
                                            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Operations Hub</h1>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Tactical data relay for {user.email}</p>
                                        </header>

                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3.5rem' }}
                                        >
                                            {[
                                                { title: 'TOTAL GEAR', value: products.length, icon: <ShoppingBag size={20} />, color: 'var(--accent-primary)' },
                                                { title: 'ACTIVE CHASSIS', value: '1', icon: <Users size={20} />, color: '#6366f1' },
                                                { title: 'RELAY STATUS', value: 'NOMINAL', icon: <LayoutDashboard size={20} />, color: '#10b981', pulse: true }
                                            ].map((item, index) => (
                                                <motion.div
                                                    key={index}
                                                    whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}
                                                    style={{ padding: '2rem', borderRadius: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-ghost)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
                                                >
                                                    <div>
                                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '1px', marginBottom: '12px' }}>{item.title}</p>
                                                        <p className="telemetry" style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)' }}>{item.value}</p>
                                                    </div>
                                                    <div style={{ color: item.color, background: `${item.color}11`, padding: '10px', borderRadius: '12px' }}>{item.icon}</div>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    </div>
                                )}
                                
                                {currentView === 'products' && (
                                    <div style={{ width: '100%' }}>
                                        <header style={{ marginBottom: '3rem' }}>
                                            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Equipment Inventory</h1>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Full hardware catalog and lifecycle management</p>
                                        </header>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Equipment Logs</h2>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setShowAddForm(true)}
                                                className="telemetry"
                                                style={{ padding: '12px 24px', borderRadius: '12px', background: 'var(--accent-primary)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700 }}
                                            >
                                                <PlusCircle size={18} /> Add Unit
                                            </motion.button>
                                        </div>

                                        <motion.div
                                            className="surface-white"
                                            style={{ borderRadius: '24px', border: '1px solid var(--border-ghost)', background: 'var(--bg-surface)', overflow: 'hidden' }}
                                        >
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-ghost)' }}>
                                                    <tr>{['Product ID', 'Model / Serial No', 'Main Image', 'Hover Image', 'Actions'].map((head) => (<th key={head} style={{ padding: '16px 24px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', textAlign: 'left' }}>{head}</th>))}</tr>
                                                </thead>
                                                <tbody>
                                                    <AnimatePresence>
                                                        {products.map((prod, idx) => (
                                                            <motion.tr
                                                                key={prod.id}
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                style={{ borderBottom: '1px solid var(--border-ghost)' }}
                                                            >
                                                                <td style={{ padding: '20px 24px', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.9rem' }}>#{prod.id}</td>
                                                                <td style={{ padding: '20px 24px', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{prod.modal || prod.name || 'N/A'}</td>
                                                                <td style={{ padding: '12px 24px' }}>
                                                                    <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                                        {prod.image ? (
                                                                            <img src={prod.image} alt="Main" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                                        ) : (
                                                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}><Box size={16} /></div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '12px 24px' }}>
                                                                    <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                                        {prod.hover_image ? (
                                                                            <img src={prod.hover_image} alt="Hover" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                                        ) : (
                                                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}><Box size={16} /></div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '20px 24px' }}>
                                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                                        <button onClick={() => handleEdit(prod.id)} style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-dim)', border: '1px solid var(--border-ghost)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Edit</button>
                                                                        <button onClick={async () => { if (window.confirm("Purge?")) { try { await productService.delete(prod.id); loadProducts(); } catch (e) { console.error(e); } } }} style={{ padding: '8px 16px', borderRadius: '8px', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Purge</button>
                                                                    </div>
                                                                </td>
                                                            </motion.tr>
                                                        ))}
                                                    </AnimatePresence>
                                                </tbody>
                                            </table>
                                        </motion.div>
                                    </div>
                                )}

                                {currentView === 'settings' && (
                                    <div style={{ width: '100%' }}>
                                        <header style={{ marginBottom: '2.5rem' }}>
                                            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px' }}>Telemetry Config</h1>
                                            <p style={{ color: '#64748b' }}>Core categories and filtering architecture</p>
                                        </header>
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
                                            {['categories', 'filters'].map(tab => (
                                                <button key={tab} onClick={() => setSettingsTab(tab)} style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, background: settingsTab === tab ? '#0f172a' : '#fff', color: settingsTab === tab ? '#fff' : '#64748b', border: '1px solid #e2e8f0', cursor: 'pointer' }}>{tab.toUpperCase()}</button>
                                            ))}
                                        </div>
                                        <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                            {settingsTab === 'categories' && <CategorySettings />}
                                            {settingsTab === 'filters' && <FilterSettings />}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </main>
                    )}
                </div>
            </div>

            <AddProductModal isOpen={showAddForm} onClose={() => { setShowAddForm(false); setSelectedProduct(null); }} onSuccess={loadProducts} productToEdit={selectedProduct} />
        </div>
    );
};

export default Dashboard;
