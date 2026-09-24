const { body, param } = require('express-validator');

exports.createMilestoneValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Milestone title is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Title must be between 2 and 150 characters'),
  body('project').notEmpty().isMongoId().withMessage('Valid project ID required'),
  body('dueDate').notEmpty().isISO8601().withMessage('Valid due date required'),
  body('status')
    .optional()
    .isIn(['Not Started', 'In Progress', 'Completed', 'Delayed'])
    .withMessage('Invalid milestone status'),
];

exports.updateMilestoneValidator = [
  param('id').isMongoId().withMessage('Valid milestone ID required'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 }),
  body('status')
    .optional()
    .isIn(['Not Started', 'In Progress', 'Completed', 'Delayed']),
];
