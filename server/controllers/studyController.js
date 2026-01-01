const StudySession = require('../models/StudySession');
const Note = require('../models/Note');
const User = require('../models/User');
const aiService = require('../services/aiService');

// Create study session
exports.createStudySession = async (req, res) => {
    try {
        const { subject, topic, goals } = req.body;

        const session = new StudySession({
            user: req.userId,
            subject,
            topic,
            goals: goals || []
        });

        await session.save();

        res.status(201).json({
            message: 'Study session started',
            session
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// End study session
exports.endStudySession = async (req, res) => {
    try {
        const { achievements } = req.body;

        const session = await StudySession.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!session) {
            return res.status(404).json({ error: 'Study session not found' });
        }

        session.endTime = Date.now();
        session.duration = Math.round((session.endTime - session.startTime) / 60000); // in minutes
        if (achievements) session.achievements = achievements;

        await session.save();

        // Update user study patterns
        const user = await User.findById(req.userId);
        user.studyPatterns.totalStudyTime += session.duration;
        user.studyPatterns.sessionsCount += 1;
        user.studyPatterns.averageSessionDuration = 
            user.studyPatterns.totalStudyTime / user.studyPatterns.sessionsCount;
        
        if (session.subject && !user.studyPatterns.preferredSubjects.includes(session.subject)) {
            user.studyPatterns.preferredSubjects.push(session.subject);
        }

        await user.save();

        res.json({
            message: 'Study session ended',
            session,
            totalStudyTime: user.studyPatterns.totalStudyTime
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get study sessions
exports.getStudySessions = async (req, res) => {
    try {
        const { subject, startDate, endDate } = req.query;
        
        const query = { user: req.userId };
        
        if (subject) query.subject = subject;
        if (startDate || endDate) {
            query.startTime = {};
            if (startDate) query.startTime.$gte = new Date(startDate);
            if (endDate) query.startTime.$lte = new Date(endDate);
        }

        const sessions = await StudySession.find(query)
            .sort({ startTime: -1 })
            .populate('notes', 'title')
            .populate('quizzes', 'title');

        res.json({ sessions, count: sessions.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get study recommendations
exports.getStudyRecommendations = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        // Get recent notes
        const recentNotes = await Note.find({ user: req.userId })
            .sort({ updatedAt: -1 })
            .limit(5)
            .select('subject topic');

        const recentTopics = recentNotes.map(n => n.subject || n.topic).filter(Boolean).join(', ');

        const recommendations = await aiService.generateStudyRecommendations(
            user.profile,
            recentTopics
        );

        res.json({
            recommendations,
            studyPatterns: user.studyPatterns,
            preferredSubjects: user.studyPatterns.preferredSubjects
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get study analytics
exports.getStudyAnalytics = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        // Get recent sessions
        const recentSessions = await StudySession.find({ user: req.userId })
            .sort({ startTime: -1 })
            .limit(30);

        // Calculate analytics
        const analytics = {
            totalStudyTime: user.studyPatterns.totalStudyTime,
            totalSessions: user.studyPatterns.sessionsCount,
            averageSessionDuration: user.studyPatterns.averageSessionDuration,
            preferredSubjects: user.studyPatterns.preferredSubjects,
            recentActivity: recentSessions.map(s => ({
                subject: s.subject,
                duration: s.duration,
                date: s.startTime
            })),
            weeklyGoal: 300, // 5 hours in minutes
            weeklyProgress: 0
        };

        // Calculate weekly progress
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const weekSessions = recentSessions.filter(s => s.startTime >= oneWeekAgo);
        analytics.weeklyProgress = weekSessions.reduce((sum, s) => sum + (s.duration || 0), 0);

        res.json({ analytics });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
