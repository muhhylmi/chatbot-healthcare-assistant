import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLogin, handleSignup, handleGetProfile } from "./routes/auth";
import { handleChat, handleChatStatus } from "./routes/chat";
import { handleUpdatePassword, handleUpdateProfile } from "./routes/user";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);


  // Authentication routes
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/signup", handleSignup);
  app.get("/api/auth/profile", handleGetProfile);

  // User routes
  app.put("/api/user/profile", handleUpdateProfile);
  app.put("/api/user/password", handleUpdatePassword);

  // Chat routes
  app.post("/api/chat", handleChat);
  app.get("/api/chat/status", handleChatStatus);

  return app;
}
