import axios from 'axios';
import { ProcessedDiseaseData } from '../contexts/DiseaseDataContext';

export interface OpenRouterAnalysisResponse {
  analysis: string;
  timestamp: string;
  success: boolean;
  error?: string;
}

// OpenRouter API config - diri nato ibutang ang settings para sa AI
const OPENROUTER_CONFIG = {
  baseURL: 'https://openrouter.ai/api/v1',
  // ibutang lang ang API key sa .env file ha, ayaw diri sa code
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || 'api router nato here mamen, pero ibutang langs .env file',
  // gamiton nato ang Moonshot AI Kimi - libre man ni ug maayo pa
  model: 'moonshotai/kimi-dev-72b:free',
  timeout: 120000, // 2 minutes timeout - daghan kaayo time ang mga AI models
};

/**
 * mag generate ug AI analysis gamit ang OpenRouter API
 * pwede ra ni mag support ug daghan AI models through one API lang
 */
export async function generateDiseaseAnalysisWithOpenRouter(
  processedData: ProcessedDiseaseData
): Promise<OpenRouterAnalysisResponse> {
  try {
    // prepare lang ang data para sa AI - organize nato para maintindihan sa AI
    const dataForAI = {
      totalDiseases: Object.keys(processedData).length,
      diseaseBreakdown: Object.entries(processedData).map(([disease, data]) => ({
        disease: disease,
        totalCases: data.totalCases,
        municipalities: data.municipalities,
        municipalityCount: Object.keys(data.municipalities).length,
        averageCasesPerMunicipality: data.totalCases / Math.max(Object.keys(data.municipalities).length, 1)
      })),
      totalCases: Object.values(processedData).reduce((sum, data) => sum + data.totalCases, 0),
      municipalities: ["Mandaue", "Consolacion", "Lilo-an"], // scope lang nato sa HealthRadar
      lastUpdated: new Date().toISOString(),
      topDiseases: Object.entries(processedData)
        .sort(([,a], [,b]) => b.totalCases - a.totalCases)
        .slice(0, 5)
        .map(([disease, data]) => ({ disease, cases: data.totalCases })),
      municipalityDistribution: calculateMunicipalityDistribution(processedData)
    };

    // create lang ang prompt para sa AI - focused lang sa conclusion
    const prompt = `
You are a public health AI analyst. Based on the disease surveillance data below from Mandaue, Consolacion, and Lilo-an municipalities in Cebu Province, provide ONLY a comprehensive analysis conclusion.

DISEASE DATA:
${JSON.stringify(dataForAI, null, 2)}

Generate a professional analysis conclusion that includes:
- Overall disease burden assessment
- Key findings and risk indicators
- Strategic recommendations for health officials
- Next steps and monitoring guidance

Write the conclusion as a cohesive narrative suitable for a medical report. Do not include any thinking process, formatting tags, or section headers. Provide only the final analysis conclusion text that health officials can use for decision-making.

Focus on practical, actionable insights based on the current data patterns, seasonal considerations, and municipal distribution of cases.
    `;

    // send na ang request sa OpenRouter API
    const response = await axios.post(
      `${OPENROUTER_CONFIG.baseURL}/chat/completions`,
      {
        model: OPENROUTER_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: 'You are a public health AI analyst specializing in disease surveillance and epidemiology. Generate ONLY analysis conclusions without thinking process, formatting tags, or section headers. Provide direct, actionable insights for health officials in a cohesive narrative format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9
      },
      {
        timeout: OPENROUTER_CONFIG.timeout,
        headers: {
          'Authorization': `Bearer ${OPENROUTER_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://healthradar.local', // replace lang ni ug actual domain nato
          'X-Title': 'HealthRadar Disease Analysis'
        }
      }
    );

    // check lang if valid ang response format - basin nag error ang API
    if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
      throw new Error('Invalid response format from OpenRouter API');
    }

    const analysisContent = response.data.choices[0].message.content;

    return {
      analysis: analysisContent,
      timestamp: new Date().toISOString(),
      success: true
    };

  } catch (error: any) {
    console.error('OpenRouter AI Analysis Error:', error);
    
    // Provide detailed error information
    let errorMessage = 'Failed to generate AI analysis. ';
    
    if (error.response?.status === 401) {
      errorMessage += 'Invalid API key. Please check your OpenRouter API key configuration.';
    } else if (error.response?.status === 402) {
      errorMessage += 'Insufficient credits. Please check your OpenRouter account balance.';
    } else if (error.response?.status === 429) {
      errorMessage += 'Rate limit exceeded. Please wait a moment and try again.';
    } else if (error.response?.status === 400) {
      errorMessage += 'Invalid request format. Please check the model configuration.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage += 'Cannot connect to OpenRouter API. Please check your internet connection.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage += 'Request timed out. The AI model may be overloaded.';
    } else {
      errorMessage += error.message || 'Unknown error occurred during AI analysis.';
    }

    return {
      analysis: '',
      timestamp: new Date().toISOString(),
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Calculate municipality distribution statistics
 */
function calculateMunicipalityDistribution(processedData: ProcessedDiseaseData) {
  const municipalityTotals: { [municipality: string]: number } = {};
  
  Object.values(processedData).forEach(diseaseData => {
    Object.entries(diseaseData.municipalities).forEach(([municipality, cases]) => {
      municipalityTotals[municipality] = (municipalityTotals[municipality] || 0) + cases;
    });
  });

  const totalCases = Object.values(municipalityTotals).reduce((sum, cases) => sum + cases, 0);
  
  return Object.entries(municipalityTotals).map(([municipality, cases]) => ({
    municipality,
    cases,
    percentage: totalCases > 0 ? ((cases / totalCases) * 100).toFixed(1) : '0.0'
  }));
}

/**
 * Test OpenRouter API connectivity
 */
export async function testOpenRouterConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    const response = await axios.post(
      `${OPENROUTER_CONFIG.baseURL}/chat/completions`,
      {
        model: OPENROUTER_CONFIG.model,
        messages: [
          {
            role: 'user',
            content: 'Hello, please respond with "OpenRouter API is working"'
          }
        ],
        max_tokens: 20
      },
      {
        timeout: 10000, // 10 second timeout for connection test
        headers: {
          'Authorization': `Bearer ${OPENROUTER_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://healthradar.local',
          'X-Title': 'HealthRadar Connection Test'
        }
      }
    );

    if (response.data && response.data.choices && response.data.choices[0]) {
      return { connected: true };
    } else {
      return { connected: false, error: 'Invalid response format' };
    }
  } catch (error: any) {
    return { 
      connected: false, 
      error: error.response?.status === 401 
        ? 'Invalid API key' 
        : error.message || 'Connection test failed'
    };
  }
}

/**
 * Get available models from OpenRouter
 */
export async function getAvailableModels(): Promise<string[]> {
  try {
    const response = await axios.get(
      `${OPENROUTER_CONFIG.baseURL}/models`,
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_CONFIG.apiKey}`,
        }
      }
    );

    if (response.data && response.data.data) {
      return response.data.data.map((model: any) => model.id);
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch available models:', error);
    return [];
  }
}
