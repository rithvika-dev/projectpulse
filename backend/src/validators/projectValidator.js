const { body, param } = require('express-validator');

exports.createProjectValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ min: 2, max: 120 })
    .withMessage('Project name must be between 2 and 120 characters'),
  body('projectCode')
    .trim()
    .notEmpty()
    .withMessage('Project code is required')
    .isLength({ min: 2, max: 10 })
    .withMessage('Project code must be between 2 and 10 uppercase characters')
    .matches(/^[A-Z0-9_-]+$/)
    .withMessage('Project code must only contain uppercase letters, numbers, hyphens, and underscores'),
  body('description').optional().trim(),
  body('projectManager').optional().isMongoId().withMessage('Valid project manager ID required'),
  body('team').optional().isMongoId().withMessage('Valid team ID required'),
  body('status')
    .optional()
    .isIn(['Planning', 'Active', 'On Hold', 'Completed', 'Archived'])
    .withMessage('Invalid project status'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Invalid project priority'),
  body('startDate').optional().isISO8601().withMessage('Valid start date required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date required'),
];

exports.updateProjectValidator = [
  param('id').isMongoId().withMessage('Valid project ID required in URL path'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Project name must be between 2 and 120 characters'),
  body('status')
    .optional()
    .isIn(['Planning', 'Active', 'On Hold', 'Completed', 'Archived'])
    .withMessage('Invalid project status'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Invalid project priority'),
  body('progress')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),
];
