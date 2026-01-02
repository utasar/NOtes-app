const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const memoryStore = require('../services/memoryStore');
const mongoose = require('mongoose');

// Check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

// Register a new user
exports.register = async (req, res) => {
    try {
        const { username, email, password, profile } = req.body;

        if (!isMongoConnected()) {
            // Use in-memory store
            try {
                const user = await memoryStore.createUser({ username, email, password, profile });
                const token = jwt.sign({ userId: user._id }, config.jwt.secret, { expiresIn: config.jwt.expire });
                
                return res.status(201).json({
                    message: 'User registered successfully',
                    token,
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        profile: user.profile
                    }
                });
            } catch (error) {
                return res.status(400).json({ error: error.message });
            }
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ 
                error: 'User with this email or username already exists' 
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            profile: profile || {}
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            config.jwt.secret,
            { expiresIn: config.jwt.expire }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profile: user.profile
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!isMongoConnected()) {
            // Use in-memory store
            const user = await memoryStore.findUserByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const isMatch = await memoryStore.comparePassword(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            user.lastActive = new Date();
            const token = jwt.sign({ userId: user._id }, config.jwt.secret, { expiresIn: config.jwt.expire });

            return res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profile: user.profile,
                    preferences: user.preferences
                }
            });
        }

        // Find user and include password field
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last active
        user.lastActive = Date.now();
        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            config.jwt.secret,
            { expiresIn: config.jwt.expire }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profile: user.profile,
                preferences: user.preferences
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        if (!isMongoConnected()) {
            const user = await memoryStore.findUserById(req.userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            return res.json({
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profile: user.profile,
                    studyPatterns: user.studyPatterns,
                    preferences: user.preferences,
                    createdAt: user.createdAt,
                    lastActive: user.lastActive
                }
            });
        }

        const user = await User.findById(req.userId);
        
        res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profile: user.profile,
                studyPatterns: user.studyPatterns,
                preferences: user.preferences,
                createdAt: user.createdAt,
                lastActive: user.lastActive
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const updates = req.body;
        const allowedUpdates = ['profile', 'preferences'];
        
        if (!isMongoConnected()) {
            const user = await memoryStore.findUserById(req.userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            allowedUpdates.forEach(field => {
                if (updates[field]) {
                    user[field] = { ...user[field], ...updates[field] };
                }
            });

            await memoryStore.updateUser(req.userId, user);

            return res.json({
                message: 'Profile updated successfully',
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profile: user.profile,
                    preferences: user.preferences
                }
            });
        }

        const user = await User.findById(req.userId);
        
        allowedUpdates.forEach(field => {
            if (updates[field]) {
                user[field] = { ...user[field], ...updates[field] };
            }
        });

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profile: user.profile,
                preferences: user.preferences
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
