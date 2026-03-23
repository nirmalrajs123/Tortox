import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import logo from '../assets/logo.png';

const Footer = () => {
    return (
        <footer style={{
            background: '#0a0a0c',
            color: '#9ca3af',
            padding: '60px 40px 20px',
            fontFamily: 'system-ui, sans-serif',
            borderTop: '1px solid rgba(255, 255, 255, 0.03)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Ambient Background decoration nodes */}
            <div style={{
                position: 'absolute', bottom: '-80px', right: '-80px', width: '300px', height: '300px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(225, 25, 25, 0.06) 0%, rgba(0,0,0,0) 70%)',
                filter: 'blur(40px)', zIndex: 0
            }} />

            <div style={{
                maxWidth: '1200px', margin: '0 auto', display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem',
                position: 'relative', zIndex: 1, paddingBottom: '40px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                
                {/* 🏷️ Column 1: Brand & About */}
                <div>
                    <div style={{ 
                        background: 'rgba(255, 255, 255, 0.95)', padding: '8px 15px', 
                        borderRadius: '10px', display: 'inline-block', marginBottom: '1.2rem' 
                    }}>
                        <img src={logo} alt="Tortox Logo" style={{ height: '28px', objectFit: 'contain', display: 'block' }} />
                    </div>
                    <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: '#6b7280', maxWidth: '300px' }}>
                        Leading provider of high-performance PC peripherals and hardware, tailoring customized setups engineered for the extreme workflow triggers setup safely correctly.
                    </p>
                </div>

                {/* 🔗 Column 2: Quick Links Support */}
                <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.2rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        Quick Links
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {['Products', 'About Us', 'Downloads', 'Warranty RMA', 'Newsletter'].map((link) => (
                            <motion.li 
                                key={link} 
                                whileHover={{ x: 3, color: '#e11919' }}
                                style={{ fontSize: '0.85rem', cursor: 'pointer', transition: 'color 0.2s' }}
                            >
                                {link}
                            </motion.li>
                        ))}
                    </ul>
                </div>

                {/* 📞 Column 3: GET IN TOUCH */}
                <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.2rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        Get In Touch
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={iconBoxStyle}><Phone size={16} /></div>
                            <span style={{ fontSize: '0.85rem' }}>(+971) 56 502 0762</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={iconBoxStyle}><Mail size={16} /></div>
                            <span style={{ fontSize: '0.85rem' }}>info@tortox.com</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{ ...iconBoxStyle, marginTop: '2px' }}><MapPin size={16} /></div>
                            <span style={{ fontSize: '0.85rem', lineHeight: '1.4', maxWidth: '220px' }}>
                                Office No. 1007, Mohammad Al Mulla Tower beside Ansar Mall, Al Nahda, Sharjah U.A.E
                            </span>
                        </div>
                    </div>
                </div>

                {/* 🌍 Column 4: GET SOCIAL */}
                <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.2rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        Get Social
                    </h3>
                    <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Tortox</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {[
                            { icon: <Facebook size={18} />, url: '#' },
                            { icon: <Instagram size={18} />, url: '#' },
                            { icon: <Twitter size={18} />, url: '#' },
                            { icon: <Youtube size={18} />, url: '#' }
                        ].map((social, idx) => (
                            <motion.a 
                                key={idx} 
                                href={social.url}
                                whileHover={{ scale: 1.1, background: '#e11919', color: '#ffffff' }}
                                style={{
                                    width: '36px', height: '36px', borderRadius: '8px', 
                                    background: 'rgba(255, 255, 255, 0.03)', color: '#9ca3af',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s', border: '1px solid rgba(255, 255, 255, 0.02)'
                                }}
                            >
                                {social.icon}
                            </motion.a>
                        ))}
                    </div>
                </div>

            </div>

            {/* Bottom Bar copyright container indices framing and structures properly */}
            <div style={{
                maxWidth: '1200px', margin: '20px auto 0', display: 'flex', 
                justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#4b5563'
            }}>
                <span>© 2019 All rights reserved by Tortox.</span>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
                    <span style={{ cursor: 'pointer' }}>Terms of Service</span>
                </div>
            </div>

        </footer>
    );
};

const iconBoxStyle = {
    width: '32px', height: '32px', borderRadius: '8px',
    background: 'rgba(225, 25, 25, 0.08)', color: '#e11919',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
};

export default Footer;
