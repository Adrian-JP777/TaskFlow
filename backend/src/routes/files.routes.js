const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticate } = require('../middleware/auth');
const upload = require('../config/upload');
const {
  uploadFile,
  getFilesByIssue,
  downloadFile,
} = require('../controllers/files.controller');

router.post('/', authenticate, upload.single('file'), uploadFile);
router.get('/', getFilesByIssue);
router.get('/download/:id', downloadFile);

module.exports = router;
