const { body, param } = require('express-validator');

exports.createSprintValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Sprint name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Sprint name must be between 2 and 100 characters'),
  body('project').notEmpty().isMongoId().withMessage('Valid project ID required'),
  body('startDate').notEmpty().isISO8601().withMessage('Valid start date required'),
  body('endDate').notEmpty().isISO8601().withMessage('Valid end date required'),
  body('goal').optional().trim(),
];

exports.updateSprintValidator = [
  param('id').isMongoId().withMessage('Valid sprint ID required'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('status').optional().isIn(['Planned', 'Active', 'Completed']),
];
