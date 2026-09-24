const express = require('express');
const router = express.Router();
const {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createComment);
router.get('/:entityType/:entityId', getComments);
router.route('/:id').put(updateComment).delete(deleteComment);

module.exports = router;
