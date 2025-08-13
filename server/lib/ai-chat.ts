import OpenAI from 'openai';

// Health-focused system prompt for the AI
const HEALTH_SYSTEM_PROMPT = `You are a knowledgeable and compassionate health assistant for HealthCare+, a medical information app. Your role is to provide helpful, accurate, and easy-to-understand health information while maintaining appropriate medical disclaimers.

Guidelines:
1. Always provide helpful, evidence-based health information
2. Be empathetic and supportive in your responses
3. Include relevant disclaimers when appropriate
4. Suggest consulting healthcare professionals for specific medical concerns
5. Focus on general wellness, prevention, and health education
6. Never provide specific medical diagnoses or treatment recommendations
7. If asked about serious symptoms, encourage seeking immediate medical attention
8. Keep responses informative but concise (2-3 paragraphs max)
9. Use a warm, professional tone suitable for a health app
10. When appropriate, suggest lifestyle improvements and general wellness tips

Important: Always end responses about specific symptoms or medical concerns with: "Please consult with a qualified healthcare professional for personalized medical advice."

You can suggest when images might be helpful by including [IMAGE_SUGGESTION: brief description] in your response, but don't assume images will always be shown.`;

// Check if OpenAI is configured
const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;

let openai: OpenAI | null = null;

if (isOpenAIConfigured) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.warn('OpenAI not configured. Set OPENAI_API_KEY environment variable to enable AI chat.');
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  message: string;
  imageSearchTerm?: string;
  error?: string;
}

export async function getChatResponse(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<AIResponse> {

  if (!openai || !isOpenAIConfigured) {
    // Fallback to static responses if OpenAI is not configured
    return getFallbackResponse(userMessage);
  }

  try {
    // Build conversation context
    const messages: ChatMessage[] = [
      { role: 'system', content: HEALTH_SYSTEM_PROMPT },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: userMessage }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const aiMessage = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';

    // Extract image suggestion if present
    const imageMatch = aiMessage.match(/\[IMAGE_SUGGESTION:\s*([^\]]+)\]/);
    const imageSearchTerm = imageMatch ? imageMatch[1].trim() : undefined;

    // Remove image suggestion from the message
    const cleanMessage = aiMessage.replace(/\[IMAGE_SUGGESTION:[^\]]+\]/g, '').trim();

    return {
      message: cleanMessage,
      imageSearchTerm
    };

  } catch (error: any) {
    console.error('OpenAI API error:', error);

    // Return fallback response on error
    return {
      message: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.',
      error: 'AI service temporarily unavailable'
    };
  }
}

// Fallback responses when OpenAI is not available
function getFallbackResponse(userInput: string): AIResponse {
  const input = userInput.toLowerCase();

  const responses: { [key: string]: { message: string; imageSearchTerm?: string } } = {
    'headache': {
      message: 'Headaches can have various causes including stress, dehydration, lack of sleep, or tension. For mild headaches, try resting in a quiet, dark room, applying a cool compress to your forehead, staying hydrated, and practicing relaxation techniques. If headaches are severe, frequent, or accompanied by other concerning symptoms, please consult with a qualified healthcare professional for personalized medical advice.',
      imageSearchTerm: 'headache relief techniques'
    },
    'fever': {
      message: 'Fever is your body\'s natural response to infection. For management: get plenty of rest, stay well-hydrated with water and clear fluids, dress lightly, and consider over-the-counter fever reducers if appropriate for your age and health status. Monitor your temperature regularly. Seek immediate medical attention if fever is very high (over 103°F/39.4°C), persists for more than 3 days, or is accompanied by severe symptoms. Please consult with a qualified healthcare professional for personalized medical advice.',
      imageSearchTerm: 'fever management thermometer'
    },
    'exercise': {
      message: 'Regular physical activity is excellent for your overall health! Aim for at least 150 minutes of moderate aerobic activity per week, plus strength training exercises twice a week. Start slowly if you\'re new to exercise and gradually increase intensity. Choose activities you enjoy - walking, swimming, cycling, dancing, or sports. Always listen to your body and rest when needed. If you have any health conditions or concerns about starting an exercise program, please consult with a qualified healthcare professional for personalized medical advice.',
      imageSearchTerm: 'people exercising healthy lifestyle'
    },
    'diet': {
      message: 'A balanced diet is fundamental to good health! Focus on eating a variety of colorful fruits and vegetables, whole grains, lean proteins, and healthy fats. Limit processed foods, excessive sugar, and sodium. Stay hydrated with plenty of water throughout the day. Practice portion control and mindful eating. Remember that small, sustainable changes often work better than drastic dietary overhauls. For specific dietary needs or medical conditions, please consult with a qualified healthcare professional for personalized medical advice.',
      imageSearchTerm: 'healthy balanced diet colorful foods'
    }
  };

  // Find matching response
  for (const [key, response] of Object.entries(responses)) {
    if (input.includes(key)) {
      return response;
    }
  }

  // Default response
  return {
    message: 'Thank you for your question! I\'m here to help with general health information and wellness tips. I can provide guidance on topics like nutrition, exercise, sleep, stress management, and general health practices. However, for specific medical concerns, symptoms, or treatment decisions, please consult with a qualified healthcare professional for personalized medical advice.',
    imageSearchTerm: 'healthcare consultation doctor patient'
  };
}

// Helper function to check if AI is available
export function isAIAvailable(): boolean {
  return isOpenAIConfigured && !!openai;
}
