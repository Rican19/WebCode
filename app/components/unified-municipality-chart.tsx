"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData } from "chart.js";
import { Card, CardBody, CardHeader, Divider, Spinner } from "@heroui/react";
import { useDiseaseData, DISEASE_COLORS } from "../contexts/DiseaseDataContext";
import { useMemo } from "react";

// register lang ang Chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);

interface UnifiedMunicipalityChartProps {
  municipalityName: string;
  displayName?: string;
}

export default function UnifiedMunicipalityChart({ 
  municipalityName, 
  displayName 
}: UnifiedMunicipalityChartProps) {
  const { processedData, loading } = useDiseaseData();

  // Process data - show diseases specific to this municipality
  const chartData: ChartData<'pie'> | null = useMemo(() => {
    if (!processedData || Object.keys(processedData).length === 0) {
      return null;
    }

    // 🏙️ Filter data to show only cases from the specific municipality
    const municipalityDiseases: { [disease: string]: number } = {};

    Object.entries(processedData).forEach(([diseaseName, diseaseData]) => {
      // Get cases for this specific municipality (case-insensitive search)
      let municipalityCases = 0;

      // Find the municipality with normalized matching (handles Lilo-an/Liloan variations)
      Object.entries(diseaseData.municipalities).forEach(([municipality, cases]) => {
        const normalizedStored = municipality.toLowerCase().replace('-', '');
        const normalizedTarget = municipalityName.toLowerCase().replace('-', '');

        if (normalizedStored === normalizedTarget) {
          municipalityCases += cases;
        }
      });

      // Only include diseases that have cases in this municipality
      if (municipalityCases > 0) {
        municipalityDiseases[diseaseName] = municipalityCases;
      }
    });

    const labels = Object.keys(municipalityDiseases);
    const values = Object.values(municipalityDiseases);

    // Debug logging to help verify data filtering
    console.log(`🏙️ ${municipalityName} chart data:`, municipalityDiseases);
    console.log(`🗺️ Available municipalities in data:`,
      Object.keys(processedData).length > 0 ?
        Object.keys(Object.values(processedData)[0].municipalities) :
        []
    );
    console.log(`🔍 Looking for normalized: "${municipalityName.toLowerCase().replace('-', '')}"`);
    console.log(`📊 Total cases found: ${Object.values(municipalityDiseases).reduce((sum, cases) => sum + cases, 0)}`);

    if (labels.length === 0) {
      return null;
    }

    // Use consistent colors from DISEASE_COLORS mapping
    const colors = labels.map(disease =>
      DISEASE_COLORS[disease as keyof typeof DISEASE_COLORS] || '#6B7280'
    );

    return {
      labels: labels.map(label =>
        // Capitalize first letter of each word for display
        label.split(' ').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      ),
      datasets: [
        {
          label: `Disease Cases in ${displayName || municipalityName}`,
          data: values,
          backgroundColor: colors,
          borderColor: colors.map(color => color),
          borderWidth: 2,
          hoverOffset: 8,
          hoverBorderWidth: 3,
        },
      ],
    };
  }, [processedData, municipalityName, displayName]);

  // Calculate total cases for this municipality
  const totalCases = useMemo(() => {
    if (!chartData) return 0;
    return chartData.datasets[0].data.reduce((sum, value) => sum + (value as number), 0);
  }, [chartData]);

  return (
    <div className="w-full">
      <Card className="h-full shadow-lg border border-gray-100">
        <CardHeader className="flex gap-3 items-center justify-between bg-gradient-to-r from-[#143D60] to-[#1e5a8a] text-white rounded-t-lg">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold">{displayName || municipalityName}</h3>
            <p className="text-sm opacity-90">Disease Distribution</p>
            <p className="text-xs opacity-75">Municipality Specific</p>
          </div>
          {totalCases > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold">{totalCases}</div>
              <div className="text-xs opacity-90">Total Cases</div>
              <div className="text-xs opacity-75">This Area</div>
            </div>
          )}
        </CardHeader>
        <Divider />
        <CardBody className="p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" color="primary" />
              <span className="ml-3 text-gray-600">Loading data...</span>
            </div>
          ) : chartData ? (
            <div className="h-64">
              <Pie 
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                      labels: {
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                          size: 11,
                          family: 'Inter, sans-serif'
                        },
                        color: '#374151',
                        boxWidth: 12,
                        boxHeight: 12
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#fff',
                      bodyColor: '#fff',
                      borderColor: '#e5e7eb',
                      borderWidth: 1,
                      cornerRadius: 8,
                      displayColors: true,
                      callbacks: {
                        label: function(context) {
                          const total = context.dataset.data.reduce((sum, value) => sum + (value as number), 0);
                          const percentage = ((context.parsed as number / total) * 100).toFixed(1);
                          return `${context.label}: ${context.parsed} cases (${percentage}%)`;
                        },
                        title: function() {
                          return `${displayName || municipalityName} Only`;
                        }
                      }
                    }
                  },
                  animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000
                  }
                }} 
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <div className="text-4xl mb-3">📊</div>
              <div className="text-lg font-medium mb-1">No Data Available</div>
              <div className="text-sm text-center">
                No disease cases found in the system.<br/>
                Upload CSV data to see charts.
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
