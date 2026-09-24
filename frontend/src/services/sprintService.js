import api from './api';

export const sprintService = {
  getSprints: async (params = {}) => {
    const res = await api.get('/sprints', { params });
    return res.data;
  },

  getSprintById: async (id) => {
    const res = await api.get(`/sprints/${id}`);
    return res.data;
  },

  createSprint: async (data) => {
    const res = await api.post('/sprints', data);
    return res.data;
  },

  updateSprint: async (id, data) => {
    const res = await api.put(`/sprints/${id}`, data);
    return res.data;
  },

  startSprint: async (id) => {
    const res = await api.post(`/sprints/${id}/start`);
    return res.data;
  },

  completeSprint: async (id, moveToBacklog = true) => {
    const res = await api.post(`/sprints/${id}/complete`, { moveToBacklog });
    return res.data;
  },

  deleteSprint: async (id) => {
    const res = await api.delete(`/sprints/${id}`);
    return res.data;
  },
};

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
