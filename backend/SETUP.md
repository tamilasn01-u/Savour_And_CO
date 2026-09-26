# Savor & Co. Backend Setup Guide

## Quick Start

### 1. Install MongoDB

**Option A: Using MongoDB Atlas (Cloud - Recommended)**
- Go to https://www.mongodb.com/cloud/atlas
- Create a free account
- Create a cluster (M0 free tier)
- Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)
- Update `.env` file with your connection string:
  ```
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/savor-co?retryWrites=true&w=majority
  ```

**Option B: Using Local MongoDB (Windows)**
- Download MongoDB Community Edition from https://www.mongodb.com/try/download/community
- Install it (it will set up as a Windows Service)
- Verify installation: Open PowerShell and run `mongosh` to connect to local MongoDB
- The backend will use `mongodb://localhost:27017/savor-co` by default

### 2. Install Dependencies (Already Done ✅)
```powershell
npm install
```

### 3. Start Backend Server
```powershell
npm start
# or for development with auto-reload:
npm run dev
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication

**POST /api/auth/register**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "passwordConfirm": "password123"
}
```

**POST /api/auth/login**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**GET /api/health**
- Check if server is running

## Frontend Integration

The frontend (localhost:5173) expects:
- Backend running on `http://localhost:5000`
- CORS enabled for cross-origin requests
- JWT token stored in localStorage
- Login page at `/login` to make requests to `/api/auth/login`

## Next Steps

1. Choose MongoDB option (Atlas or Local)
2. Update `.env` with your MongoDB URI if using Atlas
3. Start backend: `npm start`
4. Frontend can now make requests to login/register
5. Create SignUp page at `src/pages/SignupPage/index.jsx`
6. Add Protected Routes for authenticated pages (BookingPage)
7. Add logout functionality

## Troubleshooting

**Backend won't start:**
- Check if MongoDB is running
- Verify MongoDB URI in `.env` is correct
- Check if port 5000 is available: `netstat -ano | findstr :5000`

**Frontend can't reach backend:**
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify frontend is on localhost:5173
