import api from './api';

export const commentService = {
  getComments: async (entityType, entityId) => {
    const res = await api.get(`/comments/${entityType}/${entityId}`);
    return res.data;
  },

  createComment: async (data) => {
    const res = await api.post('/comments', data);
    return res.data;
  },

  updateComment: async (id, data) => {
    const res = await api.put(`/comments/${id}`, data);
    return res.data;
  },

  deleteComment: async (id) => {
    const res = await api.delete(`/comments/${id}`);
    return res.data;
  },
};

export const activityService = {
  getActivities: async (params = {}) => {
    const res = await api.get('/activities', { params });
    return res.data;
  },
};

export const notificationService = {
  getNotifications: async (params = {}) => {
    const res = await api.get('/notifications', { params });
    return res.data;
  },

  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },

  deleteNotification: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
};

export const reportService = {
  getOrgOverview: async () => {
    const res = await api.get('/reports/overview');
    return res.data;
  },

  getProjectReport: async (projectId) => {
    const res = await api.get(`/reports/project/${projectId}`);
    return res.data;
  },

  getWorkloadReport: async (projectId) => {
    const res = await api.get(`/reports/workload/${projectId}`);
    return res.data;
  },

  getSprintReport: async (sprintId) => {
    const res = await api.get(`/reports/sprint/${sprintId}`);
    return res.data;
  },
};
