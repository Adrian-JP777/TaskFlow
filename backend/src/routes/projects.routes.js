const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projects.controller');

router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', authenticate, requireRole('admin'), createProject);
router.put('/:id', authenticate, requireRole('admin'), updateProject);
router.delete('/:id', authenticate, requireRole('admin'), deleteProject);

module.exports = router;
