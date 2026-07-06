const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('manager'));
router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;
