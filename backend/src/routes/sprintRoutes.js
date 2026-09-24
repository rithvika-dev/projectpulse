const express = require('express');
const router = express.Router();
const {
  createSprint,
  getSprints,
  getSprintById,
  updateSprint,
  startSprint,
  completeSprint,
  deleteSprint,
} = require('../controllers/sprintController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const validate = require('../middleware/validatorMiddleware');
const {
  createSprintValidator,
  updateSprintValidator,
} = require('../validators/sprintValidator');

router.use(protect);

router
  .route('/')
  .post(
    authorize('organization_admin', 'project_manager', 'team_lead'),
    createSprintValidator,
    validate,
    createSprint
  )
  .get(getSprints);

router
  .route('/:id')
  .get(getSprintById)
  .put(
    authorize('organization_admin', 'project_manager', 'team_lead'),
    updateSprintValidator,
    validate,
    updateSprint
  )
  .delete(authorize('organization_admin', 'project_manager'), deleteSprint);

router.post(
  '/:id/start',
  authorize('organization_admin', 'project_manager', 'team_lead'),
  startSprint
);
router.post(
  '/:id/complete',
  authorize('organization_admin', 'project_manager', 'team_lead'),
  completeSprint
);

module.exports = router;
