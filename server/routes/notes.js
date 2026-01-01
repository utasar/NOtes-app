const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const noteController = require('../controllers/noteController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimiter');

// Validation
const noteValidation = [
    body('content')
        .notEmpty()
        .withMessage('Note content is required'),
    validate
];

// Routes
router.post('/', auth, noteValidation, noteController.createNote);
router.get('/', auth, noteController.getNotes);
router.get('/public', noteController.getPublicNotes);
router.get('/:id', auth, noteController.getNote);
router.put('/:id', auth, noteController.updateNote);
router.delete('/:id', auth, noteController.deleteNote);

// AI features with stricter rate limiting
router.post('/:id/summarize', auth, aiLimiter, noteController.summarizeNote);
router.post('/:id/generate-questions', auth, aiLimiter, noteController.generateQuestions);
router.post('/:id/explain-concept', auth, aiLimiter, noteController.explainConcept);

// Sharing features
router.post('/:id/share', auth, noteController.shareNote);
router.post('/:id/rate', auth, noteController.rateNote);

module.exports = router;
