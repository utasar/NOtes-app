# NOtes App - API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:

**Success:**
```json
{
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

**Error:**
```json
{
  "error": "Error message description"
}
```

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "username": "string (min 3 chars)",
  "email": "string (valid email)",
  "password": "string (min 6 chars)",
  "profile": {
    "firstName": "string (optional)",
    "lastName": "string (optional)",
    "grade": "string (optional)",
    "subjects": ["string"] (optional)
  }
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "token": "jwt-token-string",
  "user": {
    "id": "user-id",
    "username": "username",
    "email": "email@example.com",
    "profile": {}
  }
}
```

### Login

Authenticate existing user.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "email@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "token": "jwt-token-string",
  "user": {
    "id": "user-id",
    "username": "username",
    "email": "email@example.com",
    "profile": {},
    "preferences": {}
  }
}
```

### Get Profile

Get current user's profile information.

**Endpoint:** `GET /auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "user": {
    "id": "user-id",
    "username": "username",
    "email": "email@example.com",
    "profile": {},
    "studyPatterns": {
      "totalStudyTime": 0,
      "sessionsCount": 0,
      "averageSessionDuration": 0,
      "preferredSubjects": [],
      "weakAreas": []
    },
    "preferences": {},
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastActive": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Profile

Update user profile information.

**Endpoint:** `PUT /auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "subjects": ["Math", "Science"]
  },
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}
```

**Response:** `200 OK`
```json
{
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

---

## Notes Endpoints

### Create Note

Create a new note.

**Endpoint:** `POST /notes`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "My Study Note",
  "content": "Note content here...",
  "subject": "Mathematics",
  "tags": ["algebra", "equations"],
  "category": "study"
}
```

**Response:** `201 Created`
```json
{
  "message": "Note created successfully",
  "note": {
    "_id": "note-id",
    "title": "My Study Note",
    "content": "Note content here...",
    "subject": "Mathematics",
    "tags": ["algebra", "equations"],
    "category": "study",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get All Notes

Retrieve all notes for the authenticated user.

**Endpoint:** `GET /notes`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `subject` (optional): Filter by subject
- `category` (optional): Filter by category
- `search` (optional): Search in title, content, and tags

**Example:** `GET /notes?subject=Math&search=algebra`

**Response:** `200 OK`
```json
{
  "notes": [
    {
      "_id": "note-id",
      "title": "My Note",
      "content": "...",
      /* ... other note fields */
    }
  ],
  "count": 1
}
```

### Get Single Note

Get details of a specific note.

**Endpoint:** `GET /notes/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "note": {
    "_id": "note-id",
    /* ... full note object including AI-generated content */
  }
}
```

### Update Note

Update an existing note.

**Endpoint:** `PUT /notes/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "subject": "Physics",
  "tags": ["mechanics"],
  "category": "study"
}
```

**Response:** `200 OK`
```json
{
  "message": "Note updated successfully",
  "note": { /* updated note object */ }
}
```

### Delete Note

Delete a note.

**Endpoint:** `DELETE /notes/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Note deleted successfully"
}
```

### Summarize Note (AI)

Generate AI summary of a note.

**Endpoint:** `POST /notes/:id/summarize`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Summary generated successfully",
  "summary": "This note covers the fundamental concepts of..."
}
```

### Generate Questions (AI)

Generate practice questions from note content.

**Endpoint:** `POST /notes/:id/generate-questions`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `count` (optional, default: 5): Number of questions
- `difficulty` (optional, default: medium): easy, medium, or hard

**Example:** `POST /notes/:id/generate-questions?count=10&difficulty=hard`

**Response:** `200 OK`
```json
{
  "message": "Questions generated successfully",
  "questions": [
    {
      "question": "What is the formula for...",
      "difficulty": "medium"
    }
  ]
}
```

### Explain Concept (AI)

Get AI explanation of a concept.

**Endpoint:** `POST /notes/:id/explain-concept`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "concept": "photosynthesis"
}
```

**Response:** `200 OK`
```json
{
  "concept": "photosynthesis",
  "explanation": "Photosynthesis is the process by which..."
}
```

### Share Note

Make a note public or private.

**Endpoint:** `POST /notes/:id/share`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "isPublic": true
}
```

**Response:** `200 OK`
```json
{
  "message": "Note shared successfully",
  "note": { /* updated note */ }
}
```

### Get Public Notes (Marketplace)

Browse publicly shared notes.

**Endpoint:** `GET /notes/public`

**Query Parameters:**
- `subject` (optional): Filter by subject
- `search` (optional): Search term
- `sort` (optional, default: -marketplace.rating): Sort field

**Response:** `200 OK`
```json
{
  "notes": [
    {
      "_id": "note-id",
      "title": "Shared Note",
      "subject": "Math",
      "tags": ["algebra"],
      "marketplace": {
        "rating": 4.5,
        "ratingCount": 10
      },
      "user": {
        "username": "john_doe"
      }
    }
  ],
  "count": 1
}
```

### Rate Note

Rate a public note.

**Endpoint:** `POST /notes/:id/rate`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "rating": 5
}
```

**Response:** `200 OK`
```json
{
  "message": "Rating submitted successfully",
  "averageRating": 4.5,
  "ratingCount": 11
}
```

---

## Quiz Endpoints

### Create Quiz

Create a custom quiz.

**Endpoint:** `POST /quizzes`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Math Quiz",
  "subject": "Mathematics",
  "difficulty": "medium",
  "questions": [
    {
      "question": "What is 2+2?",
      "type": "multiple-choice",
      "options": ["3", "4", "5", "6"],
      "correctAnswer": "4",
      "explanation": "Basic addition",
      "points": 1
    }
  ],
  "timeLimit": 30
}
```

**Response:** `201 Created`
```json
{
  "message": "Quiz created successfully",
  "quiz": { /* quiz object */ }
}
```

### Generate Quiz from Notes (AI)

AI-generate quiz from selected notes.

**Endpoint:** `POST /quizzes/generate`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "noteIds": ["note-id-1", "note-id-2"],
  "title": "Auto-Generated Quiz",
  "questionCount": 10,
  "difficulty": "medium"
}
```

**Response:** `201 Created`
```json
{
  "message": "Quiz generated successfully",
  "quiz": { /* generated quiz */ }
}
```

### Get All Quizzes

Retrieve user's quizzes.

**Endpoint:** `GET /quizzes`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `subject` (optional)
- `difficulty` (optional)

**Response:** `200 OK`
```json
{
  "quizzes": [ /* array of quizzes */ ],
  "count": 5
}
```

### Get Single Quiz

Get quiz details.

**Endpoint:** `GET /quizzes/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "quiz": { /* full quiz with questions */ }
}
```

### Submit Quiz Attempt

Submit answers for grading.

**Endpoint:** `POST /quizzes/:id/attempt`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "answers": [
    { "answer": "4" },
    { "answer": "B" }
  ],
  "timeSpent": 300
}
```

**Response:** `200 OK`
```json
{
  "message": "Quiz submitted successfully",
  "score": 8,
  "totalPoints": 10,
  "percentage": 80,
  "answers": [
    {
      "questionIndex": 0,
      "answer": "4",
      "isCorrect": true,
      "pointsEarned": 1
    }
  ]
}
```

### Get Quiz Attempts History

View past quiz attempts.

**Endpoint:** `GET /quizzes/attempts/history`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "attempts": [
    {
      "_id": "attempt-id",
      "quiz": { "title": "Math Quiz" },
      "score": 8,
      "percentage": 80,
      "completedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 5
}
```

---

## Chat Endpoints (GuiderAI)

### Send Message

Chat with GuiderAI.

**Endpoint:** `POST /chat/message`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "message": "Explain quantum physics in simple terms",
  "sessionId": "session-id (optional)"
}
```

**Response:** `200 OK`
```json
{
  "message": "Message sent successfully",
  "response": "Quantum physics is the study of...",
  "sessionId": "session-id"
}
```

### Get Chat History

Retrieve recent chat sessions.

**Endpoint:** `GET /chat/history`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "chatHistory": [
    {
      "_id": "session-id",
      "messages": [
        { "role": "user", "content": "..." },
        { "role": "assistant", "content": "..." }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Create Chat Session

Start a new chat session.

**Endpoint:** `POST /chat/session`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "context": {
    "subject": "Physics",
    "sessionGoals": ["Understand mechanics"]
  }
}
```

**Response:** `201 Created`
```json
{
  "message": "Chat session created",
  "chatSession": { /* session object */ }
}
```

---

## Study Session Endpoints

### Start Study Session

Begin tracking a study session.

**Endpoint:** `POST /study/session`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "subject": "Mathematics",
  "topic": "Calculus",
  "goals": ["Complete chapter 5", "Solve 10 problems"]
}
```

**Response:** `201 Created`
```json
{
  "message": "Study session started",
  "session": { /* session object */ }
}
```

### End Study Session

Stop tracking and save session.

**Endpoint:** `PUT /study/session/:id/end`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "achievements": ["Completed chapter 5"]
}
```

**Response:** `200 OK`
```json
{
  "message": "Study session ended",
  "session": { /* completed session */ },
  "totalStudyTime": 1200
}
```

### Get Study Sessions

Retrieve study history.

**Endpoint:** `GET /study/sessions`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `subject` (optional)
- `startDate` (optional)
- `endDate` (optional)

**Response:** `200 OK`
```json
{
  "sessions": [ /* array of sessions */ ],
  "count": 10
}
```

### Get Study Recommendations (AI)

Get AI study recommendations.

**Endpoint:** `GET /study/recommendations`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "recommendations": "Based on your study patterns...",
  "studyPatterns": { /* user patterns */ },
  "preferredSubjects": ["Math", "Science"]
}
```

### Get Study Analytics

View study analytics and progress.

**Endpoint:** `GET /study/analytics`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "analytics": {
    "totalStudyTime": 3600,
    "totalSessions": 15,
    "averageSessionDuration": 240,
    "preferredSubjects": ["Math"],
    "recentActivity": [
      {
        "subject": "Math",
        "duration": 60,
        "date": "2024-01-01T00:00:00.000Z"
      }
    ],
    "weeklyGoal": 300,
    "weeklyProgress": 180
  }
}
```

---

## Error Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Default limits (configurable in .env):
- Window: 15 minutes
- Max requests: 100 per window

---

## Testing the API

### Using curl

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'

# Login and save token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}' \
  | jq -r '.token')

# Create note
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Test","content":"My first note"}'
```

### Using JavaScript/Fetch

```javascript
// Login
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@test.com',
    password: 'test123'
  })
});

const { token } = await response.json();

// Create note
await fetch('http://localhost:3000/api/notes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'My Note',
    content: 'Note content here'
  })
});
```

---

For more information, see the main README.md and USAGE_GUIDE.md files.
