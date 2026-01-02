const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-app';
        
        await mongoose.connect(mongoURI);
        
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        // For development, don't exit - allow app to run without DB
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        } else {
            console.warn('Running in development mode without database connection');
        }
    }
};

module.exports = connectDB;
