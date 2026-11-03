const express = require('express');
const router = express.Router({ mergeParams: true }); // importante para recibir projectId
const {
  getIssuesByProject,
  createIssue,
  updateIssue,
  deleteIssue,
} = require('../controllers/issues.controller');

router.get('/', getIssuesByProject);
router.post('/', createIssue);
router.put('/:id', updateIssue);
router.delete('/:id', deleteIssue);

module.exports = router;