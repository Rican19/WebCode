"use client";

import { useEffect, useState } from "react";
import { useDiseaseData } from "@/app/contexts/DiseaseDataContext";
import "leaflet/dist/leaflet.css";

export default function Body() {
  const { processedData } = useDiseaseData();
  const [municipalityData, setMunicipalityData] = useState<
    Record<string, number>
  >({});

  // 🗺️ Process Disease Distribution data for heatmap (connected to municipality charts)
  useEffect(() => {
    console.log("🗺️ Heatmap useEffect triggered");
    console.log("processedData:", processedData);
    console.log("processedData keys:", Object.keys(processedData || {}));

    if (!processedData || Object.keys(processedData).length === 0) {
      console.log("❌ No processed data available for heatmap");
      setMunicipalityData({});
      return;
    }

    console.log("✅ Processing Disease Distribution data for heatmap...");

    // 📊 Calculate total cases per municipality from latest batch data
    const municipalityMap: Record<string, number> = {};

    Object.entries(processedData).forEach(([diseaseName, diseaseData]) => {
      console.log(`Processing disease: ${diseaseName}`, diseaseData);
      Object.entries(diseaseData.municipalities).forEach(([municipality, cases]) => {
        // 🔧 Normalize municipality names (remove hyphens for consistent matching)
        const normalizedKey = municipality.toLowerCase().replace('-', '');
        console.log(`  Municipality: ${municipality} -> ${normalizedKey}, Cases: ${cases}`);
        municipalityMap[normalizedKey] = (municipalityMap[normalizedKey] || 0) + cases;
      });
    });

    console.log("🎯 Final municipality case counts for heatmap:", municipalityMap);
    console.log("🔑 Available municipality keys:", Object.keys(municipalityMap));
    setMunicipalityData(municipalityMap);
  }, [processedData]);

  // Load and render map
  useEffect(() => {
    if (Object.keys(municipalityData).length === 0) return;
    if (typeof window === 'undefined') return; // Ensure we're on the client side

    const loadMap = async () => {
      // Dynamically import Leaflet to avoid SSR issues
      const L = (await import("leaflet")).default;

      const map = L.map("map").setView([10.35, 123.93], 11);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

    // 🎨 Updated color thresholds: Low (0-150), Medium (151-500), High (501+)
    const getColor = (count: number) =>
      count >= 501
        ? "#DC2626"    // High - Red (501+ cases)
        : count >= 151
        ? "#F59E0B"    // Medium - Amber (151-500 cases)
        : count >= 1
        ? "#10B981"    // Low - Green (1-150 cases)
        : "#E5E7EB";   // No cases - Light Gray

    // 🐛 Debug logging for heatmap data connection
    console.log("Heatmap municipalityData:", municipalityData);
    console.log("Looking for Mandaue:", municipalityData["mandaue"]);
    console.log("Looking for Liloan (normalized):", municipalityData["liloan"]);
    console.log("Looking for Consolacion:", municipalityData["consolacion"]);

    const featuredMunicipalities: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            name: "Mandaue City",
            caseCount: municipalityData["mandaue"] || 0,
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [123.91, 10.31], // Southwest corner
                [123.96, 10.31], // Southeast corner
                [123.96, 10.35], // Northeast corner
                [123.91, 10.35], // Northwest corner
                [123.91, 10.31], // Close the polygon
              ],
            ],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "Lilo-an",
            caseCount: municipalityData["liloan"] || 0,
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [123.978, 10.396],
                [123.988, 10.396],
                [123.988, 10.408],
                [123.978, 10.408],
                [123.978, 10.396],
              ],
            ],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "Consolacion",
            caseCount: municipalityData["consolacion"] || 0,
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [123.935, 10.387],
                [123.945, 10.387],
                [123.945, 10.4],
                [123.935, 10.4],
                [123.935, 10.387],
              ],
            ],
          },
        },
      ],
    };

      L.geoJSON(featuredMunicipalities, {
        style: (feature) => ({
          fillColor: getColor(feature?.properties?.caseCount || 0),
          weight: 2,
          opacity: 1,
          color: "white",
          dashArray: "3",
          fillOpacity: 0.7,
        }),
        onEachFeature: (feature, layer) => {
          const { name, caseCount } = feature.properties;
          layer.bindPopup(`<b>${name}</b><br/>Cases: ${caseCount}`);
        },
      }).addTo(map);
    };

    loadMap();
  }, [municipalityData]);

  return (
    <div className="flex-1 overflow-auto">
      {/* Enhanced Header - Enhanced header na nag-complement sa background */}
      <div className="bg-white/95 backdrop-blur-xl shadow-sm border-b border-white/30 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#143D60] mb-2">Disease Heatmap</h1>
            <p className="text-gray-600">Geographic distribution of disease cases across municipalities</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Interactive Map</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Enhanced Map Container - Enhanced map container na nag-complement sa background */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 overflow-hidden hover:shadow-xl transition-all duration-300">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#A0C878] to-[#DDEB9D] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#143D60]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#143D60]">Regional Disease Distribution</h3>
                  <p className="text-sm text-gray-600">Click on municipalities to view detailed case information</p>
                </div>
              </div>

              {/* Legend - Updated thresholds connected to Disease Distribution */}
              <div className="flex items-center gap-4">
                <div className="text-xs text-gray-600">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                    <span>Low (1-150 cases)</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 bg-amber-500 rounded"></div>
                    <span>Medium (151-500 cases)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded"></div>
                    <span>High (501+ cases)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div id="map" className="w-full h-[600px] bg-gray-50" />
          </div>
        </div>

        {/* Enhanced Statistics Cards - Enhanced statistics cards na nag-complement sa background */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/30 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Municipalities</p>
                <p className="text-3xl font-bold text-[#143D60] mt-2">{Object.keys(municipalityData).length}</p>
                <p className="text-sm text-gray-500 mt-1">Covered regions</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-[#143D60] to-[#1e4a6b] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/30 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Highest Cases</p>
                <p className="text-3xl font-bold text-[#143D60] mt-2">
                  {Math.max(...Object.values(municipalityData)) || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">Peak municipality</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-[#EB5B00] to-[#ff6b1a] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/30 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Average Cases</p>
                <p className="text-3xl font-bold text-[#143D60] mt-2">
                  {Object.keys(municipalityData).length > 0
                    ? Math.round(Object.values(municipalityData).reduce((a, b) => a + b, 0) / Object.keys(municipalityData).length)
                    : 0
                  }
                </p>
                <p className="text-sm text-gray-500 mt-1">Per municipality</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-[#A0C878] to-[#DDEB9D] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-[#143D60]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
