import { RequestHandler } from "express";
import { getChatResponse, isAIAvailable, ChatMessage } from "../lib/ai-chat";

export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  success: boolean;
  message: string;
  imageSearchTerm?: string;
  aiProvider: 'openai' | 'fallback';
  error?: string;
}

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const { message, conversationHistory = [] }: ChatRequest = req.body;

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

    // Get AI response
    const aiResponse = await getChatResponse(message, conversationHistory);

    const response: ChatResponse = {
      success: true,
      message: aiResponse.message,
      imageSearchTerm: aiResponse.imageSearchTerm,
      aiProvider: isAIAvailable() ? 'openai' : 'fallback',
      error: aiResponse.error
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
    aiAvailable: isAIAvailable(),
    provider: isAIAvailable() ? 'openai' : 'fallback',
    status: 'operational'
  };
  
  res.json(response);
};
