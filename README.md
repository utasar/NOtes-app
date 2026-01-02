# NOtes App - AI-Driven Learning Assistant 🎓🤖

Transform your learning experience with **NOtes App**, a powerful AI-driven learning assistant and notes organizer designed to help students study smarter, not harder.

## 🌟 Features

### 1. **AI-Powered Notes Organization**
- **Smart Summarization**: Automatically generate concise summaries of your notes
- **Question Generation**: AI creates practice questions based on your notes to aid studying
- **Concept Explanations**: Get difficult concepts explained in simple terms with clear examples
- **Intelligent Categorization**: Organize notes by subject, tags, and categories

### 2. **Personalized Study Guidance**
- **Adaptive AI**: Learns from your usage patterns and study habits
- **Smart Recommendations**: Get personalized study suggestions based on your profile
- **Subject-Based Materials**: Access tailored material recommendations and syllabus breakdowns
- **Study Reminders**: Receive personalized reminders for effective learning routines
- **Progress Tracking**: Monitor your study patterns and time spent on different subjects

### 3. **Mock Tests and Practice Modules**
- **AI Quiz Generation**: Automatically generate quizzes from your notes
- **Customizable Practice**: Create practice modules based on topics or difficulty levels
- **Instant Feedback**: Get immediate scoring and explanations
- **Performance Analytics**: Track your quiz attempts and improvement over time

### 4. **Secure Backend Infrastructure**
- **MongoDB Database**: Robust data persistence for notes, quizzes, and user profiles
- **User Authentication**: Secure JWT-based authentication system
- **Private Data**: Each user's data is completely private and isolated
- **Multi-Account Support**: Create and manage multiple user accounts

### 5. **AI Training Across Sessions**
- **Context Awareness**: AI remembers your previous questions and interactions
- **Continuous Learning**: System improves responses based on your queries
- **Dynamic Prompts**: Encourages users to provide more information for better assistance
- **Session History**: Access past conversations with GuiderAI

### 6. **Notes Marketplace**
- **Share Resources**: Mark notes and quizzes as public for others to use
- **Rating System**: Community-driven quality control with ratings
- **Discovery**: Search and find high-quality study materials from other users
- **Download Tracking**: See how popular shared resources are

### 7. **GuiderAI - Integrated AI Teacher**
- **Live Chat**: Real-time AI chat for instant answers and clarifications
- **Study Plans**: Get personalized study schedules and plans
- **24/7 Availability**: Always-on virtual teacher for individual learners
- **Topic Clarification**: Ask questions about any concept, anytime

### 8. **Productivity Enhancement**
- **Study Sessions**: Track time spent studying different subjects
- **Goal Setting**: Set and monitor learning objectives
- **Analytics Dashboard**: Visualize your study patterns and progress
- **Achievement Tracking**: Celebrate milestones and learning achievements

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/utasar/NOtes-app.git
   cd NOtes-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/notes-app
   JWT_SECRET=your-secret-key-here
   OPENAI_API_KEY=your-openai-api-key
   ```

4. **Start MongoDB**
   ```bash
   # If running locally
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the app**
   Open your browser and navigate to `http://localhost:3000`

## 📖 Usage Guide

### Creating Your First Note
1. Register for an account or login
2. Click the "Add Note" button
3. Write your notes using Markdown syntax
4. Save your note

### Using AI Features
- **Summarize**: Click the magic wand icon to get an AI summary
- **Generate Questions**: Click the question mark to create practice questions
- **Explain Concepts**: Click the lightbulb to get concept explanations

### Chat with GuiderAI
1. Click the "GuiderAI" button in the header
2. Type your question or request
3. Get instant, intelligent responses
4. Continue the conversation for deeper understanding

### Taking Quizzes
1. Navigate to the Quizzes tab
2. Click "Generate from Notes" to create AI quizzes
3. Take the quiz and get instant feedback
4. Review your performance and track progress

### Study Sessions
1. Go to Study Sessions tab
2. Click "Start Study Session"
3. Set your goals and select subjects
4. Track your time and achievements
5. End the session to update your analytics

## 🏗️ Architecture

### Backend (Node.js + Express)
```
server/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── models/          # Database schemas
├── routes/          # API endpoints
├── middleware/      # Authentication & validation
├── services/        # AI and business logic
└── server.js        # Entry point
```

### Frontend (Vanilla JavaScript)
```
client/
├── index.html       # Main HTML structure
├── style.css        # Styling and responsive design
└── app.js          # Client-side application logic
```

### Database Models
- **User**: User profiles, preferences, and study patterns
- **Note**: User notes with AI-generated content
- **Quiz**: Quiz structure and questions
- **QuizAttempt**: User quiz submissions and scores
- **StudySession**: Study tracking and analytics
- **ChatHistory**: AI conversation history

## 🔒 Security Features

- **Password Hashing**: Bcrypt encryption for user passwords
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Express-validator for request validation
- **CORS Protection**: Configured cross-origin resource sharing
- **Environment Variables**: Sensitive data stored securely
- **Data Isolation**: User data completely private and separated

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Notes
- `POST /api/notes` - Create note
- `GET /api/notes` - Get all user notes
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `POST /api/notes/:id/summarize` - AI summarize
- `POST /api/notes/:id/generate-questions` - AI questions
- `POST /api/notes/:id/explain-concept` - AI explanation

### Quizzes
- `POST /api/quizzes` - Create quiz
- `POST /api/quizzes/generate` - AI generate quiz
- `GET /api/quizzes` - Get user quizzes
- `POST /api/quizzes/:id/attempt` - Submit quiz attempt

### Chat
- `POST /api/chat/message` - Send message to GuiderAI
- `GET /api/chat/history` - Get chat history
- `POST /api/chat/session` - Create chat session

### Study
- `POST /api/study/session` - Start study session
- `PUT /api/study/session/:id/end` - End session
- `GET /api/study/analytics` - Get study analytics
- `GET /api/study/recommendations` - AI recommendations

## 🎨 Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI**: OpenAI GPT-3.5/4 API
- **Authentication**: JWT, Bcryptjs
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Markdown**: Marked.js for note rendering
- **Icons**: Font Awesome

## 🔮 Future Enhancements

- [ ] Offline mode with service workers
- [ ] Rich text editor with formatting tools
- [ ] Mobile app (React Native)
- [ ] Voice-to-text note taking
- [ ] Collaborative study groups
- [ ] Advanced analytics with charts
- [ ] Export notes to PDF
- [ ] Integration with calendar apps
- [ ] Flashcard generation
- [ ] Spaced repetition learning

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- OpenAI for providing the AI capabilities
- The open-source community for amazing tools and libraries
- All contributors and users of NOtes App

## 📧 Support

For support, questions, or feedback, please open an issue on GitHub.

---

**Made with ❤️ for students everywhere. Happy Learning! 📚✨**
