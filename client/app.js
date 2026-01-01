// API Configuration
const API_BASE = window.location.origin + '/api';

// Global state
let authToken = localStorage.getItem('authToken');
let currentUser = null;
let currentChatSession = null;

// DOM Elements
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const authSubmit = document.getElementById('authSubmit');
const toggleAuth = document.getElementById('toggleAuth');
const usernameField = document.getElementById('usernameField');
const app = document.getElementById('app');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        loadUserProfile();
    } else {
        showAuthModal();
    }

    setupEventListeners();
});

// Authentication
function showAuthModal() {
    authModal.classList.remove('hidden');
    app.classList.add('hidden');
}

function hideAuthModal() {
    authModal.classList.add('hidden');
    app.classList.remove('hidden');
}

let isLoginMode = true;

toggleAuth.addEventListener('click', function toggleAuthMode(e) {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
        authSubmit.textContent = 'Login';
        document.getElementById('authTitle').textContent = 'Welcome to NOtes App';
        document.getElementById('authSwitch').innerHTML = 
            'Don\'t have an account? <a href="#" id="toggleAuth">Register</a>';
        usernameField.classList.add('hidden');
    } else {
        authSubmit.textContent = 'Register';
        document.getElementById('authTitle').textContent = 'Create Account';
        document.getElementById('authSwitch').innerHTML = 
            'Already have an account? <a href="#" id="toggleAuth">Login</a>';
        usernameField.classList.remove('hidden');
    }
    
    // Re-attach event listener
    document.getElementById('toggleAuth').addEventListener('click', toggleAuthMode);
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;

    try {
        const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
        const body = isLoginMode 
            ? { email, password }
            : { email, password, username };

        const response = await fetch(API_BASE + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            hideAuthModal();
            loadNotes();
            showNotification(data.message, 'success');
        } else {
            showNotification(data.error || 'Authentication failed', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
    }
});

async function loadUserProfile() {
    try {
        const response = await apiCall('/auth/profile');
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            hideAuthModal();
            loadNotes();
        } else {
            localStorage.removeItem('authToken');
            authToken = null;
            showAuthModal();
        }
    } catch (error) {
        showAuthModal();
    }
}

function logout() {
    localStorage.removeItem('authToken');
    authToken = null;
    currentUser = null;
    showAuthModal();
    showNotification('Logged out successfully', 'success');
}

// API Helper
async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    return fetch(API_BASE + endpoint, {
        ...options,
        headers
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Logout
    document.getElementById('logout')?.addEventListener('click', logout);

    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Notes
    document.getElementById('add')?.addEventListener('click', () => addNewNote());
    document.getElementById('searchNotes')?.addEventListener('input', debounce(searchNotes, 300));
    document.getElementById('filterCategory')?.addEventListener('change', loadNotes);

    // Chat
    document.getElementById('openChat')?.addEventListener('click', openChat);
    document.getElementById('closeChat')?.addEventListener('click', closeChat);
    document.getElementById('sendMessage')?.addEventListener('click', sendChatMessage);
    document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    // Quizzes
    document.getElementById('generateQuiz')?.addEventListener('click', generateQuizFromNotes);

    // Analytics
    document.getElementById('studyAnalytics')?.addEventListener('click', showAnalytics);
}

// Tab Switching
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');

    if (tabName === 'notes') loadNotes();
    if (tabName === 'quizzes') loadQuizzes();
    if (tabName === 'study') loadStudySessions();
}

// Notes Management
async function loadNotes() {
    try {
        const category = document.getElementById('filterCategory')?.value || '';
        const search = document.getElementById('searchNotes')?.value || '';
        
        let queryParams = [];
        if (category) queryParams.push(`category=${category}`);
        if (search) queryParams.push(`search=${search}`);
        
        const query = queryParams.length ? '?' + queryParams.join('&') : '';
        const response = await apiCall(`/notes${query}`);
        
        if (response.ok) {
            const data = await response.json();
            displayNotes(data.notes);
        }
    } catch (error) {
        console.error('Error loading notes:', error);
    }
}

function displayNotes(notes) {
    const container = document.getElementById('notesContainer');
    container.innerHTML = '';

    if (notes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: white;">No notes yet. Create your first note!</p>';
        return;
    }

    notes.forEach(note => {
        const noteElement = createNoteElement(note);
        container.appendChild(noteElement);
    });
}

function createNoteElement(noteData = null) {
    const note = document.createElement('div');
    note.classList.add('note');
    note.dataset.id = noteData?._id || '';

    note.innerHTML = `
        <div class="tools">
            <div class="tool-group">
                <button class="ai-summarize" title="Summarize"><i class="fas fa-magic"></i></button>
                <button class="ai-questions" title="Generate Questions"><i class="fas fa-question"></i></button>
                <button class="ai-explain" title="Explain Concept"><i class="fas fa-lightbulb"></i></button>
            </div>
            <div class="tool-group">
                <button class="edit"><i class="fas fa-edit"></i></button>
                <button class="save hidden"><i class="fas fa-save"></i></button>
                <button class="delete"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
        <div class="note-header">
            <input type="text" class="note-title" placeholder="Note Title" value="${noteData?.title || ''}" />
        </div>
        <div class="main ${noteData?.content ? '' : 'hidden'}"></div>
        <textarea class="${noteData?.content ? 'hidden' : ''}" placeholder="Write your notes here...">${noteData?.content || ''}</textarea>
        <div class="ai-section hidden"></div>
    `;

    const editBtn = note.querySelector('.edit');
    const saveBtn = note.querySelector('.save');
    const deleteBtn = note.querySelector('.delete');
    const main = note.querySelector('.main');
    const textArea = note.querySelector('textarea');
    const titleInput = note.querySelector('.note-title');

    if (noteData?.content) {
        main.innerHTML = marked(noteData.content);
    }

    // Edit/Save toggle
    editBtn.addEventListener('click', () => {
        main.classList.toggle('hidden');
        textArea.classList.toggle('hidden');
        editBtn.classList.toggle('hidden');
        saveBtn.classList.toggle('hidden');
    });

    saveBtn.addEventListener('click', async () => {
        await saveNote(note);
        main.classList.toggle('hidden');
        textArea.classList.toggle('hidden');
        editBtn.classList.toggle('hidden');
        saveBtn.classList.toggle('hidden');
    });

    deleteBtn.addEventListener('click', () => deleteNote(note));

    textArea.addEventListener('input', (e) => {
        main.innerHTML = marked(e.target.value);
    });

    // AI Features
    note.querySelector('.ai-summarize').addEventListener('click', () => summarizeNote(note));
    note.querySelector('.ai-questions').addEventListener('click', () => generateQuestions(note));
    note.querySelector('.ai-explain').addEventListener('click', () => explainConcept(note));

    if (!noteData) {
        // New note - show textarea
        textArea.classList.remove('hidden');
        saveBtn.classList.remove('hidden');
        editBtn.classList.add('hidden');
    }

    return note;
}

function addNewNote() {
    const container = document.getElementById('notesContainer');
    const noteElement = createNoteElement();
    container.insertBefore(noteElement, container.firstChild);
}

async function saveNote(noteElement) {
    const title = noteElement.querySelector('.note-title').value;
    const content = noteElement.querySelector('textarea').value;
    const noteId = noteElement.dataset.id;

    if (!content.trim()) {
        showNotification('Note content cannot be empty', 'error');
        return;
    }

    try {
        const method = noteId ? 'PUT' : 'POST';
        const endpoint = noteId ? `/notes/${noteId}` : '/notes';
        
        const response = await apiCall(endpoint, {
            method,
            body: JSON.stringify({ title, content, category: 'study' })
        });

        if (response.ok) {
            const data = await response.json();
            noteElement.dataset.id = data.note._id;
            showNotification(data.message, 'success');
        } else {
            const data = await response.json();
            showNotification(data.error || 'Failed to save note', 'error');
        }
    } catch (error) {
        showNotification('Network error', 'error');
    }
}

async function deleteNote(noteElement) {
    const noteId = noteElement.dataset.id;
    
    if (!noteId) {
        noteElement.remove();
        return;
    }

    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
        const response = await apiCall(`/notes/${noteId}`, { method: 'DELETE' });
        
        if (response.ok) {
            noteElement.remove();
            showNotification('Note deleted successfully', 'success');
        }
    } catch (error) {
        showNotification('Failed to delete note', 'error');
    }
}

// AI Features
async function summarizeNote(noteElement) {
    const noteId = noteElement.dataset.id;
    if (!noteId) {
        showNotification('Please save the note first', 'warning');
        return;
    }

    try {
        showNotification('Generating summary...', 'info');
        const response = await apiCall(`/notes/${noteId}/summarize`, { method: 'POST' });
        
        if (response.ok) {
            const data = await response.json();
            showAIResult(noteElement, 'Summary', data.summary);
        }
    } catch (error) {
        showNotification('Failed to generate summary', 'error');
    }
}

async function generateQuestions(noteElement) {
    const noteId = noteElement.dataset.id;
    if (!noteId) {
        showNotification('Please save the note first', 'warning');
        return;
    }

    try {
        showNotification('Generating questions...', 'info');
        const response = await apiCall(`/notes/${noteId}/generate-questions`, { method: 'POST' });
        
        if (response.ok) {
            const data = await response.json();
            const questionsHTML = data.questions.map((q, i) => 
                `<p><strong>Q${i + 1}:</strong> ${q.question}</p>`
            ).join('');
            showAIResult(noteElement, 'Practice Questions', questionsHTML);
        }
    } catch (error) {
        showNotification('Failed to generate questions', 'error');
    }
}

async function explainConcept(noteElement) {
    const concept = prompt('Enter the concept you want explained:');
    if (!concept) return;

    const noteId = noteElement.dataset.id;
    if (!noteId) {
        showNotification('Please save the note first', 'warning');
        return;
    }

    try {
        showNotification('Explaining concept...', 'info');
        const response = await apiCall(`/notes/${noteId}/explain-concept`, {
            method: 'POST',
            body: JSON.stringify({ concept })
        });
        
        if (response.ok) {
            const data = await response.json();
            showAIResult(noteElement, `Explanation: ${concept}`, data.explanation);
        }
    } catch (error) {
        showNotification('Failed to explain concept', 'error');
    }
}

function showAIResult(noteElement, title, content) {
    const aiSection = noteElement.querySelector('.ai-section');
    aiSection.innerHTML = `
        <h4><i class="fas fa-robot"></i> ${title}</h4>
        <div style="white-space: pre-wrap;">${content}</div>
    `;
    aiSection.classList.remove('hidden');
}

// Chat with GuiderAI
function openChat() {
    document.getElementById('chatModal').classList.remove('hidden');
    if (!currentChatSession) {
        loadChatHistory();
    }
}

function closeChat() {
    document.getElementById('chatModal').classList.add('hidden');
}

async function loadChatHistory() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '<div class="chat-message assistant">Hello! I\'m GuiderAI, your learning assistant. How can I help you today?</div>';
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;

    const messagesContainer = document.getElementById('chatMessages');
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user';
    userMsg.textContent = message;
    messagesContainer.appendChild(userMsg);
    
    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        const response = await apiCall('/chat/message', {
            method: 'POST',
            body: JSON.stringify({ 
                message,
                sessionId: currentChatSession 
            })
        });

        if (response.ok) {
            const data = await response.json();
            currentChatSession = data.sessionId;
            
            // Add AI response
            const aiMsg = document.createElement('div');
            aiMsg.className = 'chat-message assistant';
            aiMsg.textContent = data.response;
            messagesContainer.appendChild(aiMsg);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    } catch (error) {
        showNotification('Failed to send message', 'error');
    }
}

// Quizzes
async function loadQuizzes() {
    const container = document.getElementById('quizzesContainer');
    container.innerHTML = '<p style="text-align: center; color: white;">Quiz features coming soon! Generate quizzes from your notes.</p>';
}

async function generateQuizFromNotes() {
    showNotification('Quiz generation feature - select notes and generate practice quizzes!', 'info');
}

// Study Sessions
async function loadStudySessions() {
    const container = document.getElementById('studyContainer');
    container.innerHTML = '<p style="text-align: center; color: white;">Track your study sessions and progress here.</p>';
}

async function showAnalytics() {
    showNotification('View your study analytics and progress tracking!', 'info');
}

// Utility Functions
function searchNotes() {
    loadNotes();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type = 'info') {
    // Simple notification - can be enhanced with a proper notification library
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#9ec862' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
