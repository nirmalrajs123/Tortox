import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, ShieldCheck, Zap, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import TortoxLogo from './TortoxLogo';


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
            const response = await api.post('/login', {
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
            background: 'var(--bg-primary)',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Manrope', sans-serif"
        }}>

            {/* 🛡️ Left Side: About Panel (Split Layout) */}
            <div style={{
                flex: '1.2',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '5rem',
                color: '#ffffff',
                background: 'linear-gradient(rgba(10,10,12,0.4), rgba(10,10,12,0.7)), url("https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200") no-repeat center center/cover',
                borderRight: '1px solid var(--border-ghost)',
                zIndex: 1
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
                    <ArrowLeft size={19} style={{ color: 'var(--accent-primary)' }} /> Back to Website
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ maxWidth: '480px', zIndex: 1 }}
                >
                    <div className="glass" style={{
                         padding: '12px 28px',
                         borderRadius: '16px',
                         display: 'inline-block',
                         marginBottom: '2.5rem',
                         background: 'rgba(255, 255, 255, 0.05)',
                         border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <TortoxLogo color2="#fff" />
                    </div>

                    <h1 className="telemetry" style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', color: '#ffffff', letterSpacing: '-1px' }}>
                        INNOVATING <span style={{ color: 'var(--accent-primary)' }}>EXTREME</span><br />HARDWARE
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
                                <div style={{ padding: '8px', background: 'rgba(225, 25, 25, 0.1)', borderRadius: '8px', color: 'var(--accent-primary)' }}>
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
                background: '#f8fafc',
                padding: '2rem',
                overflow: 'hidden'
            }}>
                {/* 🌈 iOS Mesh Glows - Background depth for glass vibrant effects correctly framing structure setup indexing properly */}
                <motion.div
                    animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }} 
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    style={{
                        position: 'absolute', top: '10%', right: '15%', width: '400px', height: '400px',
                        borderRadius: '50%', background: 'radial-gradient(circle, rgba(225, 25, 25, 0.08) 0%, rgba(225, 25, 25, 0) 70%)',
                        filter: 'blur(60px)', zIndex: 0
                    }} 
                />
                <motion.div
                    animate={{ x: [0, -50, 50, 0], y: [0, 50, -50, 0] }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute', bottom: '15%', left: '10%', width: '350px', height: '350px',
                        borderRadius: '50%', background: 'radial-gradient(circle, rgba(160, 100, 255, 0.05) 0%, rgba(160, 100, 255, 0) 70%)',
                        filter: 'blur(50px)', zIndex: 0
                    }} 
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-vibrancy"
                    style={{
                        width: '100%',
                        maxWidth: '460px',
                        padding: '4rem 4rem',
                        borderRadius: '38px',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 10,
                        position: 'relative',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(255,255,255,0.8)'
                    }}
                >
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '8px',
                        background: 'var(--accent-primary)',
                        opacity: 0.9
                    }} />
                    <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                        <h2 className="telemetry" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
                            SIGN <span style={{ color: 'var(--accent-primary)' }}>IN</span>
                        </h2>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', marginTop: '12px', lineHeight: '1.6', fontWeight: 500 }}>
                            Secure administrative portal Access.<br />Authenticate system credentials.
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
                            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-dim)' }} />
                            <input
                                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                className="interactive-input telemetry"
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-dim)' }} />
                            <input
                                type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="interactive-input telemetry"
                                style={inputStyle}
                            />
                            <div
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '16px', top: '16px', color: 'var(--text-dim)', cursor: 'pointer' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <span className="telemetry" style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Reset Passkey
                            </span>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(225, 25, 25, 0.2)' }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="telemetry tortox-button"
                            style={{
                                width: '100%', padding: '16px', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 900,
                                cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '2.5px',
                                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Initializing...' : 'Authorize Login'}
                        </motion.button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
                            No Clearance? <span style={{ color: 'var(--accent-primary)', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase' }}>Contact Support</span>
                        </p>
                    </div>
                </motion.div>
            </div>

            <style>{`
                .glass {
                    background: rgba(255, 255, 255, 0.025) !important;
                    backdrop-filter: blur(25px) saturate(180%);
                    -webkit-backdrop-filter: blur(25px) saturate(180%);
                }
                .telemetry {
                    font-family: 'Space Grotesk', sans-serif !important;
                }
                .interactive-input {
                    transition: border-color 0.3s, box-shadow 0.3s !important;
                }
                .interactive-input:focus {
                    border-color: var(--accent-primary) !important;
                    box-shadow: 0 0 0 4px rgba(225, 25, 25, 0.08) !important;
                }
                @media (max-width: 900px) {
                    aside { display: none !important; } 
                }
            `}</style>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '16px 16px 16px 48px',
    background: 'rgba(0, 0, 0, 0.03)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '14px',
    fontSize: '0.88rem',
    color: 'var(--text-main)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
};

export default LoginPage;
