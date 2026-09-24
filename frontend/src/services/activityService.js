import api from './api';

export const activityService = {
  getActivities: async (params = {}) => {
    const res = await api.get('/activities', { params });
    return res.data;
  },
};
