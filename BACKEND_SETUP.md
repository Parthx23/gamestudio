# Backend Integration Setup Guide

## Prerequisites

1. **MongoDB Atlas Account**
   - Create a free cluster at https://cloud.mongodb.com
   - Get connection string
   - Whitelist your IP addresses

2. **Google OAuth Setup**
   - Go to Google Cloud Console
   - Create new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3001/api/auth/google/callback`

3. **Gemini API Key**
   - Go to Google AI Studio
   - Generate API key for Gemini Pro

## Installation & Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create `backend/.env` file:

```env
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cosmic-game-deck
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=https://cosmic-game-deck.lovable.app
```

### 3. Frontend Environment

Create `.env` file in root:

```env
VITE_API_URL=http://localhost:3001/api
```

For production, update to your deployed backend URL.

### 4. Start Backend

```bash
cd backend
npm run dev
```

### 5. Install Frontend Dependencies

```bash
npm install
```

### 6. Start Frontend

```bash
npm run dev
```

## Features Integrated

### ✅ Authentication
- Google OAuth login/signup
- JWT token management
- User profile with plan limits

### ✅ Database (MongoDB Atlas)
- User management with plans and limits
- Game configurations with Three.js objects
- Multiplayer room system
- Plan-based restrictions

### ✅ Game Engine
- Three.js integration for 3D games
- Dynamic game object loading
- Configurable game environments

### ✅ AI Game Creation
- Gemini API integration
- Natural language to game config conversion
- Automatic Three.js scene generation

### ✅ Multiplayer System
- WebSocket-based real-time communication
- Room creation and joining
- Player synchronization

### ✅ Video & Voice (WebRTC)
- Peer-to-peer video/audio
- WebSocket signaling server
- In-game communication

### ✅ Pricing & Limits
- Free plan: 5 games, 5 AI credits
- Pro/Premium plans with higher limits
- Backend enforcement

## API Endpoints

### Authentication
- `GET /api/auth/google` - Start Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/profile` - Get user profile

### Games
- `POST /api/games` - Create game
- `POST /api/games/generate` - AI generate game
- `GET /api/games/my-games` - Get user games
- `GET /api/games/:id` - Get game details

### Rooms
- `POST /api/rooms` - Create game room
- `POST /api/rooms/:roomId/join` - Join room
- `GET /api/rooms/:roomId` - Get room info

## WebSocket Events

### Client → Server
- `join-room` - Join game room
- `player-move` - Send player movement
- `game-action` - Send game action
- `offer`, `answer`, `ice-candidate` - WebRTC signaling

### Server → Client
- `player-joined` - Player joined room
- `player-moved` - Player movement update
- `game-action` - Game action broadcast
- `offer`, `answer`, `ice-candidate` - WebRTC signaling

## Production Deployment

### Backend (Railway/Heroku/DigitalOcean)
1. Deploy backend with environment variables
2. Update CORS origins to include frontend URL
3. Set up MongoDB Atlas IP whitelist

### Frontend (Already on Lovable)
1. Update `VITE_API_URL` to production backend
2. Update Google OAuth redirect URI
3. Deploy changes

## Security Notes

- JWT tokens expire in 7 days
- Rate limiting: 100 requests per 15 minutes
- CORS configured for frontend domain only
- MongoDB connection uses SSL
- All API endpoints require authentication except OAuth

## Troubleshooting

### Common Issues
1. **CORS errors**: Check FRONTEND_URL in backend .env
2. **OAuth fails**: Verify Google Client ID/Secret and redirect URI
3. **MongoDB connection**: Check connection string and IP whitelist
4. **WebSocket issues**: Ensure both frontend and backend are running
5. **AI generation fails**: Verify Gemini API key and quota

### Development Tips
- Use MongoDB Compass to view database
- Check browser console for WebSocket connection status
- Monitor backend logs for API errors
- Test OAuth in incognito mode to avoid cached tokens