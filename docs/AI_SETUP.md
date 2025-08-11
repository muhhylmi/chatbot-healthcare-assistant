# AI Integration Setup Guide for HealthCare+ Chatbot

## Overview

Your HealthCare+ chatbot now supports real AI integration using OpenAI's GPT models. This provides intelligent, contextual responses instead of static pre-written answers.

## Features

✅ **Real AI Conversations** - Powered by OpenAI GPT-3.5-turbo  
✅ **Health-Focused Responses** - Specialized system prompts for medical information  
✅ **Conversation Memory** - Maintains context across the conversation  
✅ **Automatic Image Suggestions** - AI suggests relevant health images  
✅ **Fallback Mode** - Works without AI configuration using static responses  
✅ **Smart Medical Disclaimers** - Appropriate warnings for health advice  

## Setup Instructions

### Option 1: Quick Setup with Environment Variable

1. Get an OpenAI API key from [OpenAI Dashboard](https://platform.openai.com/api-keys)
2. Add to your environment:

```bash
# Add this to your .env file
OPENAI_API_KEY=sk-your-api-key-here
```

3. Restart the dev server:
```bash
npm run dev
```

### Option 2: Alternative AI Providers

The system is designed to be extensible. You can modify `server/lib/ai-chat.ts` to use:
- Google Gemini API
- Anthropic Claude
- Azure OpenAI
- Local LLM models

## How It Works

### 1. AI System Prompt
The AI is configured with a health-focused system prompt that:
- Provides empathetic, evidence-based health information
- Includes appropriate medical disclaimers
- Suggests consulting healthcare professionals when needed
- Maintains a warm, professional tone

### 2. Conversation Flow
```
User Message → AI Service → OpenAI API → Health Response + Image Suggestion → UI
```

### 3. Image Integration
- AI can suggest relevant images using `[IMAGE_SUGGESTION: term]` in responses
- Images are automatically matched from a curated health image library
- Fallback images ensure all responses have visual elements

### 4. Conversation Memory
- Maintains last 20 messages for context
- Provides coherent, contextual conversations
- Memory is cleared when user starts new session

## Testing the Integration

### Without OpenAI Key (Fallback Mode)
- Bot works with pre-written responses
- Basic health information provided
- Still includes relevant images

### With OpenAI Key (AI Mode)
- Dynamic, intelligent responses
- Contextual follow-up questions
- Personalized health advice
- AI-suggested images

## Example Conversations

**User**: "I've been having trouble sleeping lately. What can I do?"

**AI Response**: "I understand how frustrating sleep difficulties can be. Here are several evidence-based strategies that can help improve your sleep quality:

**Sleep Hygiene Tips:**
- Establish a consistent bedtime routine
- Keep your bedroom cool, dark, and quiet
- Avoid screens 1-2 hours before bedtime
- Try relaxation techniques like deep breathing or gentle stretching

**Lifestyle Factors:**
- Limit caffeine after 2 PM
- Get natural sunlight exposure during the day
- Regular exercise (but not close to bedtime)
- Avoid large meals before sleep

If sleep problems persist for more than 2-3 weeks or significantly impact your daily life, please consult with a qualified healthcare professional for personalized medical advice."

## Configuration Options

### API Settings (in `server/lib/ai-chat.ts`)
```javascript
const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",     // Can upgrade to gpt-4
  max_tokens: 500,            // Response length
  temperature: 0.7,           // Creativity level
  presence_penalty: 0.1,      // Reduce repetition
  frequency_penalty: 0.1,     // Encourage variety
});
```

### System Prompt Customization
Modify the `HEALTH_SYSTEM_PROMPT` in `server/lib/ai-chat.ts` to:
- Adjust tone and personality
- Add specialized medical knowledge
- Include specific disclaimers
- Customize for different health domains

## Monitoring and Analytics

### AI Status Endpoint
```bash
GET /api/chat/status
```
Returns:
```json
{
  "aiAvailable": true,
  "provider": "openai",
  "status": "operational"
}
```

### Health Check
The UI automatically displays AI status:
- ✨ Sparkles icon when AI is active
- "AI-powered health companion" subtitle
- Fallback messaging when AI unavailable

## Cost Considerations

### OpenAI Pricing (as of 2024)
- GPT-3.5-turbo: ~$0.002 per 1K tokens
- Average health conversation: 200-500 tokens
- Estimated cost: $0.001-$0.002 per conversation

### Usage Optimization
- 500 token limit per response
- Conversation history limited to 20 messages
- Efficient prompting reduces costs

## Security Best Practices

1. **Never log API keys** - Use environment variables only
2. **Input validation** - Limit message length and content
3. **Rate limiting** - Consider implementing usage limits
4. **User data** - Don't send personal medical information to AI
5. **Disclaimers** - Always include medical disclaimers

## Troubleshooting

### Common Issues

**"AI service temporarily unavailable"**
- Check OPENAI_API_KEY is set correctly
- Verify API key has sufficient credits
- Check OpenAI service status

**"Request failed with status 429"**
- Rate limit exceeded - implement exponential backoff
- Upgrade OpenAI plan if needed

**Inconsistent responses**
- Adjust temperature setting (lower = more consistent)
- Refine system prompt for better guidance

### Debug Mode
Enable detailed logging by adding to server code:
```javascript
console.log('AI Request:', { message, conversationHistory });
console.log('AI Response:', completion.choices[0]);
```

## Future Enhancements

### Planned Features
- Voice input/output integration
- Multi-language support
- Specialized medical domain models
- Integration with health APIs
- Real-time health monitoring
- Personalized health plans

### Custom Integrations
The architecture supports:
- Electronic Health Records (EHR) integration
- Wearable device data
- Medical database lookups
- Telemedicine platform connections

## Support

For technical issues:
- Check the console logs for error messages
- Verify environment variable configuration
- Test with simple queries first
- Monitor OpenAI dashboard for API usage

The AI integration transforms your health app into an intelligent, responsive health companion that can provide personalized guidance while maintaining appropriate medical boundaries! 🤖🏥
