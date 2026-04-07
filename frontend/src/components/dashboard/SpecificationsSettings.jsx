import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Search } from 'lucide-react';
import { categoryService } from '../../services/category';
import { productService } from '../../services/product';

const SpecificationsSettings = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [specLabels, setSpecLabels] = useState([]);
    const [newLabel, setNewLabel] = useState('');
    const [options, setOptions] = useState('');

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await categoryService.getAll();
                setCategories(res.data?.data || []);
            } catch (err) {
                console.error(err);
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            loadSpecLabels();
        } else {
            setSpecLabels([]);
        }
    }, [selectedCategory]);

    const loadSpecLabels = async () => {
        try {
            const res = await productService.getSpecLabels(selectedCategory);
            setSpecLabels(res.data?.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAdd = async () => {
        if (!newLabel.trim() || !selectedCategory) return;
        try {
            await productService.addSpecLabel({
                category_id: selectedCategory,
                spec_label: newLabel,
                spec_options: options
            });
            setNewLabel('');
            setOptions('');
            loadSpecLabels();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("PERMANENT DELETE: Purge specification label from the global registry?")) return;
        try {
            await productService.deleteSpecLabel(id);
            loadSpecLabels();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={cardStyle}>
            <div style={headerSectionStyle}>
                <h3 style={titleStyle}>Specification Fields Builder</h3>
                <p style={subtitleStyle}>Configure custom dropdowns and text fields for each product category</p>
            </div>

            <div style={formSectionStyle}>
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>1. Target Category</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="">-- Choose Category --</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                        ))}
                    </select>
                </div>

                {selectedCategory && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={dynamicFormStyle}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>2. Specification Label</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Motherboard Compatibility"
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>3. Dropdown Options (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Comma separated: ATX, M-ATX, ITX..."
                                    value={options}
                                    onChange={(e) => setOptions(e.target.value)}
                                    style={inputStyle}
                                />
                                <p style={hintStyle}>Leave empty for a standard text input field</p>
                            </div>
                        </div>

                        <button onClick={handleAdd} className="btn-glowing" style={addBtnStyle}>
                            <Plus size={18} /> Define Specification Field
                        </button>
                    </motion.div>
                )}
            </div>

            {selectedCategory && (
                <div style={listSectionStyle}>
                    <div style={listHeaderStyle}>
                        <p style={listTitleStyle}>Configured Fields for this Category</p>
                        <span style={badgeStyle}>{specLabels.length} Fields</span>
                    </div>
                    
                    <div style={gridStyle}>
                        {specLabels.length === 0 ? (
                            <div style={emptyStyle}>No custom fields defined for this category yet.</div>
                        ) : (
                            specLabels.map(label => (
                                <motion.div 
                                    layout
                                    key={label.id} 
                                    style={specCardStyle}
                                    whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}
                                >
                                    <div style={specHeaderStyle}>
                                        <div style={specIconStyle}>
                                            <Search size={14} color="#e11919" />
                                        </div>
                                        <h4 style={specLabelStyle}>{label.spec_label}</h4>
                                        <button onClick={() => handleDelete(label.id)} style={deleteBtnStyle}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    
                                    <div style={specBodyStyle}>
                                        <span style={typeBadgeStyle}>
                                            {label.spec_options ? 'DROPDOWN' : 'TEXT FIELD'}
                                        </span>
                                        {label.spec_options && (
                                            <div style={optionsListStyle}>
                                                {label.spec_options.split(',').map((opt, i) => (
                                                    <span key={i} style={optionTagStyle}>{opt.trim()}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ✨ Premium Styles
const cardStyle = { background: '#ffffff', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.04)', overflow: 'hidden', border: '1px solid #f1f5f9' };
const headerSectionStyle = { padding: '2rem', background: 'linear-gradient(to right, #f8fafc, #ffffff)', borderBottom: '1px solid #f1f5f9' };
const titleStyle = { fontSize: '1.4rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.4rem', letterSpacing: '-0.5px' };
const subtitleStyle = { fontSize: '0.85rem', color: '#64748b', fontWeight: 500 };

const formSectionStyle = { padding: '2rem', borderBottom: '1px solid #f1f5f9' };
const inputGroupStyle = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' };
const selectStyle = { padding: '14px', borderRadius: '14px', border: '2px solid #f1f5f9', background: '#f8fafc', fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', outline: 'none', transition: 'all 0.2s', cursor: 'pointer' };
const inputStyle = { padding: '14px', borderRadius: '14px', border: '2px solid #f1f5f9', background: '#f8fafc', fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', outline: 'none', transition: 'all 0.2s' };
const hintStyle = { fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500, marginTop: '4px' };
const dynamicFormStyle = { marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed #e2e8f0' };

const addBtnStyle = { 
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
    width: '100%', padding: '14px', background: 'linear-gradient(135deg, #e11919 0%, #900a0a 100%)', 
    color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 800, 
    cursor: 'pointer', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' 
};

const listSectionStyle = { padding: '2rem', background: '#fcfdfe' };
const listHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' };
const listTitleStyle = { fontSize: '0.9rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' };
const badgeStyle = { px: '10px', py: '4px', background: '#eff6ff', color: '#3b82f6', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 };

const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' };
const specCardStyle = { background: '#fff', padding: '1.2rem', borderRadius: '18px', border: '1px solid #f1f5f9', transition: 'all 0.3s ease' };
const specHeaderStyle = { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' };
const specIconStyle = { width: '28px', height: '28px', borderRadius: '8px', background: '#fff1f1', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const specLabelStyle = { flex: 1, fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' };
const deleteBtnStyle = { padding: '6px', borderRadius: '8px', color: '#cbd5e1', transition: 'all 0.2s', cursor: 'pointer', border: 'none', background: 'none' };

const specBodyStyle = { display: 'flex', flexDirection: 'column', gap: '8px' };
const typeBadgeStyle = { alignSelf: 'flex-start', fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' };
const optionsListStyle = { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' };
const optionTagStyle = { fontSize: '0.7rem', fontWeight: 600, padding: '4px 10px', background: '#f1f5f9', color: '#475569', borderRadius: '8px' };
const emptyStyle = { gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 };

export default SpecificationsSettings;
