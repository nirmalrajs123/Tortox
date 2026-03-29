import React from 'react';
import logo from '../assets/logo.png';

const TortoxLogo = ({ size = '160px', height }) => {
    // We assume if the number is small (e.g. 20-50), the user likely means the height
    // for use in a navbar/footer. If it's larger (>100), they might mean the width for a hero.
    
    const numericSize = parseInt(size);
    const resolvedHeight = height || (numericSize < 80 ? size : 'auto');
    const resolvedWidth = height ? 'auto' : (numericSize < 80 ? 'auto' : size);

    const logoStyle = {
        width: resolvedWidth,
        height: resolvedHeight,
        display: 'block',
        userSelect: 'none',
        objectFit: 'contain'
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <img 
                src={logo} 
                alt="TORTOX" 
                style={logoStyle}
            />
        </div>
    );
};

export default TortoxLogo;
