import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { productService } from '../services/product';
import { categoryService } from '../services/category';

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
    // 📝 Expanded Form States
    const [category, setCategory] = useState('');
    const [name, setName] = useState('');
    const [modelNo, setModelNo] = useState('');
    const [modelName, setModelName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(''); // 📸 Holds main thumbnail URL string
    const [variantImages, setVariantImages] = useState([]); // 📸 Holds variant thumbnails lists trigger
    const [mainImageFile, setMainImageFile] = useState(null); // 📸 Stores main Binary file triggers framing
    const [variantFiles, setVariantFiles] = useState([]); // 📸 Stores Multiple variant Files trigger framing overlay flaw properly

    // Checkbox multiple selection
    const [selectedVariants, setSelectedVariants] = useState({ Color: false, Size: false, Style: false });
    const [variantDetails, setVariantDetails] = useState({ Color: '', Size: '', Style: '' });

    // Bullet points preferred fields
    const [features, setFeatures] = useState(['']);

    // ➕ Custom Specifications Rows Row States
    const [customSpecs, setCustomSpecs] = useState([]);

    // 📢 Status & Response states flawlessly flaws flawlessly
    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState(''); // 'success' | 'error'

    // 🧬 Combinations Table Generator State flawlessly flawlessly 
    const [combinations, setCombinations] = useState([]);
    const [showCombinations, setShowCombinations] = useState(false); // ➕ FIXED: Added missing state declaration trigger framing flaws

    // 🧼 Manual State Additions flawed flawless flaw flawlessly setup 
    const handleAddCombination = () => {
        setCombinations([...combinations, { Color: '', Size: '', Style: '', variantFiles: [], previews: [] }]);
    };

    // 🖥️ Cases Specifications States
    const [mbCompat, setMbCompat] = useState('');
    const [coolerCompat, setCoolerCompat] = useState('');
    const [panelType, setPanelType] = useState('');
    const [installedFans, setInstalledFans] = useState('');
    const [installedPsu, setInstalledPsu] = useState('');
    const [caseDisplay, setCaseDisplay] = useState(''); // 🖥️ Display Dropdown State trigger framing overlay flaw properly

    // 🔬 Detailed Case Specs state bundle nodes trigger framing
    const [caseSpecsList, setCaseSpecsList] = useState([
        { id: 1, key: 'dimensions', label: 'Case Dimensions', value: '' },
        { id: 2, key: 'material', label: 'Case Material', value: '' },
        { id: 3, key: 'coolerTop', label: 'Max Liquid Cooler (Top)', value: '' },
        { id: 4, key: 'coolerBottom', label: 'Max Liquid Cooler (Bottom)', value: '' },
        { id: 5, key: 'coolerSide', label: 'Max Liquid Cooler (Side)', value: '' },
        { id: 6, key: 'coolerRear', label: 'Max Liquid Cooler (Rear)', value: '' },
        { id: 7, key: 'maxFans', label: 'Max Fan Count', value: '' },
        { id: 8, key: 'maxGpu', label: 'Max GPU Length', value: '' },
        { id: 9, key: 'maxCpu', label: 'Max CPU Height/Length', value: '' },
        { id: 10, key: 'driveBays', label: 'Drive Bays', value: '' },
        { id: 11, key: 'ioPorts', label: 'I/O Ports', value: '' },
        { id: 12, key: 'pcieSlots', label: 'PCIE Slots', value: '' }
    ]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await categoryService.getAll();
                setCategories(res.data?.data || []); // 🛡️ Added fallback safety
            } catch (err) {
                console.error('Failed to load categories:', err);
            }
        };
        loadCategories();
    }, []);
    // Handlers list updates trigger safely
    const handleVariantCheckbox = (varType) => {
        setSelectedVariants(prev => ({ ...prev, [varType]: !prev[varType] }));
    };

    const handleVariantDetails = (varType, val) => {
        setVariantDetails(prev => ({ ...prev, [varType]: val }));
    };

    const handleAddFeature = () => setFeatures([...features, '']);
    const handleRemoveFeature = (index) => setFeatures(features.filter((_, i) => i !== index));
    const handleFeatureChange = (index, val) => {
        const newFeat = [...features];
        newFeat[index] = val;
        setFeatures(newFeat);
    };

    const handleAddCustomSpec = () => setCustomSpecs([...customSpecs, { id: Date.now() + Math.random(), key: '', value: '' }]);
    const handleRemoveCustomSpec = (index) => setCustomSpecs(customSpecs.filter((_, i) => i !== index));
    const handleCustomSpecChange = (index, field, val) => {
        const list = [...customSpecs];
        list[index][field] = val;
        setCustomSpecs(list);
    };

    // 📸 Handlers Multiple Variant Images state
    const handleRemoveVariantImage = (index) => {
        setVariantImages(variantImages.filter((_, i) => i !== index));
        setVariantFiles(variantFiles.filter((_, i) => i !== index)); // Remove corresponding Binary File object node flaws flawless
    };

    // 📸 Save multiple Binary files locally flawless flawlessly triggers
    const handleVariantImageChange = (fileList) => {
        if (!fileList || fileList.length === 0) return;

        const filesArray = Array.from(fileList);
        setVariantFiles([...variantFiles, ...filesArray]); // 📸 Store actual Binary file triggers

        const previews = filesArray.map(file => URL.createObjectURL(file)); // Make thumbnail thumbs static previews trigger framing
        setVariantImages([...variantImages, ...previews]); // Append triggers flawless flawless flawlessly
    };

    // 📸 Immediate Local preview for Main Image
    const handleMainImageChange = (file) => {
        if (!file) return;
        setMainImageFile(file); // 📸 Store File trigger flawlessly flaws flawlessly

        const previewUrl = URL.createObjectURL(file);
        setImage(previewUrl); // Show preview locally flawless flawlessly setup
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('category_id', category);
        formData.append('modal', modelNo);
        formData.append('modal_name', modelName);
        formData.append('product_name', name);
        formData.append('product_description', description);
        formData.append('mb_compat', mbCompat);
        formData.append('cooler_compat', coolerCompat);
        formData.append('panel_type', panelType);
        formData.append('installed_fans', installedFans);
        formData.append('installed_psu', installedPsu);
        formData.append('product_features', features.filter(f => f.trim() !== '').join('\n'));

        // Stringify nested structures flawless flaws
        const specsObj = {};
        caseSpecsList.forEach((s, idx) => {
            // Include order index for submission flawlessly flaws
            specsObj[s.key || s.id] = { value: s.value, order: idx + 1, label: s.label };
        });
        if (caseDisplay) specsObj.caseDisplay = caseDisplay;
        formData.append('specs', JSON.stringify(specsObj));

        const parsedCustomSpecs = customSpecs
            .filter(spec => spec.key && spec.key.trim() !== '')
            .map((spec, idx) => ({
                specification_name: spec.key.trim(),
                specification_value: spec.value ? spec.value.trim() : '',
                order_id: idx + 1
            }));
        console.log(parsedCustomSpecs);
        formData.append('specifications', JSON.stringify(parsedCustomSpecs));

        if (mainImageFile) formData.append('image', mainImageFile);

        // 📸 Append Combinations structured matrix flawless flaws
        formData.append('combinations', JSON.stringify(combinations.map(c => ({
            Color: c.Color, Size: c.Size, Style: c.Style
        }))));

        combinations.forEach((comb, idx) => {
            if (comb.variantFiles) {
                comb.variantFiles.forEach(file => {
                    formData.append(`comb_images_${idx}`, file); // Specific indexed files trigger framing index
                });
            }
        });

        try {
            const res = await productService.create(formData);
            setStatusMessage('Product added successfully!');
            setStatusType('success');
            setTimeout(() => { onSuccess(); onClose(); setStatusMessage(''); }, 1500); // Wait status view

            // Reset states safely trigger framing
            setCategory(''); setName(''); setModelNo(''); setModelName(''); setPrice(''); setDescription(''); setImage('');
            setVariantImages([]); setMainImageFile(null); setVariantFiles([]);
            setSelectedVariants({ Color: false, Size: false, Style: false }); setVariantDetails({ Color: '', Size: '', Style: '' }); setFeatures(['']);
            setCustomSpecs([]); setCombinations([]); setShowCombinations(false);
            setMbCompat(''); setCoolerCompat(''); setPanelType(''); setInstalledFans(''); setInstalledPsu(''); setCaseDisplay('');
            setCaseSpecsList(caseSpecsList.map(s => ({ ...s, value: '' })));
        } catch (err) {
            console.error("Add Product Frontend Error:", err.response?.data || err.message || err);
            setStatusMessage(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to add product');
            setStatusType('error');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={backdropStyle}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        style={modalStyle}
                    >
                        <div style={headerStyle}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827' }}>Add New Product</h3>
                            <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        {statusMessage && (
                            <div style={{ padding: '10px 14px', borderRadius: '8px', background: statusType === 'success' ? '#dcfce7' : '#fee2e2', color: statusType === 'success' ? '#166534' : '#ef4444', fontSize: '0.85rem', fontWeight: 600, border: statusType === 'success' ? '1px solid #bcf0da' : '1px solid #fecaca', marginBottom: '8px', margin: '0 1.5rem' }}>
                                {statusMessage}
                            </div>
                        )}

                        <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div>
                                <label style={labelStyle}>Category</label>
                                <select required value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                                    <option value="">-- Select Category --</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                                    ))}
                                </select>
                            </div>

                            <AnimatePresence>
                                {category && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><label style={{ ...labelStyle, whiteSpace: 'nowrap', fontSize: '0.75rem' }}>Model No</label><input type="text" placeholder="e.g., TX-DLX21" required value={modelNo} onChange={(e) => setModelNo(e.target.value)} style={{ ...inputStyle, marginTop: 0 }} /></div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><label style={{ ...labelStyle, whiteSpace: 'nowrap', fontSize: '0.75rem' }}>Model Name</label><input type="text" placeholder="e.g., DX-21" required value={modelName} onChange={(e) => setModelName(e.target.value)} style={{ ...inputStyle, marginTop: 0 }} /></div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><label style={{ ...labelStyle, whiteSpace: 'nowrap', fontSize: '0.75rem' }}>Product Name</label><input type="text" placeholder="e.g., DLX21 Mesh" required value={name} onChange={(e) => setName(e.target.value)} style={{ ...inputStyle, marginTop: 0 }} /></div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                            <div>
                                                <label style={labelStyle}>Motherboard Compatibility</label>
                                                <select value={mbCompat} onChange={(e) => setMbCompat(e.target.value)} style={inputStyle}>
                                                    <option value="">-- Select --</option>
                                                    {['E-ATX', 'ATX', 'M-ATX', 'ITX'].map((type, idx) => (<option key={idx} value={type}>{type}</option>))}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Liquid Cooler Compatibility</label>
                                                <select value={coolerCompat} onChange={(e) => setCoolerCompat(e.target.value)} style={inputStyle}>
                                                    <option value="">-- Select --</option>
                                                    {['120MM', '240MM', '280MM', '360MM', '480MM'].map((type, idx) => (<option key={idx} value={type}>{type}</option>))}
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                            <div>
                                                <label style={labelStyle}>Panel Type</label>
                                                <select value={panelType} onChange={(e) => setPanelType(e.target.value)} style={inputStyle}>
                                                    <option value="">-- Select --</option>
                                                    {['Tempered Glass', 'Mesh Panel'].map((type, idx) => (<option key={idx} value={type}>{type}</option>))}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Pre-Installed Fans</label>
                                                <select value={installedFans} onChange={(e) => setInstalledFans(e.target.value)} style={inputStyle}>
                                                    <option value="">-- Select --</option>
                                                    {['No Fans', '3 ARGB Fans', '4 ARGB Fans', '5 ARGB Fans', '6 ARGB Fans', '7 ARGB Fans'].map((type, idx) => (<option key={idx} value={type}>{type}</option>))}
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                            <div>
                                                <label style={labelStyle}>Pre-Installed PSU</label>
                                                <select value={installedPsu} onChange={(e) => setInstalledPsu(e.target.value)} style={inputStyle}>
                                                    <option value="">-- Select --</option>
                                                    {['No PSU', '650 Watts', '700 Watts', '850 Watts', '1050 Watts'].map((type, idx) => (<option key={idx} value={type}>{type}</option>))}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Display Type</label>
                                                <select value={caseDisplay} onChange={(e) => setCaseDisplay(e.target.value)} style={inputStyle}>
                                                    <option value="">-- Select --</option>
                                                    {['No Display', 'Customizable Display', 'Digital Display'].map((type, idx) => (<option key={idx} value={type}>{type}</option>))}
                                                </select>
                                            </div>
                                        </div>



                                        <div>
                                            {/* 🧬 Combinations Multiple Matrix Builder manual additions flawlessly flaws */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <button type="button" onClick={handleAddCombination} style={{ ...submitBtnStyle, background: '#6366f1', margin: 0, padding: '10px 16px', fontSize: '0.85rem' }}>Add Combinations</button>

                                                <div style={{ display: 'flex', gap: '1rem', marginLeft: '8px' }}>
                                                    {['Color', 'Size', 'Style'].map(varType => (
                                                        <label key={varType} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer' }}>
                                                            <input type="checkbox" checked={selectedVariants[varType]} onChange={() => handleVariantCheckbox(varType)} style={{ accentColor: '#e11919' }} />
                                                            {varType}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {combinations.length > 0 && combinations.map((comb, idx) => (
                                                <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', marginTop: '12px', background: '#f8fafc', maxHeight: '300px', overflowY: 'auto' }}>
                                                    <p style={{ fontSize: '0.78rem', fontWeight: 800, color: '#e11919', textTransform: 'uppercase', marginBottom: '10px' }}>Variant Combination {idx + 1}</p>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                                        <thead>
                                                            <tr style={{ background: '#e2e8f0', color: '#475569', textAlign: 'left' }}>
                                                                {selectedVariants.Color && <th style={{ padding: '8px' }}>Color</th>}
                                                                {selectedVariants.Size && <th style={{ padding: '8px' }}>Size</th>}
                                                                {selectedVariants.Style && <th style={{ padding: '8px' }}>Style</th>}
                                                                <th style={{ padding: '8px' }}>Images</th>
                                                                <th style={{ padding: '8px' }}></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                                {selectedVariants.Color && (
                                                                    <td style={{ padding: '8px' }}>
                                                                        <input type="text" placeholder="Color" value={comb.Color} onChange={(e) => {
                                                                            const updated = [...combinations]; updated[idx].Color = e.target.value; setCombinations(updated);
                                                                        }} style={{ ...inputStyle, padding: '6px' }} />
                                                                    </td>
                                                                )}
                                                                {selectedVariants.Size && (
                                                                    <td style={{ padding: '8px' }}>
                                                                        <input type="text" placeholder="Size" value={comb.Size} onChange={(e) => {
                                                                            const updated = [...combinations]; updated[idx].Size = e.target.value; setCombinations(updated);
                                                                        }} style={{ ...inputStyle, padding: '6px' }} />
                                                                    </td>
                                                                )}
                                                                {selectedVariants.Style && (
                                                                    <td style={{ padding: '8px' }}>
                                                                        <input type="text" placeholder="Style" value={comb.Style} onChange={(e) => {
                                                                            const updated = [...combinations]; updated[idx].Style = e.target.value; setCombinations(updated);
                                                                        }} style={{ ...inputStyle, padding: '6px' }} />
                                                                    </td>
                                                                )}


                                                                <td style={{ padding: '8px' }}>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                        <input type="file" multiple accept="image/*" onChange={(e) => {
                                                                            if (!e.target.files) return;
                                                                            const files = Array.from(e.target.files);
                                                                            const previews = files.map(file => URL.createObjectURL(file));
                                                                            const updated = [...combinations];
                                                                            updated[idx].variantFiles = [...updated[idx].variantFiles, ...files];
                                                                            updated[idx].previews = [...updated[idx].previews, ...previews];
                                                                            setCombinations(updated);
                                                                        }} style={{ display: 'none' }} id={`file_comb_${idx}`} />
                                                                        <label htmlFor={`file_comb_${idx}`} style={{ alignSelf: 'flex-start', padding: '4px 8px', border: '1px dashed #e11919', color: '#e11919', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>+ Images</label>

                                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginTop: '4px' }}>
                                                                            {comb.previews && comb.previews.map((img, imgIdx) => (
                                                                                <div key={imgIdx} style={{ position: 'relative' }}>
                                                                                    <img src={img} style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                                                                                    <button type="button" onClick={() => {
                                                                                        const updated = [...combinations];
                                                                                        updated[idx].previews = updated[idx].previews.filter((_, i) => i !== imgIdx);
                                                                                        updated[idx].variantFiles = updated[idx].variantFiles.filter((_, i) => i !== imgIdx);
                                                                                        setCombinations(updated);
                                                                                    }} style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '8px' }}>x</button>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '8px' }}>
                                                                    <button type="button" onClick={() => { setCombinations(combinations.filter((_, i) => i !== idx)); }} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}><Trash2 size={12} /></button>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ))}
                                        </div>

                                        <div>
                                            <label style={labelStyle}>Product Features</label>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {features.map((feat, index) => (
                                                    <div key={index} style={{ display: 'flex', gap: '8px' }}>
                                                        <input type="text" placeholder="Enter feature point..." required value={feat} onChange={(e) => handleFeatureChange(index, e.target.value)} style={inputStyle} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label style={labelStyle}>Product Description</label>
                                            <textarea placeholder="Detailed description..." required value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, height: '90px' }} />
                                        </div>

                                        {category == 1 && (
                                            <div style={{ border: '1px solid #e2e8f0', padding: '1.2rem', borderRadius: '12px', background: '#f8fafc' }}>
                                                <p style={{ fontSize: '0.78rem', fontWeight: 800, color: '#e11919', textTransform: 'uppercase', marginBottom: '12px' }}>Case Specifications Detail</p>
                                                <Reorder.Group axis="y" values={caseSpecsList} onReorder={setCaseSpecsList} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', listStyle: 'none', padding: 0 }}>
                                                    {caseSpecsList.map((item) => (
                                                        <Reorder.Item key={item.id} value={item} style={{ background: '#ffffff', padding: '10px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'grab' }} whileDrag={{ scale: 1.02, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                                                            <label style={labelStyle}>{item.label}</label>
                                                            <input type="text" value={item.value} onChange={(e) => {
                                                                const updated = [...caseSpecsList];
                                                                const target = updated.find(s => s.id === item.id);
                                                                if (target) target.value = e.target.value;
                                                                setCaseSpecsList(updated);
                                                            }} style={inputStyle} />
                                                        </Reorder.Item>
                                                    ))}
                                                </Reorder.Group>
                                            </div>
                                        )}

                                        <div>
                                            <label style={labelStyle}>Custom Specification</label>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <Reorder.Group
                                                    axis="y"
                                                    values={customSpecs}
                                                    onReorder={setCustomSpecs}
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '8px',
                                                        listStyle: 'none',
                                                        padding: 0
                                                    }}
                                                >
                                                    {customSpecs.map((spec, index) => {
                                                        const filledCount = caseSpecsList.filter(s => s.value && s.value.trim() !== '').length;
                                                        const displayIndex = index + filledCount;

                                                        return (
                                                            <Reorder.Item
                                                                key={spec.id || displayIndex}
                                                                value={spec}
                                                                style={{
                                                                    display: 'flex',
                                                                    gap: '8px',
                                                                    cursor: 'grab',
                                                                    background: '#ffffff',
                                                                    padding: '8px',
                                                                    borderRadius: '10px',
                                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                                                                }}
                                                                whileDrag={{ scale: 1.01 }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    placeholder={`Key ${displayIndex + 1} (e.g., Weight)`}
                                                                    value={spec.key}
                                                                    onChange={(e) =>
                                                                        handleCustomSpecChange(index, 'key', e.target.value)
                                                                    }
                                                                    style={{ ...inputStyle, flexGrow: 1 }}
                                                                />

                                                                <input
                                                                    type="text"
                                                                    placeholder="Value"
                                                                    value={spec.value}
                                                                    onChange={(e) =>
                                                                        handleCustomSpecChange(index, 'value', e.target.value)
                                                                    }
                                                                    style={{ ...inputStyle, flexGrow: 1 }}
                                                                />

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveCustomSpec(index)}
                                                                    style={{
                                                                        padding: '0 12px',
                                                                        background: '#fee2e2',
                                                                        color: '#ef4444',
                                                                        border: 'none',
                                                                        borderRadius: '8px',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </Reorder.Item>
                                                        );
                                                    })}
                                                </Reorder.Group>

                                                <button
                                                    type="button"
                                                    onClick={handleAddCustomSpec}
                                                    style={{
                                                        alignSelf: 'flex-start',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '6px 14px',
                                                        background: 'none',
                                                        border: '1px dashed #10b981',
                                                        color: '#10b981',
                                                        borderRadius: '8px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 600,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Plus size={14} /> Add
                                                </button>
                                            </div>
                                        </div>

                                        <button type="submit" style={submitBtnStyle}>Submit Product</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const backdropStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' };
const modalStyle = { background: '#ffffff', padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '750px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.12)', position: 'relative' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' };
const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' };
const inputStyle = { width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.88rem', outline: 'none', margin: 0, background: '#f8fafc', boxSizing: 'border-box', fontFamily: 'inherit' };
const submitBtnStyle = { padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '1rem', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)' };

export default AddProductModal;
