import { RequestHandler } from "express";
import { ChatMessage, getChatResponse } from "../lib/ai-chat";
import { supabase } from "../lib/supabase";
import { createEmbeddings } from "../services/embeddings";
import { groq } from "../lib/groq";
import dotenv from "dotenv";
dotenv.config();

const GROQ_MODEL = process.env.GROQ_CHAT_MODEL ?? "llama3-8b-8192";
export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  success: boolean;
  message: string;
  imageSearchTerm?: string;
  aiProvider: 'groq' | 'fallback';
  error?: string;
}

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const { message, conversationHistory }: ChatRequest = req.body;

    // Validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      const response: ChatResponse = {
        success: false,
        message: "Please provide a valid message",
        aiProvider: 'fallback'
      };
      return res.status(400).json(response);
    }

    // Limit message length
    if (message.length > 1000) {
      const response: ChatResponse = {
        success: false,
        message: "Message is too long. Please keep your message under 1000 characters.",
        aiProvider: 'fallback'
      };
      return res.status(400).json(response);
    }
    let aiResponse: any;
    if (["headache", "fever", "exercise", "diet"].some(word => message.toLowerCase().includes(word))) {
      aiResponse = await getChatResponse(message, conversationHistory);
    } else {
      aiResponse = await answerQuestion(message, 5, 0.68);
    }

    const response: ChatResponse = {
      success: true,
      message: aiResponse.message,
      imageSearchTerm: aiResponse.imageSearchTerm,
      aiProvider: 'groq',
    };

    res.json(response);

  } catch (error) {
    console.error('Chat endpoint error:', error);

    const response: ChatResponse = {
      success: false,
      message: "I'm experiencing technical difficulties. Please try again in a moment.",
      aiProvider: 'fallback',
      error: 'Internal server error'
    };

    res.status(500).json(response);
  }
};

// Health check endpoint for AI status
export const handleChatStatus: RequestHandler = (req, res) => {
  const response = {
    aiAvailable: true,
    provider: 'groq',
    status: 'operational'
  };

  res.json(response);
};


export async function answerQuestion(question: string, topK = 5, match_threshold = 0.68) {
  // create embedding for question
  const qEmbArr = await createEmbeddings([question]);
  const qEmb = qEmbArr[0];

  // call RPC match_documents
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: qEmb,
    match_threshold,
    match_count: topK
  });
  if (error) throw error;

  const matches = (data ?? []) as Array<{ id: number; content: string; metadata: any; similarity: number }>;
  const context = matches.map((m) => m.content).join("\n---\n");

  const systemPrompt = "You are a helpful assistant. Answer only using the provided context. If not present, say 'Maaf, saya tidak tahu.'";
  const userPrompt = `Context:\n${context}\n\nQuestion: ${question}`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  const resp = await groq.chat.completions.create({ model: GROQ_MODEL, messages: messages as any, max_tokens: 512, temperature: 0 });
  const answer = resp.choices?.[0]?.message?.content ?? "";

  return { message: answer, matches };
}