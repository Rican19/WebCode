"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

// oy, color mapping para sa mga diseases - basin ma confuse ang chart ug same color tanan
export const DISEASE_COLORS = {
  tuberculosis: '#8B5CF6',     // Purple
  measles: '#EF4444',          // Red
  malaria: '#F59E0B',          // Amber
  leptospirosis: '#10B981',    // Emerald
  'hiv/aids': '#EC4899',       // Pink
  dengue: '#3B82F6',           // Blue
  cholera: '#06B6D4',          // Cyan
  'syndrome (amses)': '#84CC16', // Lime
  encephalities: '#F97316',    // Orange
  'acute menigitis': '#6366F1', // Indigo
  covid: '#DC2626'             // Red-600
};

export interface DiseaseData {
  Municipality: string;
  DiseaseName: string;
  CaseCount: string;
  Date?: string;
}

export interface ProcessedDiseaseData {
  [diseaseName: string]: {
    totalCases: number;
    municipalities: { [municipality: string]: number };
    color: string;
  };
}

interface DiseaseDataContextType {
  rawData: DiseaseData[];
  processedData: ProcessedDiseaseData;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const DiseaseDataContext = createContext<DiseaseDataContextType | undefined>(undefined);

export const useDiseaseData = () => {
  const context = useContext(DiseaseDataContext);
  if (!context) {
    throw new Error('useDiseaseData must be used within a DiseaseDataProvider');
  }
  return context;
};

interface DiseaseDataProviderProps {
  children: ReactNode;
}

export const DiseaseDataProvider: React.FC<DiseaseDataProviderProps> = ({ children }) => {
  const [rawData, setRawData] = useState<DiseaseData[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedDiseaseData>({});
  const [loading, setLoading] = useState(true);

  const processRawData = (data: DiseaseData[]): ProcessedDiseaseData => {
    const processed: ProcessedDiseaseData = {};

    // agi ra ni, process ang data para ma organize - medyo messy ang CSV data gud
    data.forEach((item) => {
      const diseaseName = item.DiseaseName?.toLowerCase().trim();
      const municipality = item.Municipality?.trim();
      const caseCount = parseInt(item.CaseCount, 10);

      // check lang if valid ang data, basin naa'y empty cells sa CSV
      if (diseaseName && municipality && !isNaN(caseCount) && caseCount > 0) {
        // first time makita ni nga disease? create new entry
        if (!processed[diseaseName]) {
          processed[diseaseName] = {
            totalCases: 0,
            municipalities: {},
            // kuha ang color from mapping, if wala default gray nalang
            color: DISEASE_COLORS[diseaseName as keyof typeof DISEASE_COLORS] || '#6B7280'
          };
        }

        // add sa total count ug per municipality count
        processed[diseaseName].totalCases += caseCount;
        processed[diseaseName].municipalities[municipality] =
          (processed[diseaseName].municipalities[municipality] || 0) + caseCount;
      }
    });

    return processed;
  };

  // function to fetch and log user's municipality (for testing)
  const logUserMunicipality = async (user: any) => {
    try {
      const userDocRef = doc(db, 'healthradarDB', 'users', 'healthworker', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log(`LOGGED IN USER MUNICIPALITY: ${userData.municipality}`);
        console.log(`User: ${userData.Fname} ${userData.Lname} (${userData.email})`);
      } else {
        console.log(' User document not found in database');
      }
    } catch (error) {
      console.error('Error fetching user municipality:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.log('No user authenticated');
      setRawData([]);
      setProcessedData({});
      setLoading(false);
      return;
    }

    // log user's municipality for testing
    await logUserMunicipality(user);

    try {
      // fetch from centralized collection na naa ALL municipality data
      // para makita tanan users ang data from all municipalities
      console.log('Fetching from centralized collection...');
      const centralizedCasesRef = collection(
        db,
        'healthradarDB',
        'centralizedData',
        'allCases'
      );

      const snapshot = await getDocs(centralizedCasesRef);
      const data = snapshot.docs.map((doc) => doc.data() as DiseaseData);

      console.log('Centralized records found:', data.length);

      if (data.length > 0) {
        setRawData(data);
        setProcessedData(processRawData(data));
        console.log('Using centralized data for charts');
        return; // exit early if naa na centralized data
      } else {
        console.log('Centralized collection empty, falling back to user data...');
        throw new Error('Centralized collection is empty');
      }
    } catch (error) {
      console.error('Error fetching centralized disease data:', error);

      // fallback mag fetch sa user's own data if ever mag fail
      try {
        console.log('Falling back to user-specific data...');

        const userCasesRef = collection(
          db,
          'healthradarDB',
          'users',
          'healthworker',
          user.uid,
          'UploadedCases'
        );

        const userSnapshot = await getDocs(userCasesRef);
        const userData = userSnapshot.docs.map((doc) => doc.data() as DiseaseData);

        console.log('User-specific records found:', userData.length);

        setRawData(userData);
        setProcessedData(processRawData(userData));

        if (userData.length > 0) {
          console.log('Using user-specific data for charts (fallback mode)');
        } else {
          console.log('No data found in any collection');
        }
      } catch (fallbackError) {
        console.error('Error fetching user-specific disease data:', fallbackError);
        setRawData([]);
        setProcessedData({});
        console.log('No data available from any source');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // listen for authentication state changes and refresh data when user changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed, user:', user?.email || 'No user');
      if (user) {
        // small delay para ma ensure na ready na ang auth
        setTimeout(() => {
          console.log('Refreshing data for new user...');
          fetchData();
        }, 500);
      } else {
        // User logged out, clear data
        setRawData([]);
        setProcessedData({});
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value: DiseaseDataContextType = {
    rawData,
    processedData,
    loading,
    refreshData: fetchData
  };

  return (
    <DiseaseDataContext.Provider value={value}>
      {children}
    </DiseaseDataContext.Provider>
  );
};
