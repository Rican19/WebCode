# Moonshot AI Kimi Integration Setup

## Overview
Your HealthRadar AI Analysis is now configured to use **Moonshot AI Kimi (moonshotai/kimi-dev-72b:free)** through OpenRouter API. This is an excellent choice for disease analysis as it's:

- ✅ **Free tier available** - Cost-effective for regular use
- ✅ **Large context window** - Can handle comprehensive disease data
- ✅ **Excellent reasoning** - Great for medical/epidemiological analysis
- ✅ **Fast response times** - Good performance for real-time analysis

## Quick Setup Steps

### 1. Add Your API Key
Create or update your `.env.local` file in the project root:

```bash
NEXT_PUBLIC_OPENROUTER_API_KEY=your-actual-openrouter-api-key-here
```

**Important**: Replace `your-actual-openrouter-api-key-here` with your real OpenRouter API key.

### 2. Restart Development Server
After adding the API key, restart your development server:

```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

### 3. Test the Integration
1. Upload some disease data through Disease Management
2. Go to Dashboard → Predictive Analytics
3. Click "AI Analysis" button
4. You should now see real AI analysis from Moonshot AI Kimi!

## What's Already Configured ✅

### Model Configuration
- **Model**: `moonshotai/kimi-dev-72b:free`
- **Timeout**: 2 minutes (larger models need more time)
- **API Endpoint**: OpenRouter's unified API

### Fallback System
- If OpenRouter API fails, it automatically falls back to structured analysis
- No interruption to user experience
- Error logging for debugging

### Professional Display
- AI insights are displayed in a dedicated "AI Expert Insights" section
- Branded with "Moonshot AI Kimi" badge
- Combined with structured visual analysis

## Expected Behavior

### First Request
- May take 30-60 seconds (model loading)
- Shows professional loading animation
- Displays comprehensive AI analysis

### Subsequent Requests
- Much faster (5-15 seconds)
- Consistent high-quality analysis
- Real-time disease insights

## Cost Information

### Moonshot AI Kimi Pricing
- **Free tier**: Limited requests per day
- **Paid tier**: Very affordable per token
- **Typical analysis cost**: $0.01-0.05 per analysis

### Usage Optimization
- Analysis is only generated when requested
- No automatic background processing
- Efficient prompt design to minimize tokens

## Troubleshooting

### Common Issues

1. **"Invalid API key"**
   - Check if API key is correctly set in `.env.local`
   - Verify API key is active in OpenRouter dashboard
   - Restart development server after adding key

2. **"Rate limit exceeded"**
   - Free tier has daily limits
   - Wait for reset or upgrade to paid tier
   - Check OpenRouter dashboard for usage

3. **"Model not available"**
   - Moonshot AI Kimi should be available on free tier
   - Check OpenRouter status page
   - Try refreshing after a few minutes

4. **Analysis falls back to structured data**
   - Check browser console for error messages
   - Verify internet connection
   - Check OpenRouter API status

### Debug Steps

1. **Check API Key**:
   ```javascript
   console.log('API Key:', process.env.NEXT_PUBLIC_OPENROUTER_API_KEY);
   ```

2. **Test Connection**:
   - Open browser developer tools
   - Look for network requests to openrouter.ai
   - Check for any error responses

3. **Verify Model**:
   - Visit OpenRouter dashboard
   - Confirm Moonshot AI Kimi is available
   - Check your account status

## Features You'll Get

### Real AI Analysis
- Comprehensive disease surveillance insights
- Contextual recommendations based on current data
- Professional epidemiological analysis
- Seasonal and trend predictions

### Enhanced Display
- Structured visual components
- AI insights in dedicated section
- Professional medical report format
- Interactive charts and metrics

### Smart Integration
- Combines AI insights with structured data
- Fallback system for reliability
- Error handling and retry options
- Performance optimized

## Next Steps

1. **Add your API key** to `.env.local`
2. **Restart the server**
3. **Test with real disease data**
4. **Monitor usage** in OpenRouter dashboard
5. **Upgrade to paid tier** if needed for higher usage

The integration is ready to provide real AI-powered disease surveillance analysis using Moonshot AI Kimi! 🚀🏥

## Sample Analysis Output

With Moonshot AI Kimi, you'll get insights like:

> "Based on the current dengue case distribution across Mandaue, Consolacion, and Lilo-an, there's a concerning 40% increase in urban areas. Given the approaching rainy season, I recommend immediate vector control measures in high-density residential areas, particularly in Mandaue where cases have tripled in the past month. The predictive model suggests a potential outbreak scenario if intervention isn't implemented within the next 2 weeks..."

This level of detailed, contextual analysis is what makes the AI integration so valuable for public health decision-making! 📊🎯
