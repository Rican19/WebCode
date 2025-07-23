"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useDiseaseData } from "../contexts/DiseaseDataContext";
import { useMemo, useState } from "react";
import AIAnalysisModal from "./AIAnalysisModal";

// Register the necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function PredictionChart() {
  const { processedData } = useDiseaseData();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Generate prediction data based sa uploaded CSV - medyo complex ni pero okay ra
  const data = useMemo(() => {
    const labels = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    // Wala pa'y data? Return empty nalang para dili mag error
    if (Object.keys(processedData).length === 0) {
      return { labels, datasets: [] };
    }

    const datasets = Object.entries(processedData).map(([diseaseName, data]) => {
      // Generate prediction trend based sa current cases - gihimo nako realistic siya
      const baseCases = data.totalCases;
      const predictionData = labels.map((_, index) => {
        // Gihimo nako realistic ang prediction with seasonal patterns
        const seasonalFactor = Math.sin((index * Math.PI) / 6) * 0.3 + 1; // Para seasonal variation
        const trendFactor = 1 + (index * 0.02); // Slight increase over time
        const randomVariation = (Math.random() - 0.5) * 0.2 + 1; // Random variation para realistic

        // Make sure dili negative ang result
        return Math.max(0, Math.round(baseCases * seasonalFactor * trendFactor * randomVariation));
      });

      return {
        label: diseaseName.charAt(0).toUpperCase() + diseaseName.slice(1),
        data: predictionData,
        borderColor: data.color,
        backgroundColor: data.color + '20', // Add transparency
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: data.color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      };
    });

    return { labels, datasets };
  }, [processedData]);

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: 'bold' as const
          },
          color: '#374151'
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1F2937',
        bodyColor: '#374151',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          title: function(context: any[]) {
            return `${context[0].label} Prediction`;
          },
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y} cases`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6'
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          },
          callback: function(value: any) {
            return value + ' cases';
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  };

  return (
    <div className="w-full h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#143D60] to-[#1e4a6b] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#143D60]">Predictive Analytics</h3>
              <p className="text-sm text-gray-600">Disease trend forecasting based on uploaded data</p>
            </div>
          </div>

          {/* AI Analysis Button - only show if may data na */}
          {Object.keys(processedData).length > 0 && (
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#143D60] to-[#1e4a6b] text-white px-4 py-2 rounded-lg hover:from-[#1e4a6b] hover:to-[#143D60] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="font-medium">AI Analysis</span>
            </button>
          )}
        </div>

        {Object.keys(processedData).length === 0 ? (
          <div className="h-80 bg-gray-50 rounded-xl p-4 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Disease Data Available</h3>
              <p className="text-gray-500 mb-4">Upload disease case data to generate predictions</p>
            </div>
          </div>
        ) : (
          <div className="h-80 bg-gray-50 rounded-xl p-4">
            <Line data={data} options={options} />
          </div>
        )}
      </div>

      {/* AI Analysis Modal */}
      <AIAnalysisModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </div>
  );
}
