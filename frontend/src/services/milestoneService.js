import api from './api';

export const milestoneService = {
  getMilestones: async (params = {}) => {
    const res = await api.get('/milestones', { params });
    return res.data;
  },

  getMilestoneById: async (id) => {
    const res = await api.get(`/milestones/${id}`);
    return res.data;
  },

  createMilestone: async (data) => {
    const res = await api.post('/milestones', data);
    return res.data;
  },

  updateMilestone: async (id, data) => {
    const res = await api.put(`/milestones/${id}`, data);
    return res.data;
  },

  deleteMilestone: async (id) => {
    const res = await api.delete(`/milestones/${id}`);
    return res.data;
  },
};
