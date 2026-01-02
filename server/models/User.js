const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    profile: {
        firstName: String,
        lastName: String,
        grade: String,
        subjects: [String],
        educationLevel: String,
        learningPreferences: {
            studyTimePreference: String,
            difficultyLevel: String,
            learningStyle: String
        }
    },
    studyPatterns: {
        totalStudyTime: { type: Number, default: 0 },
        sessionsCount: { type: Number, default: 0 },
        averageSessionDuration: { type: Number, default: 0 },
        preferredSubjects: [String],
        weakAreas: [String]
    },
    preferences: {
        theme: { type: String, default: 'light' },
        notifications: { type: Boolean, default: true },
        aiAssistance: { type: Boolean, default: true }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
