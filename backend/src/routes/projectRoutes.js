const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectTimeline,
  addMember,
  removeMember,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const validate = require('../middleware/validatorMiddleware');
const {
  createProjectValidator,
  updateProjectValidator,
} = require('../validators/projectValidator');

router.use(protect);

router
  .route('/')
  .post(
    authorize('organization_admin', 'project_manager'),
    createProjectValidator,
    validate,
    createProject
  )
  .get(getProjects);

router
  .route('/:id')
  .get(getProjectById)
  .put(
    authorize('organization_admin', 'project_manager', 'team_lead'),
    updateProjectValidator,
    validate,
    updateProject
  )
  .delete(authorize('organization_admin'), deleteProject);

router.get('/:id/timeline', getProjectTimeline);
router.post('/:id/members', authorize('organization_admin', 'project_manager'), addMember);
router.delete('/:id/members/:userId', authorize('organization_admin', 'project_manager'), removeMember);

module.exports = router;
