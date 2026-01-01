const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: String,
    topic: String,
    duration: Number, // in minutes
    notes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note'
    }],
    quizzes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    }],
    aiInteractions: [{
        query: String,
        response: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    goals: [String],
    achievements: [String],
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: Date
});

module.exports = mongoose.model('StudySession', studySessionSchema);
