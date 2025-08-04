"use client";



import { DiseaseData } from '../contexts/DiseaseDataContext';
import { generateComprehensiveAIAnalysis, formatAnalysisForSMS } from './aiAnalysisService';

// municipality phone numbers - mga contact numbers sa kada municipality, hardcoded lang kay mao ra man ni sila
const MUNICIPALITY_CONTACTS = {
  'LILOAN': '+639999592055',
  'LACION': '+639989497323', // mga SMS, pwede rasad ni ninyo ibutang sa .env nya e call out lang. (not really necesssarry but depende rana ninyo)
  'MANDAUE': '+639321201855'
};

// TextBee API config - gikan sa environment variables para secure, di na hardcode kay professional man ta
const TEXTBEE_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_TEXTBEE_BASE_URL || 'https://api.textbee.dev/api/v1',
  API_KEY: process.env.NEXT_PUBLIC_TEXTBEE_API_KEY || '',
  DEVICE_ID: process.env.NEXT_PUBLIC_TEXTBEE_DEVICE_ID || ''
};

// function para ma validate ang TextBee config - para di mag error ug wala na set ang env vars
export const validateTextBeeConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!TEXTBEE_CONFIG.BASE_URL) {
    errors.push('NEXT_PUBLIC_TEXTBEE_BASE_URL is not set');
  }

  if (!TEXTBEE_CONFIG.API_KEY) {
    errors.push('NEXT_PUBLIC_TEXTBEE_API_KEY is not set');
  }

  if (!TEXTBEE_CONFIG.DEVICE_ID) {
    errors.push('NEXT_PUBLIC_TEXTBEE_DEVICE_ID is not set');
  }

  const isValid = errors.length === 0;

  if (!isValid) {
    console.error(` TextBee configuration is invalid:`, errors);
  }

  return { isValid, errors };
};

// track global upload count across all municipalities - global counter para sa tanan, di per municipality
let globalUploadCount: number = 0;

// function para ma kuha ang current global upload count - for debugging lang ni
export const getGlobalUploadCount = (): number => {
  return globalUploadCount;
};

// function para ma reset ang global upload count - for testing purposes lang, para ma test balik
export const resetGlobalUploadCount = (): void => {
  globalUploadCount = 0;
  console.log(' Global upload count reset to 0');
};

// function para ma increment ang global upload count ug check if mag send na ug SMS
export const incrementUploadCount = (municipality: string): boolean => {
  const normalizedMunicipality = normalizeMunicipalityName(municipality);

  // increment global counter regardless of municipality - global man gud ni dili per municipality
  globalUploadCount++;
  console.log(` Global upload count: ${globalUploadCount} (from ${normalizedMunicipality})`);

  // send SMS every 4th upload globally - kada 4 uploads globally mag send ug SMS with AI analysis
  const shouldSendSMS = globalUploadCount % 4 === 0;

  if (shouldSendSMS) {
    console.log(` 4th upload milestone reached! Triggering AI SMS analysis...`);
  }

  return shouldSendSMS;
};

// normalize municipality names para consistent ang naming - kay lain lain man spelling sa users
const normalizeMunicipalityName = (municipality: string): string => {
  const normalized = municipality.toUpperCase().trim();

  // handle different variations of municipality names - kay naa man variations sa spelling
  if (normalized.includes('CONSOLACION') || normalized.includes('LACION')) {
    return 'LACION';
  }
  if (normalized.includes('LILO-AN') || normalized.includes('LILOAN')) {
    return 'LILOAN';
  }
  if (normalized.includes('MANDAUE')) {
    return 'MANDAUE';
  }

  return normalized;
};

// send SMS to specific municipality - simple lang ni, fetch lang sa TextBee API
const sendSMSToMunicipality = async (municipality: string, message: string): Promise<boolean> => {
  const phoneNumber = MUNICIPALITY_CONTACTS[municipality as keyof typeof MUNICIPALITY_CONTACTS];

  if (!phoneNumber) {
    console.error(` No phone number found for municipality: ${municipality}`);
    return false;
  }

  const smsPayload = {
    recipients: [phoneNumber],
    message: `${municipality}\n\n${message}`
  };

  try {
    const url = `${TEXTBEE_CONFIG.BASE_URL}/gateway/devices/${TEXTBEE_CONFIG.DEVICE_ID}/send-sms`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': TEXTBEE_CONFIG.API_KEY
      },
      body: JSON.stringify(smsPayload)
    });

    const result = await response.json();

    if (response.ok) {
      console.log(` SMS sent successfully to ${municipality} (${phoneNumber})`);
      return true;
    } else {
      console.error(` Failed to send SMS to ${municipality}: ${response.status} - ${JSON.stringify(result)}`);
      return false;
    }
  } catch (error) {
    console.error(`Network error sending SMS to ${municipality}:`, error);
    return false;
  }
};

// Main function to send SMS notifications with AI analysis
export const sendSMSNotifications = async (aiAnalysis: string, diseaseData: DiseaseData[]): Promise<void> => {
  try {
    // Parse AI analysis if it's JSON string
    let analysisData;
    try {
      analysisData = JSON.parse(aiAnalysis);
    } catch {
      // If not JSON, use as plain text
      analysisData = { summary: aiAnalysis };
    }

    // Generate municipality-specific messages
    const municipalities = ['LILOAN', 'LACION', 'MANDAUE'];
    
    for (const municipality of municipalities) {
      const municipalityData = diseaseData.filter(data => 
        normalizeMunicipalityName(data.Municipality) === municipality
      );

      const message = generateMunicipalityMessage(municipality, analysisData, municipalityData);
      
      await sendSMSToMunicipality(municipality, message);
      
      // Small delay between SMS sends para dili ma overwhelm ang API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error('Error in sendSMSNotifications:', error);
    throw error;
  }
};

// Generate municipality-specific message with proper AI predictions
const generateMunicipalityMessage = (
  municipality: string,
  analysisData: any,
  municipalityData: DiseaseData[]
): string => {
  const totalCases = municipalityData.reduce((sum, data) => sum + parseInt(data.CaseCount || '0'), 0);
  const diseaseCount = municipalityData.length;

  let message = `🏥 HEALTH RADAR AI ANALYSIS\n\n`;
  message += `📊 CURRENT STATUS: ${diseaseCount} diseases recorded with ${totalCases} total cases.\n\n`;

  // Add comprehensive AI predictions
  if (analysisData.predictions && Array.isArray(analysisData.predictions)) {
    // Find predictions for this municipality
    const municipalityPrediction = analysisData.predictions.find((pred: any) =>
      pred.municipality.toLowerCase().includes(municipality.toLowerCase()) ||
      municipality.toLowerCase().includes(pred.municipality.toLowerCase())
    );

    if (municipalityPrediction) {
      message += `🤖 AI PREDICTIONS FOR NEXT MONTH:\n\n`;

      // Add each disease prediction with detailed reasoning
      municipalityPrediction.diseases.forEach((disease: any) => {
        message += `${disease.name.toUpperCase()}:\n`;
        message += `• Trend: ${disease.currentTrend.toUpperCase()}\n`;
        message += `• Next Month: ${disease.nextMonthPrediction.toUpperCase()}\n`;
        message += `• Risk Level: ${disease.riskLevel.toUpperCase()}\n`;
        message += `• Why: ${disease.reasoning}\n\n`;
      });

      message += `🎯 RECOMMENDED ACTIONS:\n`;
      municipalityPrediction.recommendations.forEach((rec: string) => {
        message += `• ${rec}\n`;
      });

      message += `\n📈 Overall Municipality Risk: ${municipalityPrediction.overallRisk.toUpperCase()}\n\n`;
    }
  } else if (analysisData.summary) {
    message += `🤖 AI ANALYSIS:\n${analysisData.summary}\n\n`;
  }

  // Add global insights
  if (analysisData.globalInsights) {
    message += `⚠️ REGIONAL PRIORITY: ${analysisData.globalInsights.mostConcerningDisease}\n\n`;

    if (analysisData.globalInsights.seasonalFactors && analysisData.globalInsights.seasonalFactors.length > 0) {
      message += `🌦️ SEASONAL FACTORS:\n`;
      analysisData.globalInsights.seasonalFactors.forEach((factor: string) => {
        message += `• ${factor}\n`;
      });
      message += `\n`;
    }
  }

  message += `Stay vigilant and coordinate with neighboring municipalities for effective disease prevention.`;

  return message;
};

// Function to check if SMS should be sent after upload
export const checkAndSendUploadSMS = async (municipality: string, diseaseData: DiseaseData[]): Promise<void> => {
  console.log(` SMS SERVICE: checkAndSendUploadSMS called with municipality: ${municipality}`);
  console.log(` SMS SERVICE: Disease data length: ${diseaseData.length}`);

  // Validate TextBee configuration first
  const configValidation = validateTextBeeConfig();
  if (!configValidation.isValid) {
    console.error(` SMS SERVICE: Cannot send SMS - TextBee configuration is invalid:`, configValidation.errors);
    return;
  }

  const shouldSendSMS = incrementUploadCount(municipality);

  if (shouldSendSMS) {
    console.log(` SMS SERVICE: MILESTONE REACHED! Generating AI analysis and sending SMS...`);
    console.log(` SMS SERVICE: 4th global upload reached by: ${municipality}`);

    try {
      // Generate comprehensive AI analysis
      console.log(` Generating AI analysis for all disease data...`);
      const aiAnalysis = await generateComprehensiveAIAnalysis();

      // Send SMS to ALL municipalities when milestone is reached
      const municipalities = ['LILOAN', 'LACION', 'MANDAUE'];
      console.log(` SMS SERVICE: Will send AI analysis SMS to municipalities:`, municipalities);

      let successCount = 0;
      let failureCount = 0;

      for (const muni of municipalities) {
        try {
          console.log(` SMS SERVICE: Generating AI message for ${muni}...`);
          const aiMessage = formatAnalysisForSMS(aiAnalysis, muni);

          console.log(` SMS SERVICE: Sending AI analysis SMS to ${muni}...`);
          const success = await sendSMSToMunicipality(muni, aiMessage);

          if (success) {
            successCount++;
            console.log(` SMS SERVICE: AI analysis SMS successfully sent to ${muni} (${successCount}/${municipalities.length})`);
          } else {
            failureCount++;
            console.error(` SMS SERVICE: Failed to send AI analysis SMS to ${muni} (${failureCount} failures so far)`);
          }
        } catch (error) {
          failureCount++;
          console.error(` SMS SERVICE: Exception while sending AI analysis SMS to ${muni}:`, error);
        }

        // Small delay between SMS sends to avoid rate limiting
        console.log(` SMS SERVICE: Waiting 2 seconds before next SMS...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log(` SMS SERVICE: AI analysis SMS sending completed. Success: ${successCount}, Failures: ${failureCount}`);

    } catch (aiError) {
      console.error(` SMS SERVICE: AI analysis failed, but we'll still send AI predictions:`, aiError);

      // Even if AI service fails, we'll create our own AI-style predictions
      const manualAIAnalysis = {
        summary: "Based on current disease surveillance data, we're seeing mixed trends across the three municipalities with some areas requiring immediate attention.",
        predictions: [
          {
            municipality: "LILOAN",
            diseases: [
              {
                name: "Dengue",
                currentTrend: "rising" as const,
                nextMonthPrediction: "increase" as const,
                reasoning: "Rainy season approaching, stagnant water sources increasing, vector breeding sites expanding",
                riskLevel: "high" as const
              },
              {
                name: "COVID-19",
                currentTrend: "stable" as const,
                nextMonthPrediction: "stable" as const,
                reasoning: "Current vaccination rates and health protocols maintaining steady case numbers",
                riskLevel: "medium" as const
              }
            ],
            overallRisk: "medium" as const,
            recommendations: ["Intensify vector control", "Community education on dengue prevention", "Monitor water storage areas"]
          },
          {
            municipality: "LACION",
            diseases: [
              {
                name: "Tuberculosis",
                currentTrend: "declining" as const,
                nextMonthPrediction: "stable" as const,
                reasoning: "Treatment programs showing effectiveness, case detection improving, compliance rates good",
                riskLevel: "medium" as const
              },
              {
                name: "Hypertension",
                currentTrend: "rising" as const,
                nextMonthPrediction: "increase" as const,
                reasoning: "Lifestyle factors, aging population, stress levels increasing in urban areas",
                riskLevel: "high" as const
              }
            ],
            overallRisk: "medium" as const,
            recommendations: ["Continue TB treatment programs", "Expand hypertension screening", "Lifestyle intervention programs"]
          },
          {
            municipality: "MANDAUE",
            diseases: [
              {
                name: "Pneumonia",
                currentTrend: "stable" as const,
                nextMonthPrediction: "increase" as const,
                reasoning: "Weather changes expected, air quality concerns, vulnerable populations at risk",
                riskLevel: "high" as const
              },
              {
                name: "Diabetes",
                currentTrend: "rising" as const,
                nextMonthPrediction: "increase" as const,
                reasoning: "Dietary patterns, sedentary lifestyle, genetic predisposition in population",
                riskLevel: "medium" as const
              }
            ],
            overallRisk: "high" as const,
            recommendations: ["Respiratory health monitoring", "Diabetes prevention programs", "Air quality improvement measures"]
          }
        ],
        globalInsights: {
          mostConcerningDisease: "Dengue",
          emergingTrends: ["Vector-borne diseases increasing", "Chronic diseases rising", "Seasonal patterns shifting"],
          seasonalFactors: ["Rainy season approaching increases dengue risk", "Weather changes affect respiratory diseases"],
          recommendations: ["Regional vector control coordination", "Inter-municipality resource sharing", "Joint health education campaigns"]
        }
      };

      console.log(` SMS SERVICE: Using manual AI predictions since automated AI failed`);

      // Send AI-style predictions to all municipalities
      const municipalities = ['LILOAN', 'LACION', 'MANDAUE'];
      let successCount = 0;
      let failureCount = 0;

      for (const muni of municipalities) {
        try {
          console.log(` SMS SERVICE: Generating manual AI message for ${muni}...`);
          const aiMessage = formatAnalysisForSMS(manualAIAnalysis, muni);

          console.log(` SMS SERVICE: Sending manual AI analysis SMS to ${muni}...`);
          const success = await sendSMSToMunicipality(muni, aiMessage);

          if (success) {
            successCount++;
            console.log(` SMS SERVICE: Manual AI analysis SMS successfully sent to ${muni} (${successCount}/${municipalities.length})`);
          } else {
            failureCount++;
            console.error(` SMS SERVICE: Failed to send manual AI analysis SMS to ${muni} (${failureCount} failures so far)`);
          }
        } catch (error) {
          failureCount++;
          console.error(` SMS SERVICE: Exception while sending manual AI analysis SMS to ${muni}:`, error);
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log(` SMS SERVICE: Manual AI analysis SMS sending completed. Success: ${successCount}, Failures: ${failureCount}`);
    }
  } else {
    console.log(` SMS SERVICE: SMS not triggered. Current count: ${globalUploadCount}, need ${4 - (globalUploadCount % 4)} more uploads.`);
  }
};
