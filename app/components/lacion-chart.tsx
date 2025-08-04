"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData } from "chart.js";
import { Card, CardBody, CardHeader, Divider, Spinner } from "@heroui/react";
import { useDiseaseData, DISEASE_COLORS } from "../contexts/DiseaseDataContext";
import { useMemo } from "react";

// register lang ang Chart.js elements para ma work ang chart
ChartJS.register(ArcElement, Tooltip, Legend);

export default function LacionChart() {
  const { processedData, loading } = useDiseaseData();

  // process data para ma show ang diseases specific sa Consolacion from global data
  const chartData: ChartData<'pie'> | null = useMemo(() => {
    if (!processedData || Object.keys(processedData).length === 0) {
      return null;
    }

    // 🏙️ filter lang ang data para ma show ang Consolacion cases (global data)
    const consolacionDiseases: { [disease: string]: number } = {};

    Object.entries(processedData).forEach(([diseaseName, diseaseData]) => {
      // kuha ang cases para sa Consolacion municipality (case-insensitive search)
      let consolacionCases = 0;

      // find ang Consolacion municipality with normalized matching
      Object.entries(diseaseData.municipalities).forEach(([municipality, cases]) => {
        const normalizedStored = municipality.toLowerCase().replace('-', '');
        const normalizedTarget = "consolacion";

        if (normalizedStored === normalizedTarget) {
          consolacionCases += cases;
        }
      });

      // include lang ang diseases na naa cases sa Consolacion
      if (consolacionCases > 0) {
        consolacionDiseases[diseaseName] = consolacionCases;
      }
    });

    const labels = Object.keys(consolacionDiseases);
    const values = Object.values(consolacionDiseases);

    // Debug logging to help verify data filtering
    console.log("Consolacion chart data (global):", consolacionDiseases);
    console.log("Available municipalities in global data:",
      Object.keys(processedData).length > 0 ?
        Object.keys(Object.values(processedData)[0].municipalities) :
        []
    );

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
          label: "Disease Cases in Consolacion",
          data: values,
          backgroundColor: colors,
          borderColor: colors.map(color => color),
          borderWidth: 2,
          hoverOffset: 8,
          hoverBorderWidth: 3,
        },
      ],
    };
  }, [processedData]);

  // Calculate total cases for Consolacion
  const totalCases = useMemo(() => {
    if (!chartData) return 0;
    return chartData.datasets[0].data.reduce((sum, value) => sum + (value as number), 0);
  }, [chartData]);

  return (
    <div>
      <Card className="max-w-[400px]">
        <CardHeader className="flex gap-3 items-center text-black">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-[#143D60]">Consolacion</h3>
            <p className="text-sm text-gray-600">Disease Distribution (Global Data)</p>
            {totalCases > 0 && (
              <p className="text-xs text-blue-600 mt-1">Total Cases: {totalCases}</p>
            )}
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" />
            </div>
          ) : chartData ? (
            <div className="h-64">
              <Pie data={chartData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                      font: {
                        size: 12
                      }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} cases (${percentage}%)`;
                      }
                    }
                  }
                }
              }} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">No data available for Consolacion</p>
                <p className="text-xs text-gray-500">No global data found for this municipality</p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
