const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Quiz title is required'],
        trim: true
    },
    subject: String,
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    sourceNotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note'
    }],
    questions: [{
        question: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['multiple-choice', 'true-false', 'short-answer'],
            default: 'multiple-choice'
        },
        options: [String],
        correctAnswer: String,
        explanation: String,
        points: {
            type: Number,
            default: 1
        }
    }],
    totalPoints: Number,
    timeLimit: Number, // in minutes
    isPublic: {
        type: Boolean,
        default: false
    },
    marketplace: {
        rating: { type: Number, default: 0 },
        ratingCount: { type: Number, default: 0 },
        attempts: { type: Number, default: 0 }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate total points before saving
quizSchema.pre('save', function(next) {
    this.totalPoints = this.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    next();
});

module.exports = mongoose.model('Quiz', quizSchema);
