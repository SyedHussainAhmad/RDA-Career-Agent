const express = require('express');
const cors = require('cors');
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] // Update with your production domain
    : ['http://localhost:3001', 'http://localhost:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve static files from frontend-html directory
app.use(express.static(path.join(__dirname, 'frontend-html')));

// Initialize OpenAI
let openai;
try {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY not found in environment variables');
  } else {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('✅ OpenAI client initialized successfully');
  }
} catch (error) {
  console.error('❌ Failed to initialize OpenAI client:', error.message);
}

// Your RDA system prompt (customize this with your 6 months of training)
const SYSTEM_PROMPT = `You are an RDA (Retail Data Architecture) Carrier Reference Offer Database Agent. You help carrier/operator staff search and retrieve reference pricing and offer details from telecom databases.

Key capabilities:
- Search carrier reference offers and pricing
- Retrieve specific offer details and configurations  
- Provide comparative pricing analysis
- Explain telecom product specifications
- Assist with database queries for carrier services
- Understand telecom terminology and industry standards

Always provide accurate, professional responses about carrier offers, pricing structures, and database content. If you don't have specific information, clearly state that and suggest alternatives.

Focus on Pakistani telecom market when relevant, including cities like Karachi, Lahore, Islamabad, etc.

Be helpful, professional, and concise in your responses.`;

// Chat endpoint - matches your frontend expectation
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    // Input validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Message is required and must be a non-empty string' 
      });
    }

    if (message.length > 4000) {
      return res.status(400).json({ 
        error: 'Message too long. Please limit to 4000 characters.' 
      });
    }

    // Check if OpenAI is configured
    if (!openai) {
      return res.status(500).json({ 
        error: 'OpenAI API is not configured. Please check your API key.' 
      });
    }

    const userSessionId = sessionId || 'anonymous';
    console.log(`[${userSessionId}] User: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);

    // Call OpenAI API with better error handling
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // More cost-effective option
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message.trim() }
      ],
      max_tokens: 1500,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    });

    const reply = completion.choices[0].message.content;
    console.log(`[${userSessionId}] Assistant: ${reply.substring(0, 100)}${reply.length > 100 ? '...' : ''}`);

    // Return in format your frontend expects
    res.json({ 
      reply: reply,
      sources: [], // Add sources if you have them
      sessionId: userSessionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Handle different types of OpenAI errors
    if (error.code === 'insufficient_quota') {
      res.status(429).json({ 
        error: 'API quota exceeded. Please add credits to your OpenAI account.',
        code: 'quota_exceeded'
      });
    } else if (error.code === 'invalid_api_key') {
      res.status(401).json({ 
        error: 'Invalid OpenAI API key. Please check your configuration.',
        code: 'invalid_key'
      });
    } else if (error.code === 'rate_limit_exceeded') {
      res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again in a moment.',
        code: 'rate_limit'
      });
    } else if (error.code === 'context_length_exceeded') {
      res.status(400).json({ 
        error: 'Message too long for the model. Please shorten your message.',
        code: 'context_length'
      });
    } else {
      res.status(500).json({ 
        error: 'An unexpected error occurred. Please try again.',
        code: 'server_error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    openai_configured: !!process.env.OPENAI_API_KEY,
    version: '1.0.0'
  };

  res.json(health);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 RDA Carrier Reference Agent Backend',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      chat: '/api/chat (POST)'
    },
    frontend: process.env.NODE_ENV === 'production' 
      ? 'https://your-frontend-domain.com' 
      : 'http://localhost:3001',
    documentation: 'https://github.com/your-repo/carrier-chat'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    available_endpoints: [
      'GET /',
      'GET /api/health',
      'POST /api/chat'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Configured ✅' : 'Missing ❌'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

module.exports = app;

