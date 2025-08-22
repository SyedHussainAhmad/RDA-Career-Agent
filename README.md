# RDA Carrier Reference Agent

A full-stack chat application for telecom carrier reference queries, built with Node.js/Express backend and your choice of frontend technology.

## 🚀 Features

- **AI-Powered Chat**: OpenAI GPT-4 integration for intelligent responses
- **Telecom Focus**: Specialized for Pakistani carrier/operator queries
- **Real-time Chat**: Responsive chat interface with typing indicators
- **Error Handling**: Comprehensive error handling and user feedback
- **Session Management**: Unique session tracking for conversations
- **Responsive Design**: Works on desktop and mobile devices
- **Multiple Frontend Options**: Choose between React or pure HTML/CSS/JS

## 📁 Project Structure

```
carrier-chat-main/
├── server.js              # Express server with OpenAI integration
├── package.json           # Backend dependencies
├── .env.example           # Environment variables template
├── frontend/              # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── index.css      # React styling
│   │   └── main.jsx       # React entry point
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.js     # Vite configuration
│   └── .env               # Frontend environment variables
├── frontend-html/         # Pure HTML/CSS/JS frontend
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styling
│   ├── script.js          # JavaScript functionality
│   └── README.md          # HTML frontend documentation
└── README.md              # This file
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

### Backend Setup

1. **Navigate to the project root:**
   ```bash
   cd carrier-chat-main
   ```

2. **Install backend dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables in `.env`:**
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=5000
   NODE_ENV=development
   ```

5. **Start the backend server:**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Or production mode
   npm start
   ```

   The backend will run on `http://localhost:5000`

## 🎨 Frontend Options

You can choose between two frontend implementations:

### Option 1: HTML/CSS/JavaScript Frontend (Recommended for Simplicity)

**Advantages:**
- No build process required
- Works directly in any browser
- Smaller file size
- Easier to customize
- No dependencies

**Setup:**
1. The HTML frontend is automatically served by the backend
2. Start the backend server (see above)
3. Open `http://localhost:5000` in your browser

**Independent serving:**
```bash
cd frontend-html
python -m http.server 8000
# Then open http://localhost:8000
```

### Option 2: React Frontend (Advanced)

**Advantages:**
- Modern React development
- Component-based architecture
- Hot module replacement
- Advanced tooling

**Setup:**
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:3001`

## 🚀 Quick Start

### For HTML Frontend (Easiest):
```bash
# 1. Install backend dependencies
npm install

# 2. Create .env file and add your OpenAI API key
cp .env.example .env
# Edit .env and add: OPENAI_API_KEY=your_key_here

# 3. Start the server
npm start

# 4. Open http://localhost:5000 in your browser
```

### For React Frontend:
```bash
# Terminal 1: Start backend
npm install
cp .env.example .env
# Edit .env and add your OpenAI API key
npm start

# Terminal 2: Start React frontend
cd frontend
npm install
npm run dev

# Open http://localhost:3001 in your browser
```

## 🔧 Configuration

### Backend Configuration

- **Port**: Default 5000, configurable via `PORT` environment variable
- **CORS**: Configured for development (localhost:3000, localhost:3001)
- **OpenAI Model**: Uses `gpt-4o-mini` for cost efficiency
- **Rate Limiting**: Built-in error handling for API limits

### Frontend Configuration

#### HTML Frontend
- **API URL**: Configured in `frontend-html/script.js`
- **Settings**: Customizable in the `CONFIG` object

#### React Frontend
- **API URL**: Configured via `VITE_API_BASE_URL` in `frontend/.env`
- **Development Port**: 3001 (configurable in `vite.config.js`)
- **Proxy**: API requests proxied to backend during development

## 🎯 Usage

1. **Start the backend server**
2. **Choose and start your preferred frontend**
3. **Open the application in your browser**
4. **Start chatting with the RDA agent**

### Example Queries

- "What are the current data plans for Karachi?"
- "Compare Jazz and Telenor pricing for unlimited packages"
- "Show me enterprise solutions for Lahore businesses"
- "What are the roaming charges for Dubai?"

## 🔍 API Endpoints

### Backend Endpoints

- `GET /` - Serves HTML frontend and API information
- `GET /api/health` - Health check endpoint
- `POST /api/chat` - Chat with the AI agent

#### Chat API Request Format

```json
{
  "message": "Your question here",
  "sessionId": "optional_session_id"
}
```

#### Chat API Response Format

```json
{
  "reply": "AI response",
  "sources": [],
  "sessionId": "session_id",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🚨 Error Handling

The application includes comprehensive error handling:

- **Network errors**: Connection issues with backend
- **API errors**: OpenAI API quota, rate limits, invalid keys
- **Validation errors**: Invalid input format or length
- **Server errors**: Internal server issues

## 🔒 Security Features

- **CORS protection**: Configured origins for security
- **Input validation**: Message length and format validation
- **Error sanitization**: Sensitive error details hidden in production
- **Rate limiting**: Built-in OpenAI rate limit handling
- **XSS protection**: All user input properly escaped

## 🎨 Customization

### HTML Frontend Styling

The HTML frontend uses custom CSS with:
- **Modern design**: Professional gradients and animations
- **Responsive layout**: Mobile-friendly design
- **Customizable colors**: Easy to modify color scheme
- **Smooth animations**: Fade-in effects and typing indicators

### React Frontend Styling

The React frontend uses:
- **Custom CSS**: Professional chat interface design
- **Component-based**: Modular styling approach
- **Responsive design**: Mobile-optimized layout

### System Prompt

The AI system prompt can be customized in `server.js`:

```javascript
const SYSTEM_PROMPT = `Your custom system prompt here...`;
```

## 📱 Mobile Support

Both frontends are fully responsive and support:

- **Touch interactions**: Optimized for mobile devices
- **Responsive layout**: Adapts to different screen sizes
- **iOS compatibility**: Prevents zoom on input focus
- **Android support**: Optimized for Android browsers

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**:
   - Check if port 5000 is available
   - Verify OpenAI API key is set
   - Check Node.js version (v16+)

2. **Frontend can't connect to backend**:
   - Ensure backend is running on port 5000
   - Check CORS configuration
   - Verify API URL in frontend configuration

3. **OpenAI API errors**:
   - Check API key validity
   - Verify account has credits
   - Check rate limits

4. **HTML frontend not loading**:
   - Check browser console for errors
   - Verify all files are served correctly
   - Clear browser cache

### Debug Mode

- **Backend**: Set `NODE_ENV=development` for detailed error messages
- **HTML Frontend**: Open browser developer tools and check console
- **React Frontend**: Error messages displayed in development mode

## 🚀 Deployment

### Backend Deployment

The backend is ready for deployment to platforms like:
- Heroku
- Railway
- Render
- DigitalOcean
- AWS

### Frontend Deployment

#### HTML Frontend
- Can be deployed to any static hosting service
- Or served directly by the backend (recommended)

#### React Frontend
- Build with `npm run build`
- Deploy the `dist/` folder to static hosting
- Or integrate with backend by copying to `public/` folder

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with both frontends
5. Submit a pull request

## 📞 Support

For issues and questions:

- Check the troubleshooting section
- Review error messages in browser console
- Check backend logs for API errors
- Refer to frontend-specific README files

---

**Built with ❤️ for Pakistani Telecom Industry**

Choose the frontend that best fits your needs:
- **HTML/CSS/JS**: For simplicity and direct browser compatibility
- **React**: For modern development and advanced features

