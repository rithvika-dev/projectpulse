const { body, param } = require('express-validator');

exports.createTeamValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Team name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Team name must be between 2 and 100 characters'),
  body('teamLead').notEmpty().isMongoId().withMessage('Valid team lead ID required'),
  body('description').optional().trim(),
];

exports.updateTeamValidator = [
  param('id').isMongoId().withMessage('Valid team ID required'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Team name must be between 2 and 100 characters'),
];
