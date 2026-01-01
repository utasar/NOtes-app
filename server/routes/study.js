const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');
const auth = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

// Routes
router.post('/session', auth, studyController.createStudySession);
router.put('/session/:id/end', auth, studyController.endStudySession);
router.get('/sessions', auth, studyController.getStudySessions);
router.get('/recommendations', auth, aiLimiter, studyController.getStudyRecommendations);
router.get('/analytics', auth, studyController.getStudyAnalytics);

module.exports = router;
