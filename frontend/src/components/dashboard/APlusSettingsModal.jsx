import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Image as ImageIcon, Save, AlertCircle } from 'lucide-react';
import { aplusService } from '../../services/aplus';
import { useSwag } from '../../context/SwagContext';

const APlusSettingsModal = ({ isOpen, onClose, productId, productName }) => {
    const { showAlert } = useSwag();
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

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
        if (isOpen) loadAPlus();
    }, [isOpen, productId]);

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('product_id', productId);
            files.forEach(file => {
                formData.append('media', file);
            });

            await aplusService.create(formData);
            loadAPlus();
            showAlert({ title: 'Success', message: 'A+ Content added', type: 'success' });
        } catch (err) {
            console.error(err);
            showAlert({ title: 'Upload Failed', message: 'Could not upload A+ content images', type: 'error' });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this A+ content block?")) return;
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
                style={{ background: 'var(--bg-surface)', width: '100%', maxWidth: '900px', maxHeight: '90vh', borderRadius: '32px', border: '1px solid var(--border-ghost)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}
            >
                {/* Header */}
                <div style={{ padding: '25px 35px', borderBottom: '1px solid var(--border-ghost)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
                    <div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '4px' }}>A+ Content Manager</h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Enhance product storytelling for: <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>{productName}</span></p>
                    </div>
                    <button onClick={onClose} style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-ghost)', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '35px', display: 'flex', flexDirection: 'column', gap: '30px' }}>

                    {/* Upload Trigger */}
                    <div
                        onClick={() => fileInputRef.current.click()}
                        style={{ border: '2px dashed var(--border-ghost)', borderRadius: '20px', padding: '40px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: 'rgba(255,255,255,0.02)' }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-ghost)'}
                    >
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(225, 25, 25, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                            <Plus size={30} color="var(--accent-primary)" />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Add A+ Marketing Row</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Select multiple images to create a vertical storytelling layout</p>
                        <input type="file" ref={fileInputRef} multiple style={{ display: 'none' }} accept="image/*" onChange={handleFileUpload} />
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>Syncing marketing data...</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                            {/* Pending State Rendering */}
                            {pendingFiles.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    style={{ background: 'var(--bg-primary)', borderRadius: '20px', border: '1px dashed var(--accent-primary)', overflow: 'hidden' }}
                                >
                                    <div style={{ padding: '15px 20px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-ghost)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>PENDING ROW (UNSAVED)</span>
                                        </div>
                                        <button onClick={() => setPendingFiles([])} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                                        {pendingFiles.map((file, pIdx) => (
                                            <div key={pIdx} style={{ width: '120px', height: '120px', borderRadius: '12px', border: '1px solid var(--border-ghost)', overflow: 'hidden', position: 'relative' }}>
                                                <img src={URL.createObjectURL(file)} alt={`Pending ${pIdx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ padding: '15px', display: 'flex', justifyContent: 'flex-end', background: 'rgba(225,25,25,0.05)' }}>
                                        <button onClick={handleSave} disabled={uploading} style={{ padding: '10px 24px', background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
                                            {uploading ? 'SAVING...' : 'SAVE PENDING ROW'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Existing Contents */}
                            {contents.map((block, idx) => (
                                <motion.div
                                    key={block.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    style={{ background: 'var(--bg-primary)', borderRadius: '20px', border: '1px solid var(--border-ghost)', overflow: 'hidden' }}
                                >
                                    <div style={{ padding: '15px 20px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-ghost)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>ROW #{idx + 1}</span>
                                        </div>
                                        <button onClick={() => handleDelete(block.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                                        {block.image_paths?.map((path, pIdx) => (
                                            <div key={pIdx} style={{ width: '120px', height: '120px', borderRadius: '12px', border: '1px solid var(--border-ghost)', overflow: 'hidden', position: 'relative' }}>
                                                <img src={path.startsWith('http') ? path : `http://${window.location.hostname}:5000${path}`} alt={`A+ ${pIdx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                            {contents.length === 0 && !loading && pendingFiles.length === 0 && (
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
                    <button onClick={onClose} style={{ padding: '12px 30px', borderRadius: '12px', background: 'var(--bg-primary)', color: 'var(--text-main)', border: '1px solid var(--border-ghost)', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}>
                        CLOSE MANAGER
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default APlusSettingsModal;
