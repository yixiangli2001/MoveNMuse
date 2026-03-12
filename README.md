# MoveNMuse

GitHub: https://github.com/marinankato/MoveNMuse.git
Live Demo: https://move-n-muse-fe.vercel.app/

MoveNMuse is a full-stack web platform for discovering, booking, and managing dance and music classes.
It supports session scheduling, room hire management, and secure online bookings within a clean,
responsive interface designed for small studios and creative spaces.

---

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Redux Toolkit
- React Router

### Backend
- Node.js (v22)
- Express.js
- MongoDB (Mongoose)
- JWT Authentication

### DevOps & Hosting
- Azure App Service (Linux)
- Azure Pipelines (CI/CD)
- GitHub (Version Control)

---

## Project Structure

The repository is organised into two main folders:

/server   → Backend API and database logic
/client   → Frontend React application

---

## Feature Responsibilities

- Marina Kato
  User Authentication, Login/Logout, Account Management,
  Booking History, Booking Details

- Jiayu Dai
  Course Viewing, Course Management, Booking Courses,
  Instructor Management

- Xinyi Cai
  Room Viewing, Room Management, Room Slot Scheduling

- Shirley Yi
  Cart System, Payment Processing, Payment Details,
  Payment Methods

---

## Prerequisites

Before running the project, ensure you have the following installed:

Node.js 22.x
MongoDB 7+ (Local or MongoDB Atlas)
Git
Azure account (for deployment)

---

## Environment Setup

Create a `.env` file inside the server directory:

# Database
MONGO_DB_URL=<your_mongodb_connection_string>

# Server
PORT=5001

# CORS
CORS_ORIGIN1=http://localhost:5173
CORS_ORIGIN2=
CORS_ORIGIN3=

# Authentication
JWT_SECRET=<your_jwt_secret>

Important:
Sensitive credentials such as database connection strings and JWT secrets
should not be committed to the repository. Use environment variables instead.

---

## Running the Project Locally

Open two terminals.

Backend:

cd server
npm install
npm run dev

Frontend:

cd client
npm install
npm run dev

---

## Test Accounts

Customer
email: alice@example.com
password: pass123

Customer
email: customer@example.com
password: pass123

Staff
email: staff@example.com
password: pass123
