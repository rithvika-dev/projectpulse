const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an issue title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    issueCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    severity: {
      type: String,
      enum: ['Minor', 'Major', 'Critical', 'Blocker'],
      default: 'Minor',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
    },
    resolution: {
      type: String,
      default: '',
      trim: true,
    },
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
  },
  {
    timestamps: true,
  }
);

issueSchema.pre('save', async function (next) {
  if (!this.issueCode) {
    try {
      const count = await mongoose.model('Issue').countDocuments({ project: this.project });
      this.issueCode = `ISS-${count + 1}`;
    } catch (e) {
      this.issueCode = `ISS-${Date.now().toString().slice(-4)}`;
    }
  }
  next();
});

module.exports = mongoose.model('Issue', issueSchema);
