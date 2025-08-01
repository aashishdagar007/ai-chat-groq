import React, { useState, useEffect, useRef } from 'react';
import { Send, Settings, Moon, Sun, Trash2, Key, Cpu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || false;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama-3-70b');
  const [models, setModels] = useState([]);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models');
      const data = await response.json();
      setModels(data.models);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  const setGroqApiKey = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Groq API key');
      return;
    }

    try {
      const response = await fetch('/api/set-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsApiKeySet(true);
        setError('');
        setShowSettings(false);
        setMessages([{
          id: Date.now(),
          role: 'assistant',
          content: '🎉 API key set successfully! You can now start chatting. Ask me anything!'
        }]);
      } else {
        setError(data.error || 'Failed to set API key');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    if (!isApiKeySet) {
      setError('Please set your Groq API key first');
      setShowSettings(true);
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError('');

    const assistantMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: '',
      isStreaming: true
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          model: selectedModel,
          sessionId: 'default'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                throw new Error(data.error);
              }
              
              if (data.content) {
                assistantContent += data.content;
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...msg, content: assistantContent }
                    : msg
                ));
              }
              
              if (data.done) {
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...msg, isStreaming: false }
                    : msg
                ));
              }
            } catch (parseError) {
              console.error('Parse error:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setError(error.message);
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await fetch('/api/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: 'default' }),
      });
      setMessages([]);
      setError('');
    } catch (error) {
      console.error('Clear chat error:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    if (!inline && language) {
      return (
        <SyntaxHighlighter
          style={darkMode ? vscDarkPlus : vs}
          language={language}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      );
    }

    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1>
            <Cpu className="logo-icon" />
            AI Chat - Groq
          </h1>
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            className="model-selector"
            disabled={isLoading}
          >
            {models.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="header-right">
          <button
            onClick={clearChat}
            className="header-btn"
            title="Clear chat"
            disabled={isLoading}
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="header-btn"
            title="Settings"
          >
            <Settings size={18} />
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="header-btn"
            title="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="settings-panel">
          <div className="settings-content">
            <h3><Key size={18} /> API Configuration</h3>
            <div className="api-key-section">
              <input
                type="password"
                placeholder="Enter your Groq API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="api-key-input"
              />
              <button onClick={setGroqApiKey} className="set-key-btn">
                Set Key
              </button>
            </div>
            <p className="api-key-help">
              Get your free API key from{' '}
              <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">
                console.groq.com/keys
              </a>
            </p>
            {isApiKeySet && (
              <div className="api-status">
                ✅ API key is set and ready to use
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <main className="chat-container">
        <div className="messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <h2>👋 Welcome to AI Chat</h2>
              <p>Powered by Groq's lightning-fast inference</p>
              {!isApiKeySet && (
                <div className="setup-prompt">
                  <p>🔑 Please set your Groq API key to get started</p>
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="setup-btn"
                  >
                    <Key size={16} />
                    Set API Key
                  </button>
                </div>
              )}
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="message-header">
                <span className="message-role">
                  {message.role === 'user' ? '👤 You' : '🤖 Assistant'}
                </span>
                {message.isStreaming && (
                  <div className="streaming-indicator">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
              </div>
              <div className="message-content">
                {message.role === 'user' ? (
                  <p>{message.content}</p>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: CodeBlock,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isApiKeySet ? "Type your message..." : "Please set your API key first"}
              disabled={isLoading || !isApiKeySet}
              rows={1}
              className="message-input"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim() || !isApiKeySet}
              className="send-button"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="input-hint">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;