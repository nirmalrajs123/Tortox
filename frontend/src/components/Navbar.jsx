import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, HelpCircle, ChevronDown, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../services/category';
import TortoxLogo from './TortoxLogo';

const Navbar = ({ toggleTheme, theme = 'light' }) => {
    const navigate = useNavigate();
    const [hoveredItem, setHoveredItem] = useState(null);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoryService.getAll();
                setCategories(res.data?.data || []);
            } catch (err) {
                console.error("Navbar category fetch error:", err);
            }
        };
        fetchCategories();
    }, []);

    const navItems = [
        {
            title: 'Products',
            items: categories.length > 0
                ? categories.map(c => ({ name: c.category_name, id: c.id }))
                : [
                    { name: 'PC CASES', id: 'all' },
                    { name: 'POWER SUPPLY', id: 'all' },
                    { name: 'LIQUID COOLER', id: 'all' },
                    { name: 'AIR COOLER', id: 'all' }
                ]
        },
        { title: 'About', items: [{ name: 'Company Profile' }, { name: 'News & Events' }, { name: 'Quality & Design' }] },
        { title: 'Community', items: [{ name: 'User Forums' }, { name: 'Wallpaper' }, { name: 'Newsletter' }] },
        { title: 'Support', items: [{ name: 'Downloads' }, { name: 'Warranty RMA' }, { name: 'Tech Help' }] },
        { title: 'Contact', items: [{ name: 'Global Offices' }, { name: 'Business Support' }] }
    ];

    return (
        <motion.nav
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{
                position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.8rem 6rem', backgroundColor: theme === 'light' ? '#ffffff' : '#0a0a0b',
                borderBottom: '1px solid var(--border-ghost)', boxSizing: 'border-box',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                background: theme === 'light' ? '#ffffff' : '#0a0a0b'
            }}
        >
            <div
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => navigate('/')}
            >
                <TortoxLogo size="130px" />
            </div>

            <ul style={{
                display: 'flex', gap: '2.5rem', listStyle: 'none', margin: 0, padding: 0, position: 'relative'
            }}>
                {navItems.map((item) => (
                    <li
                        key={item.title}
                        onMouseEnter={() => setHoveredItem(item.title)}
                        onMouseLeave={() => setHoveredItem(null)}
                        style={{ position: 'relative', padding: '10px 0' }}
                    >
                        <motion.div
                            whileHover={{ y: -1 }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer',
                                color: hoveredItem === item.title ? 'var(--accent-primary)' : 'var(--text-main)',
                                fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.2px', transition: 'color 0.2s'
                            }}
                        >
                            {item.title}
                            <motion.div
                                animate={{ rotate: hoveredItem === item.title ? 180 : 0, color: hoveredItem === item.title ? 'var(--accent-primary)' : 'currentColor' }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown size={14} style={{ opacity: 0.7 }} />
                            </motion.div>
                        </motion.div>

                        <AnimatePresence>
                            {hoveredItem === item.title && (
                                <motion.div
                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                    style={{
                                        position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                                        background: 'var(--bg-surface)',
                                        boxShadow: 'var(--shadow-elite)',
                                        borderRadius: '12px', padding: '10px',
                                        minWidth: '220px', border: '1px solid var(--border-ghost)',
                                        zIndex: 1010, marginTop: '5px',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {item.items.map((sub, idx) => (
                                        <motion.div
                                            key={idx}
                                            onClick={() => {
                                                if (item.title === 'Products') {
                                                    navigate(`/products?category=${sub.id}`);
                                                } else {
                                                    navigate('/products');
                                                }
                                                setHoveredItem(null);
                                            }}
                                            whileHover={{ background: 'var(--bg-secondary)', color: 'var(--accent-primary)', x: 4 }}
                                            transition={{ duration: 0.15 }}
                                            style={{
                                                padding: '10px 16px', borderRadius: '8px', fontSize: '0.85rem',
                                                color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600,
                                                whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.5px'
                                            }}
                                        >
                                            {sub.name}
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </li>
                ))}
            </ul>

            <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                <motion.button
                    onClick={toggleTheme}
                    whileHover={{ scale: 1.1, color: 'var(--accent-primary)' }}
                    whileTap={{ scale: 0.9 }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                    {theme === 'light' ? <Moon size={21} strokeWidth={2} /> : <Sun size={21} strokeWidth={2} />}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1, color: 'var(--accent-primary)' }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: 0 }}
                >
                    <Search size={21} strokeWidth={2} />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1, color: 'var(--accent-primary)' }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: 0 }}
                >
                    <Globe size={21} strokeWidth={2} />
                </motion.button>

                <motion.button
                    onClick={() => navigate('/login')}
                    whileHover={{ scale: 1.05, opacity: 0.9 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        padding: '6px 20px', background: '#0a0a0b', color: '#fff',
                        border: 'none', borderRadius: '24px', fontSize: '0.8rem', fontWeight: 800,
                        cursor: 'pointer', marginLeft: '1rem', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    Login
                </motion.button>
            </div>
        </motion.nav>
    );
};

export default Navbar;
