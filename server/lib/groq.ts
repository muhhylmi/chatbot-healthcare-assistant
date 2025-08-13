import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.GROQ_API_KEY!;
if (!API_KEY) throw new Error("GROQ_API_KEY missing");
export const groq = new Groq({ apiKey: API_KEY });