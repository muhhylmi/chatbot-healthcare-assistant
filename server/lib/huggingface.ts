import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const HF_API_KEY = process.env.HF_API_KEY!;
if (!HF_API_KEY) throw new Error("HF_API_KEY missing");

export const hfClient = axios.create({
    baseURL: "https://router.huggingface.co",
    headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
    },
    timeout: 120000
});