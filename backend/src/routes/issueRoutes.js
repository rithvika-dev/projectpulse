const express = require('express');
const router = express.Router();
const {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  addAttachment,
  deleteIssue,
} = require('../controllers/issueController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validatorMiddleware');
const {
  createIssueValidator,
  updateIssueValidator,
} = require('../validators/issueValidator');

router.use(protect);

router.route('/').post(createIssueValidator, validate, createIssue).get(getIssues);

router
  .route('/:id')
  .get(getIssueById)
  .put(updateIssueValidator, validate, updateIssue)
  .delete(deleteIssue);

router.post('/:id/attachments', upload.single('file'), addAttachment);

module.exports = router;
