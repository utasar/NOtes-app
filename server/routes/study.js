const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');
const auth = require('../middleware/auth');

// Routes
router.post('/session', auth, studyController.createStudySession);
router.put('/session/:id/end', auth, studyController.endStudySession);
router.get('/sessions', auth, studyController.getStudySessions);
router.get('/recommendations', auth, studyController.getStudyRecommendations);
router.get('/analytics', auth, studyController.getStudyAnalytics);

module.exports = router;
