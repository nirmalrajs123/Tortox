import api from './api';

export const aplusService = {
    getForProduct: (productId) => api.get(`/aplus/${productId}`),
    create: (formData) => api.post('/aplus', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (id, data) => api.put(`/aplus/${id}`, data),
    delete: (id) => api.delete(`/aplus/${id}`),
};
