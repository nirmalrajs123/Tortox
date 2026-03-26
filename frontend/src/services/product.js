import api from './api';
export const productService = {
    getAll: () => api.get('/products'),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    getSpecLabels: (catId) => api.get(`/spec-labels/${catId}`),
    addSpecLabel: (data) => api.post('/spec-labels', data),
    getFilterLabels: (catId) => api.get(`/filter-labels/${catId}`),
    addFilterLabel: (data) => api.post('/filter-labels', data),
    deleteFilterLabel: (id) => api.delete(`/filter-labels/${id}`),
    getFilterValues: (labelId) => api.get(`/filter-values/${labelId}`),
    addFilterValue: (data) => api.post('/filter-values', data),
    deleteFilterValue: (id) => api.delete(`/filter-values/${id}`),
    getFilterConfig: (catId) => api.get(`/filter-config/${catId}`),
    saveFullFilter: (data) => api.post('/save-full-filter', data),
    deleteSpecLabel: (id) => api.delete(`/spec-labels/${id}`),
    update: (id, data) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    delete: (id) => api.delete(`/products/${id}`),

};
