#  Quizora AI: Real-Time Multiplayer Quiz Platform

![Live Demo](https://img.shields.io/badge/Demo-Live_Site-brightgreen.svg)
![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-blue)
![Node](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-success)

**Try it live:** [quizora-ai-seven.vercel.app](https://quizora-ai-seven.vercel.app)

I built Quizora to make generating and hosting live quizzes completely frictionless. You upload a study PDF, the AI extracts the context to generate questions, and it instantly spins up a live multiplayer room where players compete in real-time.

##  How it Works
*(I will add a quick 10-second GIF here soon showing a host creating a room and a player joining!)*

## The Engineering Challenge
The hardest part of building this was managing the performance. AI generation (using Groq/Gemini) takes a few seconds and uses heavy compute. If I ran that on the same thread as my live WebSocket game, the game would freeze for all players whenever a new quiz was generated. 

**The Solution:** I separated the architecture.
* **The Web Server:** An Express.js + `ws` server that only handles fast HTTP requests and real-time socket connections.
* **The Background Worker:** A dedicated Node.js process using **BullMQ** and **Upstash Redis**. When a PDF is uploaded, the web server drops a job into the Redis queue. The background worker picks it up, talks to the AI APIs, and saves the questions to MongoDB without ever blocking the main game loop.

## Tech Stack
* **Frontend:** React 18, Vite, Tailwind CSS, TypeScript
* **Backend:** Node.js, Express, WebSockets (`ws`)
* **Database & Queues:** MongoDB Atlas, Upstash Redis, BullMQ
* **External APIs:** Cloudinary (PDF storage), Groq / Google Gemini (AI Generation)

##  Running it Locally

If you want to clone this and run it yourself:

1. **Clone & Install**
   ```bash
   git clone [https://github.com/shrey8250/quizora-ai.git](https://github.com/shrey8250/quizora-ai.git)
   cd backend && npm install
   cd ../frontend && npm install