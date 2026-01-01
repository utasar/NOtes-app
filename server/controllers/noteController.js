const Note = require('../models/Note');
const aiService = require('../services/aiService');

// Create a new note
exports.createNote = async (req, res) => {
    try {
        const { title, content, subject, tags, category } = req.body;

        const note = new Note({
            user: req.userId,
            title,
            content,
            subject,
            tags,
            category
        });

        await note.save();

        res.status(201).json({
            message: 'Note created successfully',
            note
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all notes for the current user
exports.getNotes = async (req, res) => {
    try {
        const { subject, category, search } = req.query;
        
        const query = { user: req.userId };
        
        if (subject) query.subject = subject;
        if (category) query.category = category;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const notes = await Note.find(query)
            .sort({ updatedAt: -1 })
            .select('-aiGenerated.concepts -aiGenerated.questions');

        res.json({ notes, count: notes.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single note
exports.getNote = async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({ note });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a note
exports.updateNote = async (req, res) => {
    try {
        const { title, content, subject, tags, category } = req.body;

        const note = await Note.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        if (title !== undefined) note.title = title;
        if (content !== undefined) note.content = content;
        if (subject !== undefined) note.subject = subject;
        if (tags !== undefined) note.tags = tags;
        if (category !== undefined) note.category = category;

        await note.save();

        res.json({
            message: 'Note updated successfully',
            note
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a note
exports.deleteNote = async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// AI-powered note summarization
exports.summarizeNote = async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        const summary = await aiService.summarizeNotes(note.content);
        
        // Save the summary
        note.aiGenerated.summary = summary;
        await note.save();

        res.json({
            message: 'Summary generated successfully',
            summary
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Generate questions from note
exports.generateQuestions = async (req, res) => {
    try {
        const { count = 5, difficulty = 'medium' } = req.query;
        
        const note = await Note.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        const questions = await aiService.generateQuestions(
            note.content,
            parseInt(count),
            difficulty
        );
        
        // Save the questions
        note.aiGenerated.questions = questions;
        await note.save();

        res.json({
            message: 'Questions generated successfully',
            questions
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Explain a concept from note
exports.explainConcept = async (req, res) => {
    try {
        const { concept } = req.body;
        
        const note = await Note.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        const explanation = await aiService.explainConcept(concept, note.content);

        res.json({
            concept,
            explanation
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Share note
exports.shareNote = async (req, res) => {
    try {
        const { isPublic } = req.body;
        
        const note = await Note.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        note.marketplace.isPublic = isPublic;
        await note.save();

        res.json({
            message: `Note ${isPublic ? 'shared' : 'unshared'} successfully`,
            note
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get public notes (marketplace)
exports.getPublicNotes = async (req, res) => {
    try {
        const { subject, search, sort = '-marketplace.rating' } = req.query;
        
        const query = { 'marketplace.isPublic': true };
        
        if (subject) query.subject = subject;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const notes = await Note.find(query)
            .sort(sort)
            .select('title subject tags marketplace createdAt')
            .populate('user', 'username');

        res.json({ notes, count: notes.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Rate a public note
exports.rateNote = async (req, res) => {
    try {
        const { rating } = req.body;
        
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const note = await Note.findOne({
            _id: req.params.id,
            'marketplace.isPublic': true
        });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        // Calculate new average rating
        const currentTotal = note.marketplace.rating * note.marketplace.ratingCount;
        note.marketplace.ratingCount += 1;
        note.marketplace.rating = (currentTotal + rating) / note.marketplace.ratingCount;

        await note.save();

        res.json({
            message: 'Rating submitted successfully',
            averageRating: note.marketplace.rating,
            ratingCount: note.marketplace.ratingCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
