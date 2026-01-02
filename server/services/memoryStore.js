// In-memory data store for development without MongoDB
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

class InMemoryStore {
    constructor() {
        this.users = new Map();
        this.notes = new Map();
        this.quizzes = new Map();
        this.chatHistories = new Map();
        this.studySessions = new Map();
        this.quizAttempts = new Map();
        
        this.counters = {
            users: 0,
            notes: 0,
            quizzes: 0,
            chatHistories: 0,
            studySessions: 0,
            quizAttempts: 0
        };
    }

    // User operations
    async createUser(userData) {
        const { username, email, password, profile = {} } = userData;
        
        // Check if user exists
        for (const user of this.users.values()) {
            if (user.email === email || user.username === username) {
                throw new Error('User already exists');
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = {
            _id: `user_${++this.counters.users}`,
            username,
            email,
            password: hashedPassword,
            profile,
            studyPatterns: {
                totalStudyTime: 0,
                sessionsCount: 0,
                averageSessionDuration: 0,
                preferredSubjects: [],
                weakAreas: []
            },
            preferences: {
                theme: 'light',
                notifications: true,
                aiAssistance: true
            },
            createdAt: new Date(),
            lastActive: new Date()
        };

        this.users.set(user._id, user);
        return user;
    }

    async findUserByEmail(email) {
        for (const user of this.users.values()) {
            if (user.email === email) {
                return user;
            }
        }
        return null;
    }

    async findUserById(id) {
        return this.users.get(id) || null;
    }

    async updateUser(id, updates) {
        const user = this.users.get(id);
        if (!user) return null;
        
        Object.assign(user, updates);
        user.lastActive = new Date();
        return user;
    }

    async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Note operations
    async createNote(noteData) {
        const note = {
            _id: `note_${++this.counters.notes}`,
            ...noteData,
            aiGenerated: {
                summary: '',
                keyPoints: [],
                questions: [],
                concepts: []
            },
            marketplace: {
                isPublic: false,
                rating: 0,
                ratingCount: 0,
                downloads: 0
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.notes.set(note._id, note);
        return note;
    }

    async findNotesByUser(userId, filters = {}) {
        const userNotes = [];
        for (const note of this.notes.values()) {
            if (note.user === userId) {
                let match = true;
                
                if (filters.subject && note.subject !== filters.subject) match = false;
                if (filters.category && note.category !== filters.category) match = false;
                if (filters.search) {
                    const searchLower = filters.search.toLowerCase();
                    const matchesTitle = note.title?.toLowerCase().includes(searchLower);
                    const matchesContent = note.content?.toLowerCase().includes(searchLower);
                    if (!matchesTitle && !matchesContent) match = false;
                }
                
                if (match) userNotes.push(note);
            }
        }
        return userNotes.sort((a, b) => b.updatedAt - a.updatedAt);
    }

    async findNoteById(id) {
        return this.notes.get(id) || null;
    }

    async updateNote(id, updates) {
        const note = this.notes.get(id);
        if (!note) return null;
        
        Object.assign(note, updates);
        note.updatedAt = new Date();
        return note;
    }

    async deleteNote(id) {
        return this.notes.delete(id);
    }

    // Quiz operations
    async createQuiz(quizData) {
        const quiz = {
            _id: `quiz_${++this.counters.quizzes}`,
            ...quizData,
            totalPoints: quizData.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0,
            marketplace: {
                rating: 0,
                ratingCount: 0,
                attempts: 0
            },
            createdAt: new Date()
        };

        this.quizzes.set(quiz._id, quiz);
        return quiz;
    }

    async findQuizzesByUser(userId) {
        const userQuizzes = [];
        for (const quiz of this.quizzes.values()) {
            if (quiz.user === userId) {
                userQuizzes.push(quiz);
            }
        }
        return userQuizzes.sort((a, b) => b.createdAt - a.createdAt);
    }

    async findQuizById(id) {
        return this.quizzes.get(id) || null;
    }

    // Chat operations
    async createChatHistory(chatData) {
        const chat = {
            _id: `chat_${++this.counters.chatHistories}`,
            ...chatData,
            messages: chatData.messages || [],
            context: chatData.context || {},
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.chatHistories.set(chat._id, chat);
        return chat;
    }

    async findChatHistoryById(id) {
        return this.chatHistories.get(id) || null;
    }

    async updateChatHistory(id, updates) {
        const chat = this.chatHistories.get(id);
        if (!chat) return null;
        
        Object.assign(chat, updates);
        chat.updatedAt = new Date();
        return chat;
    }

    // Study session operations
    async createStudySession(sessionData) {
        const session = {
            _id: `session_${++this.counters.studySessions}`,
            ...sessionData,
            aiInteractions: [],
            goals: sessionData.goals || [],
            achievements: [],
            startTime: new Date()
        };

        this.studySessions.set(session._id, session);
        return session;
    }

    async findStudySessionById(id) {
        return this.studySessions.get(id) || null;
    }

    async updateStudySession(id, updates) {
        const session = this.studySessions.get(id);
        if (!session) return null;
        
        Object.assign(session, updates);
        return session;
    }

    async findStudySessionsByUser(userId, filters = {}) {
        const sessions = [];
        for (const session of this.studySessions.values()) {
            if (session.user === userId) {
                let match = true;
                
                if (filters.subject && session.subject !== filters.subject) match = false;
                if (filters.startDate && session.startTime < new Date(filters.startDate)) match = false;
                if (filters.endDate && session.startTime > new Date(filters.endDate)) match = false;
                
                if (match) sessions.push(session);
            }
        }
        return sessions.sort((a, b) => b.startTime - a.startTime);
    }
}

// Export singleton instance
module.exports = new InMemoryStore();
