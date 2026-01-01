# NOtes App - Setup & Usage Guide

## 🚀 Quick Start (No Database Required!)

The app can run immediately without any database setup using an in-memory store:

```bash
# 1. Clone the repository
git clone https://github.com/utasar/NOtes-app.git
cd NOtes-app

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open your browser
# Navigate to http://localhost:3000
```

That's it! The app is running with full functionality using in-memory storage.

## 📋 Prerequisites

- **Node.js** v14 or higher
- **npm** v6 or higher
- **MongoDB** (optional - only for persistent storage)
- **OpenAI API Key** (optional - for AI features)

## 🔧 Configuration Options

### Basic Configuration (Works Out of the Box)

The default `.env` file provides everything needed for development:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=dev-secret-key-change-in-production-12345
```

### Advanced Configuration (Optional)

#### For MongoDB Persistence:

1. Install MongoDB locally or use MongoDB Atlas
2. Update `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/notes-app
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notes-app
```

#### For AI Features:

1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Update `.env`:
```env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

Without an OpenAI key, the app provides mock AI responses for testing.

## 📱 Using the Application

### 1. Registration & Login

**Register a New Account:**
1. Click "Register" on the login screen
2. Enter username, email, and password (min 6 characters)
3. Click "Register"
4. You'll be automatically logged in

**Login to Existing Account:**
1. Enter your email and password
2. Click "Login"

### 2. Creating and Managing Notes

**Create a Note:**
1. Click "Add Note" button
2. Enter a title (optional)
3. Write your content (supports Markdown)
4. Click the save icon to save

**Edit a Note:**
1. Click the edit icon on any note
2. Modify the content
3. Click save icon

**Delete a Note:**
1. Click the trash icon on the note
2. Confirm deletion

### 3. AI Features

Each note has three AI-powered tools:

**1. Summarize (Magic Wand Icon):**
- Click the magic wand icon
- AI generates a concise summary of your note
- Summary appears below the note content

**2. Generate Questions (Question Mark Icon):**
- Click the question mark icon
- AI creates practice questions based on your notes
- Use these questions to test your knowledge

**3. Explain Concepts (Lightbulb Icon):**
- Click the lightbulb icon
- Enter a concept or term from your notes
- AI provides a simple, clear explanation with examples

### 4. Chat with GuiderAI

**Start a Conversation:**
1. Click "GuiderAI" in the header
2. Type your question in the chat box
3. Press Enter or click send
4. GuiderAI responds with helpful information

**GuiderAI can help with:**
- Explaining difficult concepts
- Creating study plans
- Answering questions about your subjects
- Providing learning strategies
- Breaking down complex topics

### 5. Quizzes

**Generate a Quiz:**
1. Go to the "Quizzes" tab
2. Click "Generate from Notes"
3. Select notes to base the quiz on
4. AI creates questions automatically

**Take a Quiz:**
1. Click on any quiz
2. Answer the questions
3. Submit to see your score
4. Review correct answers

### 6. Study Sessions

**Track Study Time:**
1. Go to "Study Sessions" tab
2. Click "Start Study Session"
3. Set your study goals
4. Work on your studies
5. Click "End Session" when done

**View Analytics:**
1. Click "Analytics" in the header
2. See your total study time
3. View subject breakdown
4. Track progress toward goals

### 7. Notes Marketplace

**Share Your Notes:**
1. Open a note
2. Click the share button
3. Your note becomes available to others
4. Users can rate your shared notes

**Find Shared Notes:**
1. Click "Marketplace" in the header
2. Browse public notes
3. Search by subject or keyword
4. Rate notes you find helpful

## 🎨 Features Overview

### Implemented Features:

✅ **User Authentication**
- Secure registration and login
- JWT token-based sessions
- Password encryption

✅ **Smart Notes**
- Create, edit, delete notes
- Markdown support
- Category organization
- Tag system
- Search functionality

✅ **AI-Powered Learning**
- Automatic summarization
- Question generation
- Concept explanations
- Study recommendations
- Chat with GuiderAI

✅ **Practice & Testing**
- AI-generated quizzes
- Quiz attempts tracking
- Scoring and feedback
- Performance analytics

✅ **Study Tracking**
- Study sessions
- Time tracking
- Progress analytics
- Goal setting

✅ **Social Learning**
- Share notes publicly
- Community ratings
- Discover quality content

✅ **Personalization**
- User profiles
- Study pattern analysis
- Customized recommendations
- Preference settings

## 🔐 Security

- Passwords hashed with bcrypt
- JWT authentication tokens
- Input validation on all endpoints
- CORS protection
- Environment variable configuration
- Private user data isolation

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 is busy:
```bash
# Change PORT in .env file
PORT=3001

# Or kill process on port 3000
lsof -ti:3000 | xargs kill
```

### MongoDB Connection Issues

The app works without MongoDB using in-memory storage. If you want persistent storage:

1. Ensure MongoDB is running:
```bash
# Start MongoDB
mongod

# OR use MongoDB service
sudo systemctl start mongod
```

2. Check connection string in `.env`

### AI Features Not Working

Without an OpenAI API key, you'll see mock responses. This is normal for testing. To enable real AI:

1. Get API key from OpenAI
2. Add to `.env` file
3. Restart the server

## 🔄 Development Commands

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Install all dependencies
npm install

# Check for updates
npm outdated
```

## 📊 API Testing

You can test the API using tools like Postman or curl:

```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Create a note (use token from login response)
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"My Note","content":"This is my first note"}'
```

## 💡 Tips for Best Experience

1. **Use Markdown** in notes for better formatting
2. **Categorize notes** by subject for easy organization
3. **Generate questions** regularly to reinforce learning
4. **Chat with GuiderAI** when stuck on concepts
5. **Share quality notes** to help others learn
6. **Track study sessions** to monitor progress
7. **Review analytics** weekly to optimize study habits

## 🆘 Getting Help

For issues, questions, or feature requests:
1. Check this guide first
2. Review the main README.md
3. Open an issue on GitHub
4. Contact the maintainers

## 🎓 Educational Use

This app is perfect for:
- Students organizing class notes
- Self-learners tracking progress
- Study groups sharing resources
- Educators creating study materials
- Anyone wanting to learn more effectively

## 🚀 Next Steps

After getting familiar with the basics:

1. Explore all AI features
2. Create study sessions for different subjects
3. Share your best notes
4. Try creating custom quizzes
5. Use analytics to optimize study time
6. Experiment with GuiderAI for learning assistance

---

**Happy Learning! 📚✨**
