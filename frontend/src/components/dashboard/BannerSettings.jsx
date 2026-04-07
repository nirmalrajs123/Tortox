import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, Save, Upload, Image as ImageIcon, Video } from 'lucide-react';
import { bannerService } from '../../services/banner';

const BannerSettings = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        banner_text: '',
        subtitle: '',
        description: '',
        media_type: 'image',
        mediaFile: null,
        previewUrl: null,
        existing_media_path: ''
    });

    const loadBanners = async () => {
        try {
            setLoading(true);
            const res = await bannerService.getAll();
            if (res.data && res.data.success) {
                setBanners(res.data.data);
            }
        } catch (error) {
            console.error('Failed to load banners:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBanners();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                mediaFile: file,
                previewUrl: URL.createObjectURL(file),
                media_type: file.type.startsWith('video') ? 'video' : 'image'
            }));
        }
    };

    const resetForm = () => {
        setFormData({
            banner_text: '',
            subtitle: '',
            description: '',
            media_type: 'image',
            mediaFile: null,
            previewUrl: null,
            existing_media_path: ''
        });
        setIsAdding(false);
        setEditingId(null);
    };

    const handleEdit = (banner) => {
        setEditingId(banner.id);
        setFormData({
            banner_text: banner.banner_text || '',
            subtitle: banner.subtitle || '',
            description: banner.description || '',
            media_type: banner.media_type || 'image',
            mediaFile: null,
            previewUrl: banner.media_path,
            existing_media_path: banner.media_path
        });
        setIsAdding(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('banner_text', formData.banner_text);
        data.append('subtitle', formData.subtitle);
        data.append('description', formData.description);
        data.append('media_type', formData.media_type);
        
        if (formData.mediaFile) {
            data.append('media', formData.mediaFile);
        } else if (formData.existing_media_path) {
            data.append('existing_media_path', formData.existing_media_path);
        }

        try {
            let res;
            if (editingId) {
                res = await bannerService.update(editingId, data);
            } else {
                res = await bannerService.create(data);
            }

            if (res.data && res.data.success) {
                loadBanners();
                resetForm();
            }
        } catch (error) {
            console.error('Failed to save banner:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            try {
                const res = await bannerService.delete(id);
                if (res.data && res.data.success) {
                    loadBanners();
                }
            } catch (error) {
                console.error('Failed to delete banner:', error);
            }
        }
    };

    return (
        <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Hero Showcase Management</h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>Control the main promotional slides on your homepage.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { resetForm(); setIsAdding(true); }}
                    style={{
                        padding: '12px 24px', borderRadius: '12px',
                        background: 'var(--accent-primary)', color: '#fff',
                        border: 'none', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: 700,
                        boxShadow: '0 4px 15px rgba(225, 25, 25, 0.2)'
                    }}
                >
                    <Plus size={20} /> Create Slide
                </motion.button>
            </div>

            <AnimatePresence>
                {(isAdding || editingId) && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{
                            background: 'var(--bg-primary)', padding: '2.5rem',
                            borderRadius: '24px', border: '1px solid var(--border-ghost)',
                            marginBottom: '3rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                        }}
                    >
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Headline Text</label>
                                    <input
                                        type="text"
                                        value={formData.banner_text}
                                        onChange={(e) => setFormData(p => ({ ...p, banner_text: e.target.value }))}
                                        placeholder="Main Title (e.g. HGFGHGHKIIO)"
                                        style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-ghost)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', fontWeight: 500 }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Subtitle</label>
                                    <input
                                        type="text"
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData(p => ({ ...p, subtitle: e.target.value }))}
                                        placeholder="Top Label (e.g. Ensures maximum airflow)"
                                        style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-ghost)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', fontWeight: 500 }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Media Format</label>
                                    <select
                                        value={formData.media_type}
                                        onChange={(e) => setFormData(p => ({ ...p, media_type: e.target.value }))}
                                        style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-ghost)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', cursor: 'pointer' }}
                                    >
                                        <option value="image">Static Background (Image)</option>
                                        <option value="video">Dynamic Background (Video)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Bottom Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Enter additional product details or marketing punchlines..."
                                    style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-ghost)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', fontWeight: 500, minHeight: '80px', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Background Asset</label>
                                    <div style={{ position: 'relative', width: '100%' }}>
                                        <input
                                            type="file"
                                            accept="image/*,video/*"
                                            onChange={handleFileChange}
                                            style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 10 }}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '3rem 2rem', background: 'var(--bg-surface)', border: '2px dashed var(--border-ghost)', borderRadius: '16px', transition: 'border-color 0.2s' }}>
                                            <Upload color="var(--text-muted)" size={32} />
                                            <div style={{ textAlign: 'center' }}>
                                                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 700 }}>Click to select media</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Recommended: 1920x1080 (16:9)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {formData.previewUrl && (
                                    <div style={{ width: '280px' }}>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>Live Preview</label>
                                        <div style={{ width: '100%', height: '157px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-ghost)', background: '#000', position: 'relative' }}>
                                            {formData.media_type === 'video' ? (
                                                <video src={formData.previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop />
                                            ) : (
                                                <img src={formData.previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            )}
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.5)', padding: '0 10px', textAlign: 'center' }}>{formData.banner_text || 'Headline Preview'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid var(--border-ghost)', paddingTop: '2rem' }}>
                                <button type="button" onClick={resetForm} style={{ padding: '12px 24px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--border-ghost)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 700 }}>discard</button>
                                <button type="submit" style={{ padding: '12px 40px', borderRadius: '12px', background: 'linear-gradient(135deg, #e11919 0%, #900a0a 100%)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(225, 25, 25, 0.2)' }}>
                                    <Save size={20} /> {editingId ? 'Update Slide' : 'Launch Slide'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ background: 'var(--bg-surface)', borderRadius: '24px', border: '1px solid var(--border-ghost)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-ghost)' }}>
                        <tr>
                            {['Order', 'Asset Preview', 'Active Headline', 'Format', 'Controls'].map(h => (
                                <th key={h} style={{ padding: '20px 24px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'left', letterSpacing: '1px' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {banners.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '1rem' }}>No active hero slides detected.</td>
                            </tr>
                        ) : (
                            banners.map((banner, index) => (
                                <tr key={banner.id} style={{ borderBottom: '1px solid var(--border-ghost)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '24px', color: 'var(--accent-primary)', fontWeight: 900, fontSize: '1.1rem' }}>{index + 1}</td>
                                    <td style={{ padding: '12px 24px' }}>
                                        <div style={{ width: '120px', height: '68px', borderRadius: '12px', overflow: 'hidden', background: '#000', border: '1px solid var(--border-ghost)' }}>
                                            {banner.media_type === 'video' ? (
                                                <video src={banner.media_path} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                                            ) : (
                                                <img src={banner.media_path} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '24px', fontWeight: 700, color: 'var(--text-main)', maxWidth: '300px' }}>{banner.banner_text || '---'}</td>
                                    <td style={{ padding: '24px' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'var(--bg-primary)', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                                            {banner.media_type === 'video' ? <Video size={14} /> : <ImageIcon size={14} />}
                                            {banner.media_type}
                                        </div>
                                    </td>
                                    <td style={{ padding: '24px' }}>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button onClick={() => handleEdit(banner)} style={{ padding: '10px', borderRadius: '10px', background: 'transparent', border: '1px solid var(--border-ghost)', color: 'var(--text-dim)', cursor: 'pointer' }}><Edit3 size={18} /></button>
                                            <button onClick={() => handleDelete(banner.id)} style={{ padding: '10px', borderRadius: '10px', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'rgba(239, 68, 68, 0.7)', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BannerSettings;
