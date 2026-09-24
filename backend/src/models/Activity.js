const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    action: {
      type: String,
      required: true,
      // Examples: 'created_project', 'updated_task_status', 'assigned_task', 'created_issue', 'resolved_issue', 'added_comment', 'started_sprint', 'completed_milestone'
    },
    entityType: {
      type: String,
      enum: [
        'Project',
        'Task',
        'Sprint',
        'Milestone',
        'Issue',
        'Comment',
        'Team',
        'User',
        'Organization',
      ],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

activitySchema.index({ organization: 1, timestamp: -1 });
activitySchema.index({ project: 1, timestamp: -1 });

module.exports = mongoose.model('Activity', activitySchema);
