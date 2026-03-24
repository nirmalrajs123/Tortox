import api from './api';
export const productService = {
    getAll: () => api.get('/products'),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    getSpecLabels: (catId) => api.get(`/spec-labels/${catId}`),
    addSpecLabel: (data) => api.post('/spec-labels', data),
    deleteSpecLabel: (id) => api.delete(`/spec-labels/${id}`),
    update: (id, data) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    delete: (id) => api.delete(`/products/${id}`),

};
