const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    answers: [{
        questionIndex: Number,
        answer: String,
        isCorrect: Boolean,
        pointsEarned: Number
    }],
    score: {
        type: Number,
        required: true
    },
    totalPoints: Number,
    percentage: Number,
    timeSpent: Number, // in seconds
    completedAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate percentage before saving
quizAttemptSchema.pre('save', function(next) {
    if (this.totalPoints > 0) {
        this.percentage = (this.score / this.totalPoints) * 100;
    }
    next();
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
