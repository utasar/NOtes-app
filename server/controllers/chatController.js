const ChatHistory = require('../models/ChatHistory');
const aiService = require('../services/aiService');

// Get chat history for user
exports.getChatHistory = async (req, res) => {
    try {
        const chatHistory = await ChatHistory.find({ user: req.userId })
            .sort({ updatedAt: -1 })
            .limit(10);

        res.json({ chatHistory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get specific chat session
exports.getChatSession = async (req, res) => {
    try {
        const chatSession = await ChatHistory.findOne({
            _id: req.params.id,
            user: req.userId
        }).populate('context.relatedNotes', 'title');

        if (!chatSession) {
            return res.status(404).json({ error: 'Chat session not found' });
        }

        res.json({ chatSession });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new chat session
exports.createChatSession = async (req, res) => {
    try {
        const { context } = req.body;

        const chatSession = new ChatHistory({
            user: req.userId,
            messages: [],
            context: context || {}
        });

        await chatSession.save();

        res.status(201).json({
            message: 'Chat session created',
            chatSession
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Send message to AI
exports.sendMessage = async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        let chatSession;
        
        if (sessionId) {
            // Use existing session
            chatSession = await ChatHistory.findOne({
                _id: sessionId,
                user: req.userId
            });

            if (!chatSession) {
                return res.status(404).json({ error: 'Chat session not found' });
            }
        } else {
            // Create new session
            chatSession = new ChatHistory({
                user: req.userId,
                messages: [],
                context: {}
            });
        }

        // Add user message
        chatSession.messages.push({
            role: 'user',
            content: message
        });

        // Get AI response
        const aiResponse = await aiService.chatWithAI(
            chatSession.messages.map(m => ({
                role: m.role,
                content: m.content
            })),
            chatSession.context
        );

        // Add AI response
        chatSession.messages.push({
            role: 'assistant',
            content: aiResponse
        });

        await chatSession.save();

        res.json({
            message: 'Message sent successfully',
            response: aiResponse,
            sessionId: chatSession._id
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete chat session
exports.deleteChatSession = async (req, res) => {
    try {
        const chatSession = await ChatHistory.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });

        if (!chatSession) {
            return res.status(404).json({ error: 'Chat session not found' });
        }

        res.json({ message: 'Chat session deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
