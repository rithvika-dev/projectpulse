import React from 'react';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { Calendar, Flag, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const ProjectTimeline = ({ milestones = [], sprints = [], project }) => {
  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-white rounded-xl border border-sand-200 p-5 shadow-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-forest-600" />
            Project Roadmap & Delivery Schedule
          </h4>
          <p className="text-xs text-sand-600 mt-0.5">
            {project?.startDate
              ? `Started on ${new Date(project.startDate).toLocaleDateString()}`
              : ''}
            {project?.endDate
              ? ` · Target delivery by ${new Date(project.endDate).toLocaleDateString()}`
              : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="forest" size="md">
            {milestones.filter((m) => m.status === 'Completed').length} / {milestones.length}{' '}
            Milestones Reached
          </Badge>
          <Badge variant="amber" size="md">
            {sprints.filter((s) => s.status === 'Active').length} Active Sprint
          </Badge>
        </div>
      </div>

      {/* Sprints Timeline Section */}
      <div className="bg-white rounded-xl border border-sand-200 p-6 shadow-card">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-sand-200">
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-charcoal-900">
              Sprint Iteration Cycles
            </h5>
            <p className="text-xs text-sand-500">Cadence and current sprint objectives</p>
          </div>
          <span className="text-xs font-semibold text-sand-600">
            {sprints.length} Total Sprints
          </span>
        </div>

        {sprints.length > 0 ? (
          <div className="space-y-4">
            {sprints.map((sprint, idx) => {
              const isActive = sprint.status === 'Active';
              const isCompleted = sprint.status === 'Completed';

              return (
                <div
                  key={sprint._id || idx}
                  className={`relative pl-6 pb-6 border-l-2 last:border-l-0 last:pb-0 ${
                    isActive
                      ? 'border-forest-500'
                      : isCompleted
                      ? 'border-emerald-400'
                      : 'border-sand-300'
                  }`}
                >
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                      isActive
                        ? 'border-forest-600 ring-4 ring-forest-100'
                        : isCompleted
                        ? 'border-emerald-600 bg-emerald-50'
                        : 'border-sand-400'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                  </div>

                  <div className="bg-sand-50/70 border border-sand-200 rounded-xl p-4 hover:border-sand-300 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <h6 className="text-sm font-bold text-charcoal-900">
                          {sprint.name}
                        </h6>
                        <Badge size="xs" variant={sprint.status}>
                          {sprint.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-sand-600 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {new Date(sprint.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          –{' '}
                          {new Date(sprint.endDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {sprint.goal && (
                      <p className="text-xs text-charcoal-700 italic mb-3">
                        "{sprint.goal}"
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-sand-600 pt-2 border-t border-sand-200/60">
                      <span>{sprint.tasks?.length || 0} Deliverables</span>
                      {sprint.progressPercentage !== undefined && (
                        <span className="font-semibold text-charcoal-800">
                          {sprint.progressPercentage}% Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-sand-500 italic text-center py-4">
            No sprint iterations created for this project yet.
          </p>
        )}
      </div>

      {/* Major Milestones Schedule */}
      <div className="bg-white rounded-xl border border-sand-200 p-6 shadow-card">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-sand-200">
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-charcoal-900 flex items-center gap-1.5">
              <Flag className="w-4 h-4 text-terracotta-600" />
              Key Milestones & Deliverables
            </h5>
            <p className="text-xs text-sand-500">Critical deliverables and deadlines</p>
          </div>
          <span className="text-xs font-semibold text-sand-600">
            {milestones.length} Milestones
          </span>
        </div>

        {milestones.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestones.map((m) => {
              const isOverdue =
                m.dueDate &&
                new Date(m.dueDate) < new Date() &&
                m.status !== 'Completed';

              return (
                <div
                  key={m._id}
                  className="bg-sand-50/70 border border-sand-200 rounded-xl p-4 hover:shadow-subtle transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h6 className="text-sm font-bold text-charcoal-900 leading-snug">
                      {m.title}
                    </h6>
                    <Badge size="xs" variant={m.status}>
                      {m.status}
                    </Badge>
                  </div>

                  {m.description && (
                    <p className="text-xs text-sand-600 line-clamp-2 mb-3 leading-relaxed">
                      {m.description}
                    </p>
                  )}

                  {/* Progress bar */}
                  <div className="w-full bg-sand-200 rounded-full h-1.5 mb-3 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        m.status === 'Completed' ? 'bg-forest-500' : 'bg-amberGold-500'
                      }`}
                      style={{ width: `${m.progress || 0}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-sand-200/60 text-xs">
                    <div className="flex items-center gap-1.5">
                      {isOverdue ? (
                        <span className="flex items-center gap-1 text-terracotta-600 font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Due {new Date(m.dueDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-sand-600">
                          Due {new Date(m.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {m.owner && (
                      <div className="flex items-center gap-1.5">
                        <Avatar
                          src={m.owner.avatar}
                          name={m.owner.name}
                          size="xs"
                        />
                        <span className="text-xs text-charcoal-700 truncate max-w-[100px]">
                          {m.owner.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-sand-500 italic text-center py-4">
            No milestones configured for this project yet.
          </p>
        )}
      </div>
    </div>
  );
};
