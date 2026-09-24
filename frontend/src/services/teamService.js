import api from './api';

export const teamService = {
  getTeams: async () => {
    const res = await api.get('/teams');
    return res.data;
  },

  getTeamById: async (id) => {
    const res = await api.get(`/teams/${id}`);
    return res.data;
  },

  createTeam: async (data) => {
    const res = await api.post('/teams', data);
    return res.data;
  },

  updateTeam: async (id, data) => {
    const res = await api.put(`/teams/${id}`, data);
    return res.data;
  },

  deleteTeam: async (id) => {
    const res = await api.delete(`/teams/${id}`);
    return res.data;
  },
};

export const organizationService = {
  getOrganizations: async () => {
    const res = await api.get('/organizations');
    return res.data;
  },

  getOrganizationById: async (id) => {
    const res = await api.get(`/organizations/${id}`);
    return res.data;
  },

  createOrganization: async (data) => {
    const res = await api.post('/organizations', data);
    return res.data;
  },

  updateOrganization: async (id, data) => {
    const res = await api.put(`/organizations/${id}`, data);
    return res.data;
  },

  inviteMember: async (orgId, inviteData) => {
    const res = await api.post(`/organizations/${orgId}/invite`, inviteData);
    return res.data;
  },

  getInvitations: async (orgId) => {
    const res = await api.get(`/organizations/${orgId}/invitations`);
    return res.data;
  },

  removeMember: async (orgId, userId) => {
    const res = await api.delete(`/organizations/${orgId}/members/${userId}`);
    return res.data;
  },

  updateMemberRole: async (orgId, userId, role) => {
    const res = await api.put(`/organizations/${orgId}/members/${userId}/role`, { role });
    return res.data;
  },
};
