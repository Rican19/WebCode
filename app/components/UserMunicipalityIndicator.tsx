"use client";

import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { Spinner } from "@heroui/react";

interface UserData {
  Fname: string;
  Lname: string;
  email: string;
  municipality: string;
  PhoneNumber?: string;
}

export default function UserMunicipalityIndicator() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    // listen for auth state changes para ma ensure na ready na ang user
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        console.log('No user logged in for municipality indicator');
        setLoading(false);
        setUserData(null);
        return;
      }

      console.log(`🔍 Fetching municipality data for user: ${user.email} (UID: ${user.uid})`);

      try {
        const userDocRef = doc(db, 'healthradarDB', 'users', 'healthworker', user.uid);
        console.log('📍 Fetching from path:', userDocRef.path);

        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setUserData(data);
          console.log(`✅ Municipality indicator loaded: ${data.Fname} ${data.Lname} from ${data.municipality}`);
        } else {
          console.error('❌ User document not found at path:', userDocRef.path);
          console.log('🔍 Check if user document exists in Firebase console');
          setUserData(null);
        }
      } catch (error) {
        console.error('❌ Error fetching user data for municipality indicator:', error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    });

    // cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 bg-gradient-to-r from-[#143D60]/10 to-[#A0C878]/10 rounded-xl px-4 py-3 border border-white/30">
        <Spinner size="sm" />
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!userData) {
    // don't show anything if no user data - para dili ma confuse ang user
    return null;
  }

  // get municipality icon based on municipality name
  const getMunicipalityIcon = (municipality: string) => {
    switch (municipality.toLowerCase()) {
      case 'lilo-an':
      case 'liloan':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'mandaue':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'consolacion':
        return (
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
    }
  };

  // get municipality color scheme
  const getMunicipalityColors = (municipality: string) => {
    switch (municipality.toLowerCase()) {
      case 'lilo-an':
      case 'liloan':
        return {
          bg: 'from-blue-50 to-blue-100',
          border: 'border-blue-200',
          text: 'text-blue-800',
          dot: 'bg-blue-500'
        };
      case 'mandaue':
        return {
          bg: 'from-green-50 to-green-100',
          border: 'border-green-200',
          text: 'text-green-800',
          dot: 'bg-green-500'
        };
      case 'consolacion':
        return {
          bg: 'from-purple-50 to-purple-100',
          border: 'border-purple-200',
          text: 'text-purple-800',
          dot: 'bg-purple-500'
        };
      default:
        return {
          bg: 'from-gray-50 to-gray-100',
          border: 'border-gray-200',
          text: 'text-gray-800',
          dot: 'bg-gray-500'
        };
    }
  };

  const colors = getMunicipalityColors(userData.municipality);

  return (
    <div className={`flex items-center gap-3 bg-gradient-to-r ${colors.bg} rounded-xl px-4 py-3 border ${colors.border} shadow-sm`}>
      {/* municipality icon */}
      <div className="flex items-center gap-2">
        {getMunicipalityIcon(userData.municipality)}
        <div className={`w-2 h-2 ${colors.dot} rounded-full animate-pulse`}></div>
      </div>
      
      {/* user info */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${colors.text}`}>
            {userData.municipality}
          </span>
          <span className="text-xs text-gray-500">Municipality</span>
        </div>
        <span className="text-xs text-gray-600">
          {userData.Fname} {userData.Lname}
        </span>
      </div>
    </div>
  );
}
