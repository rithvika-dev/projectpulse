import api from './api';

export const issueService = {
  getIssues: async (params = {}) => {
    const res = await api.get('/issues', { params });
    return res.data;
  },

  getIssueById: async (id) => {
    const res = await api.get(`/issues/${id}`);
    return res.data;
  },

  createIssue: async (data) => {
    const res = await api.post('/issues', data);
    return res.data;
  },

  updateIssue: async (id, data) => {
    const res = await api.put(`/issues/${id}`, data);
    return res.data;
  },

  deleteIssue: async (id) => {
    const res = await api.delete(`/issues/${id}`);
    return res.data;
  },

  uploadAttachment: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/issues/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
