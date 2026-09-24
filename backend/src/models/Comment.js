const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ['Task', 'Issue', 'Project'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'entityType',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content cannot be empty'],
      trim: true,
    },
    attachments: [
      {
        name: { type: String },
        path: { type: String },
        size: { type: Number },
        mimeType: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Comment', commentSchema);
