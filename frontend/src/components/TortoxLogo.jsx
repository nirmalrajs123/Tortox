import React from 'react';

const TortoxLogo = ({ size = '160px', color1 = '#e11919', color2 = '#000000' }) => {
    // 🧬 Geometric scaling for relative proportions framing setup correctly indexing 
    const isSmall = parseInt(size) < 100;
    const fontSize = isSmall ? '1.2rem' : '1.8rem';

    const gradientId = `logoSplit-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}>
            <svg
                width={isSmall ? '24' : '32'}
                height={isSmall ? '24' : '32'}
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="100%">
                        <stop offset="50%" stopColor={color1} />
                        <stop offset="50%" stopColor={color2} />
                    </linearGradient>
                </defs>

                {/* 🛡️ Unified Arch - Horizontal Split triggered flawlessly */}
                <path
                    d="M10 60 C 10 35, 30 15, 50 15 C 70 15, 90 35, 90 60 L 90 75 L 70 75 L 70 60 C 70 50, 60 40, 50 40 C 40 40, 30 50, 30 60 L 30 75 L 10 75 Z"
                    fill={`url(#${gradientId})`}
                />

                {/* 👁️ Focal White Dot */}
                <circle cx="75" cy="40" r="3" fill="#ffffff" />
            </svg>

            <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 900,
                fontSize: fontSize,
                letterSpacing: '-1.2px',
                lineHeight: 1,
                background: `linear-gradient(180deg, ${color1} 50%, ${color2} 50%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
            }}>
                TORTOX
            </span>
        </div>
    );
};

export default TortoxLogo;
