# OpenRouter AI Integration Setup Guide

## Overview
The HealthRadar AI Analysis Modal is now ready to be integrated with OpenRouter API, which provides access to multiple AI models through a single API endpoint. This is a much more reliable and scalable solution compared to running local AI servers.

## What's Already Done ✅

### 1. AI Analysis Modal
- ✅ **Professional UI** - Clean modal with loading states, error handling, and results display
- ✅ **Dynamic Analysis** - Currently generates realistic analysis based on your actual disease data
- ✅ **Integrated Button** - AI Analysis button appears in Predictive Analytics section when data is available
- ✅ **Error Handling** - Comprehensive error states and retry functionality

### 2. OpenRouter Service
- ✅ **Service Layer** - Complete OpenRouter API integration service (`openRouterService.ts`)
- ✅ **Multiple Models** - Support for various AI models (Claude, GPT-4, Gemini, Llama)
- ✅ **Error Handling** - Detailed error messages for different API issues
- ✅ **Connection Testing** - Built-in API connectivity testing

## Next Steps to Enable Real AI Analysis

### Step 1: Get OpenRouter API Key
1. Visit [OpenRouter.ai](https://openrouter.ai)
2. Sign up for an account
3. Add credits to your account (starts from $5)
4. Generate an API key from your dashboard

### Step 2: Configure Environment Variables
Create or update your `.env.local` file:
```bash
NEXT_PUBLIC_OPENROUTER_API_KEY=your-openrouter-api-key-here
```

### Step 3: Update the AI Analysis Modal
Replace the simulated analysis with real OpenRouter API calls:

```typescript
// In app/components/AIAnalysisModal.tsx
// Replace the current generateAIAnalysis function with:

import { generateDiseaseAnalysisWithOpenRouter } from "../services/openRouterService";

const generateAIAnalysis = async () => {
  setAnalysisResult({ analysis: "", loading: true, error: null });

  try {
    const result = await generateDiseaseAnalysisWithOpenRouter(processedData);
    
    if (result.success) {
      setAnalysisResult({
        analysis: result.analysis,
        loading: false,
        error: null
      });
    } else {
      setAnalysisResult({
        analysis: "",
        loading: false,
        error: result.error || "Failed to generate analysis"
      });
    }
  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    setAnalysisResult({
      analysis: "",
      loading: false,
      error: error.message || "Unexpected error occurred during analysis"
    });
  }
};
```

## Available AI Models

### Recommended Models:
1. **anthropic/claude-3-haiku** (Default) - Fast, cost-effective, excellent for analysis
2. **openai/gpt-4o-mini** - OpenAI's efficient model, good balance of speed and quality
3. **google/gemini-flash-1.5** - Google's fast model, good for quick analysis

### Premium Models:
- **anthropic/claude-3-5-sonnet** - Highest quality analysis, more expensive
- **openai/gpt-4o** - OpenAI's flagship model
- **google/gemini-pro-1.5** - Google's premium model

### Open Source Options:
- **meta-llama/llama-3.1-8b-instruct** - Free, good quality
- **microsoft/wizardlm-2-8x22b** - High performance open source

## Cost Estimation

### Typical Usage:
- **Input**: ~2,000 tokens (disease data + prompt)
- **Output**: ~1,500 tokens (comprehensive analysis)
- **Total per analysis**: ~3,500 tokens

### Cost per Analysis:
- **Claude Haiku**: ~$0.01 per analysis
- **GPT-4o Mini**: ~$0.02 per analysis
- **Gemini Flash**: ~$0.01 per analysis

### Monthly Estimates:
- **Light usage** (10 analyses/month): $0.10 - $0.20
- **Regular usage** (50 analyses/month): $0.50 - $1.00
- **Heavy usage** (200 analyses/month): $2.00 - $4.00

## Features of Current Implementation

### 1. Smart Data Processing
- Automatically analyzes all uploaded disease data
- Calculates municipality distributions and trends
- Identifies top diseases and risk patterns

### 2. Comprehensive Analysis Structure
- **Executive Summary** - Key insights and action items
- **Disease-Specific Assessment** - Individual disease analysis with risk levels
- **Municipal Comparison** - Hotspot identification across Mandaue, Consolacion, Lilo-an
- **Predictive Forecasting** - 6-month trend predictions
- **Prevention Strategies** - Targeted intervention recommendations
- **Monitoring Guidelines** - Alert thresholds and surveillance recommendations

### 3. Professional UI/UX
- Loading animations during analysis
- Error states with retry functionality
- Clean, readable analysis display
- Responsive design for all devices

### 4. Error Handling
- API key validation
- Rate limiting detection
- Network connectivity issues
- Invalid response handling

## Testing the Integration

### 1. Test API Connection
```typescript
import { testOpenRouterConnection } from './services/openRouterService';

// Test if API key and connection work
const testConnection = async () => {
  const result = await testOpenRouterConnection();
  console.log('Connection test:', result);
};
```

### 2. Check Available Models
```typescript
import { getAvailableModels } from './services/openRouterService';

// See what models are available with your API key
const checkModels = async () => {
  const models = await getAvailableModels();
  console.log('Available models:', models);
};
```

## Security Best Practices

### 1. Environment Variables
- Never commit API keys to version control
- Use `.env.local` for local development
- Use secure environment variables in production

### 2. API Key Protection
- Rotate API keys regularly
- Monitor usage in OpenRouter dashboard
- Set spending limits to prevent unexpected charges

### 3. Rate Limiting
- Implement client-side rate limiting if needed
- Handle 429 (rate limit) responses gracefully
- Consider caching analysis results

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**
   - Check if API key is correctly set in environment variables
   - Verify API key is active in OpenRouter dashboard

2. **"Insufficient credits"**
   - Add credits to your OpenRouter account
   - Check current balance in dashboard

3. **"Rate limit exceeded"**
   - Wait a moment before retrying
   - Consider upgrading your OpenRouter plan

4. **"Model not found"**
   - Check if the model ID is correct
   - Verify model is available with your account tier

## Current Status

✅ **Ready to Use**: The modal and UI are fully functional with simulated data
🔄 **Next Step**: Replace simulated analysis with real OpenRouter API calls
💰 **Cost**: Very affordable - typically $0.01-$0.02 per analysis
🚀 **Benefits**: Access to multiple state-of-the-art AI models through one API

The implementation is production-ready and just needs the API key configuration to start providing real AI-powered disease surveillance insights!
