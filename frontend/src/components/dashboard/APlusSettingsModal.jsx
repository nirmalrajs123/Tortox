import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Image as ImageIcon, Save, AlertCircle, Smartphone, Monitor } from 'lucide-react';
import { aplusService } from '../../services/aplus';
import { useSwag } from '../../context/SwagContext';

const APlusSettingsModal = ({ isOpen, onClose, productId, productName }) => {
    const { showAlert } = useSwag();
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // 📸 Upload States
    const [desktopFile, setDesktopFile] = useState(null);
    const [desktopPreview, setDesktopPreview] = useState(null);
    const [mobileFile, setMobileFile] = useState(null);
    const [mobilePreview, setMobilePreview] = useState(null);

    const desktopInputRef = useRef(null);
    const mobileInputRef = useRef(null);

    const loadAPlus = async () => {
        if (!productId) return;
        setLoading(true);
        try {
            const res = await aplusService.getForProduct(productId);
            setContents(res.data?.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadAPlus();
            resetUploads();
        }
    }, [isOpen, productId]);

    const resetUploads = () => {
        setDesktopFile(null);
        setDesktopPreview(null);
        setMobileFile(null);
        setMobilePreview(null);
        if (desktopInputRef.current) desktopInputRef.current.value = '';
        if (mobileInputRef.current) mobileInputRef.current.value = '';
    };

    const handleFileSelect = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const isVideo = file.type.startsWith('video/');

        if (isVideo) {
            const url = URL.createObjectURL(file);
            if (type === 'desktop') {
                setDesktopFile(file);
                setDesktopPreview(url);
            } else {
                setMobileFile(file);
                setMobilePreview(url);
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const ratio = img.width / img.height;
                const isDesktop = type === 'desktop';
                const isValid = isDesktop
                    ? (ratio > 1.2) // Horizontal
                    : (ratio < 0.8); // Vertical

                if (!isValid) {
                    showAlert({
                        title: 'Ratio Infraction',
                        message: `Please use a ${isDesktop ? 'Horizontal (16:9)' : 'Vertical (9:16)'} image for ${type} view.`,
                        type: 'error'
                    });
                    e.target.value = '';
                    return;
                }

                if (isDesktop) {
                    setDesktopFile(file);
                    setDesktopPreview(event.target.result);
                } else {
                    setMobileFile(file);
                    setMobilePreview(event.target.result);
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleSaveRow = async () => {
        if (!desktopFile) {
            showAlert({ title: 'Requirement Missing', message: 'Desktop media is required to create a marketing row.', type: 'error' });
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('product_id', productId);
            formData.append('media', desktopFile);
            if (mobileFile) formData.append('mobile_media', mobileFile);

            await aplusService.create(formData);
            loadAPlus();
            resetUploads();
            showAlert({ title: 'Success', message: 'Responsive A+ Content added', type: 'success' });
        } catch (err) {
            console.error(err);
            showAlert({ title: 'Upload Failed', message: 'Could not upload A+ content', type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this responsive A+ content block?")) return;
        try {
            await aplusService.delete(id);
            setContents(prev => prev.filter(c => c.id !== id));
            showAlert({ title: 'Removed', message: 'Content block deleted', type: 'success' });
        } catch (err) {
            console.error(err);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                style={{ background: 'var(--bg-surface)', width: '100%', maxWidth: '1000px', maxHeight: '90vh', borderRadius: '32px', border: '1px solid var(--border-ghost)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}
            >
                {/* Header */}
                <div style={{ padding: '25px 35px', borderBottom: '1px solid var(--border-ghost)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
                    <div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '4px' }}>Responsive A+ Content</h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Marketing relay for: <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>{productName}</span></p>
                    </div>
                    <button onClick={onClose} style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-ghost)', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '35px', display: 'flex', flexDirection: 'column', gap: '30px' }}>

                    {/* Responsive Upload Builder */}
                    <div style={{ background: 'var(--bg-primary)', padding: '25px', borderRadius: '24px', border: '1px solid var(--border-ghost)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Plus size={18} color="var(--accent-primary)" /> ADD RESPONSIVE MARKETING ROW
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {/* Desktop Slot */}
                            <div
                                onClick={() => desktopInputRef.current.click()}
                                style={{
                                    aspectRatio: '16/9',
                                    background: 'var(--bg-secondary)',
                                    borderRadius: '16px',
                                    border: desktopPreview ? '2px solid var(--accent-primary)' : '2px dashed var(--border-ghost)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', overflow: 'hidden', position: 'relative',
                                    transition: 'all 0.3s'
                                }}
                                onMouseEnter={(e) => { if (!desktopPreview) e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                                onMouseLeave={(e) => { if (!desktopPreview) e.currentTarget.style.borderColor = 'var(--border-ghost)'; }}
                            >
                                {desktopPreview ? (
                                    desktopFile?.type.startsWith('video/') || desktopPreview.includes('video-') ? (
                                        <video src={desktopPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop />
                                    ) : (
                                        <img src={desktopPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )
                                ) : (
                                    <div style={{ textAlign: 'center' }}>
                                        <Plus size={32} color="var(--text-dim)" style={{ marginBottom: '12px', opacity: 0.6 }} />
                                        <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px' }}>Click to select media</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>Recommended: 1920x1080 (16:9)</p>
                                    </div>
                                )}
                                <input type="file" ref={desktopInputRef} hidden accept="image/*,video/*" onChange={(e) => handleFileSelect(e, 'desktop')} />
                            </div>

                            {/* Mobile Slot */}
                            <div
                                onClick={() => mobileInputRef.current.click()}
                                style={{
                                    aspectRatio: '16/9',
                                    background: 'var(--bg-secondary)',
                                    borderRadius: '16px',
                                    border: mobilePreview ? '2px solid var(--accent-primary)' : '2px dashed var(--border-ghost)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', overflow: 'hidden', position: 'relative',
                                    transition: 'all 0.3s'
                                }}
                                onMouseEnter={(e) => { if (!mobilePreview) e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                                onMouseLeave={(e) => { if (!mobilePreview) e.currentTarget.style.borderColor = 'var(--border-ghost)'; }}
                            >
                                {mobilePreview ? (
                                    mobileFile?.type.startsWith('video/') || mobilePreview.includes('video-') ? (
                                        <video src={mobilePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop />
                                    ) : (
                                        <img src={mobilePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )
                                ) : (
                                    <div style={{ textAlign: 'center' }}>
                                        <Smartphone size={32} color="var(--text-dim)" style={{ marginBottom: '12px', opacity: 0.6 }} />
                                        <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px' }}>Click to select media</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>Recommended: 1080x1920 (9:16)</p>
                                    </div>
                                )}
                                <input type="file" ref={mobileInputRef} hidden accept="image/*,video/*" onChange={(e) => handleFileSelect(e, 'mobile')} />
                            </div>
                        </div>

                        {(desktopFile || mobileFile) && (
                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button onClick={resetUploads} style={{ padding: '12px 24px', borderRadius: '12px', background: 'transparent', color: 'var(--text-dim)', border: '1px solid var(--border-ghost)', fontWeight: 800, cursor: 'pointer' }}>CANCEL</button>
                                <button onClick={handleSaveRow} disabled={uploading} style={{ padding: '12px 30px', borderRadius: '12px', background: 'var(--accent-primary)', color: '#fff', border: 'none', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Save size={18} /> {uploading ? 'SYNCING...' : 'SAVE MODULE'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ height: '1px', background: 'var(--border-ghost)' }} />

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>Syncing marketing data...</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Existing Contents */}
                            {contents.map((block, idx) => (
                                <motion.div
                                    key={block.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    style={{ background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--border-ghost)', overflow: 'hidden' }}
                                >
                                    <div style={{ padding: '15px 25px', borderBottom: '1px solid var(--border-ghost)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>MARKETING ROW #{idx + 1}</span>
                                        <button onClick={() => handleDelete(block.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                                        {/* Desktop Preview */}
                                        <div style={{ borderRadius: '12px', border: '1px solid var(--border-ghost)', overflow: 'hidden', background: '#000' }}>
                                            <p style={{ fontSize: '0.6rem', fontWeight: 900, background: 'rgba(0,0,0,0.5)', padding: '5px 10px', color: '#fff', width: 'fit-content' }}>DESKTOP</p>
                                            {block.image_paths[0].match(/\.(mp4|webm|ogg)$/i) ? (
                                                <video
                                                    src={block.image_paths[0].startsWith('http') ? block.image_paths[0] : `http://${window.location.hostname}:5000${block.image_paths[0]}`}
                                                    style={{ width: '100%', aspectRatio: '16/9', objectFit: 'contain' }}
                                                    autoPlay muted loop
                                                />
                                            ) : (
                                                <img
                                                    src={block.image_paths[0].startsWith('http') ? block.image_paths[0] : `http://${window.location.hostname}:5000${block.image_paths[0]}`}
                                                    alt="Desktop View"
                                                    style={{ width: '100%', aspectRatio: '16/9', objectFit: 'contain' }}
                                                />
                                            )}
                                        </div>
                                        {/* Mobile Preview */}
                                        <div style={{ borderRadius: '12px', border: '1px solid var(--border-ghost)', overflow: 'hidden', background: '#000' }}>
                                            <p style={{ fontSize: '0.6rem', fontWeight: 900, background: 'rgba(0,0,0,0.5)', padding: '5px 10px', color: '#fff', width: 'fit-content' }}>MOBILE</p>
                                            {block.mobile_media_path ? (
                                                <img
                                                    src={block.mobile_media_path.startsWith('http') ? block.mobile_media_path : `http://${window.location.hostname}:5000${block.mobile_media_path}`}
                                                    alt="Mobile View"
                                                    style={{ width: '100%', aspectRatio: '9/16', objectFit: 'contain' }}
                                                />
                                            ) : (
                                                <div style={{ width: '100%', aspectRatio: '9/16', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.7rem' }}>NO MOBILE ASSET</div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {contents.length === 0 && !loading && (
                                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-dim)', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--border-ghost)' }}>
                                    <AlertCircle size={40} style={{ opacity: 0.2, marginBottom: '15px' }} />
                                    <p>No A+ Content Found for this Unit.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '25px 35px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-ghost)', textAlign: 'right' }}>
                    <button onClick={onClose} style={{ padding: '12px 30px', borderRadius: '12px', background: 'var(--accent-primary)', color: '#fff', border: 'none', fontWeight: 900, cursor: 'pointer', fontSize: '0.85rem' }}>
                        BACK TO INVENTORY
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default APlusSettingsModal;
