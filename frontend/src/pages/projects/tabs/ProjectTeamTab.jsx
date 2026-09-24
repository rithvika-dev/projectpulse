import React, { useState, useEffect } from 'react';
import { projectService } from '../../../services/projectService';
import { reportService } from '../../../services/reportService';
import { authService } from '../../../services/authService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { Avatar } from '../../../components/common/Avatar';
import { Modal } from '../../../components/common/Modal';
import { Select } from '../../../components/common/Select';
import { ProgressBar } from '../../../components/common/ProgressBar';
import { LoadingState } from '../../../components/common/LoadingState';
import { WorkloadChart } from '../../../components/charts/WorkloadChart';
import { Users, UserPlus, Trash2, Mail, Phone, Briefcase } from 'lucide-react';

export const ProjectTeamTab = ({ project, onProjectUpdated }) => {
  const { isPM } = useAuth();
  const { success, error } = useToast();

  const [workload, setWorkload] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const [workloadRes, usersRes] = await Promise.all([
        reportService.getWorkloadReport(project._id),
        authService.getUsers(),
      ]);

      if (workloadRes.success) setWorkload(workloadRes.data || []);
      if (usersRes.success) setAllUsers(usersRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (project?._id) fetchTeamData();
  }, [project?._id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setIsAdding(true);
    try {
      const res = await projectService.addMember(project._id, selectedUserId);
      if (res.success) {
        setIsAddMemberOpen(false);
        setSelectedUserId('');
        if (onProjectUpdated) {
          onProjectUpdated({ ...project, members: res.data });
        }
        fetchTeamData();
        success('Member added to project team');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Remove this member from the project?')) {
      try {
        await projectService.removeMember(project._id, userId);
        if (onProjectUpdated) {
          const updatedMembers = (project.members || []).filter((m) => m._id !== userId);
          onProjectUpdated({ ...project, members: updatedMembers });
        }
        fetchTeamData();
        success('Member removed');
      } catch (err) {
        error('Failed to remove member');
      }
    }
  };

  // Filter available users not already in project
  const memberIds = (project.members || []).map((m) => m._id || m);
  const availableUsers = allUsers.filter((u) => !memberIds.includes(u._id));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Add Member Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-charcoal-900">
            Assigned Team Members & Workload
          </h3>
          <p className="text-xs text-sand-600">
            Capacity management, task distribution, and member allocations
          </p>
        </div>

        {isPM && availableUsers.length > 0 && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddMemberOpen(true)}
            icon={UserPlus}
          >
            Add Member
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingState message="Loading team roster and workload capacity..." />
      ) : (
        <>
          {/* Team Workload Chart */}
          {workload.length > 0 && (
            <div className="bg-white rounded-2xl border border-sand-200 p-5 shadow-card">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-4 pb-2 border-b border-sand-100">
                Team Member Capacity & Story Points Distribution
              </h4>
              <WorkloadChart data={workload} />
            </div>
          )}

          {/* Members Roster Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(project.members || []).map((member) => {
              const userWorkload = workload.find(
                (w) => w.user?._id?.toString() === member._id?.toString()
              );

              return (
                <div
                  key={member._id}
                  className="bg-white rounded-2xl border border-sand-200 p-5 shadow-card flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={member.avatar}
                          name={member.name}
                          size="md"
                        />
                        <div>
                          <h5 className="text-sm font-bold text-charcoal-900">
                            {member.name}
                          </h5>
                          <p className="text-xs text-forest-700 font-medium">
                            {member.title || 'Engineering Pod'}
                          </p>
                        </div>
                      </div>

                      <Badge variant={member.role} size="xs">
                        {member.role?.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs text-sand-600 mb-4">
                      {member.email && (
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-sand-500 flex-shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center gap-1.5 truncate">
                          <Phone className="w-3.5 h-3.5 text-sand-500 flex-shrink-0" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Workload Mini Stats */}
                  <div className="pt-3 border-t border-sand-100">
                    <div className="flex items-center justify-between text-xs text-sand-600 mb-1.5">
                      <span>
                        {userWorkload?.completedTasks || 0} /{' '}
                        {userWorkload?.totalTasks || 0} Tasks Done
                      </span>
                      <span className="font-semibold text-charcoal-800">
                        {userWorkload?.totalPoints || 0} pts
                      </span>
                    </div>
                    <ProgressBar
                      value={userWorkload?.completionRate || 0}
                      size="sm"
                      showLabel={false}
                      variant="auto"
                    />

                    {isPM && member._id !== project.projectManager?._id && (
                      <div className="mt-3 text-right">
                        <button
                          onClick={() => handleRemoveMember(member._id)}
                          className="text-[11px] text-sand-400 hover:text-red-600 inline-flex items-center gap-1 font-medium transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Remove from project
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        title="Add Member to Project"
        subtitle="Select a workspace colleague to participate in this project"
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddMember}
              isLoading={isAdding}
              disabled={!selectedUserId}
              icon={UserPlus}
            >
              Add Colleague
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <Select
            label="Colleague"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            placeholder="Choose workspace member..."
            options={availableUsers.map((u) => ({
              value: u._id,
              label: `${u.name} — ${u.title || u.role}`,
            }))}
            required
          />
        </form>
      </Modal>
    </div>
  );
};
