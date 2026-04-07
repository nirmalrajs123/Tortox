import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { categoryService } from '../../services/category';
import { useSwag } from '../../context/SwagContext';

const CategorySettings = () => {
    const { showAlert } = useSwag();
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');

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
            await categoryService.create({ category_name: newCategory, parent_id: 0 });
            setNewCategory('');
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
            await categoryService.update(id, { category_name: editValue, parent_id: 0 });
            setEditingId(null);
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

            <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
                <input
                    type="text"
                    placeholder="New Category Name..."
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{ ...inputStyle, background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-ghost)' }}
                />
                <button onClick={handleAdd} style={btnStyle}>
                    <Plus size={18} /> Add
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {categories.map(cat => (
                    <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'var(--bg-secondary)', borderRadius: '14px', border: '1px solid var(--border-ghost)', transition: 'all 0.2s' }}>
                        {editingId === cat.id ? (
                            <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                style={{ ...inputStyle, padding: '8px 12px', background: 'var(--bg-primary)', color: 'var(--text-main)', border: '1px solid var(--accent-primary)' }}
                            />
                        ) : (
                            <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>{cat.category_name}</span>
                        )}

                        <div style={{ display: 'flex', gap: '8px' }}>
                            {editingId === cat.id ? (
                                <button onClick={() => handleUpdate(cat.id)} style={{ ...actionBtn, color: '#10b981' }}>Save</button>
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
const actionBtn = { background: 'none', border: 'none', cursor: 'pointer', padding: '4px' };

export default CategorySettings;
