import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Heart, Menu, LogOut, Settings, Sparkles, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { aiService } from "@/lib/ai-service";
import { findHealthImage } from "@/lib/image-service";
import { UserSettings } from "@/components/UserSettings";
import { LogoutConfirmation } from "@/components/LogoutConfirmation";
import { FormattedText } from "@/components/FormattedText";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  image?: {
    url: string;
    alt: string;
    caption?: string;
  };
}

export default function Chatbot() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [aiStatus, setAiStatus] = useState<{ aiAvailable: boolean; provider: string }>({
    aiAvailable: false,
    provider: 'checking'
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Save messages to history whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      aiService.saveMessageHistory(messages);
    }
  }, [messages]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Initialize AI and check status
  useEffect(() => {
    const initializeAI = async () => {
      const status = await aiService.getStatus();
      setAiStatus(status);

      // Load chat history first
      const savedHistory = aiService.loadMessageHistory();

      if (savedHistory.length > 0) {
        // Convert timestamps back to Date objects
        const restoredMessages = savedHistory.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(restoredMessages);
      } else {
        // Add welcome message if no history
        const welcomeMessage: Message = {
          id: 'welcome',
          text: `Hello${user ? ` ${user.fullName}` : ''}! I'm your AI-powered health assistant from Nephocare+${status.aiAvailable ? ' powered by OpenAI' : ''}. I can provide information about symptoms, medications, healthy lifestyle tips, and more. I can also show you helpful images and visual guides! 📸`,
          sender: 'bot',
          timestamp: new Date(),
          image: {
            url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center',
            alt: 'Friendly Nephocare assistant',
            caption: 'I can provide personalized health guidance and tips!'
          }
        };

        setMessages([welcomeMessage]);
        aiService.saveMessageHistory([welcomeMessage]);
      }
    };

    if (user) {
      initializeAI();
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleClearHistory = () => {
    aiService.clearMessageHistory();
    aiService.clearHistory();

    // Add fresh welcome message
    const welcomeMessage: Message = {
      id: 'welcome-' + Date.now(),
      text: `Hello${user ? ` ${user.fullName}` : ''}! I'm your AI-powered health assistant from Nephocare+${aiStatus.aiAvailable ? ' powered by OpenAI' : ''}. I can provide information about symptoms, medications, healthy lifestyle tips, and more. I can also show you helpful images and visual guides! 📸`,
      sender: 'bot',
      timestamp: new Date(),
      image: {
        url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center',
        alt: 'Friendly Nephocare assistant',
        caption: 'I can provide personalized health guidance and tips!'
      }
    };

    setMessages([welcomeMessage]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    const currentInput = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Get AI response
      const aiResponse = await aiService.sendMessage(currentInput);

      let image = undefined;
      if (aiResponse.imageSearchTerm) {
        image = findHealthImage(aiResponse.imageSearchTerm);
      }

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.message,
        sender: 'bot',
        timestamp: new Date(),
        image: image || undefined,
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };


  const quickActions = [
    '😴 How can I improve my sleep?',
    '🥗 What are healthy eating tips?',
    '💪 Exercise recommendations',
    '🧘 Stress management techniques',
    '💧 How to stay hydrated?',
    '🌡️ Fever management tips',
    '🤕 Headache relief methods',
    '🧘‍♀️ Show me yoga poses'
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Nephocare+ Assistant
                {aiStatus.aiAvailable && (
                  <Sparkles className="w-4 h-4 text-blue-600"  />
                )}
              </h1>
              <p className="text-sm text-gray-600">
                {aiStatus.provider === 'checking' ? 'Initializing...' :
                 aiStatus.aiAvailable ? 'AI-powered health companion' :
                 'Your personal health companion'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 mr-2">Welcome, {user?.fullName || 'User'}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              title="Clear Chat History"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              title="Account Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLogoutConfirm(true)}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-120px)] flex flex-col">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} w-full`}
                >
                  <div className={`flex items-start space-x-2 max-w-[75%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className={message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200'}>
                        {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg p-3 break-words min-w-0 ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <FormattedText
                        text={message.text}
                        className="text-sm break-words mb-2"
                      />

                      {/* Display image if present */}
                      {message.image && (
                        <div className="mt-3">
                          <div className="relative">
                            <img
                              src={message.image.url}
                              alt={message.image.alt}
                              className="rounded-lg max-w-full h-auto object-cover max-h-48 cursor-pointer hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg"
                              onClick={() => window.open(message.image!.url, '_blank')}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            {/* Click to expand indicator */}
                            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                              🔍 Click to expand
                            </div>
                          </div>
                          {message.image.caption && (
                            <p className={`text-xs mt-2 italic ${
                              message.sender === 'user' ? 'text-blue-100' : 'text-gray-600'
                            }`}>
                              💡 {message.image.caption}
                            </p>
                          )}
                        </div>
                      )}

                      <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start w-full">
                  <div className="flex items-start space-x-2 max-w-[75%]">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-gray-200">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-gray-500 animate-pulse">
                          Answering your question...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t border-gray-200 flex-shrink-0">
              <p className="text-xs text-gray-600 mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setInputValue(action)}
                    className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 flex-shrink-0">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about your health..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <Button 
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!inputValue.trim() || isTyping}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                This chatbot provides general health information and is not a substitute for professional medical advice.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Dialog */}
      <UserSettings
        open={showSettings}
        onOpenChange={setShowSettings}
      />

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmation
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        onConfirm={handleLogout}
      />
    </div>
  );
}
