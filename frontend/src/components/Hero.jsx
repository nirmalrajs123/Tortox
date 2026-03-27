import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
    {
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1920',
        subtitle: 'NEW ARRIVAL: DLX21 MESH',
        titlePrefix: 'FLY TO ',
        titleHighlight: 'UNLIMITED',
        titleSuffix: ' PERFORMANCE',
        desc: 'Engineered for high-end airflow without compromising design aesthetics. darkFlash brings case crafting to a whole new dimension.',
        btnText: 'Explore Products'
    },
    {
        image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=1920',
        subtitle: 'LIQUID COOLING SERIES',
        titlePrefix: 'EXTREME ',
        titleHighlight: 'THERMAL',
        titleSuffix: ' SOLUTIONS',
        desc: 'Maximum cooling efficiency designed with premium copper base for extreme overclocking thermal capabilities.',
        btnText: 'View Coolers'
    },
    {
        image: 'https://images.unsplash.com/photo-1587202371785-5b1240801f0a?auto=format&fit=crop&q=80&w=1920',
        subtitle: 'ARGB FANS PACK',
        titlePrefix: 'MODULAR ',
        titleHighlight: 'AESTHETIC',
        titleSuffix: ' LIGHTING',
        desc: 'Addressable RGB lights config layouts setup perfectly balanced speed sound airflow triggers setups correctly.',
        btnText: 'Shop ARGB'
    }
];

const Hero = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    // Autoplay
    useEffect(() => {
        const interval = setInterval(nextSlide, 6000);
        return () => clearInterval(interval);
    }, [currentIndex]);

    return (
        <section style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Sliding Panels */}
            <AnimatePresence mode="wait">
                <motion.div 
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: `url("${slides[currentIndex].image}") no-repeat center center/cover`,
                        zIndex: -1
                    }}
                />
            </AnimatePresence>

            {/* White/Radial Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.6) 0%, rgba(249, 250, 251, 0.95) 100%)',
                zIndex: 0
            }} />

            {/* Text Contents AnimatePresence */}
            <AnimatePresence mode="wait">
                <motion.div 
                    key={currentIndex}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6 }}
                    style={{ zIndex: 10, maxWidth: '830px', padding: '0 20px' }}
                >
                    <motion.span 
                        style={{
                            display: 'inline-block',
                            padding: '6px 14px',
                            background: 'rgba(225, 25, 25, 0.08)',
                            border: '1px solid rgba(225, 25, 25, 0.2)',
                            borderRadius: '20px',
                            color: '#e11919',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            letterSpacing: '1px',
                            marginBottom: '1.2rem'
                        }}
                    >
                        {slides[currentIndex].subtitle}
                    </motion.span>
                    
                    <h1 style={{
                        fontSize: '4.2rem',
                        fontWeight: 800,
                        lineHeight: '1.1',
                        letterSpacing: '-1px',
                        color: '#111827',
                        marginBottom: '1.5rem'
                    }}>
                        {slides[currentIndex].titlePrefix} 
                        <span className="glow-text" style={{ 
                            background: 'linear-gradient(90deg, #e11919, #900a0a)', 
                            WebkitBackgroundClip: 'text', 
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {slides[currentIndex].titleHighlight}
                        </span> 
                        <br /> {slides[currentIndex].titleSuffix}
                    </h1>

                    <p style={{
                        color: '#4b5563',
                        fontSize: '1.1rem',
                        lineHeight: '1.6',
                        maxWidth: '600px',
                        margin: '0 auto 2.5rem',
                        fontWeight: 400
                    }}>
                        {slides[currentIndex].desc}
                    </p>

                    <motion.div 
                        style={{ display: 'inline-flex', gap: '1rem' }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                            const navigate = window.location.pathname === '/' ? null : null; // Just for conceptualizing
                            window.location.href = '/products';
                        }}
                    >
                        <button style={{
                            padding: '14px 34px',
                            background: 'linear-gradient(135deg, #e11919 0%, #900a0a 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '30px',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 8px 24px rgba(225, 25, 25, 0.2)',
                            transition: 'box-shadow 0.2s'
                        }}>
                            {slides[currentIndex].btnText}
                        </button>
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            {/* Manual Controls left/right arrows */}
            <motion.button 
                whileHover={{ scale: 1.1, background: 'rgba(0,0,0,0.05)' }}
                onClick={prevSlide}
                style={{
                    position: 'absolute',
                    left: '30px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.7)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#111827',
                    cursor: 'pointer',
                    zIndex: 20,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
            >
                <ChevronLeft size={24} />
            </motion.button>

            <motion.button 
                whileHover={{ scale: 1.1, background: 'rgba(0,0,0,0.05)' }}
                onClick={nextSlide}
                style={{
                    position: 'absolute',
                    right: '30px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.7)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#111827',
                    cursor: 'pointer',
                    zIndex: 20,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
            >
                <ChevronRight size={24} />
            </motion.button>

            {/* Navigation Dots Indicator bottom center */}
            <div style={{
                position: 'absolute',
                bottom: '40px',
                display: 'flex',
                gap: '8px',
                zIndex: 20
            }}>
                {slides.map((_, index) => (
                    <div 
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        style={{
                            width: currentIndex === index ? '24px' : '8px',
                            height: '8px',
                            borderRadius: '4px',
                            background: currentIndex === index ? '#e11919' : 'rgba(0,0,0,0.15)',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    />
                ))}
            </div>
        </section>
    );
};

export default Hero;
