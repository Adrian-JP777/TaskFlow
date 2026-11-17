const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
} = require('../controllers/users.controller');

router.get('/', authenticate, requireRole('admin'), getAllUsers);
router.get('/:id', authenticate, getUserProfile);
router.put('/:id', authenticate, updateUserProfile);

module.exports = router;
