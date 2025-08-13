import { ChatRequest, ChatResponse, ChatMessage } from "@shared/api";

class AIService {
  private conversationHistory: ChatMessage[] = [];
  private messageHistory: any[] = [];

  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      const request: ChatRequest = {
        message,
        conversationHistory: this.conversationHistory
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      if (data.success) {
        // Update conversation history
        this.conversationHistory.push(
          { role: 'user', content: message },
          { role: 'assistant', content: data.message }
        );

        // Keep only last 20 messages to prevent context from getting too long
        if (this.conversationHistory.length > 20) {
          this.conversationHistory = this.conversationHistory.slice(-20);
        }
      }

      return data;
    } catch (error) {
      console.error('AI Service error:', error);
      return {
        success: false,
        message: 'Sorry, I\'m having trouble connecting to the AI service. Please try again.',
        aiProvider: 'fallback',
        error: 'Network error'
      };
    }
  }

  async getStatus(): Promise<{ aiAvailable: boolean; provider: string }> {
    try {
      const response = await fetch('/api/chat/status');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Status check error:', error);
      return { aiAvailable: false, provider: 'fallback' };
    }
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  // Message history for UI persistence
  saveMessageHistory(messages: any[]): void {
    this.messageHistory = messages;
    localStorage.setItem('nephocare_chat_history', JSON.stringify(messages));
  }

  loadMessageHistory(): any[] {
    try {
      const saved = localStorage.getItem('nephocare_chat_history');
      if (saved) {
        this.messageHistory = JSON.parse(saved);
        return this.messageHistory;
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
    return [];
  }

  getMessageHistory(): any[] {
    return [...this.messageHistory];
  }

  clearMessageHistory(): void {
    this.messageHistory = [];
    localStorage.removeItem('nephocare_chat_history');
  }
}

export const aiService = new AIService();
