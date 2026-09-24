const { body, param } = require('express-validator');

exports.createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('project').notEmpty().isMongoId().withMessage('Valid project ID required'),
  body('sprint').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage('Valid sprint ID required'),
  body('assignee').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage('Valid assignee ID required'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Invalid task priority'),
  body('status')
    .optional()
    .isIn(['Backlog', 'To Do', 'In Progress', 'Review', 'Done'])
    .withMessage('Invalid task status'),
  body('storyPoints')
    .optional()
    .isNumeric()
    .withMessage('Story points must be a number'),
];

exports.updateTaskValidator = [
  param('id').isMongoId().withMessage('Valid task ID required'),
  body('status')
    .optional()
    .isIn(['Backlog', 'To Do', 'In Progress', 'Review', 'Done'])
    .withMessage('Invalid task status'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Invalid task priority'),
];

exports.updateTaskStatusValidator = [
  param('id').isMongoId().withMessage('Valid task ID required'),
  body('status')
    .notEmpty()
    .isIn(['Backlog', 'To Do', 'In Progress', 'Review', 'Done'])
    .withMessage('Status must be Backlog, To Do, In Progress, Review, or Done'),
];
