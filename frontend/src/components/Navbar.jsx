import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, HelpCircle, ChevronDown, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../services/category';
import TortoxLogo from './TortoxLogo';

const Navbar = ({ toggleTheme, theme }) => {
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
                position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1.2rem 4rem', backgroundColor: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border)', boxSizing: 'border-box',
                transition: 'all 0.3s ease'
            }}
        >
            <div
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => navigate('/')}
            >
                <TortoxLogo size="35px" />
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
                            whileHover={{ y: -1, color: 'var(--accent-primary)' }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer',
                                color: hoveredItem === item.title ? 'var(--accent-primary)' : 'var(--text-main)',
                                fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.2px', transition: 'color 0.2s'
                            }}
                        >
                            {item.title}
                            <motion.div
                                animate={{ rotate: hoveredItem === item.title ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown size={14} style={{ opacity: 0.7 }} />
                            </motion.div>
                        </motion.div>

                        <AnimatePresence>
                            {hoveredItem === item.title && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                    style={{
                                        position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                                        background: 'var(--bg-secondary)', boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                                        borderRadius: '12px', padding: '12px 10px',
                                        minWidth: '180px', border: '1px solid var(--border)', zIndex: 110, marginTop: '4px'
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
                                            whileHover={{ background: 'var(--bg-primary)', color: 'var(--accent-primary)', x: 4 }}
                                            transition={{ duration: 0.15 }}
                                            style={{
                                                padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem',
                                                color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 500,
                                                whiteSpace: 'nowrap', textTransform: 'uppercase'
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
                    whileHover={{ scale: 1.05, background: 'var(--accent-primary)' }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        padding: '7px 18px', background: 'var(--text-main)', color: 'var(--bg-secondary)',
                        border: 'none', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700,
                        cursor: 'pointer', marginLeft: '0.4rem', transition: 'all 0.2s'
                    }}
                >
                    Login
                </motion.button>
            </div>
        </motion.nav>
    );
};

export default Navbar;
