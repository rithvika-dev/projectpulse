import api from './api';

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
