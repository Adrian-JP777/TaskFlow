const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  listMine,
  unreadCount,
  markRead,
  markAllRead,
} = require('../controllers/notifications.controller');

router.get('/', authenticate, listMine);
router.get('/unread-count', authenticate, unreadCount);
router.post('/:id/read', authenticate, markRead);
router.post('/read-all', authenticate, markAllRead);

module.exports = router;