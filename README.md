# Users, Projects & Tasks REST API — Task 3

A production-ready REST API for managing users, projects, and tasks with a persistent MongoDB data layer.

This backend provides secure user authentication, project management, task management, database relationships, validation, centralized error handling, and JWT-based authorization.

---

## 🚀 Features

- User registration and login
- JWT-based authentication
- Protected API routes
- Get, update, and delete current user profile
- Create, retrieve, update, and delete projects
- Create, retrieve, update, and delete tasks
- Task status management
- Task statuses:
  - `todo`
  - `in-progress`
  - `done`
- User-project relationship
- User-task relationship
- Project-task relationship
- MongoDB persistent data storage
- Mongoose schema and model validation
- Input validation using Express Validator
- Centralized error handling
- Secure password hashing using bcrypt
- Environment variable configuration
- CORS support
- Helmet security middleware
- HTTP request logging with Morgan

---

## 🏗️ Architecture

```text
Client / Frontend
       ↓
    REST API
       ↓
   Express.js
       ↓
    Mongoose
       ↓
    MongoDB