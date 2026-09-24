const express = require('express');
const router = express.Router();
const {
  createMilestone,
  getMilestones,
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
} = require('../controllers/milestoneController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const validate = require('../middleware/validatorMiddleware');
const {
  createMilestoneValidator,
  updateMilestoneValidator,
} = require('../validators/milestoneValidator');

router.use(protect);

router
  .route('/')
  .post(
    authorize('organization_admin', 'project_manager', 'team_lead'),
    createMilestoneValidator,
    validate,
    createMilestone
  )
  .get(getMilestones);

router
  .route('/:id')
  .get(getMilestoneById)
  .put(
    authorize('organization_admin', 'project_manager', 'team_lead'),
    updateMilestoneValidator,
    validate,
    updateMilestone
  )
  .delete(authorize('organization_admin', 'project_manager'), deleteMilestone);

module.exports = router;
