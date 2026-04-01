import express from "express";
import { WebSocketServer } from "ws";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import quizRouter from "./routes/quiz";
import adminRouter from "./routes/admin";
import { verifyToken } from "./middleware/auth";
import { UserManager } from "./managers/UserManager";
import { aiRouter } from "./routes/ai";
import { errorHandler } from "./middleware/errorHandler";
import { 
  joinAdminSchema, 
  joinRoomSchema, 
  nextQuestionSchema, 
  submitAnswerSchema, 
  showLeaderboardSchema 
} from "./schemas/wsSchema";

dotenv.config(); 

const app = express();

//List of allowed urls (used for both HTTP and WebSockets)
const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:5173"];

// HTTP CORS 
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    // or allow requests from our specific frontend URL
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Blocked by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // allows authorization headers (like JWT)
}));

app.use(express.json());
app.use("/api/admin", adminRouter);
app.use("/api/quiz",verifyToken, quizRouter);
app.use("/api/ai", verifyToken, aiRouter);
app.use(errorHandler);

const mongoUrl = process.env.MONGO_URL as string;
const port = process.env.PORT || 8080;


const connectDB = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

  connectDB();


const httpServer = app.listen(port);

const userManager = new UserManager();

//WEBSOCKET CORS 
const wss = new WebSocketServer({ server: httpServer, 
    verifyClient: (info, callback) => {
         const origin = info.origin;
    
         // Check if the connection comes from our allowed React frontend
         if (!origin || allowedOrigins.includes(origin)) {
         callback(true); // accept the connection
        } else {
              console.warn(`Blocked malicious WebSocket connection from: ${origin}`);
              callback(false, 401, "Unauthorized"); // instantly reject the connection
               }
  } });

wss.on("connection", (socket) => {
  
  
  socket.on("message", (message) => {

    try {
    const data = JSON.parse(message.toString());
    
    // Let the Admin join the room silently to listen for updates 
    if (data.type === "JOIN_ADMIN") {

      //validate payload
      const parsed = joinAdminSchema.safeParse(data.payload);
        if (!parsed.success) return console.error("Invalid JOIN_ADMIN payload", parsed.error);

        const { roomId } = parsed.data;
        // We use a secret name so the Admin doesn't show up on the leaderboard
        userManager.addUser(roomId, "host_admin_secret", socket);

        //immediately tell the admin who is already in the room
        const players = userManager.getUsersInRoom(roomId)
        .filter(u => u.name !== "host_admin_secret")
        .map(u => u.name);

        // send the list directly to the admin socket that just joined
        socket.send(JSON.stringify({
        type: "LOBBY_UPDATE",
        payload: { players }
      }));
      }

    if (data.type === "JOIN_ROOM") {

        // validate payload
        const parsed = joinRoomSchema.safeParse(data.payload);
        if (!parsed.success) return console.error("Invalid JOIN_ROOM payload", parsed.error);

        const { roomId, name } = parsed.data;
        userManager.addUser(roomId, name, socket);

        socket.send(JSON.stringify({ 
            type: "ROOM_JOINED", 
            payload: { message: `Welcome!` } 
        }));

        // 1. Get all users in this room, but hide the admin's secret account
        const players = userManager.getUsersInRoom(roomId)
            .filter(u => u.name !== "host_admin_secret")
            .map(u => u.name);
        
        // 2. Broadcast this new list to everyone in the room (including the Admin)
        userManager.broadcast(roomId, { 
            type: "LOBBY_UPDATE", 
            payload: { players } 
        });
    }

        if (data.type === "NEXT_QUESTION") {

        // validate payload
        const parsed = nextQuestionSchema.safeParse(data.payload);
        if (!parsed.success) return console.error("Invalid NEXT_QUESTION payload", parsed.error);

        const { roomId, question } = parsed.data;

        // Tell UserManager to set the active question
        userManager.setActiveQuestion(roomId, question);

        const deadline = Date.now() + 10 * 1000;
        
        userManager.broadcast(roomId, { 
          type: "NEXT_QUESTION", 
          payload: { question, deadline } 
        });
      }

      if (data.type === "SUBMIT_ANSWER") {

        // validate payload
        const parsed = submitAnswerSchema.safeParse(data.payload);
        if (!parsed.success) return console.error("Invalid SUBMIT_ANSWER payload", parsed.error);

        const { answerText } = parsed.data;

        // If they got it right, give them 100 points
        userManager.submitAnswer(socket, answerText);
      }

      if (data.type === "SHOW_LEADERBOARD") {
        // validate payload
        const parsed = showLeaderboardSchema.safeParse(data.payload);
        if (!parsed.success) return console.error("Invalid SHOW_LEADERBOARD payload", parsed.error);
        const { roomId } = parsed.data;
        
        //  Get the sorted scores from our Manager
        const leaderboard = userManager.getLeaderboard(roomId);
        
        //Broadcast it to everyone (including the Admin)
        userManager.broadcast(roomId, {
          type: "LEADERBOARD",
          payload: { leaderboard }
        });
      }

    } catch (error) {
      console.error("Error parsing message. Invalid JSON:", error);
    }   
  });

   socket.on("close", () => {
    userManager.removeUser(socket);
  });
   
});