# HTML/CSS/JavaScript Frontend

This is a pure HTML, CSS, and JavaScript frontend for the RDA Carrier Reference Agent chat application. It provides the same functionality as the React version but without any build tools or frameworks.

## 🚀 Features

- **Pure Web Technologies**: Built with vanilla HTML, CSS, and JavaScript
- **No Build Process**: Ready to run directly in any web browser
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Chat**: Interactive chat interface with typing indicators
- **Error Handling**: Comprehensive error handling and user feedback
- **Connection Status**: Real-time backend connection monitoring
- **Auto-retry**: Automatic retry for failed requests
- **Accessibility**: Keyboard navigation and screen reader friendly

## 📁 File Structure

```
frontend-html/
├── index.html          # Main HTML file
├── styles.css          # All CSS styling
├── script.js           # JavaScript functionality
└── README.md           # This documentation
```

## 🛠️ Setup Instructions

### Option 1: Serve via Backend (Recommended)

The backend server is configured to serve the HTML frontend automatically.

1. **Start the backend server:**
   ```bash
   cd carrier-chat-main
   npm start
   ```

2. **Open your browser to:**
   ```
   http://localhost:5000
   ```

The HTML frontend will be served directly by the backend server.

### Option 2: Serve Independently

You can also serve the HTML frontend independently using any web server.

1. **Using Python (if installed):**
   ```bash
   cd frontend-html
   python -m http.server 8000
   ```
   Then open: `http://localhost:8000`

2. **Using Node.js http-server:**
   ```bash
   npm install -g http-server
   cd frontend-html
   http-server -p 8000
   ```
   Then open: `http://localhost:8000`

3. **Using any other web server:**
   Point your web server to serve files from the `frontend-html` directory.

**Note:** When serving independently, make sure the backend is running on `http://localhost:5000` for the API calls to work.

## ⚙️ Configuration

### API Endpoint

The frontend is configured to connect to the backend at `http://localhost:5000`. To change this:

1. Open `script.js`
2. Modify the `CONFIG.API_BASE_URL` value:
   ```javascript
   const CONFIG = {
       API_BASE_URL: 'http://your-backend-url:port',
       // ... other config
   };
   ```

### Other Settings

You can customize various settings in the `CONFIG` object in `script.js`:

```javascript
const CONFIG = {
    API_BASE_URL: 'http://localhost:5000',
    MAX_MESSAGE_LENGTH: 4000,           // Maximum message length
    TYPING_DELAY: 1000,                 // Typing indicator delay
    RETRY_ATTEMPTS: 3,                  // Number of retry attempts
    RETRY_DELAY: 2000                   // Delay between retries
};
```

## 🎨 Customization

### Styling

All styles are contained in `styles.css`. The design uses:

- **CSS Grid and Flexbox**: For responsive layouts
- **CSS Custom Properties**: For easy color theming
- **CSS Animations**: For smooth transitions and effects
- **Media Queries**: For responsive design

### Colors and Themes

The main color scheme is defined using CSS custom properties. To change colors:

1. Open `styles.css`
2. Modify the color values in the CSS or add custom properties
3. The main gradient uses: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

### JavaScript Functionality

The `script.js` file contains all the interactive functionality:

- **Message handling**: Sending and receiving messages
- **API communication**: HTTP requests to the backend
- **UI updates**: Dynamic content updates
- **Error handling**: User-friendly error messages
- **Connection monitoring**: Backend health checks

## 🔧 Browser Compatibility

This frontend works in all modern browsers:

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+

### Required Features

- ES6+ JavaScript support
- Fetch API
- CSS Grid and Flexbox
- CSS Custom Properties

## 📱 Mobile Support

The interface is fully responsive and includes:

- **Touch-friendly**: Large touch targets
- **Responsive layout**: Adapts to screen size
- **iOS compatibility**: Prevents zoom on input focus
- **Android support**: Optimized for Android browsers

## 🐛 Troubleshooting

### Common Issues

1. **Chat not loading**:
   - Check browser console for errors
   - Ensure backend is running on port 5000
   - Verify network connectivity

2. **Messages not sending**:
   - Check connection status indicator
   - Verify backend API is accessible
   - Check browser network tab for failed requests

3. **Styling issues**:
   - Clear browser cache
   - Check for CSS loading errors
   - Verify all files are served correctly

### Debug Mode

Open browser developer tools and check the console for detailed error messages. The application exposes a global `ChatApp` object for debugging:

```javascript
// In browser console
ChatApp.state          // Current application state
ChatApp.checkHealth()  // Manually check backend health
ChatApp.clearChat()    // Programmatically clear chat
```

## 🔒 Security Considerations

- **XSS Protection**: All user input is properly escaped
- **CORS**: Backend configured for appropriate origins
- **Input Validation**: Message length and format validation
- **Error Sanitization**: Sensitive errors hidden from users

## 🚀 Performance

The frontend is optimized for performance:

- **Minimal Dependencies**: No external libraries
- **Efficient DOM Updates**: Minimal DOM manipulation
- **Lazy Loading**: Content loaded as needed
- **Optimized CSS**: Efficient selectors and animations

## 📄 License

Same as the main project - MIT License.

---

**Built with vanilla web technologies for maximum compatibility and performance.**

