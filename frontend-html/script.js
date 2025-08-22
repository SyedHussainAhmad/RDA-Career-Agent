// Configuration
const CONFIG = {
    API_BASE_URL: 'http://localhost:5000',
    MAX_MESSAGE_LENGTH: 4000,
    TYPING_DELAY: 1000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 2000
};

// Application state
const state = {
    messages: [],
    isLoading: false,
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    retryCount: 0
};

// DOM elements
const elements = {
    messagesContainer: null,
    messageInput: null,
    sendButton: null,
    typingIndicator: null,
    errorDisplay: null,
    errorMessage: null,
    dismissError: null,
    clearButton: null,
    charCounter: null,
    connectionStatus: null,
    statusText: null,
    loadingOverlay: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    checkBackendHealth();
    focusInput();
    
    // Hide loading overlay
    setTimeout(() => {
        hideLoadingOverlay();
    }, 1000);
});

// Initialize DOM element references
function initializeElements() {
    elements.messagesContainer = document.getElementById('messages-container');
    elements.messageInput = document.getElementById('message-input');
    elements.sendButton = document.getElementById('send-button');
    elements.typingIndicator = document.getElementById('typing-indicator');
    elements.errorDisplay = document.getElementById('error-display');
    elements.errorMessage = document.getElementById('error-message');
    elements.dismissError = document.getElementById('dismiss-error');
    elements.clearButton = document.getElementById('clear-chat');
    elements.charCounter = document.getElementById('char-counter');
    elements.connectionStatus = document.getElementById('connection-status');
    elements.statusText = document.getElementById('status-text');
    elements.loadingOverlay = document.getElementById('loading-overlay');
}

// Setup event listeners
function setupEventListeners() {
    // Send button click
    elements.sendButton.addEventListener('click', handleSendMessage);
    
    // Input field events
    elements.messageInput.addEventListener('input', handleInputChange);
    elements.messageInput.addEventListener('keydown', handleKeyDown);
    elements.messageInput.addEventListener('paste', handlePaste);
    
    // Clear chat button
    elements.clearButton.addEventListener('click', handleClearChat);
    
    // Dismiss error button
    elements.dismissError.addEventListener('click', hideError);
    
    // Example query clicks
    document.addEventListener('click', function(e) {
        if (e.target.closest('.example-queries li')) {
            const query = e.target.textContent.replace('💡 ', '');
            elements.messageInput.value = query;
            handleInputChange();
            elements.messageInput.focus();
        }
    });
    
    // Auto-resize textarea
    elements.messageInput.addEventListener('input', autoResizeTextarea);
}

// Handle input changes
function handleInputChange() {
    const value = elements.messageInput.value;
    const length = value.length;
    
    // Update character counter
    elements.charCounter.textContent = `${length}/${CONFIG.MAX_MESSAGE_LENGTH}`;
    
    // Update counter styling
    elements.charCounter.className = 'char-counter';
    if (length > CONFIG.MAX_MESSAGE_LENGTH * 0.8) {
        elements.charCounter.classList.add('warning');
    }
    if (length > CONFIG.MAX_MESSAGE_LENGTH * 0.95) {
        elements.charCounter.classList.add('danger');
    }
    
    // Enable/disable send button
    const canSend = value.trim().length > 0 && length <= CONFIG.MAX_MESSAGE_LENGTH && !state.isLoading;
    elements.sendButton.disabled = !canSend;
}

// Handle keyboard events
function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!elements.sendButton.disabled) {
            handleSendMessage();
        }
    }
}

// Handle paste events
function handlePaste(e) {
    setTimeout(() => {
        handleInputChange();
        autoResizeTextarea();
    }, 0);
}

// Auto-resize textarea
function autoResizeTextarea() {
    const textarea = elements.messageInput;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

// Handle send message
async function handleSendMessage() {
    const message = elements.messageInput.value.trim();
    if (!message || state.isLoading) return;
    
    // Add user message
    addMessage('user', message);
    
    // Clear input
    elements.messageInput.value = '';
    elements.messageInput.style.height = 'auto';
    handleInputChange();
    
    // Show typing indicator
    showTypingIndicator();
    
    // Hide error if visible
    hideError();
    
    // Send to API
    try {
        state.isLoading = true;
        const response = await sendToAPI(message);
        
        hideTypingIndicator();
        addMessage('assistant', response.reply, response.sources);
        state.retryCount = 0;
        
    } catch (error) {
        hideTypingIndicator();
        handleAPIError(error, message);
    } finally {
        state.isLoading = false;
        handleInputChange();
    }
}

// Send message to API
async function sendToAPI(message) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                sessionId: state.sessionId
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new APIError(response.status, errorData.error || `HTTP ${response.status}`, errorData.code);
        }
        
        return await response.json();
        
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new APIError(408, 'Request timed out. Please try again.', 'timeout');
        }
        
        if (error instanceof APIError) {
            throw error;
        }
        
        // Network error
        throw new APIError(0, 'Cannot connect to server. Please check if the backend is running.', 'network');
    }
}

// Custom API Error class
class APIError extends Error {
    constructor(status, message, code) {
        super(message);
        this.status = status;
        this.code = code;
        this.name = 'APIError';
    }
}

// Handle API errors
function handleAPIError(error, originalMessage) {
    let errorMessage = 'Sorry, something went wrong. Please try again.';
    let canRetry = false;
    
    if (error instanceof APIError) {
        switch (error.code) {
            case 'timeout':
                errorMessage = 'Request timed out. Please try again.';
                canRetry = true;
                break;
            case 'network':
                errorMessage = 'Cannot connect to server. Please check if the backend is running.';
                updateConnectionStatus(false);
                break;
            case 'quota_exceeded':
                errorMessage = 'API quota exceeded. Please add credits to your OpenAI account.';
                break;
            case 'invalid_key':
                errorMessage = 'Authentication error. Please check the API configuration.';
                break;
            case 'rate_limit':
                errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
                canRetry = true;
                break;
            case 'context_length':
                errorMessage = 'Message too long for the model. Please shorten your message.';
                break;
            default:
                errorMessage = error.message || errorMessage;
                canRetry = error.status >= 500; // Server errors can be retried
        }
    } else {
        console.error('Unexpected error:', error);
        canRetry = true;
    }
    
    // Show error message
    addMessage('error', errorMessage);
    showError(errorMessage);
    
    // Auto-retry for certain errors
    if (canRetry && state.retryCount < CONFIG.RETRY_ATTEMPTS) {
        state.retryCount++;
        setTimeout(() => {
            if (confirm(`Retry attempt ${state.retryCount}/${CONFIG.RETRY_ATTEMPTS}. Try sending the message again?`)) {
                elements.messageInput.value = originalMessage;
                handleInputChange();
                handleSendMessage();
            }
        }, CONFIG.RETRY_DELAY);
    }
}

// Add message to chat
function addMessage(role, content, sources = []) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${role}`;
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let messageHTML = `<div>${escapeHtml(content)}</div>`;
    
    if (sources && sources.length > 0) {
        messageHTML += `<div class="message-timestamp">Sources: ${sources.join(', ')}</div>`;
    }
    
    messageHTML += `<div class="message-timestamp">${timestamp}</div>`;
    
    messageElement.innerHTML = messageHTML;
    
    // Remove welcome message if it exists
    const welcomeMessage = elements.messagesContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    elements.messagesContainer.appendChild(messageElement);
    scrollToBottom();
    
    // Store in state
    state.messages.push({ role, content, timestamp: new Date().toISOString(), sources });
}

// Show/hide typing indicator
function showTypingIndicator() {
    elements.typingIndicator.classList.remove('hidden');
    scrollToBottom();
}

function hideTypingIndicator() {
    elements.typingIndicator.classList.add('hidden');
}

// Show/hide error
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorDisplay.classList.remove('hidden');
}

function hideError() {
    elements.errorDisplay.classList.add('hidden');
}

// Show/hide loading overlay
function showLoadingOverlay() {
    elements.loadingOverlay.classList.remove('hidden');
}

function hideLoadingOverlay() {
    elements.loadingOverlay.classList.add('hidden');
}

// Clear chat
function handleClearChat() {
    if (state.messages.length === 0) return;
    
    if (confirm('Are you sure you want to clear the conversation?')) {
        elements.messagesContainer.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">💬</div>
                <h3>Welcome to RDA Carrier Reference Agent</h3>
                <p>I can help you with carrier offers, pricing, and telecom database queries. Ask me anything about Pakistani telecom services!</p>
                <div class="example-queries">
                    <p><strong>Try asking:</strong></p>
                    <ul>
                        <li>"What are the current data plans for Karachi?"</li>
                        <li>"Compare Jazz and Telenor pricing"</li>
                        <li>"Show me enterprise solutions for Lahore"</li>
                    </ul>
                </div>
            </div>
        `;
        
        state.messages = [];
        hideError();
        focusInput();
    }
}

// Scroll to bottom
function scrollToBottom() {
    setTimeout(() => {
        elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
    }, 100);
}

// Focus input
function focusInput() {
    setTimeout(() => {
        elements.messageInput.focus();
    }, 100);
}

// Update connection status
function updateConnectionStatus(isOnline) {
    if (isOnline) {
        elements.connectionStatus.className = 'status-dot online';
        elements.statusText.textContent = 'Connected';
    } else {
        elements.connectionStatus.className = 'status-dot offline';
        elements.statusText.textContent = 'Disconnected';
    }
}

// Check backend health
async function checkBackendHealth() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/health`, {
            method: 'GET',
            timeout: 5000
        });
        
        if (response.ok) {
            updateConnectionStatus(true);
        } else {
            updateConnectionStatus(false);
        }
    } catch (error) {
        updateConnectionStatus(false);
        console.warn('Backend health check failed:', error.message);
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Utility function to format text with basic markdown-like formatting
function formatMessage(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
}

// Periodic health check
setInterval(checkBackendHealth, 30000); // Check every 30 seconds

// Handle page visibility change
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        checkBackendHealth();
    }
});

// Handle online/offline events
window.addEventListener('online', function() {
    checkBackendHealth();
});

window.addEventListener('offline', function() {
    updateConnectionStatus(false);
    showError('You are offline. Please check your internet connection.');
});

// Export for debugging (optional)
if (typeof window !== 'undefined') {
    window.ChatApp = {
        state,
        elements,
        CONFIG,
        sendToAPI,
        addMessage,
        clearChat: handleClearChat,
        checkHealth: checkBackendHealth
    };
}

