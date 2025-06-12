import mongoose from "mongoose";
import { env } from "../env";

const mongoUri = `mongodb+srv://${env.MONGODB_USERNAME}:${env.MONGODB_PASSWORD}@test.bg7l5m7.mongodb.net/database?retryWrites=true&w=majority&appName=Test`;

export async function connectToDatabase() {
  try {
    await mongoose.connect(mongoUri);
  } catch (error) {
    if (error) {
      return console.log("Erro ao se conectar com o MongoDB: ", error);
    }
  }
}
