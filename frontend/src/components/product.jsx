import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import { productService } from '../services/product';
import { categoryService } from '../services/category';

const AddProductModal = ({ isOpen, onClose, onSuccess, productToEdit }) => {
    // 📝 Expanded Form States
    const [activeTab, setActiveTab] = useState('General');
    const [category, setCategory] = useState('');
    const [name, setName] = useState('');
    const [modelNo, setModelNo] = useState('');
    const [modelName, setModelName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(''); // Thumbnail preview
    const [mainImageFile, setMainImageFile] = useState(null);

    // Checkbox multiple selection
    const [selectedVariants, setSelectedVariants] = useState({ Color: false, Size: false, Style: false });
    const [variantDetails, setVariantDetails] = useState({ Color: '', Size: '', Style: '' });

    // Bullet points preferred fields
    const [features, setFeatures] = useState(['']);
    const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
    const [newLabelTitle, setNewLabelTitle] = useState('');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [newFilterTitle, setNewFilterTitle] = useState('');
    const [newFilterOptions, setNewFilterOptions] = useState('');

    // ➕ Custom Specifications Rows Row States
    const [customSpecs, setCustomSpecs] = useState([]);

    // 📢 Status & Response states flawlessly flaws flawlessly
    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState(''); // 'success' | 'error'

    // 🧬 Combinations Table Generator State flawlessly flawlessly 
    const [combinations, setCombinations] = useState([]);
    const [showCombinations, setShowCombinations] = useState(false);

    // 📸 Product Images State
    const [productImages, setProductImages] = useState([]); // { file: File|null, preview: string }[]
    const [hoverImage, setHoverImage] = useState('');
    const [hoverImageFile, setHoverImageFile] = useState(null);

    // 🏘️ Variant Detail Modal State
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [editingVariantIdx, setEditingVariantIdx] = useState(null);

    // 🧼 Manual State Additions flawed flawless flaw flawlessly setup 
    const handleAddCombination = () => {
        setCombinations(prev => [...prev, {
            Color: '', Size: '', Style: '',
            variantFiles: [], previews: [],
            features: [{ id: Date.now() + Math.random().toString(36).substring(2, 9), text: '' }],
            filters: (filtersList || []).map(f => ({ ...f })),
            specs: (caseSpecsList || []).map(s => ({ ...s })),
            description: '',
            modelName: '',
            productName: ''
        }]);
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
                    newCombs.push({
                        Color: c, Size: s, Style: st,
                        variantFiles: [], previews: [],
                        features: [{ id: Date.now() + Math.random().toString(36).substring(2, 9), text: '' }],
                        filters: (filtersList || []).map(f => ({ ...f })),
                        specs: (caseSpecsList || []).map(s => ({ ...s })),
                        description: '',
                        modelName: '',
                        productName: ''
                    });
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
    const [filtersList, setFiltersList] = useState([]);

    // 🔄 Sync new spec fields to all variants flawlessly flaws flawlessly
    // 🔄 Sync new spec fields to all variants flawlessly flaws flawlessly
    useEffect(() => {
        if (combinations.length > 0) {
            setCombinations(prev => prev.map(comb => {
                const currentSpecs = comb.specs || [];

                // 1. Fill missing ones
                let updatedSpecs = [...currentSpecs];
                let changed = false;

                caseSpecsList.forEach(s => {
                    const exists = currentSpecs.find(cs => cs.id === s.id);
                    if (!exists) {
                        updatedSpecs.push({ ...s, value: '' });
                        changed = true;
                    }
                });

                // 2. Remove orphaned ones (ones that are no longer in caseSpecsList)
                const filteredSpecs = updatedSpecs.filter(us =>
                    caseSpecsList.some(s => s.id === us.id)
                );

                if (filteredSpecs.length !== updatedSpecs.length) changed = true;

                return changed ? { ...comb, specs: filteredSpecs } : comb;
            }));
        }
    }, [caseSpecsList, combinations.length]);

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
                        const specsArray = productToEdit && Array.isArray(productToEdit.specifications) ? productToEdit.specifications : [];

                        const mappedSpecs = res.data.data.map((item) => {
                            const genKey = item.spec_label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                            const match = specsArray.find(s => s.spec_label_id === item.id);

                            return {
                                id: item.id,
                                key: genKey,
                                label: item.spec_label,
                                options: item.spec_options ? item.spec_options.split(',').map(o => o.trim()).filter(Boolean) : null,
                                value: match ? match.specification_value : '',
                                order: match && match.order_id != null ? match.order_id : 9999
                            };
                        });

                        // 🛡️ Sort them by the preserved `order` from specifications
                        mappedSpecs.sort((a, b) => a.order - b.order);
                        setCaseSpecsList(mappedSpecs);
                    }
                } catch (err) {
                    console.error('Failed to load spec labels:', err);
                }
            };
            fetchSpecs();

            const fetchFilters = async () => {
                try {
                    const res = await productService.getFilterConfig(category);
                    if (res.data.success) {
                        const existingFilters = productToEdit && Array.isArray(productToEdit.filters) ? productToEdit.filters : [];
                        const mappedFilters = res.data.data.map(ft => {
                            const match = existingFilters.find(ef => ef.filter_type_id === ft.id);
                            return {
                                id: ft.id,
                                label: ft.filter_label,
                                options: ft.values || [], // This is now an array of {id, filter_value}
                                value: match ? match.filter_value : ''
                            };
                        });
                        setFiltersList(mappedFilters);
                    }
                } catch (err) {
                    console.error('Failed to load filter config:', err);
                }
            };
            fetchFilters();
        }
    }, [category, productToEdit]);

    useEffect(() => {
        if (productToEdit && isOpen) {
            setCategory(productToEdit.category_id || '');
            setName(productToEdit.product_name || '');
            setModelNo(productToEdit.modal || '');
            setModelName(productToEdit.modal_name || '');
            setDescription(productToEdit.product_description || '');
            setMbCompat(productToEdit.mb_compat || '');
            setCoolerCompat(productToEdit.cooler_compat || '');
            setPanelType(productToEdit.panel_type || '');
            setInstalledFans(productToEdit.installed_fans || '');
            setInstalledPsu(productToEdit.installed_psu || '');
            if (productToEdit.image) {
                const img = productToEdit.image;
                const fullImg = img.startsWith('http') ? img : `http://${window.location.hostname}:5000${img.startsWith('/') ? '' : '/'}${img}`;
                setImage(fullImg);
            }

            if (productToEdit.product_features) {
                const feats = productToEdit.product_features.split('\n');
                if (feats.length > 0) setFeatures(feats);
            }

            const specsArray = productToEdit && Array.isArray(productToEdit.specifications) ? productToEdit.specifications : [];
            const displaySpec = specsArray.find(s => s.specification_name === 'Display Type');
            if (displaySpec) {
                setCaseDisplay(displaySpec.specification_value || '');
            } else if (productToEdit.specs) {
                try {
                    const spc = typeof productToEdit.specs === 'string' ? JSON.parse(productToEdit.specs) : productToEdit.specs;
                    if (spc.caseDisplay) setCaseDisplay(typeof spc.caseDisplay === 'object' ? spc.caseDisplay.value : spc.caseDisplay);
                } catch (e) { }
            }

            if (productToEdit.combinations && productToEdit.combinations.length > 0) {
                const hydratedCombs = productToEdit.combinations.map(c => ({
                    ...c,
                    features: (c.features || []).map(f => typeof f === 'string' ? { id: crypto.randomUUID(), text: f } : f),
                    previews: (c.previews || []).map(p => {
                        if (!p) return '';
                        if (p.startsWith('http')) return p;
                        return `http://${window.location.hostname}:5000${p.startsWith('/') ? '' : '/'}${p}`;
                    })
                }));
                setCombinations(hydratedCombs);
                const hasColor = productToEdit.combinations.some(c => c.Color);
                const hasSize = productToEdit.combinations.some(c => c.Size);
                const hasStyle = productToEdit.combinations.some(c => c.Style);
                setSelectedVariants({ Color: !!hasColor, Size: !!hasSize, Style: !!hasStyle });
            }

            if (productToEdit.product_images && productToEdit.product_images.length > 0) {
                setProductImages(productToEdit.product_images.map(img => {
                    const path = img.image_path || '';
                    if (path.startsWith('http')) return { file: null, preview: path };
                    // Ensure slash between domain and path
                    const slash = path.startsWith('/') ? '' : '/';
                    return { file: null, preview: `http://${window.location.hostname}:5000${slash}${path}` };
                }));
            }
            if (productToEdit.hover_image) {
                const h = productToEdit.hover_image;
                const fullH = h.startsWith('http') ? h : `http://${window.location.hostname}:5000${h.startsWith('/') ? '' : '/'}${h}`;
                setHoverImage(fullH);
            }
        } else if (isOpen && !productToEdit) {
            setCategory(''); setName(''); setModelNo(''); setModelName(''); setDescription('');
            setMbCompat(''); setCoolerCompat(''); setPanelType(''); setInstalledFans(''); setInstalledPsu(''); setCaseDisplay('');
            setFeatures(['']);
            setProductImages([]);
            setImage('');
            setMainImageFile(null);
        }
    }, [productToEdit, isOpen]);

    // Handlers list updates trigger safely
    const handleSaveSpecLabel = async () => {
        const trimmedTitle = newLabelTitle.trim();
        if (!trimmedTitle) { setStatusMessage("Required: Label Title"); setStatusType('error'); return; }
        if (!category) { setStatusMessage("Required: Category Selection"); setStatusType('error'); return; }
        try {
            const res = await productService.addSpecLabel({ category_id: category, spec_label: trimmedTitle });
            if (res.data.success) {
                const newItem = {
                    id: res.data.data.id,
                    key: res.data.data.spec_label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
                    label: res.data.data.spec_label,
                    value: '',
                    order: res.data.data.order_id || 9999
                };

                setCaseSpecsList(prev => {
                    const exists = prev.find(s => s.id === newItem.id);
                    return exists ? prev : [...prev, newItem];
                });

                setNewLabelTitle('');
                setIsLabelModalOpen(false);
                setStatusMessage('Specification added!');
                setStatusType('success');
                setTimeout(() => setStatusMessage(''), 1500);
            }
        } catch (e) {
            console.error("Add Spec Label Error:", e);
            setStatusMessage("Error: " + (e.response?.data?.message || e.message));
            setStatusType('error');
        }
    };

    const handleAddFilterType = async () => {
        if (!newFilterTitle.trim()) { setStatusMessage("Required: Filter Label"); setStatusType('error'); return; }
        if (!category) { setStatusMessage("Required: Category Selection"); setStatusType('error'); return; }
        try {
            const res = await productService.addFilterLabel({
                category_id: category,
                filter_label: newFilterTitle
            });
            if (res.data.success) {
                const newItem = {
                    id: res.data.data.id,
                    label: res.data.data.filter_label,
                    options: res.data.data.values || [],
                    value: ''
                };

                setFiltersList(prev => {
                    const exists = prev.find(f => f.id === newItem.id);
                    return exists ? prev : [...prev, newItem];
                });

                setNewFilterTitle('');
                setNewFilterOptions(''); // Keep state but ignored for labels
                setIsFilterModalOpen(false);
                setStatusMessage('Filter type added (manage options in settings)!');
                setStatusType('success');
                setTimeout(() => setStatusMessage(''), 1500);
            }
        } catch (e) {
            console.error("Add Filter Label Error:", e);
            setStatusMessage("Error: " + (e.response?.data?.message || e.message));
            setStatusType('error');
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


    // 📸 Immediate Local preview for Main Image
    const handleMainImageChange = (file) => {
        if (!file) return;
        setMainImageFile(file); // 📸 Store File trigger flawlessly flaws flawlessly

        const previewUrl = URL.createObjectURL(file);
        setImage(previewUrl); // Show preview locally flawless flawlessly setup
    };

    const handleHoverImageChange = (file) => {
        if (!file) return;
        setHoverImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        setHoverImage(previewUrl);
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();


        if (!category) { setStatusMessage("Required: Category Selection"); setStatusType('error'); return; }

        // 📸 REQUIRE IMAGES AS PER USER REQUEST
        if (productImages.length === 0) {
            setActiveTab('Product Images');
            setStatusMessage("Required: At least one Image"); setStatusType('error'); return;
        }
        if (!hoverImage && !hoverImageFile) {
            setActiveTab('Product Images');
            setStatusMessage("Required: Hover Image Asset"); setStatusType('error'); return;
        }

        const formData = new FormData();
        formData.append('category_id', category);
        formData.append('modal', modelNo);
        formData.append('modal_name', modelName);
        ;
        formData.append('product_description', description);
        formData.append('mb_compat', mbCompat);
        formData.append('cooler_compat', coolerCompat);
        formData.append('panel_type', panelType);
        formData.append('installed_fans', installedFans);
        formData.append('installed_psu', installedPsu);
        formData.append('product_features', features.filter(f => f.trim() !== '').join('\n'));
        formData.append('featuresList', JSON.stringify(features.filter(f => f.trim() !== '')));

        // 📐 Global Specifications Array
        const mappedSpecsArray = caseSpecsList
            .filter(s => s.value && s.value.trim() !== '')
            .map((s, idx) => ({
                specification_name: s.label,
                specification_value: s.value,
                order_id: idx + 1,
                spec_label_id: s.id
            }));

        if (caseDisplay) {
            mappedSpecsArray.push({
                specification_name: 'Display Type',
                specification_value: caseDisplay,
                order_id: 99,
                spec_label_id: null
            });
        }
        formData.append('specifications', JSON.stringify(mappedSpecsArray));

        const filtersToSave = filtersList
            .filter(f => f.value && f.value.trim() !== '')
            .map(f => {
                const optMatch = (f.options || []).find(opt => opt.filter_value === f.value);
                return { 
                    filter_type_id: f.id, 
                    filter_value: f.value,
                    filter_value_id: optMatch ? optMatch.id : null
                };
            });
        formData.append('filters', JSON.stringify(filtersToSave));

        if (mainImageFile) {
            formData.append('image', mainImageFile);
        } else if (image) {
            formData.append('existing_image', image.replace(/^https?:\/\/[^\/]+/i, ''));
        }

        if (hoverImageFile) {
            formData.append('hover_image', hoverImageFile);
        } else if (hoverImage) {
            formData.append('existing_hover_image', hoverImage.replace(/^https?:\/\/[^\/]+/i, ''));
        }

        // 📸 Append Combinations structured matrix
        formData.append('combinations', JSON.stringify(combinations.map(c => ({
            Color: c.Color, Size: c.Size, Style: c.Style,
            features: (c.features || []).map(f => typeof f === 'object' ? f.text : f),
            filters: (c.filters || []).map(f => {
                const opt = (f.options || []).find(o => o.filter_value === f.value);
                return {
                    id: f.id,
                    value: f.value,
                    filter_value_id: opt ? opt.id : null
                };
            }),
            specs: (c.specs || []).map((s, sIdx) => ({
                ...s,
                order: sIdx + 1
            })),
            description: c.description || '',
            modelName: c.modelName || '',
            productName: c.productName || ''
        }))));

        combinations.forEach((comb, idx) => {
            if (comb.variantFiles) {
                comb.variantFiles.forEach(file => {
                    if (file) formData.append(`comb_images_${idx}`, file);
                });
            }

            // 📸 Build Combined Order for Variant Images
            // We communicate absolute order string array list supporting reorder
            const orderList = [];
            let fileCounter = 0;
            const previews = comb.previews || [];

            previews.forEach((p) => {
                if (p.startsWith('blob:')) {
                    // It's a newly added local file
                    orderList.push(`FILE_${fileCounter}`);
                    fileCounter++;
                } else {
                    // It's an existing image absolute URL from database
                    orderList.push(p);
                }
            });
            formData.append(`comb_images_order_${idx}`, JSON.stringify(orderList));
        });

        // 📸 Append Product Images
        const existingImages = [];
        productImages.forEach((img) => {
            if (img.file) {
                formData.append('product_images', img.file);
            } else if (img.preview) {
                const purePath = img.preview.replace(/^https?:\/\/[^\/]+/i, '').trim();
                if (purePath && purePath !== '/') {
                    existingImages.push(purePath);
                }
            }
        });
        formData.append('existing_product_images', JSON.stringify(existingImages));

        try {
            if (productToEdit) {
                await productService.update(productToEdit.id, formData);
                setStatusMessage('Product updated successfully!');
            } else {
                await productService.create(formData);
                setStatusMessage('Product added successfully!');
            }
            setStatusType('success');
            setTimeout(() => { onSuccess(); onClose(); setStatusMessage(''); }, 1500); // Wait status view

            // Reset states safely trigger framing
            setCategory(''); setName(''); setModelNo(''); setModelName(''); setDescription(''); setImage('');
            setMainImageFile(null);
            setSelectedVariants({ Color: false, Size: false, Style: false }); setVariantDetails({ Color: '', Size: '', Style: '' }); setFeatures(['']);
            setCustomSpecs([]); setCombinations([]); setShowCombinations(false);
            setProductImages([]);
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
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        onClick={(e) => e.stopPropagation()}
                        style={modalStyle}
                    >
                        <div style={{ width: '100%', padding: '0 3rem' }}>
                            <div style={headerStyle}>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{productToEdit ? 'Edit Product' : 'Add New Product'}</h3>
                                <button type="button" onClick={onClose} style={{ background: 'var(--bg-secondary)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} className="hover-lift"><X size={24} /></button>
                            </div>

                            <div style={{ marginBottom: '2.5rem' }}>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500 }}>{productToEdit ? 'Update existing product details, variants, and configurations.' : 'Create a new product listing with multi-variant support'}</p>
                            </div>


                            {statusMessage && (
                                <div className="telemetry" style={{ padding: '16px 20px', borderRadius: '12px', background: statusType === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(225,25,25,0.08)', color: statusType === 'success' ? '#10b981' : 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 700, border: '1px solid var(--border-ghost)', marginBottom: '1.5rem', margin: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 10px currentColor' }} />
                                    {statusMessage}
                                </div>
                            )}

                            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-ghost)', paddingBottom: '16px', marginBottom: '1.5rem', overflowX: 'auto' }}>
                                    {['General', 'Variant', 'Product Images'].map((t) => (
                                        <button key={t} type="button" onClick={() => setActiveTab(t)} className="telemetry" style={{ padding: '10px 24px', background: activeTab === t ? 'var(--accent-primary)' : 'transparent', color: activeTab === t ? '#fff' : 'var(--text-dim)', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 800, transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '1px' }}>{t}</button>
                                    ))}
                                </div>

                                <div style={{ display: activeTab === 'General' ? 'flex' : 'none', flexDirection: 'column', gap: '1.2rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div>
                                            <label style={labelStyle}>Category</label>
                                            <select required value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                                                <option value="">-- Select Category --</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                                                ))}
                                            </select>
                                        </div>

                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>

                                        <div>
                                            <label style={labelStyle}>Model No / Serial No</label>
                                            <input type="text" placeholder="e.g., TX-DLX21" value={modelNo} onChange={(e) => setModelNo(e.target.value)} style={inputStyle} />
                                        </div>

                                    </div>


                                    {/* ✏️ Bullet Features */}

                                </div>




                                <div style={{ display: activeTab === 'Variant' ? 'flex' : 'none', flexDirection: 'column', gap: '1.2rem' }}>
                                    <div style={{ padding: '0 1.2rem' }}>

                                        {/* Variant Checkboxes */}
                                        <div style={{ padding: '0.5rem 0', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-ghost)' }}>
                                            <label style={{ ...labelStyle, marginBottom: '16px' }}>Enable Variations</label>
                                            <div style={{ display: 'flex', gap: '2.5rem' }}>
                                                {['Color', 'Size', 'Style'].map(type => (
                                                    <label key={type} className="telemetry" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', cursor: 'pointer', textTransform: 'uppercase' }}>
                                                        <input type="checkbox" checked={selectedVariants[type]} onChange={() => handleVariantCheckbox(type)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-primary)', background: 'var(--bg-high)', border: '1px solid var(--border)' }} />
                                                        {type}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* The Generated Combinations Table or List */}
                                        {/* The Generated Combinations Section */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', marginTop: '1rem' }}>
                                            <p className="telemetry" style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent-primary)', textTransform: 'uppercase', margin: 0, letterSpacing: '1px' }}>Generated Combinations</p>
                                            <button type="button" onClick={handleAddCombination} className="telemetry" style={{ padding: '10px 20px', background: 'var(--bg-high)', color: 'var(--text-main)', border: '1px solid var(--border-ghost)', borderRadius: '10px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 800, transition: 'all 0.2s', textTransform: 'uppercase' }}>+ Add Combination</button>
                                        </div>

                                        {combinations.length > 0 && (
                                            <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', background: '#fff' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                                    <thead>
                                                        <tr style={{ background: '#f8fafc' }}>
                                                            {selectedVariants.Color && <th style={{ padding: '12px', fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Color</th>}
                                                            {selectedVariants.Size && <th style={{ padding: '12px', fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Size</th>}
                                                            {selectedVariants.Style && <th style={{ padding: '12px', fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Style</th>}
                                                            <th style={{ padding: '12px', fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Images</th>
                                                            <th style={{ padding: '12px', fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Details</th>
                                                            <th style={{ padding: '12px', fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'center' }}>Remove</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {combinations.map((comb, index) => (
                                                            <React.Fragment key={index}>
                                                                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                                                                    {selectedVariants.Color && (
                                                                        <td style={{ padding: '12px' }}>
                                                                            <input type="text" value={comb.Color} onChange={(e) => { const newComb = [...combinations]; newComb[index].Color = e.target.value; setCombinations(newComb); }} style={{ ...inputStyle, padding: '10px 14px', fontSize: '0.85rem', marginTop: 0, fontWeight: 600 }} placeholder="Color" />
                                                                        </td>
                                                                    )}
                                                                    {selectedVariants.Size && (
                                                                        <td style={{ padding: '12px' }}>
                                                                            <input type="text" value={comb.Size} onChange={(e) => { const newComb = [...combinations]; newComb[index].Size = e.target.value; setCombinations(newComb); }} style={{ ...inputStyle, padding: '10px 14px', fontSize: '0.85rem', marginTop: 0, fontWeight: 600 }} placeholder="Size" />
                                                                        </td>
                                                                    )}
                                                                    {selectedVariants.Style && (
                                                                        <td style={{ padding: '12px' }}>
                                                                            <input type="text" value={comb.Style} onChange={(e) => { const newComb = [...combinations]; newComb[index].Style = e.target.value; setCombinations(newComb); }} style={{ ...inputStyle, padding: '10px 14px', fontSize: '0.85rem', marginTop: 0, fontWeight: 600 }} placeholder="Style" />
                                                                        </td>
                                                                    )}
                                                                    <td style={{ padding: '12px' }}>
                                                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                                            {comb.previews && comb.previews.map((preview, i) => (
                                                                                <div key={i} style={{ position: 'relative', width: '45px', height: '45px' }}>
                                                                                    <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />

                                                                                    {i > 0 && (
                                                                                        <button type="button" onClick={() => {
                                                                                            const newComb = [...combinations];
                                                                                            const prev = [...newComb[index].previews];
                                                                                            const files = [...(newComb[index].variantFiles || [])];
                                                                                            [prev[i], prev[i - 1]] = [prev[i - 1], prev[i]];
                                                                                            let temp = files[i];
                                                                                            files[i] = files[i - 1];
                                                                                            files[i - 1] = temp;
                                                                                            newComb[index].previews = prev;
                                                                                            newComb[index].variantFiles = files;
                                                                                            setCombinations(newComb);
                                                                                        }} style={{ position: 'absolute', bottom: '-4px', left: '-4px', background: '#38bdf8', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px', zIndex: 10 }}>←</button>
                                                                                    )}

                                                                                    {i < (comb.previews || []).length - 1 && (
                                                                                        <button type="button" onClick={() => {
                                                                                            const newComb = [...combinations];
                                                                                            const prev = [...newComb[index].previews];
                                                                                            const files = [...(newComb[index].variantFiles || [])];
                                                                                            [prev[i], prev[i + 1]] = [prev[i + 1], prev[i]];
                                                                                            let tempR = files[i];
                                                                                            files[i] = files[i + 1];
                                                                                            files[i + 1] = tempR;
                                                                                            newComb[index].previews = prev;
                                                                                            newComb[index].variantFiles = files;
                                                                                            setCombinations(newComb);
                                                                                        }} style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#38bdf8', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px', zIndex: 10 }}>→</button>
                                                                                    )}

                                                                                    <button type="button" onClick={() => {
                                                                                        const newComb = [...combinations];
                                                                                        newComb[index].previews = newComb[index].previews.filter((_, idx) => idx !== i);
                                                                                        newComb[index].variantFiles = (newComb[index].variantFiles || []).filter((_, idx) => idx !== i);
                                                                                        setCombinations(newComb);
                                                                                    }} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={10} /></button>
                                                                                </div>
                                                                            ))}
                                                                            <div style={{ width: '45px', height: '45px', border: '2px dashed #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', position: 'relative', cursor: 'pointer' }}>
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
                                                                                <Plus size={18} color="#94a3b8" />
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ padding: '12px' }}>
                                                                        <button type="button" onClick={() => { setEditingVariantIdx(index); setIsVariantModalOpen(true); }} style={{ padding: '8px 14px', background: 'rgba(225,25,25,0.08)', color: '#e11919', border: '1px solid rgba(225,25,25,0.2)', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }} className="hover-lift">Configure Details</button>
                                                                    </td>
                                                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                                                        <button type="button" onClick={() => setCombinations(combinations.filter((_, i) => i !== index))} style={{ padding: '10px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '12px', cursor: 'pointer' }} className="hover-lift"><Trash2 size={18} /></button>
                                                                    </td>
                                                                </tr>
                                                            </React.Fragment>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: activeTab === 'Product Images' ? 'flex' : 'none', flexDirection: 'column', gap: '1.2rem' }}>
                                    <div style={{ padding: '0 1.2rem' }}>
                                        <div style={{ border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '12px', background: '#f8fafc' }}>

                                            <p style={{ fontSize: '0.78rem', fontWeight: 800, color: '#e11919', textTransform: 'uppercase', marginBottom: '12px' }}>Product Images</p>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                                                {productImages.map((img, index) => (
                                                    <div key={index} style={{ position: 'relative', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', background: '#fff', aspectRatio: '1' }}>
                                                        <img src={img.preview} alt={`Product ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        <button type="button" onClick={() => {
                                                            setProductImages(productImages.filter((_, i) => i !== index));
                                                        }} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>×</button>
                                                    </div>
                                                ))}

                                                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', aspectRatio: '1', position: 'relative', cursor: 'pointer', background: '#fff', transition: 'all 0.2s' }}>
                                                    <input type="file" multiple accept="image/*" onChange={(e) => {
                                                        const files = Array.from(e.target.files);
                                                        const newImages = files.map(file => ({
                                                            file,
                                                            preview: URL.createObjectURL(file)
                                                        }));
                                                        setProductImages([...productImages, ...newImages]);
                                                        e.target.value = '';
                                                    }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                                                    <Plus size={22} color="#94a3b8" />
                                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px', fontWeight: 600 }}>Add Image</span>
                                                </div>
                                            </div>

                                            <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '1.2rem' }}>{productImages.length} image{productImages.length !== 1 ? 's' : ''} added</p>

                                            {/* Hover Image Option */}
                                            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.2rem' }}>
                                                <p style={{ fontSize: '0.78rem', fontWeight: 800, color: '#e11919', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    Hover Image <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 500, textTransform: 'none' }}>(Displayed on listing hover)</span>
                                                </p>
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                    <div style={{
                                                        width: '120px',
                                                        height: '120px',
                                                        border: hoverImage ? '1px solid #e2e8f0' : '2px dashed #cbd5e1',
                                                        borderRadius: '12px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        position: 'relative',
                                                        background: '#fff',
                                                        overflow: 'hidden',
                                                        cursor: 'pointer'
                                                    }}>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleHoverImageChange(e.target.files[0])}
                                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
                                                        />
                                                        {hoverImage ? (
                                                            <>
                                                                <img src={hoverImage} alt="Hover preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '10px', padding: '4px', textAlign: 'center' }}>Change</div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Plus size={20} color="#94a3b8" />
                                                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '4px', fontWeight: 600 }}>Set Hover</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {hoverImage && (
                                                        <button
                                                            type="button"
                                                            onClick={() => { setHoverImage(''); setHoverImageFile(null); }}
                                                            style={{ padding: '8px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>




                                <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'space-between', borderTop: '1px solid var(--border-ghost)', paddingTop: '2.5rem' }}>
                                    <button type="button" onClick={() => {
                                        const tabs = ['General', 'Variant', 'Product Images'];
                                        const currIndex = tabs.indexOf(activeTab);
                                        if (currIndex > 0) setActiveTab(tabs[currIndex - 1]);
                                    }} className="telemetry" style={{ padding: '14px 28px', background: 'var(--bg-high)', color: 'var(--text-dim)', border: '1px solid var(--border-ghost)', borderRadius: '12px', fontWeight: 800, cursor: activeTab === 'General' ? 'not-allowed' : 'pointer', textTransform: 'uppercase', letterSpacing: '2px', opacity: activeTab === 'General' ? 0 : 1, pointerEvents: activeTab === 'General' ? 'none' : 'auto', transition: 'all 0.2s', fontSize: '0.75rem' }}>Back</button>

                                    {activeTab !== 'Product Images' ? (
                                        <button type="button" onClick={() => {
                                            const tabs = ['General', 'Variant', 'Product Images'];
                                            setActiveTab(tabs[tabs.indexOf(activeTab) + 1]);
                                        }} className="telemetry" style={{ padding: '14px 32px', background: 'var(--bg-high)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '2px', transition: 'all 0.2s', fontSize: '0.75rem' }}>Next Step</button>
                                    ) : (
                                        <button type="submit" className="tortox-button" style={{ padding: '14px 32px', borderRadius: '12px', fontSize: '0.75rem' }}>{productToEdit ? 'Update Product' : 'Submit Product'}</button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {isLabelModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(3px)' }}>
                    <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '12px', width: '320px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>Add Specification Label</p>
                        <input type="text" placeholder="e.g., Cooling Type" value={newLabelTitle} onChange={(e) => setNewLabelTitle(e.target.value)} style={{ ...inputStyle, background: 'var(--bg-secondary)', border: '1px solid var(--border)', marginBottom: '12px' }} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button type="button" onClick={() => setIsLabelModalOpen(false)} style={{ padding: '6px 12px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-muted)', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>Cancel</button>
                            <button type="button" onClick={handleSaveSpecLabel} style={{ padding: '6px 12px', border: 'none', background: '#e11919', color: '#ffffff', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 💎 Variant Configuration Modal */}
            <AnimatePresence>
                {isVariantModalOpen && editingVariantIdx !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={backdropStyle}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            style={{ ...modalStyle, width: '100vw', minHeight: '100vh' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                                <div>
                                    <h4 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>Configure Variant Details</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        Setting up: {combinations[editingVariantIdx].Color} {combinations[editingVariantIdx].Size} {combinations[editingVariantIdx].Style}
                                    </p>
                                </div>
                                <button type="button" onClick={() => setIsVariantModalOpen(false)} style={{ background: 'var(--bg-secondary)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover-lift"><X size={24} /></button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                                <div>
                                    <label style={labelStyle}>Model Name</label>
                                    <input
                                        type="text"
                                        placeholder="Specific Model Name"
                                        value={combinations[editingVariantIdx].modelName || ''}
                                        onChange={(e) => {
                                            const newComb = [...combinations];
                                            newComb[editingVariantIdx].modelName = e.target.value;
                                            setCombinations(newComb);
                                        }}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Product Name</label>
                                    <input
                                        type="text"
                                        placeholder="Product Display Name"
                                        value={combinations[editingVariantIdx].productName || ''}
                                        onChange={(e) => {
                                            const newComb = [...combinations];
                                            newComb[editingVariantIdx].productName = e.target.value;
                                            setCombinations(newComb);
                                        }}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <label style={labelStyle}>Variant Description</label>
                                <textarea
                                    placeholder="Enter unique description for this variant..."
                                    value={combinations[editingVariantIdx].description || ''}
                                    onChange={(e) => {
                                        const newComb = [...combinations];
                                        newComb[editingVariantIdx].description = e.target.value;
                                        setCombinations(newComb);
                                    }}
                                    style={{ ...inputStyle, height: '120px', resize: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                {/* Filters */}
                                <div>
                                    <p style={{ fontSize: '0.95rem', fontWeight: 900, color: '#e11919', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Categorization Filters</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                        {(filtersList || []).map((f) => {
                                            const vFilter = (combinations[editingVariantIdx].filters || []).find(vf => vf.id === f.id);
                                            return (
                                                <div key={f.id}>
                                                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>{f.label}</label>
                                                    <select
                                                        value={vFilter ? vFilter.value : ''}
                                                        onChange={(e) => {
                                                            const newComb = [...combinations];
                                                            if (!newComb[editingVariantIdx].filters) newComb[editingVariantIdx].filters = [];
                                                            const vfIdx = newComb[editingVariantIdx].filters.findIndex(vf => vf.id === f.id);
                                                            if (vfIdx !== -1) {
                                                                newComb[editingVariantIdx].filters[vfIdx].value = e.target.value;
                                                            } else {
                                                                newComb[editingVariantIdx].filters.push({ id: f.id, value: e.target.value });
                                                            }
                                                            setCombinations(newComb);
                                                        }}
                                                        style={{ ...inputStyle, padding: '12px 16px', fontSize: '0.95rem' }}
                                                    >
                                                        <option value="">-- No Selection --</option>
                                                        {(f.options || []).map(opt => (
                                                            <option key={opt.id} value={opt.filter_value}>{opt.filter_value}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Features */}
                                <div>
                                    <p style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--accent-primary)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
                                        Highlight Features
                                    </p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <Reorder.Group
                                            axis="y"
                                            values={combinations[editingVariantIdx].features || []}
                                            onReorder={(newOrder) => {
                                                const newComb = [...combinations];
                                                newComb[editingVariantIdx].features = newOrder;
                                                setCombinations(newComb);
                                            }}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '8px',
                                                listStyle: 'none',
                                                padding: 0
                                            }}
                                        >
                                            {(combinations[editingVariantIdx].features || []).map((feat, featIdx) => (
                                                <FeatureReorderItem
                                                    key={feat.id}
                                                    feat={feat}
                                                    featIdx={featIdx}
                                                    combinations={combinations}
                                                    editingVariantIdx={editingVariantIdx}
                                                    setCombinations={setCombinations}
                                                    inputStyle={inputStyle}
                                                />
                                            ))}
                                        </Reorder.Group>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCombinations(prev => prev.map((c, ci) => {
                                                    if (ci === editingVariantIdx) {
                                                        return {
                                                            ...c,
                                                            features: [...(c.features || []), { id: Date.now() + Math.random().toString(36).substring(2, 9), text: '' }]
                                                        };
                                                    }
                                                    return c;
                                                }));
                                            }}
                                            style={{
                                                alignSelf: 'flex-start',
                                                fontSize: '0.8rem',
                                                color: '#e11919',
                                                fontWeight: 800,
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                marginTop: '5px'
                                            }}
                                        >
                                            + Add Bullet Point
                                        </button>
                                    </div>
                                </div>

                                {/* Technical Specifications */}
                                <div>
                                    <p style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--accent-primary)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Technical Specifications</p>
                                    <Reorder.Group
                                        axis="y"
                                        values={combinations[editingVariantIdx].specs || []}
                                        onReorder={(newOrder) => {
                                            const newComb = [...combinations];
                                            newComb[editingVariantIdx].specs = newOrder;
                                            setCombinations(newComb);
                                        }}
                                        style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0 }}
                                    >
                                        {(combinations[editingVariantIdx].specs || []).map((s) => (
                                            <SpecReorderItem
                                                key={s.id}
                                                s={s}
                                                combinations={combinations}
                                                editingVariantIdx={editingVariantIdx}
                                                setCombinations={setCombinations}
                                                inputStyle={inputStyle}
                                                handleDeleteSpecLabel={handleDeleteSpecLabel}
                                            />
                                        ))}
                                    </Reorder.Group>
                                    <button type="button" onClick={() => setIsLabelModalOpen(true)} style={{ alignSelf: 'flex-start', fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer', marginTop: '15px' }}>+ New Specification Field</button>
                                </div>
                            </div>

                            <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                                <button type="button" onClick={() => setIsVariantModalOpen(false)} style={{ padding: '16px 60px', background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', color: '#fff', border: 'none', borderRadius: '18px', fontWeight: 900, cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 15px 35px rgba(225,25,25,0.2)' }} className="btn-glowing">Done Configuring</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AnimatePresence>
    );
};

const backdropStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', overflowY: 'auto', backdropFilter: 'blur(10px)' };
const modalStyle = { background: 'var(--bg-primary)', color: 'var(--text-main)', padding: '3.5rem 2.5rem 6rem 2.5rem', width: '100vw', minHeight: '100vh', position: 'relative', border: 'none', transition: 'all 0.3s ease' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', paddingBottom: '24px', borderBottom: '1px solid var(--border-ghost)' };
const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 900, color: '#000', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1.2px' };
const inputStyle = { width: '100%', padding: '16px 20px', border: '1px solid #000', borderRadius: '12px', fontSize: '0.95rem', outline: 'none', margin: 0, background: 'var(--bg-secondary)', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'all 0.3s ease', color: 'var(--text-main)' };
const submitBtnStyle = { width: '100%', padding: '20px', background: 'var(--accent-primary)', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', marginTop: '2.5rem', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1rem', transition: 'all 0.3s ease' };

// 🛠️ Helper Components for Drag and Drop reliability
const FeatureReorderItem = ({ feat, featIdx, combinations, editingVariantIdx, setCombinations, inputStyle }) => {
    const dragControls = useDragControls();
    return (
        <Reorder.Item
            value={feat}
            dragListener={false}
            dragControls={dragControls}
            whileDrag={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.15)', zIndex: 100 }}
            style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--bg-secondary)', padding: '10px', borderRadius: '14px', border: '1px solid var(--border)', cursor: 'default' }}
        >
            <GripVertical
                size={16}
                color="var(--text-muted)"
                style={{ cursor: 'grab', touchAction: 'none' }}
                onPointerDown={(e) => dragControls.start(e)}
            />
            <input
                type="text"
                placeholder="Feature bullet point..."
                value={feat.text || ''}
                onChange={(e) => {
                    const newVal = e.target.value;
                    setCombinations(prev => prev.map((c, ci) => {
                        if (ci === editingVariantIdx) {
                            return {
                                ...c,
                                features: c.features.map((f, fi) => fi === featIdx ? { ...f, text: newVal } : f)
                            };
                        }
                        return c;
                    }));
                }}
                style={{ ...inputStyle, padding: '12px 16px', fontSize: '0.95rem', background: 'transparent', border: 'none', flex: 1, margin: 0 }}
            />
            <button type="button" onClick={() => {
                const newComb = [...combinations];
                newComb[editingVariantIdx].features = newComb[editingVariantIdx].features.filter((_, i) => i !== featIdx);
                setCombinations(newComb);
            }} style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '12px', cursor: 'pointer' }}><Trash2 size={16} /></button>
        </Reorder.Item>
    );
};

const SpecReorderItem = ({ s, combinations, editingVariantIdx, setCombinations, inputStyle, handleDeleteSpecLabel }) => {
    const dragControls = useDragControls();
    return (
        <Reorder.Item
            value={s}
            dragListener={false}
            dragControls={dragControls}
            whileDrag={{ scale: 1.01, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 100 }}
            style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: '20px', border: '1px solid var(--border)', cursor: 'default' }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <GripVertical
                            size={16}
                            color="var(--text-muted)"
                            style={{ cursor: 'grab', touchAction: 'none' }}
                            onPointerDown={(e) => dragControls.start(e)}
                        />
                        <label style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-main)', textTransform: 'uppercase' }}>{s.label}</label>
                    </div>
                    <button type="button" onClick={() => {
                        if (window.confirm(`Permanently remove "${s.label}" field for all variants and this category?`)) {
                            handleDeleteSpecLabel(s.id);
                        }
                    }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                </div>
                <input
                    type="text"
                    value={s.value}
                    onChange={(e) => {
                        const newVal = e.target.value;
                        setCombinations(prev => prev.map((c, ci) => {
                            if (ci === editingVariantIdx) {
                                return {
                                    ...c,
                                    specs: c.specs.map(sp => sp.id === s.id ? { ...sp, value: newVal } : sp)
                                };
                            }
                            return c;
                        }));
                    }}
                    style={{ ...inputStyle, background: 'var(--bg-primary)', border: '1px solid var(--border)', margin: 0 }}
                    placeholder={`Enter ${s.label}...`}
                />
            </div>
        </Reorder.Item>
    );
};

export default AddProductModal;
