const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const quizController = require('../controllers/quizController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation
const quizValidation = [
    body('title')
        .notEmpty()
        .withMessage('Quiz title is required'),
    body('questions')
        .isArray({ min: 1 })
        .withMessage('Quiz must have at least one question'),
    validate
];

// Routes
router.post('/', auth, quizValidation, quizController.createQuiz);
router.post('/generate', auth, quizController.generateQuizFromNotes);
router.get('/', auth, quizController.getQuizzes);
router.get('/public', quizController.getPublicQuizzes);
router.get('/:id', auth, quizController.getQuiz);
router.post('/:id/attempt', auth, quizController.submitQuizAttempt);
router.get('/attempts/history', auth, quizController.getQuizAttempts);
router.post('/:id/share', auth, quizController.shareQuiz);

module.exports = router;
