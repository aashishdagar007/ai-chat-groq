const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Store chat sessions in memory (in production, use a database)
const chatSessions = new Map();

// Available models
const MODELS = {
  'llama-3-70b': 'llama3-70b-8192',
  'mixtral-8x7b': 'mixtral-8x7b-32768'
};

// Initialize Groq client
let groq = null;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Set API key endpoint
app.post('/api/set-key', (req, res) => {
  const { apiKey } = req.body;
  
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }

  try {
    groq = new Groq({ apiKey });
    res.json({ success: true, message: 'API key set successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid API key format' });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { message, model = 'llama-3-70b', sessionId = 'default' } = req.body;

  if (!groq) {
    return res.status(400).json({ error: 'API key not set. Please set your Groq API key first.' });
  }

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!MODELS[model]) {
    return res.status(400).json({ error: 'Invalid model selected' });
  }

  try {
    // Get or create chat session
    if (!chatSessions.has(sessionId)) {
      chatSessions.set(sessionId, []);
    }

    const chatHistory = chatSessions.get(sessionId);
    
    // Add user message to history
    chatHistory.push({ role: 'user', content: message });

    // Keep only last 10 messages (5 exchanges) for context
    const contextMessages = chatHistory.slice(-10);

    // Set up SSE headers for streaming
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    let assistantMessage = '';

    try {
      // Create chat completion with streaming
      const stream = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses. When showing code, use proper formatting.'
          },
          ...contextMessages
        ],
        model: MODELS[model],
        temperature: 0.7,
        max_tokens: 4096,
        stream: true,
      });

      // Stream the response
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          assistantMessage += content;
          res.write(`data: ${JSON.stringify({ content, done: false })}\n\n`);
        }
      }

      // Add assistant message to history
      chatHistory.push({ role: 'assistant', content: assistantMessage });

      // Send completion signal
      res.write(`data: ${JSON.stringify({ content: '', done: true })}\n\n`);
      res.end();

    } catch (streamError) {
      console.error('Streaming error:', streamError);
      res.write(`data: ${JSON.stringify({ error: 'Error generating response', done: true })}\n\n`);
      res.end();
    }

  } catch (error) {
    console.error('Chat error:', error);
    
    let errorMessage = 'An error occurred while processing your request';
    
    if (error.status === 401) {
      errorMessage = 'Invalid API key. Please check your Groq API key.';
    } else if (error.status === 429) {
      errorMessage = 'Rate limit exceeded. Please try again later.';
    } else if (error.message?.includes('network')) {
      errorMessage = 'Network error. Please check your connection.';
    }

    res.status(error.status || 500).json({ error: errorMessage });
  }
});

// Clear chat history endpoint
app.post('/api/clear', (req, res) => {
  const { sessionId = 'default' } = req.body;
  chatSessions.delete(sessionId);
  res.json({ success: true, message: 'Chat history cleared' });
});

// Get available models
app.get('/api/models', (req, res) => {
  res.json({
    models: Object.keys(MODELS).map(key => ({
      id: key,
      name: key === 'llama-3-70b' ? 'Llama 3 70B' : 'Mixtral 8x7B',
      model: MODELS[key]
    }))
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});