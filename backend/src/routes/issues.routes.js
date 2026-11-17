const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticate, requireRole } = require('../middleware/auth');

const {
  getIssuesByProject,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
} = require('../controllers/issues.controller');

router.get('/', getIssuesByProject);
router.post('/', authenticate, requireRole('admin'), createIssue);
router.get('/:id', getIssueById);
router.put('/:id', authenticate, requireRole('admin'), updateIssue);
router.delete('/:id', authenticate, requireRole('admin'), deleteIssue);

module.exports = router;
