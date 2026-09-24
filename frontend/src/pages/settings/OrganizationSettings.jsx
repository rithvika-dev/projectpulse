import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import { organizationService } from '../../services/organizationService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Modal } from '../../components/common/Modal';
import { LoadingState } from '../../components/common/LoadingState';
import {
  Settings,
  User,
  Building2,
  Lock,
  Mail,
  UserPlus,
  Trash2,
  CheckCircle2,
  Shield,
  Clock,
} from 'lucide-react';

export const OrganizationSettings = () => {
  const { user, updateUser, isAdmin } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'organization' | 'members' | 'security'
  const [loading, setLoading] = useState(false);

  // Profile Form
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    title: user?.title || '',
    department: user?.department || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });

  // Password Form
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Organization Data
  const [orgData, setOrgData] = useState({
    name: '',
    description: '',
    industry: '',
  });
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);

  // Invite Member Modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('developer');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        title: user.title || '',
        department: user.department || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
    }

    if (user?.organization) {
      loadOrgData(user.organization?._id || user.organization);
    }
  }, [user]);

  const loadOrgData = async (orgId) => {
    try {
      const [orgRes, inviteRes] = await Promise.all([
        organizationService.getOrganizationById(orgId),
        organizationService.getInvitations(orgId),
      ]);

      if (orgRes.success && orgRes.data) {
        setOrgData({
          name: orgRes.data.name || '',
          description: orgRes.data.description || '',
          industry: orgRes.data.industry || '',
        });
        setMembers(orgRes.data.members || []);
      }

      if (inviteRes.success) {
        setInvitations(inviteRes.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.updateProfile(profileData);
      if (res.success) {
        updateUser(res.data.user);
        success('Profile updated successfully');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      if (res.success) {
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        success('Password changed successfully');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrganization = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orgId = user?.organization?._id || user?.organization;
      const res = await organizationService.updateOrganization(orgId, orgData);
      if (res.success) {
        success('Organization settings saved');
      }
    } catch (err) {
      error('Failed to update organization');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      const orgId = user?.organization?._id || user?.organization;
      const res = await organizationService.inviteMember(orgId, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      if (res.success) {
        setInvitations([res.data, ...invitations]);
        setIsInviteOpen(false);
        setInviteEmail('');
        success(res.message || 'Invitation sent successfully');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to send invite');
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateMemberRole = async (userId, newRole) => {
    try {
      const orgId = user?.organization?._id || user?.organization;
      await organizationService.updateMemberRole(orgId, userId, newRole);
      setMembers(
        members.map((m) =>
          m.user?._id === userId ? { ...m, role: newRole } : m
        )
      );
      success(`Role updated to ${newRole}`);
    } catch (err) {
      error('Failed to update member role');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Remove this member from your organization?')) {
      try {
        const orgId = user?.organization?._id || user?.organization;
        await organizationService.removeMember(orgId, userId);
        setMembers(members.filter((m) => m.user?._id !== userId));
        success('Member removed');
      } catch (err) {
        error('Failed to remove member');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="pb-2 border-b border-sand-200">
        <h2 className="text-2xl font-extrabold text-charcoal-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-forest-600" />
          Workspace & Profile Settings
        </h2>
        <p className="text-xs text-sand-600 mt-0.5">
          Manage your personal details, workspace access, invitation queues, and security
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex gap-2 border-b border-sand-200 pb-px">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'profile'
              ? 'border-forest-500 text-forest-700 bg-white'
              : 'border-transparent text-sand-600 hover:text-charcoal-800'
          }`}
        >
          <User className="w-4 h-4" /> My Profile
        </button>

        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab('organization')}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === 'organization'
                  ? 'border-forest-500 text-forest-700 bg-white'
                  : 'border-transparent text-sand-600 hover:text-charcoal-800'
              }`}
            >
              <Building2 className="w-4 h-4" /> Organization Details
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === 'members'
                  ? 'border-forest-500 text-forest-700 bg-white'
                  : 'border-transparent text-sand-600 hover:text-charcoal-800'
              }`}
            >
              <Shield className="w-4 h-4" /> Team & Invitations ({members.length})
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'security'
              ? 'border-forest-500 text-forest-700 bg-white'
              : 'border-transparent text-sand-600 hover:text-charcoal-800'
          }`}
        >
          <Lock className="w-4 h-4" /> Security & Password
        </button>
      </div>

      {/* Tab Panels */}

      {/* 1. Profile Settings */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-sand-200 p-6 shadow-card max-w-2xl">
          <h3 className="text-base font-bold text-charcoal-900 mb-1">Personal Details</h3>
          <p className="text-xs text-sand-600 mb-6">
            Your name, title, and bio visible across sprint assignments and activity logs.
          </p>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <Avatar src={user?.avatar} name={user?.name || 'User'} size="lg" />
              <div>
                <span className="text-xs font-bold text-charcoal-900 block">{user?.name}</span>
                <span className="text-xs text-sand-500">{user?.email}</span>
                <Badge variant="forest" size="xs" className="mt-1">
                  {user?.role?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                required
              />
              <Input
                label="Job Title"
                value={profileData.title}
                onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Department"
                value={profileData.department}
                onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
              />
              <Input
                label="Phone Number"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Bio / Responsibilities
              </label>
              <textarea
                rows={3}
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="Brief summary of your focus areas..."
                className="block w-full rounded-lg border border-sand-300 bg-white text-sm text-charcoal-800 focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 p-3 shadow-subtle resize-none"
              />
            </div>

            <div className="pt-3 border-t border-sand-100 flex justify-end">
              <Button type="submit" variant="primary" size="sm" isLoading={loading}>
                Save Profile
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Organization Settings (Admin Only) */}
      {activeTab === 'organization' && isAdmin && (
        <div className="bg-white rounded-2xl border border-sand-200 p-6 shadow-card max-w-2xl">
          <h3 className="text-base font-bold text-charcoal-900 mb-1">Organization Profile</h3>
          <p className="text-xs text-sand-600 mb-6">
            Company branding, industry vertical, and workspace identity.
          </p>

          <form onSubmit={handleUpdateOrganization} className="space-y-4">
            <Input
              label="Organization Name"
              value={orgData.name}
              onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
              required
            />

            <Input
              label="Industry / Domain"
              value={orgData.industry}
              onChange={(e) => setOrgData({ ...orgData, industry: e.target.value })}
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Company Description
              </label>
              <textarea
                rows={3}
                value={orgData.description}
                onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
                className="block w-full rounded-lg border border-sand-300 bg-white text-sm text-charcoal-800 focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 p-3 shadow-subtle resize-none"
              />
            </div>

            <div className="pt-3 border-t border-sand-100 flex justify-end">
              <Button type="submit" variant="primary" size="sm" isLoading={loading}>
                Save Organization Settings
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Members & Invitations (Admin Only) */}
      {activeTab === 'members' && isAdmin && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-sand-200 p-6 shadow-card">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-sand-100">
              <div>
                <h3 className="text-base font-bold text-charcoal-900">Workspace Members</h3>
                <p className="text-xs text-sand-600">
                  Role assignments and permissions for active team colleagues
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsInviteOpen(true)}
                icon={UserPlus}
              >
                Invite Member
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-50 border-b border-sand-200 text-sand-600 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Title & Dept</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100">
                  {members.map((member) => (
                    <tr key={member.user?._id || member._id} className="hover:bg-sand-50/70">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            src={member.user?.avatar}
                            name={member.user?.name || 'Colleague'}
                            size="sm"
                          />
                          <div>
                            <span className="font-bold text-charcoal-900 block">
                              {member.user?.name}
                            </span>
                            <span className="text-[11px] text-sand-500">
                              {member.user?.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-sand-700">
                        {member.user?.title || 'Member'} · {member.user?.department || 'Product'}
                      </td>

                      <td className="px-4 py-3.5">
                        <select
                          value={member.role}
                          onChange={(e) =>
                            handleUpdateMemberRole(member.user?._id, e.target.value)
                          }
                          disabled={member.user?._id === user?.id}
                          className="text-xs bg-sand-50 border border-sand-300 rounded-md px-2 py-1 text-charcoal-800 font-medium focus:outline-none focus:border-forest-500 disabled:opacity-50"
                        >
                          <option value="organization_admin">Org Admin</option>
                          <option value="project_manager">Project Manager</option>
                          <option value="team_lead">Team Lead</option>
                          <option value="developer">Developer</option>
                          <option value="stakeholder">Stakeholder</option>
                        </select>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        {member.user?._id !== user?.id && (
                          <button
                            onClick={() => handleRemoveMember(member.user?._id)}
                            className="text-sand-400 hover:text-red-600 p-1"
                            title="Remove Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Invitations Queue */}
          <div className="bg-white rounded-2xl border border-sand-200 p-6 shadow-card">
            <div className="mb-4 pb-3 border-b border-sand-100">
              <h4 className="text-sm font-bold uppercase tracking-wider text-charcoal-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amberGold-600" />
                Invitation Queue ({invitations.length})
              </h4>
              <p className="text-xs text-sand-500">
                Pending and accepted invitation links sent to new members
              </p>
            </div>

            {invitations.length > 0 ? (
              <div className="space-y-2">
                {invitations.map((inv) => (
                  <div
                    key={inv._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-sand-50 border border-sand-200 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-sand-500" />
                      <div>
                        <span className="font-bold text-charcoal-900">{inv.email}</span>
                        <span className="text-sand-500 block text-[11px]">
                          Invited as {inv.role?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <Badge variant={inv.status === 'Accepted' ? 'forest' : 'amber'} size="xs">
                      {inv.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-sand-500 italic">No invitations pending.</p>
            )}
          </div>
        </div>
      )}

      {/* 4. Security & Password Settings */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl border border-sand-200 p-6 shadow-card max-w-xl">
          <h3 className="text-base font-bold text-charcoal-900 mb-1">Change Account Password</h3>
          <p className="text-xs text-sand-600 mb-6">
            Ensure your account is protected with a strong, distinct password.
          </p>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, currentPassword: e.target.value })
              }
              required
            />

            <Input
              label="New Password (min 6 chars)"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, newPassword: e.target.value })
              }
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, confirmPassword: e.target.value })
              }
              required
            />

            <div className="pt-3 border-t border-sand-100 flex justify-end">
              <Button type="submit" variant="primary" size="sm" isLoading={loading}>
                Update Password
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Invite Colleague Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Colleague to Workspace"
        subtitle="Send an invitation record to join your organization"
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleInviteMember}
              isLoading={isInviting}
              icon={UserPlus}
            >
              Send Invitation
            </Button>
          </>
        }
      >
        <form onSubmit={handleInviteMember} className="space-y-4">
          <Input
            label="Colleague Work Email"
            type="email"
            placeholder="colleague@company.com"
            icon={Mail}
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />

          <Select
            label="Assigned Workspace Role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            options={[
              { value: 'project_manager', label: 'Project Manager' },
              { value: 'team_lead', label: 'Team Lead' },
              { value: 'developer', label: 'Developer / Engineer' },
              { value: 'stakeholder', label: 'Stakeholder (Read Only)' },
              { value: 'organization_admin', label: 'Organization Admin' },
            ]}
          />
        </form>
      </Modal>
    </div>
  );
};
