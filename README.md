# MoveNMuse
github: https://github.com/marinankato/MoveNMuse.git
live demo: https://move-n-muse-fe.vercel.app/

Move N Muse is a full-stack web platform for discovering, booking, and managing dance and music classes. It includes session scheduling, room hire management, and secure online bookings — all within a clean, responsive interface designed to make studio management simple for small businesses.

----
## Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- Redux Toolkit
- React Router

**Backend:**
- Node.js (v22)
- Express.js
- MongoDB (Mongoose)
- JWT Authentication

**DevOps & Hosting:**
- Azure App Service (Linux)
- Azure Pipelines (CI/CD)
- GitHub for source control

----
## Project Structure

The repo is divided into two main folders:
/server for backend code and /client for frontend code.

----
## Feature Responsibilities
- **Marina Kato**: User, Login/Logout, Account, Booking History, Booking Details 
- **Jiayu Dai**: Course Viewing, Course Management, Booking Course, Instructor Management
- **Xinyi Cai**: Room Viewing, Room Management, Room Slot
- **Shirley Yi**: Cart, Payment, Payment Detail, Payment Methods

---- 
## Prerequisites
Before you begin, ensure you have:

- [Node.js 22.x](https://nodejs.org/)  
- [MongoDB 7+](https://www.mongodb.com/try/download/community) (local or MongoDB Atlas)  
- [Git](https://git-scm.com/)
- An [Azure account](https://azure.microsoft.com/) (for deployment)

----
## How to set up:
- Create a `.env` file in the `server` directory:
    # Database
    MONGO_DB_URL="mongodb+srv://marina:L4AZ0KcESie31Uyq@movenmuse.3s5x6fi.mongodb.net/?retryWrites=true&w=majority&appName=MoveNMuse"
    PORT=5001

    CORS_ORIGIN1=http://localhost:5173
    CORS_ORIGIN2=
    CORS_ORIGIN3=

    JWT_SECRET=mQ3Vx6pQvLz3GgHUL1bOEWkRWzXyzRwIjsfHEErS+ZA=


## How to run locally:
- Open two terminals
- In one have server:
    run cd backend
    npm install
    npm run dev
- In another have frontend: 
    run cd client
    npm install
    npm run dev
- Sample users to test features:
    email: alice@example.com
    password: pass123
    
    email: customer@example.com
    password: pass123
   
   email: staff@example.com
    password: pass123
