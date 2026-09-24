const express = require('express');
const router = express.Router();
const {
  getProjectReport,
  getWorkloadReport,
  getSprintReport,
  getOrgOverviewReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/overview', getOrgOverviewReport);
router.get('/project/:projectId', getProjectReport);
router.get('/workload/:projectId', getWorkloadReport);
router.get('/sprint/:sprintId', getSprintReport);

module.exports = router;
