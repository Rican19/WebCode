"use client";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";


// register lang ang required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function MandaueChart() {
  const data = {
    labels: ["Red", "Blue", "Yellow"],
    datasets: [
      {
        label: "My First Dataset",
        data: [300, 50, 100],
        backgroundColor: [
          "rgb(255, 99, 132)",
          "rgb(54, 162, 235)",
          "rgb(255, 205, 86)",
        ],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-[#143D60] mb-1">Mandaue City</h3>
        <p className="text-sm text-gray-600">Disease Distribution</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="h-64 flex items-center justify-center">
          <Pie data={data} options={{
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
              }
            }
          }} />
        </div>
      </div>
    </div>
  );
}
