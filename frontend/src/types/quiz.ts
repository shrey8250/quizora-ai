export type StatusMessage = {
  type: "error" | "success";
  text: string;
};

export type FieldErrors = Record<string, string>;

export type QuizOption = {
  _id?: string;
  text: string;
  isCorrect?: boolean;
};

export type QuizQuestion = {
  _id?: string;
  text: string;
  options: QuizOption[];
};

export type LeaderboardEntry = {
  name: string;
  score: number;
};

export type QuizResponse = {
  _id?: string;
  quizId?: string;
  title?: string;
  description?: string;
  questions: QuizQuestion[];
};

export type CreateQuizResponse = {
  quizId: string;
};

export type AuthResponse = {
  token?: string;
};

export type CloudinaryUploadResponse = {
  secure_url: string;
};

export type ValidationDetail = {
  field: string;
  message: string;
};

export type ApiErrorBody = {
  error?: string;
  details?: ValidationDetail[];
};

export type UserServerMessage =
  | {
      type: "NEXT_QUESTION";
      payload: {
        question: QuizQuestion;
        deadline: number;
      };
    }
  | {
      type: "LEADERBOARD";
      payload: {
        leaderboard: LeaderboardEntry[];
      };
    };

export type UserClientMessage =
  | {
      type: "JOIN_ROOM";
      payload: {
        roomId: string;
        name: string;
      };
    }
  | {
      type: "SUBMIT_ANSWER";
      payload: {
        answerText: string;
      };
    };

export type AdminServerMessage =
  | {
      type: "LOBBY_UPDATE";
      payload: {
        players: string[];
      };
    }
  | {
      type: "LEADERBOARD";
      payload: {
        leaderboard: LeaderboardEntry[];
      };
    };

export type AdminClientMessage =
  | {
      type: "JOIN_ADMIN";
      payload: {
        roomId: string;
        token: string;  // Token for WebSocket Auth
      };
    }
  | {
      type: "NEXT_QUESTION";
      payload: {
        roomId: string;
        question: QuizQuestion;
        deadline: number;
      };
    }
  | {
      type: "SHOW_LEADERBOARD";
      payload: {
        roomId: string;
      };
    };