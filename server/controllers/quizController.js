const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Note = require('../models/Note');
const aiService = require('../services/aiService');

// Create a quiz
exports.createQuiz = async (req, res) => {
    try {
        const { title, subject, difficulty, questions, timeLimit } = req.body;

        const quiz = new Quiz({
            user: req.userId,
            title,
            subject,
            difficulty,
            questions,
            timeLimit
        });

        await quiz.save();

        res.status(201).json({
            message: 'Quiz created successfully',
            quiz
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Generate quiz from notes
exports.generateQuizFromNotes = async (req, res) => {
    try {
        const { noteIds, title, questionCount = 10, difficulty = 'medium' } = req.body;

        // Get the notes
        const notes = await Note.find({
            _id: { $in: noteIds },
            user: req.userId
        });

        if (notes.length === 0) {
            return res.status(404).json({ error: 'No notes found' });
        }

        // Combine note content
        const combinedContent = notes.map(n => n.content).join('\n\n');

        // Generate questions using AI
        const aiQuestions = await aiService.generateQuestions(
            combinedContent,
            questionCount,
            difficulty
        );

        // Convert to quiz format with mock options and answers
        const questions = aiQuestions.map((q, index) => ({
            question: q.question,
            type: 'multiple-choice',
            options: [
                'Option A (Generated)',
                'Option B (Generated)',
                'Option C (Generated)',
                'Option D (Generated)'
            ],
            correctAnswer: 'Option A (Generated)',
            explanation: 'Review the related notes for details',
            points: 1
        }));

        const quiz = new Quiz({
            user: req.userId,
            title: title || 'AI-Generated Quiz',
            subject: notes[0].subject,
            difficulty,
            sourceNotes: noteIds,
            questions,
            timeLimit: questionCount * 2 // 2 minutes per question
        });

        await quiz.save();

        res.status(201).json({
            message: 'Quiz generated successfully',
            quiz
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all quizzes
exports.getQuizzes = async (req, res) => {
    try {
        const { subject, difficulty } = req.query;
        
        const query = { user: req.userId };
        
        if (subject) query.subject = subject;
        if (difficulty) query.difficulty = difficulty;

        const quizzes = await Note.find(query)
            .sort({ createdAt: -1 })
            .select('-questions');

        res.json({ quizzes, count: quizzes.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single quiz
exports.getQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            user: req.userId
        }).populate('sourceNotes', 'title');

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        res.json({ quiz });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Submit quiz attempt
exports.submitQuizAttempt = async (req, res) => {
    try {
        const { answers, timeSpent } = req.body;
        
        const quiz = await Quiz.findOne({
            _id: req.params.id
        });

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Grade the quiz
        let score = 0;
        const gradedAnswers = answers.map((answer, index) => {
            const question = quiz.questions[index];
            const isCorrect = answer.answer === question.correctAnswer;
            const pointsEarned = isCorrect ? question.points : 0;
            score += pointsEarned;

            return {
                questionIndex: index,
                answer: answer.answer,
                isCorrect,
                pointsEarned
            };
        });

        const attempt = new QuizAttempt({
            user: req.userId,
            quiz: quiz._id,
            answers: gradedAnswers,
            score,
            totalPoints: quiz.totalPoints,
            timeSpent
        });

        await attempt.save();

        res.json({
            message: 'Quiz submitted successfully',
            score,
            totalPoints: quiz.totalPoints,
            percentage: attempt.percentage,
            answers: gradedAnswers
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get quiz attempts for a user
exports.getQuizAttempts = async (req, res) => {
    try {
        const attempts = await QuizAttempt.find({ user: req.userId })
            .populate('quiz', 'title subject difficulty')
            .sort({ completedAt: -1 });

        res.json({ attempts, count: attempts.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get public quizzes (marketplace)
exports.getPublicQuizzes = async (req, res) => {
    try {
        const { subject, difficulty, sort = '-marketplace.rating' } = req.query;
        
        const query = { isPublic: true };
        
        if (subject) query.subject = subject;
        if (difficulty) query.difficulty = difficulty;

        const quizzes = await Quiz.find(query)
            .sort(sort)
            .select('-questions')
            .populate('user', 'username');

        res.json({ quizzes, count: quizzes.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Share quiz
exports.shareQuiz = async (req, res) => {
    try {
        const { isPublic } = req.body;
        
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        quiz.isPublic = isPublic;
        await quiz.save();

        res.json({
            message: `Quiz ${isPublic ? 'shared' : 'unshared'} successfully`,
            quiz
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
