import React, { useState, useEffect } from 'react';
import { teamService } from '../../services/teamService';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import {
  Users,
  Plus,
  FolderKanban,
  UserCheck,
  Shield,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export const TeamsList = () => {
  const { isAdmin, isPM } = useAuth();
  const { success, error } = useToast();

  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    teamLead: '',
    color: '#2F6B5F',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const [teamsRes, usersRes] = await Promise.all([
        teamService.getTeams(),
        authService.getUsers(),
      ]);
      if (teamsRes.success) setTeams(teamsRes.data || []);
      if (usersRes.success) setUsers(usersRes.data || []);
    } catch (err) {
      console.error(err);
      error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.teamLead) {
      error('Team name and Team Lead are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await teamService.createTeam(formData);
      if (res.success) {
        setTeams([...teams, res.data]);
        setIsCreateOpen(false);
        setFormData({
          name: '',
          description: '',
          teamLead: '',
          color: '#2F6B5F',
        });
        success('Team created successfully');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team pod?')) {
      try {
        await teamService.deleteTeam(teamId);
        setTeams(teams.filter((t) => t._id !== teamId));
        success('Team deleted');
      } catch (err) {
        error('Failed to delete team');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-sand-200">
        <div>
          <h2 className="text-2xl font-extrabold text-charcoal-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-forest-600" />
            Engineering & Product Teams
          </h2>
          <p className="text-xs text-sand-600 mt-0.5">
            Cross-functional squads, tech lead assignments, and capacity tracking
          </p>
        </div>

        {(isAdmin || isPM) && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            icon={Plus}
          >
            Create Team
          </Button>
        )}
      </div>

      {/* Teams Grid */}
      {loading ? (
        <LoadingState message="Loading organization teams..." />
      ) : teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Teams Created"
          description="Group engineers, designers, and QA into pods to manage collective workloads."
          actionLabel={isAdmin || isPM ? 'Create Team' : undefined}
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team._id}
              className="bg-white rounded-2xl border border-sand-200 p-5 shadow-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: team.color || '#2F6B5F' }}
                    />
                    <h4 className="text-base font-bold text-charcoal-900">
                      {team.name}
                    </h4>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteTeam(team._id)}
                      className="p-1 rounded text-sand-400 hover:text-red-600 transition-colors"
                      title="Delete team"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-sand-600 leading-relaxed mb-4 line-clamp-2">
                  {team.description || 'No description provided.'}
                </p>

                {/* Team Lead Card */}
                {team.teamLead && (
                  <div className="p-2.5 rounded-xl bg-sand-50 border border-sand-200 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={team.teamLead.avatar}
                        name={team.teamLead.name}
                        size="xs"
                      />
                      <div className="text-xs truncate">
                        <span className="font-bold text-charcoal-900 block truncate">
                          {team.teamLead.name}
                        </span>
                        <span className="text-[10px] text-forest-700 font-medium">
                          {team.teamLead.title || 'Team Lead'}
                        </span>
                      </div>
                    </div>
                    <Badge variant="amber" size="xs">
                      Lead
                    </Badge>
                  </div>
                )}

                {/* Members Avatars preview */}
                <div className="mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sand-500 block mb-1.5">
                    Members ({team.members?.length || 0})
                  </span>
                  <div className="flex items-center -space-x-1.5 overflow-hidden">
                    {(team.members || []).slice(0, 5).map((m) => (
                      <Avatar
                        key={m._id}
                        src={m.avatar}
                        name={m.name}
                        size="sm"
                        className="ring-2 ring-white"
                      />
                    ))}
                    {(team.members?.length || 0) > 5 && (
                      <div className="w-7 h-7 rounded-full bg-sand-200 text-charcoal-800 text-xs font-semibold flex items-center justify-center ring-2 ring-white">
                        +{team.members.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Projects association */}
              <div className="pt-3 border-t border-sand-100 flex items-center justify-between text-xs text-sand-600">
                <span className="flex items-center gap-1 font-medium text-charcoal-700">
                  <FolderKanban className="w-3.5 h-3.5 text-forest-600" />
                  {team.projects?.length || 0} Projects Assigned
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Team Pod"
        subtitle="Organize members into a dedicated engineering or product unit"
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateTeam}
              isLoading={isSubmitting}
              icon={Plus}
            >
              Create Team
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <Input
            label="Team Name"
            placeholder="e.g. Core Architecture Pod"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Responsibilities, scope, tech stack..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="block w-full rounded-lg border border-sand-300 bg-white text-sm text-charcoal-800 focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 p-2.5 shadow-subtle resize-none"
            />
          </div>

          <Select
            label="Team Lead"
            value={formData.teamLead}
            onChange={(e) => setFormData({ ...formData, teamLead: e.target.value })}
            placeholder="Choose Team Lead..."
            options={users.map((u) => ({ value: u._id, label: u.name }))}
            required
          />

          <Select
            label="Brand Color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            options={[
              { value: '#2F6B5F', label: 'Forest Green (#2F6B5F)' },
              { value: '#C86B4A', label: 'Warm Terracotta (#C86B4A)' },
              { value: '#C7A35A', label: 'Muted Gold (#C7A35A)' },
              { value: '#3D7B7F', label: 'Slate Teal (#3D7B7F)' },
            ]}
          />
        </form>
      </Modal>
    </div>
  );
};
