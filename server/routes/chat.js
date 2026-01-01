const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation
const messageValidation = [
    body('message')
        .notEmpty()
        .withMessage('Message is required'),
    validate
];

// Routes
router.get('/history', auth, chatController.getChatHistory);
router.post('/session', auth, chatController.createChatSession);
router.get('/session/:id', auth, chatController.getChatSession);
router.post('/message', auth, messageValidation, chatController.sendMessage);
router.delete('/session/:id', auth, chatController.deleteChatSession);

module.exports = router;
