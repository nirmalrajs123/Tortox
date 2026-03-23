import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, HelpCircle, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const navItems = [
    { title: 'Products', items: ['Chassis / Case', 'Liquid Coolers', 'ARGB Fans', 'Power Supply', 'Gaming Mice'] },
    { title: 'About', items: ['Company Profile', 'News & Events', 'Quality & Design'] },
    { title: 'Community', items: ['User Forums', 'Wallpaper', 'Newsletter'] },
    { title: 'Support', items: ['Downloads', 'Warranty RMA', 'Tech Help'] },
    { title: 'Contact', items: ['Global Offices', 'Business Support'] }
];

const Navbar = () => {
    const navigate = useNavigate();
    const [hoveredItem, setHoveredItem] = useState(null);

    return (
        <motion.nav 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{
                position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1.2rem 4rem', backgroundColor: '#ffffff',
                borderBottom: '1px solid #e5e7eb', boxSizing: 'border-box'
            }}
        >
            {/* Logo Group */}
            <div 
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} 
                onClick={() => navigate('/')}
            >
                <img src={logo} alt="Tortox Logo" style={{ height: '35px', width: 'auto', objectFit: 'contain' }} />
            </div>

            {/* Nav Links - Centered with interactive Dropdown triggers indices framing appropriately */}
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
                            whileHover={{ y: -1, color: '#111827' }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer',
                                color: hoveredItem === item.title ? '#111827' : '#4b5563',
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

                        {/* Interactive Dropdown Box List framing container securely safely properly */}
                        <AnimatePresence>
                            {hoveredItem === item.title && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                    style={{
                                        position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                                        background: '#ffffff', boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                                        borderRadius: '12px', padding: '12px 10px',
                                        minWidth: '180px', border: '1px solid #f1f5f9', zIndex: 110, marginTop: '4px'
                                    }}
                                >
                                    {item.items.map((sub, idx) => (
                                        <motion.div
                                            key={idx}
                                            whileHover={{ background: '#f8fafc', color: '#ff1a1a', x: 4 }}
                                            transition={{ duration: 0.15 }}
                                            style={{
                                                padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem',
                                                color: '#4b5563', cursor: 'pointer', fontWeight: 500,
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {sub}
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </li>
                ))}
            </ul>

            {/* Actions Icons - Right side */}
            <div style={{ display: 'flex', gap: '1.8rem', alignItems: 'center' }}>
                <motion.button 
                    whileHover={{ scale: 1.1, color: '#111827' }} 
                    style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', padding: 0 }}
                >
                    <Search size={21} strokeWidth={2} />
                </motion.button>
                
                <motion.button 
                    whileHover={{ scale: 1.1, color: '#111827' }} 
                    style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', padding: 0 }}
                >
                    <Globe size={21} strokeWidth={2} />
                </motion.button>
                
                <motion.button 
                    whileHover={{ scale: 1.1, color: '#111827' }} 
                    style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', padding: 0 }}
                >
                    <HelpCircle size={21} strokeWidth={2} />
                </motion.button>

                <motion.button 
                    onClick={() => navigate('/login')}
                    whileHover={{ scale: 1.05, background: '#e11919' }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        padding: '7px 18px', background: '#111827', color: '#ffffff',
                        border: 'none', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700,
                        cursor: 'pointer', marginLeft: '0.4rem', transition: 'background 0.2s'
                    }}
                >
                    Login
                </motion.button>
            </div>
        </motion.nav>
    );
};

export default Navbar;
