const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticate } = require('../middleware/auth');
const {
  createRecommendation,
  getRecommendationsByIssue,
  rateRecommendation,
} = require('../controllers/recommendations.controller');

router.post('/', authenticate, createRecommendation);
router.get('/', getRecommendationsByIssue);
router.post('/:id/rate', authenticate, rateRecommendation);

module.exports = router;
