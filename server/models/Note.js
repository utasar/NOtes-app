const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        trim: true,
        default: 'Untitled Note'
    },
    content: {
        type: String,
        required: [true, 'Note content is required']
    },
    subject: {
        type: String,
        trim: true
    },
    tags: [String],
    category: {
        type: String,
        enum: ['personal', 'study', 'work', 'research', 'other'],
        default: 'personal'
    },
    aiGenerated: {
        summary: String,
        keyPoints: [String],
        questions: [{
            question: String,
            difficulty: {
                type: String,
                enum: ['easy', 'medium', 'hard']
            }
        }],
        concepts: [{
            term: String,
            explanation: String
        }]
    },
    isShared: {
        type: Boolean,
        default: false
    },
    sharedWith: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        permissions: {
            type: String,
            enum: ['view', 'edit'],
            default: 'view'
        }
    }],
    marketplace: {
        isPublic: { type: Boolean, default: false },
        rating: { type: Number, default: 0 },
        ratingCount: { type: Number, default: 0 },
        downloads: { type: Number, default: 0 }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
noteSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Note', noteSchema);
