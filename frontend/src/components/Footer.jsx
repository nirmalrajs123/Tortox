import React from 'react';
import { motion } from 'framer-motion';
import {
    Facebook,
    Instagram,
    Youtube,
    Twitter,
    ArrowRight
} from 'lucide-react';
import TortoxLogo from './TortoxLogo';

import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Footer = () => {
    const navigate = useNavigate();
    const [dbCategories, setDbCategories] = React.useState([]);

    React.useEffect(() => {
        axios.get('http://localhost:5000/api/categories')
            .then(res => {
                if (res.data.success) {
                    setDbCategories(res.data.data);
                }
            })
            .catch(err => console.error("Error fetching footer categories:", err));
    }, []);

    const footerSections = [
        {
            title: 'Products',
            links: dbCategories.map(cat => ({ name: cat.category_name, id: cat.id }))
        },
        {
            title: 'Support',
            links: ['Service', 'Terms & Conditions', 'Driver'].map(name => ({ name }))
        },
        {
            title: 'Community',
            links: [
                'Tech News', 'Product News', 'Hardware Tips',
                'Build Guides', 'How-to Guides', 'Product Reviews'
            ].map(name => ({ name }))
        },
        {
            title: 'About',
            links: ['Brand Story', 'Stores', 'Contact'].map(name => ({ name }))
        }
    ];

    const socialIcons = [
        { icon: <Facebook size={18} />, url: '#' },
        { icon: <Instagram size={18} />, url: '#' },
        { icon: <Youtube size={18} />, url: '#' },
        { icon: <Twitter size={18} />, url: '#' }, // Using Twitter as X placeholder
    ];

    return (
        <footer style={{
            background: '#ffffff',
            color: '#1d1d1f',
            padding: '80px 80px 40px',
            fontFamily: '"SF Pro Display", "Inter", sans-serif',
            borderTop: '1px solid #f2f2f2'
        }}>
            <div style={{
                maxWidth: '1440px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '40px',
                paddingBottom: '80px'
            }}>
                {/* Link Columns */}
                {footerSections.map((section, idx) => (
                    <div key={idx}>
                        <h3 style={{
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            marginBottom: '25px',
                            color: '#1d1d1f'
                        }}>
                            {section.title}
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {section.links.map((link, lIdx) => (
                                <motion.li
                                    key={lIdx}
                                    whileHover={{ x: 2, color: '#e11919' }}
                                    onClick={() => {
                                        if (section.title === 'Products' && link.id) {
                                            navigate(`/products?category=${link.id}`);
                                        }
                                    }}
                                    style={{
                                        fontSize: '0.85rem',
                                        color: '#6e6e73',
                                        cursor: 'pointer',
                                        transition: 'color 0.2s'
                                    }}
                                >
                                    {link.name}
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                ))}

                {/* Subscribe Section */}
                <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '15px' }}>
                        Subscribe to the latest news
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#6e6e73', marginBottom: '20px' }}>
                        Get Special offers, exclusive product news.
                    </p>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#fff',
                        border: '1px solid #e1e1e1',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginBottom: '25px'
                    }}>
                        <input
                            type="email"
                            placeholder="Enter your Email Address"
                            style={{
                                flex: 1,
                                border: 'none',
                                padding: '12px 15px',
                                fontSize: '0.85rem',
                                outline: 'none'
                            }}
                        />
                        <button style={{
                            background: '#4b4b4b',
                            color: '#fff',
                            border: 'none',
                            padding: '12px 15px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <ArrowRight size={16} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        {socialIcons.map((social, sIdx) => (
                            <motion.a
                                key={sIdx}
                                href={social.url}
                                whileHover={{ scale: 1.1, color: '#e11919' }}
                                style={{ color: '#1d1d1f', transition: 'color 0.2s' }}
                            >
                                {social.icon}
                            </motion.a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div style={{
                maxWidth: '1440px',
                margin: '0 auto',
                borderTop: '1px solid #f2f2f2',
                paddingTop: '40px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <TortoxLogo size="28px" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1d1d1f' }}>
                        Tortox
                    </span>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    color: '#86868b'
                }}>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <span style={{ cursor: 'pointer' }}>Sitemap</span>
                        <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
                    </div>
                    <span>Copyright © 2023 - 2026 Tortox All rights reserved.</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
