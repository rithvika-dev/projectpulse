import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { activityService } from '../../services/activityService';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Select } from '../../components/common/Select';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { Activity, Clock, Filter, ArrowRight } from 'lucide-react';

export const ActivityPage = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('all');

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await activityService.getActivities({
        entityType: entityFilter !== 'all' ? entityFilter : undefined,
        limit: 100,
      });
      if (res.success) {
        setActivities(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [entityFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-sand-200">
        <div>
          <h2 className="text-2xl font-extrabold text-charcoal-900 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-forest-600" />
            Workspace Activity Stream
          </h2>
          <p className="text-xs text-sand-600 mt-0.5">
            Audit trail of project updates, sprint launches, task transitions, and collaboration events
          </p>
        </div>

        <div className="w-48">
          <Select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            placeholder="Filter: All Events"
            options={[
              { value: 'all', label: 'All Event Types' },
              { value: 'Project', label: 'Projects' },
              { value: 'Sprint', label: 'Sprints' },
              { value: 'Task', label: 'Tasks' },
              { value: 'Milestone', label: 'Milestones' },
              { value: 'Issue', label: 'Issues' },
              { value: 'Comment', label: 'Comments' },
              { value: 'Team', label: 'Teams' },
            ]}
          />
        </div>
      </div>

      {/* Activity Timeline */}
      {loading ? (
        <LoadingState message="Loading audit stream..." />
      ) : activities.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No Activities Logged"
          description="Workspace events will appear here chronologically as team members interact."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-sand-200 p-6 shadow-card">
          <div className="space-y-6">
            {activities.map((act, index) => (
              <div
                key={act._id || index}
                className="flex items-start gap-4 relative pb-6 last:pb-0 border-l-2 border-sand-200 pl-6 last:border-l-0"
              >
                {/* Timeline Dot with Avatar */}
                <div className="absolute -left-3.5 top-0">
                  <Avatar
                    src={act.actor?.avatar}
                    name={act.actor?.name || 'User'}
                    size="xs"
                    className="ring-4 ring-white"
                  />
                </div>

                <div className="flex-1 bg-sand-50/60 p-3.5 rounded-xl border border-sand-200 hover:border-sand-300 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-charcoal-900">
                        {act.actor?.name || 'Team Member'}
                      </span>
                      <Badge size="xs" variant="neutral">
                        {act.entityType}
                      </Badge>
                    </div>

                    <span className="text-[11px] text-sand-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(act.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-charcoal-800 leading-relaxed">
                    {act.description}
                  </p>

                  {act.project && (
                    <div className="mt-2 pt-2 border-t border-sand-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-sand-600">
                        Project: <span className="font-semibold text-charcoal-800">{act.project.name}</span>
                      </span>
                      <button
                        onClick={() => navigate(`/projects/${act.project._id}`)}
                        className="text-forest-600 hover:text-forest-700 font-semibold inline-flex items-center gap-0.5"
                      >
                        View Project <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
