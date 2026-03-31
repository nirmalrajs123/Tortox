import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';

const PartnerSettings = () => {
    const [formData, setFormData] = useState({
        heading: '',
        description: '',
        image: null
    });
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: 'info', message: 'Syncing manifest...' });

        // Industry Guard: Mimic payload for now or connect to API
        setTimeout(() => {
            setLoading(false);
            setStatus({ type: 'success', message: 'Partner Manifest adopted successfully!' });
        }, 1500);
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Partner Configuration</h1>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Deploy high-fidelity brand identities to the Tortox hub.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* 🏷️ Heading */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Partner Heading</label>
                    <input 
                        type="text" 
                        value={formData.heading}
                        onChange={(e) => setFormData({...formData, heading: e.target.value})}
                        placeholder="e.g. NVIDIA Studio Certified"
                        style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-ghost)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none' }}
                    />
                </div>

                {/* 📝 Description */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Brand Manifest (Description)</label>
                    <textarea 
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Describe the technical synergy..."
                        style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-ghost)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none', resize: 'none' }}
                    />
                </div>

                {/* 📸 Image Upload */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identity Media (Logo/Banner)</label>
                    <div 
                        onClick={() => document.getElementById('partner-image').click()}
                        style={{ 
                            height: '200px', 
                            border: '2px dashed var(--border-ghost)', 
                            borderRadius: '16px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            cursor: 'pointer',
                            overflow: 'hidden',
                            position: 'relative',
                            background: '#f8fafc'
                        }}
                    >
                        {preview ? (
                            <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                            <>
                                <Upload color="#94a3b8" />
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.5rem' }}>Inject Media Format</span>
                            </>
                        )}
                        <input id="partner-image" type="file" hidden onChange={handleImageChange} />
                    </div>
                </div>

                {/* 🚀 Submit */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ 
                        padding: '1rem', 
                        background: 'var(--accent-primary)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '12px', 
                        fontWeight: 700, 
                        cursor: 'pointer',
                        marginTop: '1rem'
                    }}
                >
                    Adopt Partner Identity
                </motion.button>
            </form>

            <AnimatePresence>
                {status && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{ 
                            marginTop: '2rem', 
                            padding: '1rem', 
                            borderRadius: '12px', 
                            background: status.type === 'success' ? '#f0fdf4' : '#eff6ff',
                            border: `1px solid ${status.type === 'success' ? '#bbf7d0' : '#bfdbfe'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}
                    >
                        {status.type === 'success' ? <CheckCircle2 color="#22c55e" size={18} /> : <AlertCircle color="#3b82f6" size={18} /> }
                        <span style={{ color: status.type === 'success' ? '#166534' : '#1e40af', fontSize: '0.9rem', fontWeight: 600 }}>{status.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PartnerSettings;
