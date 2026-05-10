# Clarity Call Frontend

## Project Overview

Clarity Call is a mentorship platform where users can connect with verified mentors, book one-to-one sessions, chat with mentors, and manage their mentorship journey.

This frontend is built with React and Vite. It provides the user interface for seekers, mentors, and admins.

## Main Features

- User registration and login
- Seeker dashboard
- Mentor dashboard
- Mentor verification form
- Mentor profile pages
- Session slot booking
- Chat between seekers and mentors
- Notifications
- Admin dashboard for users, mentor applications, sessions, feedback, analytics, and logs

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- Axios
- React Icons

## Folder Structure

```txt
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── admin/
│   │   ├── Register.jsx
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── SeekerDashboard.jsx
│   │   ├── MentorProfile.jsx
│   │   ├── VerifyMentor.jsx
│   │   └── ChatPage.jsx
│   ├── App.jsx
│   ├── config.js
│   ├── index.css
│   └── main.jsx
├── package.json
├── vite.config.js
└── README.md
```

## Setup Instructions

Follow these steps to run the frontend locally.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
```

### 2. Open the Project Folder

```bash
cd Major-Project
```

### 3. Go to the Frontend Folder

```bash
cd frontend
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start the Development Server

```bash
npm run dev
```

### 6. Open the App in Browser

After starting the development server, open the local Vite URL in your browser.

```txt
http://localhost:5173
```

## Backend Setup Requirement

This frontend depends on the backend API for login, registration, mentor data, bookings, chat, notifications, and admin features.

Before using the full application, make sure the backend server is also running.

From the project root:

```bash
cd backend
npm install
npm run dev
```

By default, the frontend expects the backend to run on:

```txt
http://localhost:3000
```

The Vite proxy in `vite.config.js` forwards frontend `/api` requests to the backend server.

## Available Scripts

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Run Lint

```bash
npm run lint
```

## Important Files

- `src/App.jsx` - Main application component and page navigation
- `src/config.js` - API base URL configuration
- `src/components/Register.jsx` - User registration form
- `src/components/Login.jsx` - User login form
- `src/components/SeekerDashboard.jsx` - Seeker dashboard
- `src/components/Dashboard.jsx` - Mentor dashboard
- `src/components/VerifyMentor.jsx` - Mentor verification form
- `src/components/MentorProfile.jsx` - Mentor profile and booking page
- `src/components/ChatPage.jsx` - Chat interface
- `src/components/admin/AdminDashboard.jsx` - Admin dashboard

## Notes

- Keep the backend running while testing frontend features.
- The project uses session-based authentication with cookies.
- API requests are made using `/api` routes.
- Profile images and chat attachments are handled by the backend.
