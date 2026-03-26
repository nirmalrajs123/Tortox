import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';
import { categoryService } from '../../services/category';

const CategorySettings = () => {
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
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete category?")) return;
        try {
            await categoryService.delete(id);
            loadCategories();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdate = async (id) => {
        try {
            await categoryService.update(id, { category_name: editValue, parent_id: 0 });
            setEditingId(null);
            loadCategories();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', color: '#111827' }}>Category Management</h3>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
                <input 
                    type="text" 
                    placeholder="New Category Name..." 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={inputStyle}
                />
                <button onClick={handleAdd} style={btnStyle}>
                    <Plus size={18} /> Add
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {categories.map(cat => (
                    <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        {editingId === cat.id ? (
                            <input 
                                type="text" 
                                value={editValue} 
                                onChange={(e) => setEditValue(e.target.value)} 
                                style={{ ...inputStyle, padding: '6px 10px' }}
                            />
                        ) : (
                            <span style={{ fontWeight: 600, color: '#111827' }}>{cat.category_name}</span>
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
