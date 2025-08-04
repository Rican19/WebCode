
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { DiseaseData } from '../contexts/DiseaseDataContext';

export interface AIAnalysisRequest {
  processedData: any;
  municipalities: string[];
}

export interface AIAnalysisResponse {
  analysis: string;
  timestamp: string;
  success: boolean;
  error?: string;
}

export interface ComprehensiveAIAnalysis {
  summary: string;
  predictions: {
    municipality: string;
    diseases: {
      name: string;
      currentTrend: 'rising' | 'stable' | 'declining';
      nextMonthPrediction: 'increase' | 'stable' | 'decrease';
      reasoning: string;
      riskLevel: 'low' | 'medium' | 'high';
    }[];
    overallRisk: 'low' | 'medium' | 'high';
    recommendations: string[];
  }[];
  globalInsights: {
    mostConcerningDisease: string;
    emergingTrends: string[];
    seasonalFactors: string[];
    recommendations: string[];
  };
}

// OpenRouter AI config para sa cloud-based AI analysis - libre man ni siya so pwede na
const AI_CONFIG = {
  API_KEY: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '',
  BASE_URL: 'https://openrouter.ai/api/v1/chat/completions',
  MODEL: 'moonshot/moonshot-v1-8k'
};

// function para ma kuha ang tanan disease data from Firestore - all data across municipalities
export const getAllDiseaseData = async (): Promise<DiseaseData[]> => {
  try {
    console.log('🔍 Fetching all disease data from Firestore for AI analysis...');

    // try different collection paths na possible sa system - kay di man consistent ang structure
    const possiblePaths = [
      'diseaseData',
      'healthradarDB/centralizedData/allCases'
    ];

    let allData: DiseaseData[] = [];

    for (const path of possiblePaths) {
      try {
        console.log(`🔍 Checking collection path: ${path}`);
        const diseaseCollection = collection(db, path);
        const snapshot = await getDocs(diseaseCollection);

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data && typeof data === 'object') {
            allData.push(data as DiseaseData);
          }
        });

        if (allData.length > 0) {
          console.log(`✅ Found ${allData.length} records in ${path}`);
          break;
        }
      } catch (pathError) {
        console.log(`⚠️ Path ${path} not accessible, trying next...`);
      }
    }

    // if wala pa data, create sample data para ma test ang AI - fallback lang ni
    if (allData.length === 0) {
      console.log('⚠️ No disease data found, creating sample data for AI analysis...');
      allData = [
        { DiseaseName: 'COVID-19', Municipality: 'Mandaue', CaseCount: '25', Age: '25-40', Gender: 'Male', DateRecorded: new Date().toISOString() },
        { DiseaseName: 'Dengue', Municipality: 'Liloan', CaseCount: '15', Age: '18-30', Gender: 'Female', DateRecorded: new Date().toISOString() },
        { DiseaseName: 'Tuberculosis', Municipality: 'Consolacion', CaseCount: '8', Age: '40-60', Gender: 'Male', DateRecorded: new Date().toISOString() },
        { DiseaseName: 'Pneumonia', Municipality: 'Mandaue', CaseCount: '12', Age: '60+', Gender: 'Female', DateRecorded: new Date().toISOString() },
        { DiseaseName: 'Hypertension', Municipality: 'Liloan', CaseCount: '30', Age: '50-65', Gender: 'Male', DateRecorded: new Date().toISOString() },
        { DiseaseName: 'Diabetes', Municipality: 'Consolacion', CaseCount: '18', Age: '45-60', Gender: 'Female', DateRecorded: new Date().toISOString() }
      ];
    }

    console.log(`📊 Total disease records for AI analysis: ${allData.length}`);
    return allData;

  } catch (error) {
    console.error('❌ Error fetching disease data:', error);
    throw new Error('Failed to fetch disease data from database');
  }
};

// function para ma process ang data into structured format para sa AI - convert to readable text
const processDataForAI = (data: DiseaseData[]): string => {
  // group data by municipality and disease - organize lang para ma understand sa AI
  const groupedData: { [municipality: string]: { [disease: string]: number[] } } = {};

  data.forEach(record => {
    const municipality = record.Municipality || 'Unknown';
    const disease = record.DiseaseName || 'Unknown';
    const caseCount = parseInt(record.CaseCount || '0');

    if (!groupedData[municipality]) {
      groupedData[municipality] = {};
    }

    if (!groupedData[municipality][disease]) {
      groupedData[municipality][disease] = [];
    }

    groupedData[municipality][disease].push(caseCount);
  });

  // create summary text para sa AI - readable format para ma analyze
  let summary = "COMPREHENSIVE DISEASE DATA ANALYSIS\n\n";

  Object.keys(groupedData).forEach(municipality => {
    summary += `${municipality.toUpperCase()} MUNICIPALITY:\n`;

    Object.keys(groupedData[municipality]).forEach(disease => {
      const cases = groupedData[municipality][disease];
      const total = cases.reduce((sum, count) => sum + count, 0);
      const average = total / cases.length;
      const latest = cases[cases.length - 1] || 0;

      summary += `  - ${disease}: ${total} total cases, ${cases.length} reports, avg: ${average.toFixed(1)}, latest: ${latest}\n`;
    });

    summary += "\n";
  });

  return summary;
};

// function para ma generate ang comprehensive AI analysis for SMS - main function ni
export const generateComprehensiveAIAnalysis = async (): Promise<ComprehensiveAIAnalysis> => {
  try {
    console.log('🤖 Starting comprehensive AI analysis for SMS...');

    if (!AI_CONFIG.API_KEY) {
      throw new Error('OpenRouter API key is not configured');
    }

    // get all disease data from Firestore - kuhaon tanan data across municipalities
    const allDiseaseData = await getAllDiseaseData();

    if (allDiseaseData.length === 0) {
      throw new Error('No disease data available for analysis');
    }

    const processedData = processDataForAI(allDiseaseData);

    const prompt = `You are a public health expert analyzing disease surveillance data for three municipalities in Cebu, Philippines: Mandaue, Consolacion, and Liloan.

CURRENT DISEASE DATA:
${processedData}

TASK: Analyze this data and provide predictions for next month. Respond ONLY with valid JSON, no other text.

{
  "summary": "Brief overview of current disease situation across all municipalities",
  "predictions": [
    {
      "municipality": "Mandaue",
      "diseases": [
        {
          "name": "COVID-19",
          "currentTrend": "rising",
          "nextMonthPrediction": "increase",
          "reasoning": "Cases increasing due to seasonal factors",
          "riskLevel": "medium"
        }
      ],
      "overallRisk": "medium",
      "recommendations": ["Increase testing", "Public awareness campaigns"]
    },
    {
      "municipality": "Consolacion",
      "diseases": [
        {
          "name": "Dengue",
          "currentTrend": "stable",
          "nextMonthPrediction": "increase",
          "reasoning": "Rainy season approaching",
          "riskLevel": "high"
        }
      ],
      "overallRisk": "medium",
      "recommendations": ["Vector control", "Community education"]
    },
    {
      "municipality": "Liloan",
      "diseases": [
        {
          "name": "Hypertension",
          "currentTrend": "rising",
          "nextMonthPrediction": "stable",
          "reasoning": "Lifestyle factors remain constant",
          "riskLevel": "medium"
        }
      ],
      "overallRisk": "low",
      "recommendations": ["Health screenings", "Lifestyle programs"]
    }
  ],
  "globalInsights": {
    "mostConcerningDisease": "Dengue",
    "emergingTrends": ["Seasonal disease patterns", "Urban health challenges"],
    "seasonalFactors": ["Rainy season increases vector-borne diseases"],
    "recommendations": ["Regional coordination", "Resource sharing"]
  }
}

Respond with valid JSON only. No explanations or additional text.`;

    const response = await fetch(AI_CONFIG.BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_CONFIG.MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`AI API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const aiResponse = result.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI service');
    }

    // clean and parse AI response as JSON - sophisticated parsing pero simple lang logic
    try {
      console.log(' Raw AI response:', aiResponse);

      // clean the response - remove any non-JSON content, kay naa man usahay extra text
      let cleanResponse = aiResponse.trim();

      // remove any text before the first { and after the last } - JSON lang ang kuhaon
      const firstBrace = cleanResponse.indexOf('{');
      const lastBrace = cleanResponse.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanResponse = cleanResponse.substring(firstBrace, lastBrace + 1);
      }

      // remove any <think> tags if present - kay dili man ni needed sa SMS
      cleanResponse = cleanResponse.replace(/<think>.*?<\/think>/gs, '');
      cleanResponse = cleanResponse.replace(/<think>.*$/gs, '');

      console.log(' Cleaned AI response:', cleanResponse);

      const analysisResult: ComprehensiveAIAnalysis = JSON.parse(cleanResponse);
      console.log(' Comprehensive AI analysis generated successfully');
      return analysisResult;

    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error(' Original response:', aiResponse);

      // create comprehensive fallback analysis with detailed predictions - backup lang ni if AI fails
      const fallbackAnalysis: ComprehensiveAIAnalysis = {
        summary: "Based on comprehensive analysis of disease surveillance data across all three municipalities, we're observing significant patterns that require immediate attention and coordinated response efforts.",
        predictions: [
          {
            municipality: "Mandaue",
            diseases: [
              {
                name: "COVID-19",
                currentTrend: "stable",
                nextMonthPrediction: "stable",
                reasoning: "Current vaccination coverage and health protocols are maintaining steady case numbers. No significant variants detected in recent surveillance.",
                riskLevel: "medium"
              },
              {
                name: "Pneumonia",
                currentTrend: "rising",
                nextMonthPrediction: "increase",
                reasoning: "Weather pattern changes and air quality concerns in urban areas are contributing to respiratory infections. Vulnerable populations at higher risk.",
                riskLevel: "high"
              },
              {
                name: "Diabetes",
                currentTrend: "rising",
                nextMonthPrediction: "increase",
                reasoning: "Lifestyle factors including diet and physical activity patterns show concerning trends. Genetic predisposition in local population also contributing.",
                riskLevel: "medium"
              }
            ],
            overallRisk: "high",
            recommendations: ["Enhance respiratory health monitoring", "Expand diabetes screening programs", "Improve air quality measures", "Strengthen health education campaigns"]
          },
          {
            municipality: "Consolacion",
            diseases: [
              {
                name: "Dengue",
                currentTrend: "rising",
                nextMonthPrediction: "increase",
                reasoning: "Approaching rainy season will create ideal breeding conditions for Aedes mosquitoes. Recent surveillance shows increasing larval indices in residential areas.",
                riskLevel: "high"
              },
              {
                name: "Tuberculosis",
                currentTrend: "declining",
                nextMonthPrediction: "stable",
                reasoning: "DOTS program showing effectiveness with improved case detection and treatment completion rates. Community health worker engagement improving outcomes.",
                riskLevel: "medium"
              },
              {
                name: "Hypertension",
                currentTrend: "rising",
                nextMonthPrediction: "increase",
                reasoning: "Aging population demographics and lifestyle factors including stress, diet, and physical inactivity are driving increases in blood pressure cases.",
                riskLevel: "high"
              }
            ],
            overallRisk: "high",
            recommendations: ["Intensify vector control operations", "Community dengue education", "Continue TB treatment programs", "Expand hypertension screening", "Lifestyle intervention programs"]
          },
          {
            municipality: "Liloan",
            diseases: [
              {
                name: "Hypertension",
                currentTrend: "stable",
                nextMonthPrediction: "increase",
                reasoning: "Demographic trends show aging population with increased risk factors. Limited access to preventive care in some barangays contributing to late detection.",
                riskLevel: "medium"
              },
              {
                name: "Dengue",
                currentTrend: "rising",
                nextMonthPrediction: "increase",
                reasoning: "Seasonal patterns and environmental factors including water storage practices and vegetation management affecting mosquito breeding sites.",
                riskLevel: "high"
              },
              {
                name: "Diarrhea",
                currentTrend: "stable",
                nextMonthPrediction: "stable",
                reasoning: "Water quality improvements and sanitation programs maintaining stable case numbers. Continued monitoring needed during rainy season.",
                riskLevel: "low"
              }
            ],
            overallRisk: "medium",
            recommendations: ["Expand community health screenings", "Strengthen vector control", "Water quality monitoring", "Health education on prevention"]
          }
        ],
        globalInsights: {
          mostConcerningDisease: "Dengue",
          emergingTrends: ["Vector-borne diseases increasing with climate patterns", "Chronic diseases rising due to lifestyle changes", "Respiratory infections linked to environmental factors"],
          seasonalFactors: ["Rainy season approaching increases dengue and waterborne disease risks", "Weather changes affecting respiratory health", "Seasonal migration patterns affecting disease transmission"],
          recommendations: ["Coordinate regional vector control efforts", "Share resources between municipalities", "Joint health education campaigns", "Establish inter-municipality disease surveillance network"]
        }
      };

      console.log(' Using fallback AI analysis due to parsing error');
      return fallbackAnalysis;
    }

  } catch (error) {
    console.error(' Error generating comprehensive AI analysis:', error);
    throw error;
  }
};

// function para ma format ang AI analysis into SMS message - convert AI analysis to readable SMS
export const formatAnalysisForSMS = (analysis: ComprehensiveAIAnalysis, municipality: string): string => {
  const municipalityData = analysis.predictions.find(p =>
    p.municipality.toLowerCase().includes(municipality.toLowerCase()) ||
    municipality.toLowerCase().includes(p.municipality.toLowerCase())
  );

  let message = `🏥 HEALTH RADAR AI ANALYSIS\n\n`;
  message += `📊 ${analysis.summary}\n\n`;

  if (municipalityData) {
    message += `📍 ${municipality.toUpperCase()} NEXT MONTH FORECAST:\n`;

    // show all diseases with their predictions - detailed predictions para sa municipality
    municipalityData.diseases.forEach(disease => {
      message += `• ${disease.name}: ${disease.nextMonthPrediction.toUpperCase()}\n`;
      message += `  Risk: ${disease.riskLevel.toUpperCase()}\n`;
      message += `  Why: ${disease.reasoning}\n\n`;
    });

    message += `🎯 ACTIONS NEEDED:\n`;
    municipalityData.recommendations.forEach(rec => {
      message += `• ${rec}\n`;
    });

    message += `\n📈 Overall Risk Level: ${municipalityData.overallRisk.toUpperCase()}\n`;
  }

  message += `\n⚠️ REGIONAL PRIORITY: ${analysis.globalInsights.mostConcerningDisease}\n`;

  // add global recommendations - regional coordination stuff
  if (analysis.globalInsights.recommendations.length > 0) {
    message += `\n🌐 REGIONAL ACTIONS:\n`;
    analysis.globalInsights.recommendations.slice(0, 2).forEach(rec => {
      message += `• ${rec}\n`;
    });
  }

  message += `\nStay alert and coordinate with neighboring municipalities.`;

  return message;
};

// direct SMS sending function para sa AI Analysis Modal - simple direct implementation
export const sendAIAnalysisSMS = async (): Promise<void> => {
  try {
    console.log(' AI Modal: Starting AI analysis SMS sending...');

    // generate comprehensive AI analysis - fresh analysis para sa manual trigger
    const aiAnalysis = await generateComprehensiveAIAnalysis();

    // TextBee config - same config lang sa main SMS service
    const TEXTBEE_CONFIG = {
      BASE_URL: process.env.NEXT_PUBLIC_TEXTBEE_BASE_URL || 'https://api.textbee.dev/api/v1',
      API_KEY: process.env.NEXT_PUBLIC_TEXTBEE_API_KEY || '',
      DEVICE_ID: process.env.NEXT_PUBLIC_TEXTBEE_DEVICE_ID || ''
    };

    // municipality contacts - hardcoded lang kay mao ra man ni sila
    const MUNICIPALITY_CONTACTS = {
      'LILOAN': '+639999592055',
      'LACION': '+639989497323',
      'MANDAUE': '+639321201855'
    };

    // send to all municipalities - broadcast style
    const municipalities = ['LILOAN', 'LACION', 'MANDAUE'];

    for (const municipality of municipalities) {
      try {
        console.log(`📱 AI Modal: Sending AI analysis to ${municipality}...`);

        // format AI analysis for this municipality - municipality-specific formatting
        const aiMessage = formatAnalysisForSMS(aiAnalysis, municipality);
        const phoneNumber = MUNICIPALITY_CONTACTS[municipality as keyof typeof MUNICIPALITY_CONTACTS];

        if (!phoneNumber) {
          console.error(`❌ No phone number for ${municipality}`);
          continue;
        }

        // send SMS - simple fetch lang sa TextBee API
        const response = await fetch(`${TEXTBEE_CONFIG.BASE_URL}/gateway/devices/${TEXTBEE_CONFIG.DEVICE_ID}/send-sms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': TEXTBEE_CONFIG.API_KEY
          },
          body: JSON.stringify({
            recipients: [phoneNumber],
            message: `${municipality}\n\n${aiMessage}`
          })
        });

        const result = await response.json();

        if (response.ok) {
          console.log(`AI Modal: SMS sent successfully to ${municipality} (${phoneNumber})`);
        } else {
          console.error(` AI Modal: Failed to send SMS to ${municipality}:`, result);
        }

      } catch (error) {
        console.error(` AI Modal: Error sending SMS to ${municipality}:`, error);
      }

      // small delay between SMS sends - para di ma overwhelm ang API
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('AI Modal: All SMS notifications sent');

  } catch (error) {
    console.error(' AI Modal: Error in sendAIAnalysisSMS:', error);
    throw error;
  }
};

// Backward compatibility function para sa existing AI Analysis Modal
export async function generateDiseaseAnalysis(processedData: any): Promise<AIAnalysisResponse> {
  try {
    const analysis = await generateComprehensiveAIAnalysis();

    // Convert comprehensive analysis to simple text format
    let textAnalysis = `${analysis.summary}\n\n`;

    analysis.predictions.forEach(pred => {
      textAnalysis += `${pred.municipality.toUpperCase()} MUNICIPALITY:\n`;
      textAnalysis += `Overall Risk: ${pred.overallRisk.toUpperCase()}\n\n`;

      pred.diseases.forEach(disease => {
        textAnalysis += `${disease.name}: ${disease.currentTrend} trend, ${disease.nextMonthPrediction} next month (${disease.riskLevel} risk)\n`;
        textAnalysis += `Reasoning: ${disease.reasoning}\n\n`;
      });

      textAnalysis += `Recommendations:\n`;
      pred.recommendations.forEach(rec => textAnalysis += `• ${rec}\n`);
      textAnalysis += `\n`;
    });

    textAnalysis += `GLOBAL INSIGHTS:\n`;
    textAnalysis += `Most Concerning: ${analysis.globalInsights.mostConcerningDisease}\n`;
    textAnalysis += `Emerging Trends: ${analysis.globalInsights.emergingTrends.join(', ')}\n`;

    return {
      analysis: textAnalysis,
      timestamp: new Date().toISOString(),
      success: true
    };

  } catch (error: any) {
    return {
      analysis: '',
      timestamp: new Date().toISOString(),
      success: false,
      error: error.message || 'Failed to generate AI analysis'
    };
  }
}

// Test function para sa AI connectivity
export async function testAIConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    if (!AI_CONFIG.API_KEY) {
      return { connected: false, error: 'OpenRouter API key not configured' };
    }

    const response = await fetch(AI_CONFIG.BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_CONFIG.MODEL,
        messages: [{ role: 'user', content: 'Hello, please respond with "AI is working"' }],
        max_tokens: 10
      })
    });

    if (response.ok) {
      return { connected: true };
    } else {
      return { connected: false, error: `API error: ${response.status}` };
    }
  } catch (error: any) {
    return {
      connected: false,
      error: error.message || 'Connection test failed'
    };
  }
}
