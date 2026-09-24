const { body, param } = require('express-validator');

exports.createIssueValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Issue title is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('project').notEmpty().isMongoId().withMessage('Valid project ID required'),
  body('severity')
    .optional()
    .isIn(['Minor', 'Major', 'Critical', 'Blocker'])
    .withMessage('Invalid severity level'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Invalid priority level'),
  body('status')
    .optional()
    .isIn(['Open', 'In Progress', 'Resolved', 'Closed'])
    .withMessage('Invalid issue status'),
  body('assignee').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage('Valid assignee ID required'),
];

exports.updateIssueValidator = [
  param('id').isMongoId().withMessage('Valid issue ID required'),
  body('severity')
    .optional()
    .isIn(['Minor', 'Major', 'Critical', 'Blocker'])
    .withMessage('Invalid severity level'),
  body('status')
    .optional()
    .isIn(['Open', 'In Progress', 'Resolved', 'Closed'])
    .withMessage('Invalid issue status'),
];
