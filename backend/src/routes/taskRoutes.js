const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  addAttachment,
  deleteAttachment,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validatorMiddleware');
const {
  createTaskValidator,
  updateTaskValidator,
  updateTaskStatusValidator,
} = require('../validators/taskValidator');

router.use(protect);

router.route('/').post(createTaskValidator, validate, createTask).get(getTasks);

router
  .route('/:id')
  .get(getTaskById)
  .put(updateTaskValidator, validate, updateTask)
  .delete(deleteTask);

router.patch('/:id/status', updateTaskStatusValidator, validate, updateTaskStatus);
router.post('/:id/attachments', upload.single('file'), addAttachment);
router.delete('/:id/attachments/:attachmentId', deleteAttachment);

module.exports = router;
