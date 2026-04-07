import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { bannerService } from '../services/banner';

const Hero = () => {
    const [slides, setSlides] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await bannerService.getAll();
                const backendUrl = `http://${window.location.hostname}:5000`; 

                if (response.data && response.data.success && response.data.data.length > 0) {
                const iframedSlides = response.data.data.map(banner => {
                        let imageUrl = banner.media_path || '';
                        if (imageUrl && !imageUrl.startsWith('http')) {
                            imageUrl = `${backendUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
                        }

                        return {
                            image: imageUrl,
                            title: banner.banner_text || 'Premium Gaming Gear',
                            type: banner.media_type || 'image'
                        };
                    });
                    setSlides(iframedSlides);
                } else {
                    setSlides([]); 
                }
            } catch (error) {
                console.error('Error fetching banners:', error);
                setSlides([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    const nextSlide = useCallback(() => {
        if (slides.length === 0) return;
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, [slides]);

    const prevSlide = () => {
        if (slides.length === 0) return;
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    // Auto-scroll (Autoplay every 5 seconds)
    useEffect(() => {
        if (slides.length <= 1) return;
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [nextSlide, slides.length]);

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{ width: '40px', height: '40px', border: '4px solid #e11919', borderTopColor: 'transparent', borderRadius: '50%' }}
                />
            </div>
        );
    }

    if (slides.length === 0) return null;

    const currentSlide = slides[currentIndex];

    return (
        <section style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: '#000'
        }}>
            {/* Background Media with Kenya-Zoom Effect */}
            <AnimatePresence initial={false}>
                <motion.div 
                    key={currentIndex}
                    initial={{ scale: 1.15, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 0
                    }}
                >
                    {currentSlide.type === 'video' ? (
                        <video 
                            src={currentSlide.image} 
                            autoPlay muted loop playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{
                            width: '100%', height: '100%',
                            background: `url("${currentSlide.image}") no-repeat center center/cover`
                        }} />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Premium Gradient Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)',
                zIndex: 1
            }} />

            {/* Cinematic Content */}
            <AnimatePresence mode="wait">
                <motion.div 
                    key={currentIndex}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    style={{ zIndex: 10, maxWidth: '1100px', padding: '0 40px' }}
                >
                    <h1 style={{
                        fontSize: 'clamp(3rem, 10vw, 7rem)',
                        fontWeight: 950,
                        lineHeight: '0.85',
                        letterSpacing: '-0.05em',
                        color: '#fff',
                        textTransform: 'uppercase',
                        textShadow: '0 20px 80px rgba(0,0,0,0.6)'
                    }}>
                        <span style={{ 
                            background: 'linear-gradient(135deg, #fff 0%, #999 100%)', 
                            WebkitBackgroundClip: 'text', 
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {currentSlide.title}
                        </span>
                    </h1>
                </motion.div>
            </AnimatePresence>

            {/* Progressive Indicators */}
            {slides.length > 1 && (
                <div style={{
                    position: 'absolute',
                    bottom: '60px',
                    display: 'flex',
                    gap: '15px',
                    zIndex: 20
                }}>
                    {slides.map((_, index) => (
                        <div 
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            style={{
                                width: '40px',
                                height: '2px',
                                position: 'relative',
                                background: 'rgba(255,255,255,0.15)',
                                cursor: 'pointer',
                                overflow: 'hidden'
                            }}
                        >
                            {currentIndex === index && (
                                <motion.div 
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '0%' }}
                                    transition={{ duration: 5, ease: 'linear' }}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: '#fff'
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default Hero;
