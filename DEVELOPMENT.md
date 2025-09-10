# AI Learning Support App - Development Guide

## Overview
This is a learning continuation support application that uses AI chat to automatically generate learning records and send reminders based on the forgetting curve.

## Features Implemented (v1)
- ✅ AI Chat functionality with automatic learning record generation
- ✅ Calendar view for learning records
- ✅ Reminder system based on Ebbinghaus forgetting curve
- ✅ PWA support with push notifications
- ✅ Firestore database integration
- ✅ Firebase Functions backend

## Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- Firebase CLI (optional for local development)

### Installation
```bash
# Install dependencies
npm install

# Install frontend dependencies
cd web && npm install

# Install backend dependencies
cd functions && npm install
```

### Environment Setup

#### Backend (.env in functions/)
```bash
LLM_PROVIDER=gemini
GEMINI_API_KEY="your_gemini_api_key"
OPENAI_API_KEY="your_openai_api_key"
SKIP_AUTH=true
LOCAL_USER_ID=demo-user-123
```

#### Frontend (.env.local in web/)
```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5003/ai-learning-support-project/us-central1/api
NEXT_PUBLIC_FIREBASE_API_KEY="your_firebase_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdef"
```

### Development Commands

```bash
# Build everything
npm run build

# Start development (frontend + backend)
npm run dev

# Start only frontend
cd web && npm run dev

# Start only backend
cd functions && npm run serve
```

## Architecture Overview

### Backend (Firebase Functions)
- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and database operations
- **Models**: Type definitions and data structures
- **LLM Integration**: Supports both Gemini and OpenAI

### Frontend (Next.js)
- **Pages**: App router with TypeScript
- **Components**: Reusable UI components
- **Hooks**: Custom hooks for API calls and state management
- **Store**: Zustand for global state management

### Database (Firestore)
- **Collections**: chatSessions, learningRecords, reminders, reminderSettings
- **Security Rules**: User-based access control
- **Indexes**: Optimized for common queries

## Key Flows

### Learning Record Generation
1. User completes chat session
2. Backend analyzes chat content with AI
3. Generates structured learning record
4. Automatically schedules reminders based on forgetting curve

### Reminder System
1. Default intervals: 1, 3, 7, 14, 30 days
2. Users can customize reminder settings
3. PWA push notifications (when implemented)
4. Reminders link back to relevant learning content

## API Endpoints

### Chat
- `POST /chatSessions` - Create new session
- `GET /chatSessions` - Get user sessions
- `POST /chatSessions/:id/messages` - Send message

### Learning Records
- `POST /chatSessions/:id/learningRecord` - Generate learning record
- `GET /learningRecords` - Get user's learning records

### Reminders
- `GET /reminders` - Get user's reminders
- `GET /reminderSettings` - Get reminder settings
- `PUT /reminderSettings` - Update reminder settings
- `PUT /reminders/:id/status` - Update reminder status

## Deployment

### Firebase Hosting (Frontend)
```bash
cd web && npm run build
firebase deploy --only hosting
```

### Firebase Functions (Backend)
```bash
cd functions && npm run build
firebase deploy --only functions
```

### Database Setup
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## Development Notes

### Authentication
- Currently uses SKIP_AUTH for local development
- Production should use Firebase Auth with proper tokens

### LLM Integration
- Supports both Gemini and OpenAI
- Set LLM_PROVIDER environment variable
- Fallback handling for API failures

### PWA Features
- Manifest.json configured
- Service worker ready for implementation
- Push notification infrastructure in place

## Troubleshooting

### Build Issues
- Ensure all dependencies are installed
- Check environment variables are set
- Verify Node.js version compatibility

### API Issues
- Check Firebase project configuration
- Verify API keys are correct
- Enable required Firebase services

### Database Issues
- Deploy Firestore rules and indexes
- Check user permissions
- Verify collection structure

## Next Steps
1. Implement Firebase Cloud Messaging for push notifications
2. Add proper Firebase Auth integration
3. Implement service worker for offline capability
4. Add comprehensive error handling
5. Add unit and integration tests