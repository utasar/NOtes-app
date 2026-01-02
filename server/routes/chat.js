const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimiter');

// Validation
const messageValidation = [
    body('message')
        .notEmpty()
        .withMessage('Message is required'),
    validate
];

// Routes with AI rate limiting
router.get('/history', auth, chatController.getChatHistory);
router.post('/session', auth, chatController.createChatSession);
router.get('/session/:id', auth, chatController.getChatSession);
router.post('/message', auth, aiLimiter, messageValidation, chatController.sendMessage);
router.delete('/session/:id', auth, chatController.deleteChatSession);

module.exports = router;
