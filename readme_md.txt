# 🚀 AI Chat - Groq

A modern, lightning-fast AI chat application powered by Groq's high-performance inference engine. Built with React and Node.js, featuring real-time streaming responses, dark/light themes, and support for multiple AI models.

## ✨ Features

- **⚡ Lightning Fast**: Powered by Groq's ultra-fast inference
- **🔄 Real-time Streaming**: See responses generate in real-time
- **🎨 Modern UI**: Clean, responsive design with dark/light themes
- **💬 Multiple Models**: Choose between Llama 3 70B and Mixtral 8x7B
- **🎯 Code Highlighting**: Automatic syntax highlighting for code blocks
- **📱 Mobile Friendly**: Fully responsive design
- **💾 Chat Memory**: Maintains context for natural conversations
- **🔒 Secure**: API keys handled client-side, no server storage

## 🛠️ Tech Stack

- **Frontend**: React 18, CSS3, Prism.js
- **Backend**: Node.js, Express
- **AI**: Groq SDK (groq-sdk)
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 16+ and npm
- Free Groq API key from [console.groq.com](https://console.groq.com/keys)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-chat-groq.git
cd ai-chat-groq
```

### 2. Install Dependencies

```bash
npm run install-all
```

### 3. Environment Setup

```bash
# Copy the example environment file
cp server/.env.example server/.env

# Edit the .env file and add your Groq API key
# GROQ_API_KEY=your_groq_api_key_here
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📁 Project Structure

```
ai-chat-groq/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styling
│   │   └── index.js       # React entry point
│   └── package.json
├── server/                 # Node.js backend
│   ├── server.js          # Express server
│   ├── .env.example       # Environment template
│   └── package.json
├── vercel.json            # Vercel deployment config
├── package.json           # Root package.json
└── README.md
```

## 🔧 Configuration

### Available Models

- **Llama 3 70B**: Best for complex reasoning and detailed responses
- **Mixtral 8x7B**: Great balance of speed and capability

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GROQ_API_KEY` | Your Groq API key | Required |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |

## 🌐 Deployment

### Deploy to Vercel (Recommended)

#### Method 1: GitHub Integration (Easiest)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ai-chat-groq.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the configuration
   - Click "Deploy"

3. **Configure Environment**:
   - In Vercel dashboard, go to Project Settings
   - Navigate to "Environment Variables"
   - Add `GROQ_API_KEY` with your API key
   - Redeploy if necessary

#### Method 2: Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login and Deploy**:
   ```bash
   vercel login
   vercel --prod
   ```

3. **Set Environment Variables**:
   ```bash
   vercel env add GROQ_API_KEY
   # Enter your Groq API key when prompted
   ```

### Alternative Deployment Options

#### Railway

1. Connect your GitHub repository to Railway
2. Set `GROQ_API_KEY` environment variable
3. Deploy with automatic builds

#### Netlify (Frontend Only)

For frontend-only deployment with client-side API calls:

1. Build the client: `cd client && npm run build`
2. Deploy the `build` folder to Netlify
3. Users enter their API keys directly in the app

#### Heroku

1. Create a Heroku app
2. Set buildpacks for Node.js
3. Configure environment variables
4. Deploy via Git

## 🔑 Getting Your Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy and use in your environment setup

**Free Tier Limits**:
- 30 requests per minute
- 6,000 tokens per minute
- Perfect for development and light usage

## 🎯 Usage Tips

1. **Model Selection**: Use Llama 3 70B for complex tasks, Mixtral 8x7B for faster responses
2. **Context**: The app remembers the last 10 messages for context
3. **Code Blocks**: Use markdown code blocks for syntax highlighting
4. **Keyboard Shortcuts**: 
   - Enter: Send message
   - Shift+Enter: New line

## 🐛 Troubleshooting

### Common Issues

**API Key Issues**:
- Ensure your Groq API key is valid and active
- Check if you've exceeded rate limits
- Verify the key is properly set in environment variables

**CORS Errors**:
- Make sure the backend proxy is running
- Check that API calls are going through the backend, not directly to Groq

**Build Errors**:
- Run `npm run install-all` to ensure all dependencies are installed
- Check Node.js version (16+ required)
- Clear node_modules and reinstall if needed

**Deployment Issues**:
- Verify all environment variables are set in production
- Check build logs for specific error messages
- Ensure vercel.json configuration is correct

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Groq](https://groq.com) for providing ultra-fast AI inference
- [React](https://reactjs.org) for the frontend framework
- [Prism.js](https://prismjs.com) for code syntax highlighting
- [Lucide](https://lucide.dev) for beautiful icons

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/YOUR_USERNAME/ai-chat-groq/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**Made with ❤️ and ⚡ by the AI Chat Team**