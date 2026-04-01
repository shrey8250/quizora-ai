import mongoose, { Schema, Document } from "mongoose";

const AdminSchema = new Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
});
export const Admin = mongoose.model("Admin", AdminSchema);


export interface IQuiz extends Document {
  title: string;
  description: string;
}
const QuizSchema = new Schema<IQuiz>({
  title: { type: String, required: true },
  description: { type: String, default: "" }
}, { timestamps: true });
export const Quiz = mongoose.model<IQuiz>("Quiz", QuizSchema);


export interface IQuestion extends Document {
  quizId: mongoose.Types.ObjectId;
  text: string;
  options: { text: string; isCorrect: boolean }[];
}
const QuestionSchema = new Schema<IQuestion>({
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  text: { type: String, required: true },
  options: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true, default: false }
  }]
}, { timestamps: true });
export const Question = mongoose.model<IQuestion>("Question", QuestionSchema);