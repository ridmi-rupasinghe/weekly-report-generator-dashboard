const { body, param } = require('express-validator');
const router = require('express').Router();
const projectController = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

router.get('/', projectController.getProjects);

router.use(authorize('manager'));

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('description').optional().trim(),
    body('color').optional().isHexColor(),
  ],
  validate,
  projectController.createProject
);

router.put(
  '/:id',
  param('id').isMongoId(),
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('color').optional().isHexColor(),
  validate,
  projectController.updateProject
);

router.delete('/:id', param('id').isMongoId(), validate, projectController.deleteProject);

router.put(
  '/:id/members',
  param('id').isMongoId(),
  body('memberIds').isArray(),
  validate,
  projectController.assignMembers
);

module.exports = router;
