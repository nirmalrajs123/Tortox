import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, ShieldCheck, Zap, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                email,
                password
            });

            if (response.data.success) {
                localStorage.setItem('user', JSON.stringify(response.data.data));
                navigate('/dashboard');
            } else {
                setError(response.data.message || 'Login failed');
            }

        } catch (err) {
            setError(err.response?.data?.message || 'Login failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            backgroundColor: '#070708', // Dark base
            position: 'relative',
            overflow: 'hidden'
        }}>

            {/* 🛡️ Left Side: About Panel (Split Layout) */}
            <div style={{
                flex: '1',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '4rem',
                color: '#ffffff',
                background: 'linear-gradient(135deg, rgba(17,17,20,0.9) 0%, rgba(10,10,12,0.95) 100%), url("https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200") no-repeat center center/cover',
                backgroundBlendMode: 'overlay',
                borderRight: '1px solid rgba(255, 255, 255, 0.03)'
            }}>
                {/* Back button top left corner index */}
                <motion.button
                    whileHover={{ x: -5 }}
                    onClick={() => navigate('/')}
                    style={{
                        position: 'absolute', top: '40px', left: '40px', background: 'none', border: 'none',
                        display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af',
                        fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', zIndex: 20
                    }}
                >
                    <ArrowLeft size={19} style={{ color: '#e11919' }} /> Back to Website
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ maxWidth: '480px', zIndex: 1 }}
                >
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.91)',
                        padding: '10px 18px',
                        borderRadius: '12px',
                        display: 'inline-block',
                        marginBottom: '2rem',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255, 255, 255, 0.04)'
                    }}>
                        <img src={logo} alt="Tortox Logo" style={{ height: '33px', objectFit: 'contain', display: 'block' }} />
                    </div>

                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.2rem', color: '#ffffff' }}>
                        Innovating <span style={{ color: '#e11919' }}>High-Performance</span> PC Hardware
                    </h1>

                    <p style={{ color: '#9ca3af', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                        TORTOX continuously innovates, is one of the world’s leading providers of high-performance PC peripherals and components.
                        Integrating R&D, and quality, our computer systems are assembled carefully and built to last.
                    </p>

                    {/* Features Bullet details structure efficiently framing index */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        {[
                            { icon: <Zap size={20} />, title: 'Advanced Performance', desc: 'Sustained peak speeds configuration layouts setups adequately.' },
                            { icon: <ShieldCheck size={20} />, title: 'Rigorously Tested', desc: 'Guaranteed sustainability fully resilient structural endurance configurations setup.' },
                            { icon: <Cpu size={20} />, title: 'Personalized Solutions', desc: 'Fulfilling desired customizations smoothly properly layout balancing adequately.' }
                        ].map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <div style={{ padding: '8px', background: 'rgba(225, 25, 25, 0.1)', borderRadius: '8px', color: '#e11919' }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#eef2f6', marginBottom: '2px' }}>{item.title}</h4>
                                    <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Left Blur node back decoration indices framing and structures properly */}
                <div style={{
                    position: 'absolute', bottom: '-80px', left: '-80px', width: '300px', height: '300px',
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(225, 25, 25, 0.12) 0%, rgba(225, 25, 25, 0) 70%)',
                    filter: 'blur(40px)', zIndex: 0
                }} />
            </div>

            {/* 🔑 Right Side: Interactive Form Container Panel setup correctly */}
            <div style={{
                flex: '1',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                background: '#fafafa',
                padding: '2rem'
            }}>
                {/* Gradient orb decoration for interactive depth layout parameters indexing accurate setups correctly */}
                <motion.div
                    animate={{ x: [0, 40, -10, 0], y: [0, -20, 10, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                    style={{
                        position: 'absolute', top: '15%', right: '10%', width: '250px', height: '250px',
                        borderRadius: '50%', background: 'radial-gradient(circle, rgba(225, 25, 25, 0.05) 0%, rgba(225, 25, 25, 0) 70%)',
                        filter: 'blur(40px)', zIndex: 0
                    }}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{
                        rotateY: 1,
                        rotateX: -1,
                        boxShadow: '0 20px 50px rgba(0,0,0,0.08)'
                    }}
                    transition={{ duration: 0.4 }}
                    style={{
                        background: '#ffffff',
                        width: '100%',
                        maxWidth: '400px',
                        padding: '2.8rem 2.5rem',
                        borderRadius: '20px',
                        boxShadow: '0 12px 35px rgba(0,0,0,0.03)',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        zIndex: 10,
                        perspective: '1000px'
                    }}
                >
                    <div style={{ marginBottom: '1.8rem', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>
                            Sign <span style={{ color: '#e11919' }}>In</span>
                        </h2>
                        <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: '6px' }}>
                            Authorized login for administrative index panel configurations accurately setup properly.
                        </p>
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: [0, -10, 10, -5, 5, 0] }}
                            style={{
                                color: '#ef4444', fontSize: '0.8rem', textAlign: 'center', marginBottom: '1.2rem',
                                background: '#fee2e2', padding: '10px 14px', borderRadius: '8px', width: '100%', boxSizing: 'border-box'
                            }}
                        >
                            {error}
                        </motion.p>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', width: '100%' }}>
                        <div style={{ position: 'relative' }}>
                            <Mail size={19} style={{ position: 'absolute', left: '14px', top: '14px', color: '#9ca3af' }} />
                            <input
                                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                className="interactive-input"
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <Lock size={19} style={{ position: 'absolute', left: '14px', top: '14px', color: '#9ca3af' }} />
                            <input
                                type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="interactive-input"
                                style={inputStyle}
                            />
                            <div
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '14px', top: '14px', color: '#9ca3af', cursor: 'pointer' }}
                            >
                                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                            </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.78rem', color: '#e11919', cursor: 'pointer', fontWeight: 600 }}>
                                Forgot Password?
                            </span>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, background: '#111827' }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '13px', background: '#e11919', color: '#ffffff',
                                border: 'none', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700,
                                cursor: 'pointer', boxShadow: '0 4px 15px rgba(225, 25, 25, 0.15)',
                                transition: 'background 0.2s, box-shadow 0.2s', opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Logging In...' : 'LOG IN'}
                        </motion.button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.8rem' }}>
                        <p style={{ color: '#6b7280', fontSize: '0.82rem' }}>
                            Join the community? <span style={{ color: '#e11919', fontWeight: 600, cursor: 'pointer' }}>Sign up</span>
                        </p>
                    </div>
                </motion.div>
            </div>

            <style>{`
                .interactive-input {
                    transition: border-color 0.3s, box-shadow 0.3s !important;
                }
                .interactive-input:focus {
                    border-color: #e11919 !important;
                    box-shadow: 0 0 0 3px rgba(225, 25, 25, 0.06) !important;
                }
                @media (max-width: 900px) {
                    aside { display: none !important; } // simply hide left side on small mobile frames adequately
                }
            `}</style>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '12px 42px 12px 42px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '0.88rem',
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
};

export default LoginPage;
