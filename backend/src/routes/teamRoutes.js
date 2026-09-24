const express = require('express');
const router = express.Router();
const {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
} = require('../controllers/teamController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const validate = require('../middleware/validatorMiddleware');
const { createTeamValidator, updateTeamValidator } = require('../validators/teamValidator');

router.use(protect);

router
  .route('/')
  .post(
    authorize('organization_admin', 'project_manager'),
    createTeamValidator,
    validate,
    createTeam
  )
  .get(getTeams);

router
  .route('/:id')
  .get(getTeamById)
  .put(
    authorize('organization_admin', 'project_manager', 'team_lead'),
    updateTeamValidator,
    validate,
    updateTeam
  )
  .delete(authorize('organization_admin'), deleteTeam);

module.exports = router;
