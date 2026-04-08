import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { categoryService } from '../../services/category';
import { useSwag } from '../../context/SwagContext';

const CategorySettings = () => {
    const { showAlert } = useSwag();
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [newCategoryImage, setNewCategoryImage] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [editCategoryImage, setEditCategoryImage] = useState(null);
    const fileInputRef = useRef(null);
    const editFileInputRef = useRef(null);

    const loadCategories = async () => {
        try {
            const res = await categoryService.getAll();
            setCategories(res.data?.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleAdd = async () => {
        if (!newCategory.trim()) return;
        try {
            const formData = new FormData();
            formData.append('category_name', newCategory);
            formData.append('parent_id', 0);
            if (newCategoryImage) {
                formData.append('media', newCategoryImage);
            }

            await categoryService.create(formData);
            setNewCategory('');
            setNewCategoryImage(null);
            loadCategories();
            showAlert({ title: 'Success', message: 'Category added successfully', type: 'success' });
        } catch (err) {
            console.error(err);
            showAlert({ title: 'Operation Failed', message: err.response?.data?.message || 'Failed to add category', type: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("PERMANENT DELETE: Remove category and all its associated data forever?")) return;
        try {
            await categoryService.delete(id);
            loadCategories();
            showAlert({ title: 'Success', message: 'Category permanently purged', type: 'success' });
        } catch (err) {
            console.error(err);
            showAlert({ title: 'Operation Failed', message: err.response?.data?.message || 'Failed to delete category', type: 'error' });
        }
    };

    const handleUpdate = async (id) => {
        try {
            const formData = new FormData();
            formData.append('category_name', editValue);
            formData.append('parent_id', 0);
            
            const cat = categories.find(c => c.id === id);
            if (editCategoryImage) {
                formData.append('media', editCategoryImage);
            } else if (cat.category_image) {
                formData.append('existing_category_image', cat.category_image);
            }

            await categoryService.update(id, formData);
            setEditingId(null);
            setEditCategoryImage(null);
            loadCategories();
            showAlert({ title: 'Success', message: 'Category updated', type: 'success' });
        } catch (err) {
            console.error(err);
            showAlert({ title: 'Operation Failed', message: err.response?.data?.message || 'Update failed', type: 'error' });
        }
    };

    return (
        <div style={{ background: 'var(--bg-primary)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-ghost)', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '1px' }}>Category Management</h3>

            {/* Add Category Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '2rem', background: 'var(--bg-secondary)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-ghost)' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="New Category Name..."
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        style={{ ...inputStyle, background: 'var(--bg-primary)', color: 'var(--text-main)', border: '1px solid var(--border-ghost)' }}
                    />
                    <div 
                        onClick={() => fileInputRef.current.click()}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '10px', background: newCategoryImage ? 'var(--accent-primary)' : 'var(--bg-primary)', cursor: 'pointer', border: '1px solid var(--border-ghost)', color: newCategoryImage ? '#fff' : 'var(--text-main)' }}
                    >
                        <ImageIcon size={20} />
                    </div>
                    <button onClick={handleAdd} style={btnStyle}>
                        <Plus size={18} /> Add
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept="image/*"
                        onChange={(e) => setNewCategoryImage(e.target.files[0])}
                    />
                </div>
                {newCategoryImage && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{newCategoryImage.name}</span>
                        <X size={14} style={{ cursor: 'pointer' }} onClick={() => setNewCategoryImage(null)} />
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {categories.map(cat => (
                    <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'var(--bg-secondary)', borderRadius: '14px', border: '1px solid var(--border-ghost)', transition: 'all 0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                            {/* Category Thumbnail */}
                            <div style={{ width: '45px', height: '45px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-ghost)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {cat.category_image ? (
                                    <img src={cat.category_image} alt={cat.category_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <ImageIcon size={18} style={{ opacity: 0.3 }} />
                                )}
                            </div>

                            {editingId === cat.id ? (
                                <div style={{ display: 'flex', gap: '10px', flex: 1, alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        style={{ ...inputStyle, padding: '8px 12px', background: 'var(--bg-primary)', color: 'var(--text-main)', border: '1px solid var(--accent-primary)' }}
                                    />
                                    <div 
                                        onClick={() => editFileInputRef.current.click()}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: editCategoryImage ? 'var(--accent-primary)' : 'var(--bg-primary)', cursor: 'pointer', border: '1px solid var(--border-ghost)', color: editCategoryImage ? '#fff' : 'var(--text-main)' }}
                                    >
                                        <ImageIcon size={16} />
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={editFileInputRef} 
                                        style={{ display: 'none' }} 
                                        accept="image/*"
                                        onChange={(e) => setEditCategoryImage(e.target.files[0])}
                                    />
                                </div>
                            ) : (
                                <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>{cat.category_name}</span>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            {editingId === cat.id ? (
                                <>
                                    <button onClick={() => handleUpdate(cat.id)} style={{ ...actionBtn, color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>Save</button>
                                    <button onClick={() => { setEditingId(null); setEditCategoryImage(null); }} style={{ ...actionBtn, color: '#94a3b8' }}><X size={16} /></button>
                                </>
                            ) : (
                                <button onClick={() => { setEditingId(cat.id); setEditValue(cat.category_name); }} style={{ ...actionBtn, color: '#3b82f6' }}><Edit size={16} /></button>
                            )}
                            <button onClick={() => handleDelete(cat.id)} style={{ ...actionBtn, color: '#ef4444' }}><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const inputStyle = { flexGrow: 1, padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem', outline: 'none' };
const btnStyle = { display: 'flex', alignItems: 'center', gap: '6px', padding: '0 20px', background: '#e11919', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' };
const actionBtn = { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' };

export default CategorySettings;
