import { WebSocket } from "ws";

interface User {
    id: string;
    name: string;
    socket: WebSocket;
    roomId: string;
    score: number;
}

export class UserManager {
    private users: User[];
    private activeQuestions: Map<string, any>; // track questions per room

    constructor() {
        this.users = [];
        this.activeQuestions = new Map();
    }

    // 1. Add a user to a specific room
    addUser(roomId: string, name: string, socket: WebSocket) {
        // Generate a random ID for the user
        const id = Math.random().toString(36).substring(7); 
        
        const newUser: User = { id, name, socket, roomId, score: 0};
        this.users.push(newUser);
        
        return id;
    }

    // 2. Remove a user (if they disconnect)
    removeUser(socket: WebSocket) {
        this.users = this.users.filter(user => user.socket !== socket);
    }

    // 3. Find everyone in a specific room
    getUsersInRoom(roomId: string) {
        return this.users.filter(user => user.roomId === roomId);
    }

    // 4. Send a message to EVERYONE in a room
    broadcast(roomId: string, message: any) {
        const usersInRoom = this.getUsersInRoom(roomId);
        
        usersInRoom.forEach(user => {
            user.socket.send(JSON.stringify(message)); 
        });
    }

    //  5. Store the active question for a room
    setActiveQuestion(roomId: string, question: any) {
        this.activeQuestions.set(roomId, question);
    }

    // 6. Grade the answer server-side
    submitAnswer(socket: WebSocket, answerText: string) {
        // Find who sent the answer
        const user = this.users.find(u => u.socket === socket);
        if (!user) return; 

        // Get the current question for their room
        const currentQuestion = this.activeQuestions.get(user.roomId);
        if (!currentQuestion) return; 

        // Find the option they clicked
        const selectedOption = currentQuestion.options.find((opt: any) => opt.text === answerText);

        // Award points ONLY if the server verifies it is correct
        if (selectedOption && selectedOption.isCorrect) {
            user.score += 100;
        }
    }
    getLeaderboard(roomId: string) {
        const usersInRoom = this.getUsersInRoom(roomId);
        // Sort users by score (highest to lowest) and only return names and scores
        return usersInRoom
            .filter(user => user.name !== "host_admin_secret")
            .sort((a, b) => b.score - a.score)
            .map(user => ({ name: user.name, score: user.score }));
    }
}
