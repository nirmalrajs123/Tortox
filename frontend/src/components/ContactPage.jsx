import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, MessageSquare, Mail, Globe, Clock, Send } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const ContactPage = () => {
    return (
        <div style={{ background: '#ffffff', minHeight: '100vh' }}>
            <Navbar theme="light" />
            
            {/* ── HERO SECTION ── */}
            <div style={{ 
                padding: '160px 20px 80px', 
                background: 'linear-gradient(to bottom, #f9f9fb, #ffffff)',
                textAlign: 'center' 
            }}>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="tortox-heading"
                    style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '-2px' }}
                >
                    Contact Us
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ fontSize: '1.25rem', color: '#86868b', maxWidth: '600px', margin: '0 auto' }}
                >
                    Have a question about our high-performance gear? Our global support team is ready to assist.
                </motion.p>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 100px', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '80px' }}>
                
                {/* ── LEFT: CONTACT INFO ── */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '40px', color: '#1d1d1f', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Contact Info
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
                        {/* Address */}
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11919', flexShrink: 0 }}>
                                <MapPin size={22} />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 700 }}>Our Headquarters</h4>
                                <p style={{ margin: 0, color: '#86868b', lineHeight: '1.6' }}>
                                    Tortox<br />
                                    Office No. 1007, Mohammad Al Mulla Tower,<br />
                                    Beside Ansar Mall, Al Nahda,<br />
                                    Sharjah, U.A.E
                                </p>
                            </div>
                        </div>

                        {/* Phones */}
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11919', flexShrink: 0 }}>
                                <Phone size={22} />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 700 }}>Phone Support</h4>
                                <p style={{ margin: 0, color: '#86868b' }}>Office: 06 535 1776</p>
                                <p style={{ margin: 0, color: '#86868b' }}>Mobile: +971 56 502 0762</p>
                            </div>
                        </div>

                        {/* Email */}
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11919', flexShrink: 0 }}>
                                <Mail size={22} />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 700 }}>Email Us</h4>
                                <p style={{ margin: 0, color: '#86868b' }}>info@tortox.com</p>
                            </div>
                        </div>

                        {/* Web */}
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11919', flexShrink: 0 }}>
                                <Globe size={22} />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 700 }}>Official Website</h4>
                                <p style={{ margin: 0, color: '#86868b' }}>www.tortox.com</p>
                            </div>
                        </div>
                    </div>

                    {/* Business Hours */}
                    <div style={{ marginTop: '60px', padding: '30px', background: '#f5f5f7', borderRadius: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <Clock size={18} color="#e11919" />
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Working Hours</span>
                        </div>
                        <p style={{ margin: 0, color: '#424245', fontSize: '0.95rem' }}>Monday - Friday: 9:00 AM - 6:00 PM</p>
                        <p style={{ margin: '5px 0 0', color: '#424245', fontSize: '0.95rem' }}>Saturday: 10:00 AM - 2:00 PM</p>
                    </div>
                </motion.div>

                {/* ── RIGHT: FORM ── */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ background: '#ffffff', padding: '50px', borderRadius: '32px', border: '1px solid #f2f2f2', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}
                >
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '15px', color: '#1d1d1f' }}>Send a Message</h2>
                    <p style={{ color: '#86868b', marginBottom: '40px' }}>We typically respond within 24 business hours.</p>

                    <form style={{ display: 'grid', gap: '25px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1d1d1f' }}>Full Name</label>
                                <input type="text" placeholder="John Doe" style={{ padding: '15px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#f9fafb', outline: 'none', transition: 'all 0.2s' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1d1d1f' }}>Email Address</label>
                                <input type="email" placeholder="john@example.com" style={{ padding: '15px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#f9fafb', outline: 'none' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1d1d1f' }}>Subject</label>
                            <select style={{ padding: '15px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#f9fafb', outline: 'none' }}>
                                <option>Product Inquiry</option>
                                <option>Technical Support</option>
                                <option>Warranty Claim</option>
                                <option>Business Partnership</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1d1d1f' }}>Message</label>
                            <textarea placeholder="How can we help you?" rows={5} style={{ padding: '15px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#f9fafb', outline: 'none', resize: 'none' }}></textarea>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, background: '#000' }}
                            whileTap={{ scale: 0.98 }}
                            style={{ 
                                padding: '18px', 
                                background: '#1d1d1f', 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: '14px', 
                                fontWeight: 800, 
                                fontSize: '1rem', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                marginTop: '10px'
                            }}
                        >
                            Send Message
                            <Send size={18} />
                        </motion.button>
                    </form>
                </motion.div>
            </div>

            <Footer />
        </div>
    );
};

export default ContactPage;
