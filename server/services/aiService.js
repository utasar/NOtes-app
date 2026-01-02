const OpenAI = require('openai');
const config = require('../config/config');

class AIService {
    constructor() {
        // Only initialize if API key is provided
        if (config.openai.apiKey && config.openai.apiKey !== '') {
            this.openai = new OpenAI({
                apiKey: config.openai.apiKey
            });
            this.model = config.openai.model;
        } else {
            console.warn('OpenAI API key not configured. AI features will use mock responses.');
            this.openai = null;
        }
    }

    async summarizeNotes(noteContent) {
        if (!this.openai) {
            return this.getMockSummary(noteContent);
        }

        try {
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an educational AI assistant. Summarize the following notes into concise key points.'
                    },
                    {
                        role: 'user',
                        content: `Please summarize these notes:\n\n${noteContent}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('AI Summarization Error:', error.message);
            return this.getMockSummary(noteContent);
        }
    }

    async generateQuestions(noteContent, count = 5, difficulty = 'medium') {
        if (!this.openai) {
            return this.getMockQuestions(noteContent, count);
        }

        try {
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: `You are an educational AI assistant. Generate ${count} ${difficulty} difficulty questions based on the provided notes. Return the questions as a JSON array with format: [{"question": "...", "difficulty": "${difficulty}"}]`
                    },
                    {
                        role: 'user',
                        content: noteContent
                    }
                ],
                temperature: 0.8,
                max_tokens: 800
            });

            const content = response.choices[0].message.content;
            // Try to parse JSON, fallback to text processing if it fails
            try {
                const questions = JSON.parse(content);
                return Array.isArray(questions) ? questions : this.getMockQuestions(noteContent, count);
            } catch {
                // If not JSON, extract questions from text
                return this.extractQuestionsFromText(content, difficulty);
            }
        } catch (error) {
            console.error('AI Question Generation Error:', error.message);
            return this.getMockQuestions(noteContent, count);
        }
    }

    async explainConcept(concept, context = '') {
        if (!this.openai) {
            return this.getMockExplanation(concept);
        }

        try {
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an educational AI assistant. Explain concepts in simple, clear language with practical examples suitable for students.'
                    },
                    {
                        role: 'user',
                        content: `Please explain the concept: "${concept}"${context ? `\n\nContext: ${context}` : ''}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 600
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('AI Explanation Error:', error.message);
            return this.getMockExplanation(concept);
        }
    }

    async generateStudyRecommendations(userProfile, recentNotes) {
        if (!this.openai) {
            return this.getMockRecommendations(userProfile);
        }

        try {
            const profileSummary = `
                Subjects: ${userProfile.subjects?.join(', ') || 'General'}
                Grade Level: ${userProfile.educationLevel || 'Not specified'}
                Weak Areas: ${userProfile.weakAreas?.join(', ') || 'None identified'}
            `;

            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an educational AI assistant. Provide personalized study recommendations based on student profile and recent activity.'
                    },
                    {
                        role: 'user',
                        content: `User Profile:\n${profileSummary}\n\nRecent Topics: ${recentNotes}\n\nProvide study recommendations.`
                    }
                ],
                temperature: 0.8,
                max_tokens: 500
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('AI Recommendations Error:', error.message);
            return this.getMockRecommendations(userProfile);
        }
    }

    async chatWithAI(messages, context = {}) {
        if (!this.openai) {
            return this.getMockChatResponse(messages);
        }

        try {
            const systemMessage = {
                role: 'system',
                content: 'You are GuiderAI, an intelligent educational assistant. Help students learn, clarify concepts, create study plans, and answer questions in a friendly, encouraging manner.'
            };

            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [systemMessage, ...messages],
                temperature: 0.8,
                max_tokens: 800
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('AI Chat Error:', error.message);
            return this.getMockChatResponse(messages);
        }
    }

    // Mock responses for when OpenAI is not configured
    getMockSummary(content) {
        const words = content.split(/\s+/);
        const preview = words.slice(0, 50).join(' ');
        return `Summary: ${preview}...\n\nKey Points:\n- This is a mock summary\n- Configure OpenAI API key for AI-powered summaries\n- The note contains approximately ${words.length} words`;
    }

    getMockQuestions(content, count) {
        const questions = [];
        for (let i = 1; i <= count; i++) {
            questions.push({
                question: `Sample question ${i} based on your notes? (Configure OpenAI API for AI-generated questions)`,
                difficulty: 'medium'
            });
        }
        return questions;
    }

    getMockExplanation(concept) {
        return `Explanation of "${concept}":\n\nThis is a mock explanation. To get AI-powered explanations, please configure your OpenAI API key in the .env file.\n\nThe concept you asked about will be explained in simple terms with practical examples once AI is enabled.`;
    }

    getMockRecommendations(userProfile) {
        return `Study Recommendations:\n\n1. Review your recent notes regularly\n2. Practice with quizzes to reinforce learning\n3. Set daily study goals\n\n(Configure OpenAI API key for personalized AI recommendations)`;
    }

    getMockChatResponse(messages) {
        const lastMessage = messages[messages.length - 1];
        return `I understand you asked: "${lastMessage.content}"\n\nThis is a mock response. To enable full GuiderAI chat capabilities, please configure your OpenAI API key in the .env file.`;
    }

    extractQuestionsFromText(text, difficulty) {
        const lines = text.split('\n').filter(line => line.trim());
        const questions = [];
        
        for (const line of lines) {
            if (line.includes('?') || line.match(/^\d+\./)) {
                questions.push({
                    question: line.replace(/^\d+\.\s*/, '').trim(),
                    difficulty: difficulty
                });
            }
        }
        
        return questions.length > 0 ? questions : this.getMockQuestions(text, 5);
    }
}

module.exports = new AIService();
