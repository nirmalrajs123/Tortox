import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

const ScrollVideoSection = ({ src, title = "", description = "", stages = [] }) => {
    const sectionRef = useRef(null);
    const videoRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const section = sectionRef.current;
        const video = videoRef.current;
        if (!section || !video) return;

        let ctx = gsap.context(() => {
            const onLoadedMetadata = () => {
                const duration = video.duration || 0;
                
                // Pin the section
                const st = ScrollTrigger.create({
                    trigger: section,
                    start: "top top",
                    end: "+=3000", 
                    scrub: 1, 
                    pin: true,
                    anticipatePin: 1
                });

                // Separate animation for video currentTime to allow for smoother interpolation
                gsap.to(video, {
                    currentTime: duration,
                    ease: "none",
                    scrollTrigger: {
                        trigger: section,
                        start: "top top",
                        end: "+=3000",
                        scrub: 0.5, // Slightly less than 1 to feel more responsive yet smooth
                    }
                });
            };

            video.addEventListener("loadedmetadata", onLoadedMetadata);
            if (video.readyState >= 2) onLoadedMetadata();

            return () => {
                video.removeEventListener("loadedmetadata", onLoadedMetadata);
            };
        }, section);

        return () => ctx.revert();
    }, [src]);

    return (
        <section 
            ref={sectionRef} 
            style={{ 
                height: "100vh", 
                background: "#000", 
                overflow: "hidden",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            {/* Background Video */}
            <video
                ref={videoRef}
                src={src}
                muted
                playsInline
                preload="auto"
                style={{
                    width: "100%",
                    height: "100vh",
                    objectFit: "cover",
                    display: "block",
                    opacity: 0.8
                }}
            />

            {/* Cinematic Overlays */}
            <div 
                style={{ 
                    position: "absolute", 
                    inset: 0, 
                    background: "linear-gradient(to right, rgba(0,0,0,0.8) 0%, transparent 60%)",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 8%",
                    pointerEvents: "none"
                }}
            >
                <div style={{ maxWidth: "500px" }}>
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                    >
                        <h2 style={{ 
                            fontSize: "clamp(2.5rem, 5vw, 4rem)", 
                            fontWeight: 900, 
                            color: "#fff", 
                            lineHeight: 1,
                            marginBottom: "20px",
                            textTransform: "uppercase",
                            letterSpacing: "-2px"
                        }}>
                            {title.split(' ').map((word, i) => (
                                <span key={i} style={{ color: i === 0 ? "var(--accent-primary)" : "#fff", display: "block" }}>
                                    {word}
                                </span>
                            ))}
                        </h2>
                        <p style={{ 
                            fontSize: "1.1rem", 
                            color: "rgba(255,255,255,0.6)", 
                            lineHeight: 1.6,
                            borderLeft: "2px solid var(--accent-primary)",
                            paddingLeft: "20px"
                        }}>
                            {description}
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Industrial Bottom Indicator */}
            <div style={{ 
                position: "absolute", 
                bottom: "40px", 
                left: "8%", 
                display: "flex", 
                alignItems: "center", 
                gap: "15px",
                opacity: 0.5
            }}>
                <div style={{ width: "40px", height: "1px", background: "#fff" }} />
                <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "#fff", letterSpacing: "3px", textTransform: "uppercase" }}>
                    Cinematic Sequence
                </span>
            </div>
        </section>
    );
};

export default ScrollVideoSection;
