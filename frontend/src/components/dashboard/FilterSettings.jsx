import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, Trash2, ChevronRight, Filter, Settings2, Hash, Layers, Save, X, Edit2, Check, GripVertical } from 'lucide-react';
import { categoryService } from '../../services/category';
import { productService } from '../../services/product';

const FilterSettings = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [labels, setLabels] = useState([]);
    const [selectedLabelId, setSelectedLabelId] = useState(null);
    const [values, setValues] = useState([]);

    // 🏗️ Builder States
    const [isBuilding, setIsBuilding] = useState(false);
    const [builderLabel, setBuilderLabel] = useState('');
    const [builderOptions, setBuilderOptions] = useState(['']);

    // 📝 Editing States
    const [editingLabelId, setEditingLabelId] = useState(null);
    const [editingLabelText, setEditingLabelText] = useState('');
    const [editingValueId, setEditingValueId] = useState(null);
    const [editingValueText, setEditingValueText] = useState('');
    const [newValueText, setNewValueText] = useState(''); // ➕ New state for inline value add

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
            loadLabels();
            setSelectedLabelId(null);
            setValues([]);
        } else {
            setLabels([]);
        }
    }, [selectedCategory]);

    useEffect(() => {
        if (selectedLabelId) {
            loadValues();
        } else {
            setValues([]);
        }
    }, [selectedLabelId]);

    const loadLabels = async () => {
        try {
            const res = await productService.getFilterLabels(selectedCategory);
            setLabels(res.data?.data || []);
        } catch (err) {
            console.error("LOAD LABELS FAILED!", err);
        }
    };

    const loadValues = async () => {
        try {
            const res = await productService.getFilterValues(selectedLabelId);
            setValues(res.data?.data || []);
        } catch (err) {
            console.error("LOAD VALUES FAILED!", err);
        }
    };

    // 🏗️ Builder Logic
    const addOptionField = () => setBuilderOptions([...builderOptions, '']);
    const removeOptionField = (index) => setBuilderOptions(builderOptions.filter((_, i) => i !== index));
    const updateOptionField = (index, val) => {
        const updated = [...builderOptions];
        updated[index] = val;
        setBuilderOptions(updated);
    };

    const handleSaveFull = async () => {
        if (!builderLabel.trim()) return alert("Label cannot be empty!");
        if (builderOptions.filter(o => o.trim()).length === 0) return alert("Add at least one option!");

        try {
            const res = await productService.saveFullFilter({
                category_id: parseInt(selectedCategory),
                filter_label: builderLabel,
                options: builderOptions.filter(o => o.trim())
            });
            if (res.data.success) {
                setIsBuilding(false);
                setBuilderLabel('');
                setBuilderOptions(['']);
                loadLabels();
            }
        } catch (err) {
            console.error("SAVE FULL FAILED:", err);
            alert("Error saving: " + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteLabel = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("PERMANENT DELETE: Remove filter label and all its values forever?")) return;
        try {
            await productService.deleteFilterLabel(id);
            if (selectedLabelId === id) setSelectedLabelId(null);
            loadLabels();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteValue = async (id) => {
        if (!window.confirm("PERMANENT DELETE: Purge this option from the catalog?")) return;
        try {
            await productService.deleteFilterValue(id);
            loadValues();
        } catch (err) {
            console.error(err);
        }
    };

    // 📝 Update Handlers
    const handleUpdateLabel = async (id) => {
        if (!editingLabelText.trim()) return setEditingLabelId(null);
        try {
            await productService.updateFilterLabel(id, { filter_label: editingLabelText });
            setEditingLabelId(null);
            loadLabels();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateValue = async (id) => {
        if (!editingValueText.trim()) return setEditingValueId(null);
        try {
            await productService.updateFilterValue(id, { filter_value: editingValueText });
            setEditingValueId(null);
            loadValues();
        } catch (err) {
            console.error(err);
        }
    };

    const handleReorder = async (newOrder) => {
        setLabels(newOrder); // ⚡ Visual Sync Impulse
        try {
            const payload = newOrder.map((l, idx) => ({ id: l.id, order_id: idx + 1 }));
            await productService.reorderFilterLabels({ order: payload });
        } catch (err) {
            console.error("REORDER SYNC FAILED:", err);
        }
    };

    const handleReorderValues = async (newValues) => {
        setValues(newValues); // ⚡ Visual Sync Impulse
        try {
            const payload = newValues.map((v, idx) => ({ id: v.id, order_id: idx + 1 }));
            await productService.reorderFilterValues({ order: payload });
        } catch (err) {
            console.error("REORDER VALUES SYNC FAILED:", err);
        }
    };

    return (
        <div style={cardStyle}>
            <div style={headerSectionStyle}>
                <div style={iconBoxStyle}><Layers size={22} color="#fff" /></div>
                <div>
                    <h3 style={titleStyle}>Universal Filter Builder</h3>
                    <p style={subtitleStyle}>Build dynamic dropdown filters with multiple options instantly</p>
                </div>
            </div>

            <div style={{ padding: '2rem' }}>
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Target Category Selection</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="">-- Select Your Category --</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                        ))}
                    </select>
                </div>

                {selectedCategory && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2.5rem', marginTop: '2rem' }}>

                        {/* LEFT COLUMN: TABLE 1 - FILTER LABELS */}
                        <div style={columnStyle}>
                            <div style={columnHeaderStyle}>
                                <span style={columnTitleStyle}>Table 1: Filter Labels</span>
                                <button
                                    onClick={() => { setIsBuilding(!isBuilding); setEditingLabelId(null); }}
                                    style={{ ...builderToggleStyle, background: isBuilding ? '#f1f5f9' : '#1e293b', color: isBuilding ? '#1e293b' : '#fff' }}
                                >
                                    {isBuilding ? <X size={14} /> : <Plus size={14} />} {isBuilding ? 'Cancel' : 'New Filter'}
                                </button>
                            </div>

                            <AnimatePresence>
                                {isBuilding && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                        style={builderContainerStyle}
                                    >
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={miniLabelStyle}>1. Filter Label Name</label>
                                            <input
                                                type="text" placeholder="e.g., Motherboard Support" style={fullInputStyle}
                                                value={builderLabel} onChange={(e) => setBuilderLabel(e.target.value)}
                                            />
                                        </div>

                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={miniLabelStyle}>2. Options Builder</label>
                                            {builderOptions.map((opt, idx) => (
                                                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                                    <input
                                                        type="text" placeholder={`Option ${idx + 1}`} style={{ ...fullInputStyle, flex: 1 }}
                                                        value={opt} onChange={(e) => updateOptionField(idx, e.target.value)}
                                                    />
                                                    <button onClick={() => removeOptionField(idx)} style={deleteFieldBtnStyle}><Trash2 size={12} /></button>
                                                </div>
                                            ))}
                                            <button onClick={addOptionField} style={addFieldBtnStyle}><Plus size={14} /> Add Another Option</button>
                                        </div>

                                        <button onClick={handleSaveFull} style={saveFullBtnStyle}><Save size={16} /> Save Full Filter</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div style={listScrollStyle}>
                                <div style={{ marginBottom: '10px', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Existing Labels</div>
                                <Reorder.Group axis="y" values={labels} onReorder={handleReorder} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {labels.map(l => (
                                        <Reorder.Item
                                            key={l.id}
                                            value={l}
                                            onClick={() => { setSelectedLabelId(l.id); setIsBuilding(false); }}
                                            style={{
                                                ...itemRowStyle,
                                                background: selectedLabelId === l.id ? 'linear-gradient(135deg, #ffffff 0%, #fff1f1 100%)' : '#fff',
                                                borderColor: selectedLabelId === l.id ? '#e11919' : '#f1f5f9',
                                                cursor: 'grab'
                                            }}
                                            whileDrag={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', cursor: 'grabbing' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                                <div style={{ color: '#cbd5e1', cursor: 'grab' }}><GripVertical size={18} /></div>
                                                {editingLabelId === l.id ? (
                                                    <div style={{ display: 'flex', gap: '5px', flex: 1 }} onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            autoFocus
                                                            style={{ ...fullInputStyle, padding: '5px 10px', fontSize: '0.8rem' }}
                                                            value={editingLabelText}
                                                            onChange={(e) => setEditingLabelText(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateLabel(l.id)}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); handleUpdateLabel(l.id); }}
                                                            style={{ border: 'none', background: '#10b981', color: '#fff', borderRadius: '4px', padding: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontWeight: 700, color: selectedLabelId === l.id ? '#1e293b' : '#64748b', fontSize: '0.85rem' }}>{l.filter_label}</span>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <button onClick={(e) => { e.stopPropagation(); setEditingLabelId(l.id); setEditingLabelText(l.filter_label); }} style={editBtnStyle}><Edit2 size={14} /></button>
                                                <button onClick={(e) => handleDeleteLabel(l.id, e)} style={deleteBtnStyle}><Trash2 size={14} /></button>
                                                <ChevronRight size={16} color={selectedLabelId === l.id ? '#e11919' : '#cbd5e1'} />
                                            </div>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                                {labels.length === 0 && !isBuilding && <div style={emptyHintStyle}>No labels found. Click "New Filter" to start.</div>}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: TABLE 2 - OPTIONS VIEW */}
                        <div style={{ ...columnStyle, background: '#fcfcfc' }}>
                            {!selectedLabelId ? (
                                <div style={unselectedMsgStyle}>
                                    <div style={emptyStateIconStyle}><Settings2 size={30} color="#cbd5e1" /></div>
                                    <p style={{ fontWeight: 600, color: '#94a3b8' }}>Select a label to view or edit individual options.</p>
                                </div>
                            ) : (
                                <motion.div key={selectedLabelId} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div style={columnHeaderStyle}>
                                        <span style={columnTitleStyle}>Table 2: Options for <span style={{ color: '#e11919' }}>{labels.find(l => l.id === selectedLabelId)?.filter_label}</span></span>
                                        <span style={{ ...counterBadgeStyle, background: '#dcfce7', color: '#166534' }}>{values.length} Active</span>
                                    </div>

                                    {/* ➕ Quick-Add Interface */}
                                    <div style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            placeholder="Add New Value..."
                                            value={newValueText}
                                            onChange={(e) => setNewValueText(e.target.value)}
                                            onKeyDown={async (e) => {
                                                if (e.key === 'Enter' && newValueText.trim()) {
                                                    try {
                                                        const res = await productService.addFilterValue({
                                                            category_id: selectedCategory,
                                                            filter_label_id: selectedLabelId,
                                                            filter_value: newValueText
                                                        });
                                                        if (res.data.success) {
                                                            setNewValueText('');
                                                            loadValues();
                                                        }
                                                    } catch (err) {
                                                        alert(err.response?.data?.message || "Signal Mismatch: Failed to add specification.");
                                                    }
                                                }
                                            }}
                                            style={{ ...fullInputStyle, flex: 1, borderColor: '#f1f5f9' }}
                                        />
                                        <button
                                            onClick={async () => {
                                                if (newValueText.trim()) {
                                                    try {
                                                        const res = await productService.addFilterValue({
                                                            category_id: selectedCategory,
                                                            filter_label_id: selectedLabelId,
                                                            filter_value: newValueText
                                                        });
                                                        if (res.data.success) {
                                                            setNewValueText('');
                                                            loadValues();
                                                        }
                                                    } catch (err) {
                                                        alert(err.response?.data?.message || "Signal Mismatch: Failed to add specification.");
                                                    }
                                                }
                                            }}
                                            style={{ ...builderToggleStyle, background: '#1e293b', color: '#fff' }}
                                        >
                                            <Plus size={14} /> Add
                                        </button>
                                    </div>

                                    <div style={listScrollStyle}>
                                        <Reorder.Group axis="y" values={values} onReorder={handleReorderValues} style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {values.map(v => (
                                                <Reorder.Item
                                                    key={v.id}
                                                    value={v}
                                                    style={{
                                                        ...tagBoxStyle,
                                                        background: '#fff',
                                                        cursor: 'grab'
                                                    }}
                                                    whileDrag={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', cursor: 'grabbing' }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                                        <div style={{ color: '#cbd5e1', cursor: 'grab' }}><GripVertical size={16} /></div>
                                                        {editingValueId === v.id ? (
                                                            <input
                                                                autoFocus type="text"
                                                                style={{ ...fullInputStyle, border: 'none', background: 'transparent', padding: 0 }}
                                                                value={editingValueText}
                                                                onChange={(e) => setEditingValueText(e.target.value)}
                                                                onBlur={() => handleUpdateValue(v.id)}
                                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateValue(v.id)}
                                                            />
                                                        ) : (
                                                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>{v.filter_value}</span>
                                                        )}
                                                    </div>

                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => { setEditingValueId(v.id); setEditingValueText(v.filter_value); }} style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer' }}><Edit2 size={13} /></button>
                                                        <button onClick={() => handleDeleteValue(v.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={13} /></button>
                                                    </div>
                                                </Reorder.Item>
                                            ))}
                                        </Reorder.Group>
                                        {values.length === 0 && <div style={emptyHintStyle}>No values found for this label.</div>}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

// Styles
const cardStyle = { background: '#ffffff', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.04)', overflow: 'hidden', border: '1px solid #f1f5f9' };
const headerSectionStyle = { padding: '2.5rem 2rem', background: '#ffffff', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1.2rem' };
const iconBoxStyle = { width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #e11919 0%, #900a0a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(225,25,25,0.3)' };
const titleStyle = { fontSize: '1.4rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.2rem' };
const subtitleStyle = { fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 };
const inputGroupStyle = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '0.72rem', fontWeight: 900, color: '#1e293b', textTransform: 'uppercase' };
const selectStyle = { padding: '16px', borderRadius: '16px', border: '2px solid #f1f5f9', background: '#f8fafc', fontSize: '0.92rem', fontWeight: 700, color: '#1e293b', outline: 'none' };
const columnStyle = { background: '#ffffff', borderRadius: '24px', padding: '1.8rem', border: '1px solid #f1f5f9', minHeight: '440px' };
const columnHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' };
const columnTitleStyle = { fontSize: '0.8rem', fontWeight: 900, color: '#1e293b', textTransform: 'uppercase' };
const counterBadgeStyle = { padding: '4px 12px', background: '#f8fafc', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800, color: '#64748b' };
const listScrollStyle = { maxHeight: '380px', overflowY: 'auto', paddingRight: '8px' };
const itemRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '16px', border: '1.5px solid #f1f5f9', marginBottom: '10px', cursor: 'pointer' };
const deleteBtnStyle = { background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const editBtnStyle = { background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const tagBoxStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '2px solid #f1f5f9', padding: '10px 14px', borderRadius: '14px' };
const unselectedMsgStyle = { height: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#94a3b8' };
const emptyStateIconStyle = { padding: '1.5rem', background: '#f8fafc', borderRadius: '50%', marginBottom: '1rem' };
const emptyHintStyle = { textAlign: 'center', padding: '3rem', color: '#cbd5e1', fontSize: '0.8rem', fontStyle: 'italic' };

const builderToggleStyle = { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, border: 'none', cursor: 'pointer', transition: '0.2s' };
const builderContainerStyle = { background: '#f8fafc', padding: '1.2rem', borderRadius: '18px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', overflow: 'hidden' };
const miniLabelStyle = { fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', display: 'block' };
const fullInputStyle = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.85rem', fontWeight: 600, outline: 'none', background: '#fff', boxSizing: 'border-box' };
const addFieldBtnStyle = { background: 'none', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, padding: '8px', borderRadius: '8px', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' };
const deleteFieldBtnStyle = { background: '#fff1f1', color: '#e11d48', border: '1px solid #fee2e2', borderRadius: '8px', padding: '8px', cursor: 'pointer' };
const saveFullBtnStyle = { width: '100%', padding: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' };

export default FilterSettings;
