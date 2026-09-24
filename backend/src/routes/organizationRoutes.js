const express = require('express');
const router = express.Router();
const {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  inviteMember,
  getInvitations,
  removeMember,
  updateMemberRole,
} = require('../controllers/organizationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(protect);

router
  .route('/')
  .post(authorize('organization_admin'), createOrganization)
  .get(getOrganizations);

router
  .route('/:id')
  .get(getOrganizationById)
  .put(authorize('organization_admin'), updateOrganization)
  .delete(authorize('organization_admin'), deleteOrganization);

router.post('/:id/invite', authorize('organization_admin', 'project_manager'), inviteMember);
router.get('/:id/invitations', authorize('organization_admin', 'project_manager'), getInvitations);
router.delete('/:id/members/:userId', authorize('organization_admin'), removeMember);
router.put('/:id/members/:userId/role', authorize('organization_admin'), updateMemberRole);

module.exports = router;
