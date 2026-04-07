import api from './api';

export const bannerService = {
    getAll: () => api.get('/banners'),
    create: (data) => api.post('/banners', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (id, data) => api.put(`/banners/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    delete: (id) => api.delete(`/banners/${id}`),
};
