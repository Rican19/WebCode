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

export default function UserMunicipalityCard() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    // listen for auth state changes para ma ensure na ready na ang user
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        console.log('No user logged in for municipality card');
        setLoading(false);
        setUserData(null);
        return;
      }

      console.log(`🔍 Fetching municipality card data for user: ${user.email} (UID: ${user.uid})`);

      try {
        const userDocRef = doc(db, 'healthradarDB', 'users', 'healthworker', user.uid);
        console.log('📍 Fetching from path:', userDocRef.path);

        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setUserData(data);
          console.log(`✅ Municipality card loaded: ${data.Fname} ${data.Lname} from ${data.municipality}`);
        } else {
          console.error('❌ User document not found at path:', userDocRef.path);
          console.log('🔍 Check if user document exists in Firebase console');
          setUserData(null);
        }
      } catch (error) {
        console.error('❌ Error fetching user data for municipality card:', error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    });

    // cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // get municipality-specific styling
  const getMunicipalityStyle = (municipality: string) => {
    switch (municipality?.toLowerCase()) {
      case 'lilo-an':
      case 'liloan':
        return {
          gradient: 'from-blue-500 to-blue-600',
          bgAccent: 'bg-blue-50',
          textAccent: 'text-blue-600',
          icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )
        };
      case 'mandaue':
        return {
          gradient: 'from-green-500 to-green-600',
          bgAccent: 'bg-green-50',
          textAccent: 'text-green-600',
          icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          )
        };
      case 'consolacion':
        return {
          gradient: 'from-purple-500 to-purple-600',
          bgAccent: 'bg-purple-50',
          textAccent: 'text-purple-600',
          icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      default:
        return {
          gradient: 'from-[#143D60] to-[#1e4a6b]',
          bgAccent: 'bg-gray-50',
          textAccent: 'text-gray-600',
          icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/30 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Your Municipality</p>
            <div className="flex items-center gap-2 mt-2">
              <Spinner size="sm" />
              <span className="text-lg text-gray-500">Loading...</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-gray-300 to-gray-400 rounded-xl flex items-center justify-center">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    // show a fallback card instead of error - para dili ma confuse ang user
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/30 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Municipalities</p>
            <p className="text-3xl font-bold text-[#143D60] mt-2">3</p>
            <p className="text-sm text-blue-600 mt-1">Lilo-an, Mandaue, Consolacion</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-[#143D60] to-[#1e4a6b] rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  const style = getMunicipalityStyle(userData.municipality);

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/30 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Your Municipality</p>
          <p className="text-3xl font-bold text-[#143D60] mt-2">{userData.municipality}</p>
          <div className={`inline-flex items-center gap-2 ${style.bgAccent} rounded-full px-3 py-1 mt-2`}>
            <div className={`w-2 h-2 ${style.textAccent.replace('text-', 'bg-')} rounded-full animate-pulse`}></div>
            <p className={`text-sm font-medium ${style.textAccent}`}>
              Assigned to {userData.Fname} {userData.Lname}
            </p>
          </div>
        </div>
        {/* municipality-specific icon */}
        <div className={`w-12 h-12 bg-gradient-to-r ${style.gradient} rounded-xl flex items-center justify-center`}>
          {style.icon}
        </div>
      </div>
    </div>
  );
}
