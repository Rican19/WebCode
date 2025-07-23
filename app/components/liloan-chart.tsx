"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData } from "chart.js";
import { Card, CardBody, CardHeader, Divider, Spinner } from "@heroui/react";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

// register lang ang Chart.js elements para ma work ang chart
ChartJS.register(ArcElement, Tooltip, Legend);

export default function LiloanChart() {
  const [chartData, setChartData] = useState<ChartData<'pie'> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) return;

      try {
        console.log("Fetching global centralized data for Liloan chart...");

        // fetch from centralized collection na naa tanan municipality data
        const centralizedCasesRef = collection(
          db,
          "healthradarDB",
          "centralizedData",
          "allCases"
        );
        const snapshot = await getDocs(centralizedCasesRef);
        const data = snapshot.docs.map((doc) => doc.data());
        console.log(`Found ${data.length} records in centralized collection for Liloan chart`);

        // filter lang para sa Municipality = "Lilo-an"
        const filteredData = data.filter(
          (item) => item.Municipality?.toLowerCase() === "lilo-an"
        );

        console.log("Raw data:", data);
        console.log("Filtered data:", filteredData);

        // Aggregate case counts by disease within "Lilo-an"
        const diseaseMap: Record<string, number> = {};
        filteredData.forEach((item) => {
          const name = item.DiseaseName;
          const count = parseInt(item.CaseCount, 10);
          if (!isNaN(count)) {
            diseaseMap[name] = (diseaseMap[name] || 0) + count;
          }
        });

        const labels = Object.keys(diseaseMap);
        const values = Object.values(diseaseMap);
        const disease = labels.map(() => `hsl(${Math.random() * 360}, 70%, 60%)`);

        setChartData({
          labels,
          datasets: [
            {
              label: "Disease Case Count",
              data: values,
              backgroundColor: disease,
              hoverOffset: 4,
            },
          ],
        });

        console.log("Successfully loaded global data for Liloan chart");
      } catch (error) {
        console.error("Error fetching global centralized data for Liloan chart:", error);
        setChartData({
          labels: [],
          datasets: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  return (
    <div>
      <Card className="max-w-[400px]">
        <CardHeader className="flex gap-3 items-center text-black">
          Lilo-an Chart
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
                <p className="text-sm font-semibold text-gray-700 mb-1">No data available for Lilo-an</p>
                <p className="text-xs text-gray-500">Upload CSV data to see the chart</p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
