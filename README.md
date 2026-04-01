#  QUIZORA AI

[![Live Demo](https://img.shields.io/badge/Demo-Live_Site-brightgreen.svg)](https://quizora-ai-seven.vercel.app)
[![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-blue)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-success)](https://nodejs.org/)

**Turn any document into a live, multiplayer quiz — instantly.**

QUIZORA AI is a full-stack, real-time multiplayer quiz platform. Hosts can upload a PDF, specify a topic, and have an AI automatically generate multiple-choice questions from the document's content within seconds. Players join a live game room via a 6-character PIN, race against a countdown timer, and compete on a real-time leaderboard. Built for educators and trainers to run engaging sessions without the manual grind of writing questions by hand.

---

##  Key Features
* **AI-Powered Question Generation:** A custom RAG (Retrieval-Augmented Generation) pipeline reads uploaded PDFs, finds relevant sections via semantic search, and generates structured questions via an LLM.
* **Real-Time Multiplayer Game Loop:** Powered by raw WebSockets. Players join rooms, see live lobby updates, and answer questions against a synchronized timer without a single page refresh.
* **Non-Blocking Background Processing:** AI generation is handled in a dedicated BullMQ worker process, completely decoupled from the main HTTP/WebSocket server so the game never lags.
* **In-Memory Vector Store:** PDFs are embedded and cached. Repeated requests for the same document skip the download and embedding steps entirely.
* **Secure Admin Authentication:** JWT-based auth with bcrypt password hashing protects all quiz management routes.
* **Strict Input Validation:** Zod schemas validate both incoming HTTP requests and the raw JSON output from the LLM before it touches the database, preventing AI hallucinations from corrupting the game.

---

## Architecture & Tech Stack

### Frontend
| Technology | Role |
| :--- | :--- |
| **React + TypeScript** | UI framework |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Styling |
| **Native WebSockets** | Real-time game communication |

### Backend & AI Pipeline
| Technology | Role |
| :--- | :--- |
| **Node.js + Express** | HTTP REST API server |
| **ws** | Real-time bidirectional communication |
| **BullMQ + Upstash Redis** | Job queue for background AI generation |
| **MongoDB Atlas + Mongoose** | Primary database |
| **LangChain** | LLM orchestration and document chunking |
| **Groq (Llama 3)** | Question generation LLM |
| **Google Gemini API** | Document chunk vectorization (Embeddings) |

---

##  Technical Highlights

### 1. The Decoupled Worker Architecture
The most critical design decision in this codebase is keeping AI generation completely off the main server process. When a host requests AI questions, the Express route drops a job onto a BullMQ Redis queue and immediately returns a `202 Accepted`. 

A separate worker process runs independently, downloads the PDF, performs a similarity search, calls the LLM, and writes to MongoDB. 
* **Why this matters:** The WebSocket game server handles dozens of concurrent real-time connections. If AI generation (which takes ~15 seconds) ran on the main event loop, every player's timer and leaderboard would freeze. Offloading to a worker completely isolates the real-time game loop from the heavy AI workload.

### 2. The RAG Pipeline
Rather than dumping an entire PDF into an LLM prompt (which is slow and hits context limits), this app implements a proper RAG approach:
1. The PDF is parsed and split into overlapping chunks (`chunkSize: 2000`).
2. Each chunk is vectorized using Google's `gemini-embedding-001` model.
3. At generation time, only the top 5 most semantically relevant chunks for the host's topic are retrieved and sent to the LLM as context.

### 3. LLM Output Validation with Zod
LLMs hallucinate and sometimes return malformed JSON. Rather than letting bad output silently crash the app, the worker runs the parsed LLM response through a strict `Zod` schema validator before any database insertion. If the schema doesn't match, the job fails gracefully and the database stays clean.

---

##  Getting Started (Local Setup)

### Prerequisites
* Node.js v18+
* MongoDB Atlas connection string
* Upstash Redis URL

### 1. Clone & Install
```bash
git clone [https://github.com/shrey8250/quizora-ai.git](https://github.com/shrey8250/quizora-ai.git)
cd quizora-ai

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables
Create a `.env` file inside the `backend/` directory:
```env
MONGO_URL="mongodb+srv://<user>:<password>@cluster.mongodb.net/"
JWT_SECRET="your-strong-random-secret"
FRONTEND_URL="http://localhost:5173"
REDIS_URL="redis://your-upstash-url"
GROQ_API_KEY="your-groq-key"
GOOGLE_API_KEY="your-gemini-key"
```

Create a `.env` file inside the `frontend/` directory:
```env
VITE_API_URL="http://localhost:8080"
VITE_WS_URL="ws://localhost:8080"
VITE_CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
VITE_CLOUDINARY_UPLOAD_PRESET="your-preset"
```

### 3. Run the Development Servers
Open two terminal windows:

**Terminal 1 (Backend - Runs both API and Worker concurrently):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
The app will be available at `http://localhost:5173`.