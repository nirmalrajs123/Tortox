import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { productService } from '../services/product';
import { categoryService } from '../services/category';

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
    // 📝 Expanded Form States
    const [activeTab, setActiveTab] = useState('General');
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
    const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
    const [newLabelTitle, setNewLabelTitle] = useState('');

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

    const handleGenerateCombinations = () => {
        const colors = selectedVariants.Color ? variantDetails.Color.split(',').map(s => s.trim()).filter(Boolean) : [''];
        const sizes = selectedVariants.Size ? variantDetails.Size.split(',').map(s => s.trim()).filter(Boolean) : [''];
        const styles = selectedVariants.Style ? variantDetails.Style.split(',').map(s => s.trim()).filter(Boolean) : [''];

        if (colors.length === 0) colors.push('');
        if (sizes.length === 0) sizes.push('');
        if (styles.length === 0) styles.push('');

        const newCombs = [];
        colors.forEach(c => {
            sizes.forEach(s => {
                styles.forEach(st => {
                    newCombs.push({ Color: c, Size: s, Style: st, variantFiles: [], previews: [] });
                });
            });
        });

        setCombinations(newCombs);
        setShowCombinations(true);
    };

    const [watts, setWatts] = useState('');
    const [efficiency, setEfficiency] = useState('');
    const [modularity, setModularity] = useState('');

    const [radiatorSize, setRadiatorSize] = useState('');
    const [lighting, setLighting] = useState('');
    const [coolerDisplay, setCoolerDisplay] = useState('');
    const [tdp, setTdp] = useState('');

    const [towerType, setTowerType] = useState('');
    const [fanSize, setFanSize] = useState('');
    const [airLighting, setAirLighting] = useState('');
    const [airDisplay, setAirDisplay] = useState('');
    const [airTdp, setAirTdp] = useState('');
    const [heatPipes, setHeatPipes] = useState('');

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

    useEffect(() => {
        if (category) {
            const fetchSpecs = async () => {
                try {
                    const res = await productService.getSpecLabels(category);
                    if (res.data.success && res.data.data.length > 0) {
                        setCaseSpecsList(res.data.data.map((item) => ({
                            id: item.id,
                            key: item.spec_label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
                            label: item.spec_label,
                            value: ''
                        })));
                    }
                } catch (err) {
                    console.error('Failed to load spec labels:', err);
                }
            };
            fetchSpecs();
        }
    }, [category]);
    // Handlers list updates trigger safely
    const handleSaveSpecLabel = async () => {
        if (!newLabelTitle.trim()) return alert("Please type a label title!");
        if (!category) return alert("Please select a Category from the dropdown first!");
        try {
            const res = await productService.addSpecLabel({ category_id: category, spec_label: newLabelTitle });
            if (res.data.success) {
                setCaseSpecsList([...caseSpecsList, {
                    id: res.data.data.id,
                    key: res.data.data.spec_label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-0_]/g, ''),
                    label: res.data.data.spec_label,
                    value: ''
                }]);
                setNewLabelTitle('');
                setIsLabelModalOpen(false);
                setStatusMessage('Specification added!');
                setStatusType('success');
                setTimeout(() => setStatusMessage(''), 1500);
            }
        } catch (e) {
            console.error("Add Spec Label Error:", e);
            alert("Error: " + (e.response?.data?.message || e.message));
        }
    };

    const handleDeleteSpecLabel = async (itemId) => {
        setCaseSpecsList(caseSpecsList.filter(s => s.id !== itemId));
        try {
            await productService.deleteSpecLabel(itemId);
        } catch (e) {
            console.error("Failed to delete spec label permanently from DB:", e);
        }
    };
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
        formData.append('featuresList', JSON.stringify(features.filter(f => f.trim() !== '')));

        // Stringify nested structures flawless flaws
        const specsObj = {};
        caseSpecsList.forEach((s, idx) => {
            if (s.value && s.value.trim() !== '') {
                specsObj[s.key || s.id] = { value: s.value, order: idx + 1, label: s.label, spec_label_id: s.id };
            }
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
                    <style>{`
                        .glow-focus:focus { border-color: #e11919 !important; box-shadow: 0 0 0 4px rgba(225,25,25,0.06) !important; }
                        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important; }
                        .hover-lift { transition: all 0.2s ease-out !important; }
                        .btn-glowing:hover { filter: contrast(1.1) brightness(1.05); box-shadow: 0 10px 25px rgba(225,25,25,0.25) !important; transform: translateY(-1px); }
                        .btn-glowing:active { transform: translateY(0); }
                    `}</style>
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
                            <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', marginBottom: '1.5rem' }}>
                                {['General', 'Specifications', 'Features', 'Variant', 'Combinations'].map((t) => (
                                    <button key={t} type="button" onClick={() => setActiveTab(t)} style={{ padding: '8px 16px', background: activeTab === t ? 'linear-gradient(135deg, #e11919 0%, #900a0a 100%)' : 'none', color: activeTab === t ? '#fff' : '#6b7280', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, transition: 'all 0.2s', boxShadow: activeTab === t ? '0 4px 12px rgba(225,25,25,0.2)' : 'none' }}>{t}</button>
                                ))}
                            </div>

                            <div style={{ display: activeTab === 'General' ? 'flex' : 'none', flexDirection: 'column', gap: '1.2rem' }}>
                                <div>
                                    <label style={labelStyle}>Category</label>
                                    <select required value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                                        <option value="">-- Select Category --</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><label style={{ ...labelStyle, whiteSpace: 'nowrap', fontSize: '0.75rem' }}>Model No</label><input type="text" placeholder="e.g., TX-DLX21" required value={modelNo} onChange={(e) => setModelNo(e.target.value)} style={{ ...inputStyle, marginTop: 0 }} /></div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><label style={{ ...labelStyle, whiteSpace: 'nowrap', fontSize: '0.75rem' }}>Model Name</label><input type="text" placeholder="e.g., DX-21" required value={modelName} onChange={(e) => setModelName(e.target.value)} style={{ ...inputStyle, marginTop: 0 }} /></div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><label style={{ ...labelStyle, whiteSpace: 'nowrap', fontSize: '0.75rem' }}>Product Name</label><input type="text" placeholder="e.g., DLX21 Mesh" required value={name} onChange={(e) => setName(e.target.value)} style={{ ...inputStyle, marginTop: 0 }} /></div>
                                </div>


                            </div>

                            <div style={{ display: activeTab === 'Specifications' ? 'flex' : 'none', flexDirection: 'column', gap: '1.2rem' }}>
                                {category && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                        <div style={{ display: "none" }}></div>

                                        {(() => {
                                            const selectedCat = categories.find(c => String(c.id) === String(category));
                                            const isPowerSupply = selectedCat && selectedCat.category_name.toUpperCase().includes('POWER SUPPLY');
                                            const isLiquidCooling = selectedCat && (selectedCat.category_name.toUpperCase().includes('LIQUID COOLER') || selectedCat.category_name.toUpperCase().includes('LIQUID COOLING'));
                                            const isAirCooling = selectedCat && selectedCat.category_name.toUpperCase().includes('AIR COOLER');

                                            if (isPowerSupply) {
                                                return (
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                                        <div>
                                                            <label style={labelStyle}>Watts</label>
                                                            <select value={watts} onChange={(e) => setWatts(e.target.value)} style={inputStyle}>
                                                                <option value="">-- Select --</option>
                                                                {['550W', '650W', '750W', '850W', '1050W', '1250W'].map((type, idx) => (<option key={idx} value={type}>{type}</option>))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label style={labelStyle}>Efficiency</label>
                                                            <select value={efficiency} onChange={(e) => setEfficiency(e.target.value)} style={inputStyle}>
                                                                <option value="">-- Select --</option>
                                                                {['Normal', '80 Plus White', '80 Plus Gold', '80 Plus Platinum', '80 Plus Titanium'].map((type, idx) => (<option key={idx} value={type}>{type}</option>))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label style={labelStyle}>Modularity</label>
                                                            <select value={modularity} onChange={(e) => setModularity(e.target.value)} style={inputStyle}>
                                                                <option value="">-- Select --</option>
                                                                {['Full Modular', 'Non Modular'].map((type, idx) => (<option key={idx} value={type}>{type}</option>))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                );
                                            } else if (isLiquidCooling) {
                                                return (
                                                    <>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                                            <div>
                                                                <label style={labelStyle}>Radiator Size</label>
                                                                <select value={radiatorSize} onChange={(e) => setRadiatorSize(e.target.value)} style={inputStyle}>
                                                                    <option value="">-- Select --</option>
                                                                    {['120mm', '140mm', '240mm', '280mm', '360mm', '420mm', '480mm'].map((type, idx) => (<option key={idx} value={type}>{type}</option>))}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label style={labelStyle}>Lighting</label>
                                                                <select value={lighting} onChange={(e) => setLighting(e.target.value)} style={inputStyle}>
                                                                    <option value="">-- Select --</option>
                                                                    {['ARGB', 'Non-RGB'].map((type, idx) => (<option key={idx} value={type}>{type}</option>))}
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                                            <div>
                                                                <label style={labelStyle}>Display</label>
                                                                <select value={coolerDisplay} onChange={(e) => setCoolerDisplay(e.target.value)} style={inputStyle}>
                                                                    <option value="">-- Select --</option>
                                                                    {['No Display', 'Digital Display', 'Customizable Display'].map((type, idx) => (<option key={idx} value={type}>{type}</option>))}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label style={labelStyle}>TDP</label>
                                                                <select value={tdp} onChange={(e) => setTdp(e.target.value)} style={inputStyle}>
                                                                    <option value="">-- Select --</option>
                                                                    {['150-200', '200-250', '250-300', '300-350', '350+'].map((type, idx) => (<option key={idx} value={type}>{type}</option>))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            } else if (isAirCooling) {
                                                return (
                                                    <>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                                            <div>
                                                                <label style={labelStyle}>Tower Type</label>
                                                                <select value={towerType} onChange={(e) => setTowerType(e.target.value)} style={inputStyle}>
                                                                    <option value="">-- Select --</option>
                                                                    {['Single', 'Dual'].map((t, idx) => (<option key={idx} value={t}>{t}</option>))}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label style={labelStyle}>Fan Size</label>
                                                                <select value={fanSize} onChange={(e) => setFanSize(e.target.value)} style={inputStyle}>
                                                                    <option value="">-- Select --</option>
                                                                    {['90mm', '120mm'].map((t, idx) => (<option key={idx} value={t}>{t}</option>))}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label style={labelStyle}>Lighting</label>
                                                                <select value={airLighting} onChange={(e) => setAirLighting(e.target.value)} style={inputStyle}>
                                                                    <option value="">-- Select --</option>
                                                                    {['RGB', 'ARGB', 'Non RGB'].map((t, idx) => (<option key={idx} value={t}>{t}</option>))}
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                                                            <div>
                                                                <label style={labelStyle}>Display</label>
                                                                <select value={airDisplay} onChange={(e) => setAirDisplay(e.target.value)} style={inputStyle}>
                                                                    <option value="">-- Select --</option>
                                                                    {['No Display', 'Digital Display'].map((t, idx) => (<option key={idx} value={t}>{t}</option>))}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label style={labelStyle}>TDP</label>
                                                                <select value={airTdp} onChange={(e) => setAirTdp(e.target.value)} style={inputStyle}>
                                                                    <option value="">-- Select --</option>
                                                                    {['50-100', '100-150', '150-200', '200-250', '250+'].map((t, idx) => (<option key={idx} value={t}>{t}</option>))}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label style={labelStyle}>Heat Pipes</label>
                                                                <select value={heatPipes} onChange={(e) => setHeatPipes(e.target.value)} style={inputStyle}>
                                                                    <option value="">-- Select --</option>
                                                                    {['2', '4', '6'].map((t, idx) => (<option key={idx} value={t}>{t}</option>))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            } else {
                                                return (
                                                    <>
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
                                                    </>
                                                );
                                            }
                                        })()}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: activeTab === 'Features' ? 'flex' : 'none', flexDirection: 'column', gap: '1.2rem' }}>
                                <div style={{ padding: '0 1.2rem' }}>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={labelStyle}>Product Description</label>
                                        <textarea placeholder="Detailed description..." required value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, height: '90px' }} />
                                    </div>

                                    <label style={labelStyle}>Product Features</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {features.map((feat, index) => (
                                            <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <input type="text" placeholder="Enter feature point..." required value={feat} onChange={(e) => handleFeatureChange(index, e.target.value)} style={inputStyle} />
                                                {features.length > 1 && (
                                                    <button type="button" onClick={() => handleRemoveFeature(index)} style={{ padding: '8px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Trash2 size={16} /></button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={handleAddFeature} style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: 'none', border: '1px dashed #e11919', color: '#e11919', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}><Plus size={14} /> Add Feature</button>
                                </div>
                            </div>

                            <div style={{ display: activeTab === 'Variant' ? 'flex' : 'none', flexDirection: 'column', gap: '1.2rem' }}>
                                <div style={{ padding: '0 1.2rem' }}>

                                    {/* Variant Checkboxes */}
                                    <div style={{ padding: '0.5rem 0', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                                        <label style={{ ...labelStyle, marginBottom: '12px' }}>Enable Variations</label>
                                        <div style={{ display: 'flex', gap: '2rem' }}>
                                            {['Color', 'Size', 'Style'].map(type => (
                                                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                                                    <input type="checkbox" checked={selectedVariants[type]} onChange={() => handleVariantCheckbox(type)} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#e11919' }} />
                                                    {type}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* The Generated Combinations Table or List */}
                                    {Object.keys(selectedVariants).some(k => selectedVariants[k]) && (
                                        <div style={{ marginBottom: '2rem' }}>
                                            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e11919', textTransform: 'uppercase', marginBottom: '12px' }}>Generated Combinations</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {combinations.map((comb, index) => (
                                                    <div key={index} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', background: '#ffffff', position: 'relative' }}>
                                                        <button type="button" onClick={() => setCombinations(combinations.filter((_, i) => i !== index))} style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '4px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={13} /></button>

                                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', paddingRight: '2rem' }}>
                                                            {selectedVariants.Color && (
                                                                <div style={{ flex: 1 }}>
                                                                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Color</label>
                                                                    <input type="text" value={comb.Color} onChange={(e) => { const newComb = [...combinations]; newComb[index].Color = e.target.value; setCombinations(newComb); }} style={{ ...inputStyle, padding: '6px 10px', marginTop: '4px' }} />
                                                                </div>
                                                            )}
                                                            {selectedVariants.Size && (
                                                                <div style={{ flex: 1 }}>
                                                                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Size</label>
                                                                    <input type="text" value={comb.Size} onChange={(e) => { const newComb = [...combinations]; newComb[index].Size = e.target.value; setCombinations(newComb); }} style={{ ...inputStyle, padding: '6px 10px', marginTop: '4px' }} />
                                                                </div>
                                                            )}
                                                            {selectedVariants.Style && (
                                                                <div style={{ flex: 1 }}>
                                                                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Style</label>
                                                                    <input type="text" value={comb.Style} onChange={(e) => { const newComb = [...combinations]; newComb[index].Style = e.target.value; setCombinations(newComb); }} style={{ ...inputStyle, padding: '6px 10px', marginTop: '4px' }} />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>Variant Images</label>
                                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                                {comb.previews && comb.previews.map((preview, i) => (
                                                                    <div key={i} style={{ position: 'relative' }}>
                                                                        <img src={preview} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                                                        <button type="button" onClick={() => {
                                                                            const newComb = [...combinations];
                                                                            newComb[index].previews = newComb[index].previews.filter((_, idx) => idx !== i);
                                                                            newComb[index].variantFiles = newComb[index].variantFiles.filter((_, idx) => idx !== i);
                                                                            setCombinations(newComb);
                                                                        }} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}><X size={10} /></button>
                                                                    </div>
                                                                ))}
                                                                <div style={{ width: '50px', height: '50px', border: '1px dashed #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', cursor: 'pointer', position: 'relative' }}>
                                                                    <input type="file" multiple accept="image/*" onChange={(e) => {
                                                                        if (e.target.files && e.target.files.length > 0) {
                                                                            const newComb = [...combinations];
                                                                            const filesArray = Array.from(e.target.files);
                                                                            const previewsArray = filesArray.map(f => URL.createObjectURL(f));
                                                                            newComb[index].variantFiles = [...(newComb[index].variantFiles || []), ...filesArray];
                                                                            newComb[index].previews = [...(newComb[index].previews || []), ...previewsArray];
                                                                            setCombinations(newComb);
                                                                        }
                                                                    }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                                                                    <Plus size={16} color="#94a3b8" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={handleAddCombination} style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 16px', background: '#f1f5f9', border: '1px dashed #cbd5e1', color: '#475569', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', justifyContent: 'center' }}><Plus size={14} /> Add Manual Combination</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: activeTab === 'Combinations' ? 'flex' : 'none', flexDirection: 'column', gap: '1.2rem' }}>
                                <div style={{ padding: '0 1.2rem' }}>
                                    {caseSpecsList.length > 0 && (
                                        <div style={{ border: '1px solid #e2e8f0', padding: '1.2rem', borderRadius: '12px', background: '#f8fafc' }}>
                                            <p style={{ fontSize: '0.78rem', fontWeight: 800, color: '#e11919', textTransform: 'uppercase', marginBottom: '12px' }}>Detailed Specification</p>
                                            <Reorder.Group axis="y" values={caseSpecsList} onReorder={setCaseSpecsList} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', listStyle: 'none', padding: 0 }}>
                                                {caseSpecsList.map((item) => (
                                                    <Reorder.Item key={item.id} value={item} style={{ background: '#ffffff', padding: '10px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'grab' }} whileDrag={{ scale: 1.02, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                            <label style={{ ...labelStyle, marginBottom: 0 }}>{item.label}</label>
                                                            <button type="button" onClick={() => handleDeleteSpecLabel(item.id)} style={{ padding: '4px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Trash2 size={13} /></button>
                                                        </div>
                                                        <input type="text" value={item.value} onChange={(e) => {
                                                            const updated = [...caseSpecsList];
                                                            const target = updated.find(s => s.id === item.id);
                                                            if (target) target.value = e.target.value;
                                                            setCaseSpecsList(updated);
                                                        }} style={inputStyle} />
                                                    </Reorder.Item>
                                                ))}
                                            </Reorder.Group>
                                            <button type="button" onClick={() => setIsLabelModalOpen(true)} style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: 'none', border: '1px dashed #e11919', color: '#e11919', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}><Plus size={14} /> Add Label</button>
                                        </div>
                                    )}
                                </div>
                            </div>



                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                                <button type="button" onClick={() => {
                                    const tabs = ['General', 'Specifications', 'Features', 'Variant', 'Combinations'];
                                    const currIndex = tabs.indexOf(activeTab);
                                    if (currIndex > 0) setActiveTab(tabs[currIndex - 1]);
                                }} style={{ padding: '14px 28px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 700, cursor: activeTab === 'General' ? 'not-allowed' : 'pointer', textTransform: 'uppercase', letterSpacing: '1px', opacity: activeTab === 'General' ? 0 : 1, pointerEvents: activeTab === 'General' ? 'none' : 'auto', transition: 'all 0.2s' }}>Back</button>

                                {activeTab !== 'Combinations' ? (
                                    <button type="button" onClick={() => {
                                        const tabs = ['General', 'Specifications', 'Features', 'Variant', 'Combinations'];
                                        setActiveTab(tabs[tabs.indexOf(activeTab) + 1]);
                                    }} style={{ padding: '14px 32px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.2s' }}>Next Step</button>
                                ) : (
                                    <button type="submit" className="btn-glowing" style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #e11919 0%, #900a0a 100%)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(225, 25, 25, 0.2)', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.2s' }}>Submit Product</button>
                                )}
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}

            {isLabelModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(3px)' }}>
                    <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '12px', width: '320px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>Add Specification Label</p>
                        <input type="text" placeholder="e.g., Cooling Type" value={newLabelTitle} onChange={(e) => setNewLabelTitle(e.target.value)} style={{ ...inputStyle, background: '#ffffff', border: '1px solid #d1d5db', marginBottom: '12px' }} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button type="button" onClick={() => setIsLabelModalOpen(false)} style={{ padding: '6px 12px', border: '1px solid #d1d5db', background: '#f3f4f6', color: '#4b5563', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>Cancel</button>
                            <button type="button" onClick={handleSaveSpecLabel} style={{ padding: '6px 12px', border: 'none', background: '#e11919', color: '#ffffff', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

const backdropStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.4)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' };
const modalStyle = { background: '#ffffff', padding: '2.5rem', borderRadius: '24px', width: '95%', maxWidth: '1050px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.15)', position: 'relative', border: '1px solid rgba(255,255,255,0.7)' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' };
const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' };
const inputStyle = { width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.88rem', outline: 'none', margin: 0, background: '#ffffff', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'all 0.2s', color: '#1e293b' };
const submitBtnStyle = { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #e11919 0%, #900a0a 100%)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', marginTop: '1.5rem', boxShadow: '0 8px 24px rgba(225, 25, 25, 0.2)', textTransform: 'uppercase', letterSpacing: '0.5px', transition: 'transform 0.2s ease, filter 0.2s ease' };

export default AddProductModal;
