import axios from 'axios';
import { ProcessedDiseaseData } from '../contexts/DiseaseDataContext';

export interface AIAnalysisRequest {
  processedData: ProcessedDiseaseData;
  municipalities: string[];
}

export interface AIAnalysisResponse {
  analysis: string;
  timestamp: string;
  success: boolean;
  error?: string;
}

// AI Server configuration - port 11434 as requested
const AI_SERVER_CONFIG = {
  baseURL: 'http://localhost:11434',
  model: 'qwen3:0.6b',
  timeout: 30000, // 30 seconds timeout
};

/**
 * Generate comprehensive AI analysis for disease surveillance data
 * Connects to local AI server on port 11434
 */
export async function generateDiseaseAnalysis(
  processedData: ProcessedDiseaseData
): Promise<AIAnalysisResponse> {
  try {
    // Prepare comprehensive data summary for AI analysis
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
      // additional analytics para sa AI
      topDiseases: Object.entries(processedData)
        .sort(([,a], [,b]) => b.totalCases - a.totalCases)
        .slice(0, 5)
        .map(([disease, data]) => ({ disease, cases: data.totalCases })),
      municipalityDistribution: calculateMunicipalityDistribution(processedData)
    };

    // create detailed prompt para sa AI analysis
    const prompt = `
As a public health AI analyst specializing in disease surveillance for Cebu Province, analyze the following comprehensive disease data from three municipalities (Mandaue, Consolacion, Lilo-an):

CURRENT DISEASE SURVEILLANCE DATA:
${JSON.stringify(dataForAI, null, 2)}

Please provide a detailed predictive analysis with the following structure:

## 1. EXECUTIVE SUMMARY
- Overall disease burden assessment
- Key risk indicators
- Immediate action items

## 2. DISEASE-SPECIFIC RISK ASSESSMENT
For each disease, provide:
- Current case count and trend analysis
- Risk level (Low/Medium/High/Critical)
- Seasonal pattern predictions
- Specific concerns or alerts

## 3. MUNICIPAL COMPARISON & HOTSPOTS
- Compare disease burden across Mandaue, Consolacion, and Lilo-an
- Identify high-risk areas requiring immediate attention
- Resource allocation recommendations

## 4. PREDICTIVE FORECASTING (Next 6 Months)
- Expected disease trends based on current data
- Seasonal outbreak predictions
- Early warning indicators to monitor

## 5. PREVENTION & INTERVENTION STRATEGIES
- Targeted prevention measures for each municipality
- Resource deployment priorities
- Community health education focus areas

## 6. MONITORING RECOMMENDATIONS
- Key metrics to track
- Alert thresholds for each disease
- Surveillance enhancement suggestions

Format your response with clear headings, bullet points, and actionable recommendations. Focus on practical insights for local health officials and decision-makers.
    `;

    // send request sa AI server
    const response = await axios.post(
      `${AI_SERVER_CONFIG.baseURL}/api/chat`,
      {
        model: AI_SERVER_CONFIG.model,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        options: {
          temperature: 0.7, // balanced creativity ug accuracy
          top_p: 0.9,
          top_k: 40
        }
      },
      {
        timeout: AI_SERVER_CONFIG.timeout,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    // check lang if valid ang response format
    if (!response.data || !response.data.message || !response.data.message.content) {
      throw new Error('Invalid response format from AI server');
    }

    return {
      analysis: response.data.message.content,
      timestamp: new Date().toISOString(),
      success: true
    };

  } catch (error: any) {
    console.error('AI Analysis Service Error:', error);
    
    // Provide detailed error information
    let errorMessage = 'Failed to generate AI analysis. ';
    
    if (error.code === 'ECONNREFUSED') {
      errorMessage += 'AI server is not running on localhost:11434. Please start the AI server first.';
    } else if (error.response?.status === 404) {
      errorMessage += `AI model "${AI_SERVER_CONFIG.model}" not found. Please ensure the model is installed and available.`;
    } else if (error.response?.status === 500) {
      errorMessage += 'AI server encountered an internal error. Please check server logs.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage += 'Cannot resolve localhost. Please check your network configuration.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage += 'Request timed out. The AI server may be overloaded or the model is too large.';
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
 * Test AI server connectivity
 */
export async function testAIServerConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    const response = await axios.post(
      `${AI_SERVER_CONFIG.baseURL}/api/chat`,
      {
        model: AI_SERVER_CONFIG.model,
        messages: [{ role: 'user', content: 'Hello, please respond with "AI server is working"' }],
        stream: false,
        options: {
          num_ctx: 512, // Very small context for quick test
          num_predict: 10 // Very short response
        }
      },
      {
        timeout: 60000 // 1 minute timeout for connection test - model loading takes time
      }
    );

    if (response.data && response.data.message) {
      return { connected: true };
    } else {
      return { connected: false, error: 'Invalid response format' };
    }
  } catch (error: any) {
    return { 
      connected: false, 
      error: error.code === 'ECONNREFUSED' 
        ? 'AI server not running on localhost:11434' 
        : error.message || 'Connection test failed'
    };
  }
}
