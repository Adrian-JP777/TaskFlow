const express = require('express');
const router = express.Router({ mergeParams: true });
const { listByIssue } = require('../controllers/activity.controller');

router.get('/', listByIssue);

module.exports = router;