const { body, param } = require('express-validator');
const router = require('express').Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const reportValidation = [
  body('weekStart').isISO8601().withMessage('Valid week start date required'),
  body('weekEnd').isISO8601().withMessage('Valid week end date required'),
  body('project').isMongoId().withMessage('Valid project ID required'),
  body('tasksCompleted').trim().notEmpty().withMessage('Tasks completed is required'),
  body('tasksPlanned').trim().notEmpty().withMessage('Tasks planned is required'),
  body('blockers').optional().trim(),
  body('hoursWorked').optional({ nullable: true }).isFloat({ min: 0 }),
  body('notes').optional().trim(),
  body('status').optional().isIn(['draft', 'submitted']),
];

router.use(protect);

router.get('/my', reportController.getMyReports);
router.get('/team', authorize('manager'), reportController.getTeamReports);
router.get('/:id', param('id').isMongoId(), validate, reportController.getReport);
router.post('/', reportValidation, validate, reportController.createReport);
router.put('/:id', [param('id').isMongoId(), ...reportValidation], validate, reportController.updateReport);
router.delete('/:id', param('id').isMongoId(), validate, reportController.deleteReport);

module.exports = router;
