const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    taskCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    sprint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sprint',
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'],
      default: 'Backlog',
    },
    storyPoints: {
      type: Number,
      default: 1,
      min: 0,
      max: 100,
    },
    dueDate: {
      type: Date,
    },
    labels: [
      {
        type: String,
        trim: true,
      },
    ],
    dependencies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    blockers: [
      {
        type: String,
        trim: true,
      },
    ],
    attachments: [
      {
        name: { type: String, required: true },
        originalName: { type: String },
        path: { type: String, required: true },
        size: { type: Number },
        mimeType: { type: String },
        uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
    estimatedHours: {
      type: Number,
      default: 0,
    },
    loggedHours: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto generate taskCode before save if missing
taskSchema.pre('save', async function (next) {
  if (!this.taskCode) {
    try {
      const Project = mongoose.model('Project');
      const project = await Project.findById(this.project);
      const prefix = project ? project.projectCode : 'TASK';
      const count = await mongoose.model('Task').countDocuments({ project: this.project });
      this.taskCode = `${prefix}-${count + 1}`;
    } catch (e) {
      this.taskCode = `TSK-${Date.now().toString().slice(-4)}`;
    }
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
