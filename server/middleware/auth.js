const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const memoryStore = require('../services/memoryStore');
const mongoose = require('mongoose');

const isMongoConnected = () => mongoose.connection.readyState === 1;

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'No authentication token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, config.jwt.secret);
        
        let user;
        
        if (!isMongoConnected()) {
            // Use in-memory store
            user = await memoryStore.findUserById(decoded.userId);
        } else {
            // Find user in MongoDB
            user = await User.findById(decoded.userId);
        }
        
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Attach user to request
        req.user = user;
        req.userId = user._id;
        
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

module.exports = auth;
