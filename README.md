# Syntecxhub Task Manager

A full-stack task manager built with the MERN stack (MongoDB, Express, React, Node.js) as part of the Syntecxhub Web Development internship (Task 3, Project 1).

Users can register, log in, and manage their own private tasks. Authentication uses JSON Web Tokens (JWT).

## Features

- [x] User registration with hashed passwords (bcrypt)
- [x] User login with JWT
- [ ] Auth middleware to protect routes
- [ ] Create, read, update and delete tasks
- [ ] React frontend with login and task dashboard
- [ ] Responsive design

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas (Mongoose)
- **Auth:** JWT, bcryptjs

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/Syntecxhub_Task_Manager.git
cd Syntecxhub_Task_Manager/server
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create a `.env` file in `server/`
```
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 4. Run the server
```bash
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create a new account |
| POST | /api/auth/login | Log in and receive a token |

More endpoints will be added as the project grows.

## Author

Rustam