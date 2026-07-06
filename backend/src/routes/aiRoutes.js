const { body } = require('express-validator');
const router = require('express').Router();
const aiController = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect, authorize('manager'));

router.post(
  '/chat',
  [body('message').trim().notEmpty(), body('history').optional().isArray()],
  validate,
  aiController.chat
);

router.get('/summary', aiController.getTeamSummary);

module.exports = router;
