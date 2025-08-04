"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@heroui/react";
import UserMunicipalityIndicator from "./UserMunicipalityIndicator";
import Cookies from "js-cookie";
import Image from "next/image";

export default function SideNavbar() {
  const [loading, setLoading] = useState(false);
  const [routerloading, setRouterLoading] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    setLoading(true);
    Cookies.remove("token"); // Clear the token from cookies
    // Clear the token from local storage
    // localStorage.removeItem("token");
    // sessionStorage.clear(); // clears all session storage

    console.log("Logout successful - paalam na!");
    // Redirect balik sa login page after 1 second
    setTimeout(() => {
      router.push("/components/login");
    }, 1000);
  };

  const openDiseaseManagement = () => {
    setRouterLoading(true);
    router.push("/sections/diseaseManagement");
    // Set timeout para ma reset ang loading state - para sa UX
    setTimeout(() => {
      setRouterLoading(false);
    }, 1000);
  };

  return (
    <div className="w-80 h-screen bg-white shadow-2xl border-r border-gray-200 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Image
            src="/assets/logoHDRM.png"
            alt="HealthRadar Logo"
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover shadow-md"
          />
          <div>
            <h1 className="text-xl font-bold text-[#143D60]">HealthRadar</h1>
            <p className="text-sm text-gray-600">Disease Management</p>
          </div>
        </div>
        {/* municipality indicator sa sidebar - compact version */}
        <div className="mt-3">
          <UserMunicipalityIndicator />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <Button
            className="w-full justify-start h-12 bg-gradient-to-r from-[#143D60] to-[#1e4a6b] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            onPress={() => router.push("/sections/dashboard")}
            startContent={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
              </svg>
            }
          >
            Dashboard
          </Button>

          <Button
            disabled={loading}
            className="w-full justify-start h-12 bg-white border-2 border-[#A0C878] text-[#143D60] font-semibold hover:bg-[#A0C878] hover:text-white transition-all duration-300"
            onPress={openDiseaseManagement}
            startContent={
              routerloading ? (
                <Spinner size="sm" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              )
            }
          >
            {routerloading ? "Loading..." : "Disease Management"}
          </Button>

          <Button
            disabled={loading}
            className="w-full justify-start h-12 bg-white border-2 border-[#A0C878] text-[#143D60] font-semibold hover:bg-[#A0C878] hover:text-white transition-all duration-300"
            onPress={() => router.push("/sections/heatmap")}
            startContent={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            }
          >
            Heat Map
          </Button>
        </div>
      </nav>

      {/* User Section & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#143D60] rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#143D60]">Health Worker</p>
              <p className="text-xs text-gray-600">Administrator</p>
            </div>
          </div>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-[#EB5B00] to-[#ff6b1a] text-white font-semibold h-12 shadow-lg hover:shadow-xl transition-all duration-300"
          onPress={handleLogout}
          disabled={loading}
          startContent={
            loading ? (
              <Spinner size="sm" color="white" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            )
          }
        >
          {loading ? "Signing Out..." : "Sign Out"}
        </Button>
      </div>
    </div>
  );
}
