// test file para ma test ang SMS functionality - for debugging purposes lang ni
// run this sa browser console para ma test if working ang SMS

import { sendSMSNotifications, checkAndSendUploadSMS, getGlobalUploadCount, resetGlobalUploadCount } from './smsService';
import { DiseaseData } from '../contexts/DiseaseDataContext';

// test data para sa SMS - sample data lang para ma test
const testDiseaseData: DiseaseData[] = [
  {
    Municipality: 'Liloan',
    DiseaseName: 'Dengue',
    CaseCount: '15'
  },
  {
    Municipality: 'Mandaue',
    DiseaseName: 'COVID-19',
    CaseCount: '8'
  },
  {
    Municipality: 'Consolacion',
    DiseaseName: 'Tuberculosis',
    CaseCount: '12'
  }
];

// test AI analysis data - sample AI response para ma test
const testAIAnalysis = JSON.stringify({
  summary: "Based on current disease surveillance data, there is a moderate increase in dengue cases across all municipalities. Preventive measures should be implemented immediately.",
  predictions: "Next month outlook shows potential 20% increase in mosquito-borne diseases due to rainy season. Enhanced vector control recommended.",
  recommendations: [
    "Increase community education on dengue prevention",
    "Implement enhanced mosquito control measures",
    "Monitor water storage areas closely"
  ]
});

// function para ma test ang SMS notifications - manual testing lang ni
export const testSMSNotifications = async () => {
  try {
    console.log('🧪 Testing SMS notifications...');
    await sendSMSNotifications(testAIAnalysis, testDiseaseData);
    console.log('✅ SMS test completed successfully!');
  } catch (error) {
    console.error('❌ SMS test failed:', error);
  }
};

// function para ma test ang upload SMS check - simulate upload trigger
export const testUploadSMS = async (municipality: string) => {
  try {
    console.log(`🧪 Testing upload SMS for ${municipality}...`);
    await checkAndSendUploadSMS(municipality, testDiseaseData);
    console.log('✅ Upload SMS test completed!');
  } catch (error) {
    console.error('❌ Upload SMS test failed:', error);
  }
};

// function para ma test ang global counting - simulate 4 uploads para ma trigger ang SMS
export const testGlobalCounting = async () => {
  console.log('🧪 Testing global upload counting...');

  // reset counter first - start from zero
  resetGlobalUploadCount();
  console.log(`Initial count: ${getGlobalUploadCount()}`);

  // simulate uploads from different municipalities - test ang global counting
  console.log('1st upload (Liloan):');
  await testUploadSMS('Liloan');
  console.log(`Count after Liloan: ${getGlobalUploadCount()}`);

  console.log('2nd upload (Mandaue):');
  await testUploadSMS('Mandaue');
  console.log(`Count after Mandaue: ${getGlobalUploadCount()}`);

  console.log('3rd upload (Consolacion):');
  await testUploadSMS('Consolacion');
  console.log(`Count after Consolacion: ${getGlobalUploadCount()}`);

  console.log('4th upload (Liloan again) - Should trigger SMS:');
  await testUploadSMS('Liloan');
  console.log(`Count after 4th upload: ${getGlobalUploadCount()}`);
};

// para ma run sa browser console - copy paste lang ni sa console
// import { testSMSNotifications, testUploadSMS, testGlobalCounting } from './app/services/testSMS';
// testSMSNotifications();
// testUploadSMS('Liloan');
// testGlobalCounting(); // test the global counting system
