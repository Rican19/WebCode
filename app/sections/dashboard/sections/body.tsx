"use client";

import UnifiedMunicipalityChart from "../../../components/unified-municipality-chart";
import NewsBox from "../../../components/news-box";
import PredictionChart from "../../../components/prediction-chart";

import UserMunicipalityCard from "../../../components/UserMunicipalityCard";
import { useState, useEffect } from "react";

export default function Body() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // real-time clock ni para sa dashboard - para professional kaayo tan-awon
  // nag update every second para live jud ang time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date()); // update ang time kada second
    }, 1000);

    // cleanup ang timer para dili mag memory leak - importante ni!
    return () => clearInterval(timer);
  }, []);

  // format ang time para nindot tan-awon - 12:34:56 format
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit' // with seconds para live jud
    });
  };

  // format ang date para readable - "Monday, January 1, 2025" format
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long', // Monday, Tuesday, etc.
      year: 'numeric',
      month: 'long', // January, February, etc.
      day: 'numeric'
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Enhanced Header section - Enhanced header na nag-complement sa background */}
      <div className="bg-white/95 backdrop-blur-xl shadow-sm border-b border-white/30 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#143D60] mb-2">Dashboard Overview</h1>
            <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your health data.</p>
          </div>
          {/* Enhanced live time display - Enhanced time display na nag-match sa theme */}
          <div className="text-right bg-gradient-to-br from-[#143D60]/5 to-[#A0C878]/5 rounded-xl p-4 border border-white/30">
            <div className="text-2xl font-bold text-[#143D60]">{formatTime(currentTime)}</div>
            <div className="text-sm text-gray-600">{formatDate(currentTime)}</div>
          </div>
        </div>
      </div>

      {/* Main Content area - diri ang tanan nga charts ug data */}
      <div className="p-6 space-y-6">
        {/* Stats Cards - combination of static and dynamic cards */}
        {/* naa na'y SMS tracking card para ma monitor ang AI notifications */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Cases card - Enhanced first card sa stats */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/30 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Cases</p>
                <p className="text-3xl font-bold text-[#143D60] mt-2">1,234</p> {/* static number lang ni for now */}
                <p className="text-sm text-green-600 mt-1">↗ +12% from last month</p> {/* fake percentage pero nindot tan-awon */}
              </div>
              {/* icon sa right side - chart icon para relevant */}
              <div className="w-12 h-12 bg-gradient-to-r from-[#A0C878] to-[#DDEB9D] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-[#143D60]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Active Diseases card - Enhanced second card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/30 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Active Diseases</p>
                <p className="text-3xl font-bold text-[#143D60] mt-2">8</p> {/* 8 diseases ang gi monitor nato */}
                <p className="text-sm text-yellow-600 mt-1">→ No change</p> {/* stable ra ang count */}
              </div>
              {/* orange icon para standout - plus icon kay diseases */}
              <div className="w-12 h-12 bg-gradient-to-r from-[#EB5B00] to-[#ff6b1a] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* User Municipality card - shows which municipality the user belongs to */}
          <UserMunicipalityCard />
        </div>

        {/* Enhanced Charts Section - Enhanced charts na nag-complement sa background */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Prediction Chart - Enhanced prediction chart container */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-2 border border-white/30 hover:shadow-xl transition-all duration-300">
            <PredictionChart />
          </div>
          {/* News Box - Enhanced news box container */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-2 border border-white/30 hover:shadow-xl transition-all duration-300">
            <NewsBox />
          </div>
        </div>

        {/* Enhanced Municipality Charts - Enhanced municipality charts container */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/30 hover:shadow-xl transition-all duration-300">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#143D60] mb-2">Disease Distribution by Municipality</h2>
            <p className="text-gray-600">Municipality-specific disease case data - each chart shows data only for that municipality</p>
          </div>
          {/* 3 charts side by side - kada municipality naa'y chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <UnifiedMunicipalityChart
              municipalityName="mandaue"
              displayName="Mandaue City"
            />
            <UnifiedMunicipalityChart
              municipalityName="consolacion"
              displayName="Consolacion"
            />
            <UnifiedMunicipalityChart
              municipalityName="lilo-an"
              displayName="Lilo-an"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
