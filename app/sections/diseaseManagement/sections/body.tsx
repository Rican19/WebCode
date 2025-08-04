"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import Papa from "papaparse";
import { getDocs, query, deleteDoc, doc, getDoc } from "firebase/firestore";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase";

import { useEffect, useState, useCallback } from "react";
import { getAuth } from "firebase/auth";
import { useDiseaseData } from "../../../contexts/DiseaseDataContext";
import NotificationModal from "../../../components/NotificationModal";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { checkAndSendUploadSMS } from "../../../services/smsService";

interface CsvData {
  [key: string]: string | number;
}

export default function Body() {
  const [ArrayKeys, setArrayKeys] = useState<string[]>([]);
  const [ArrayValues, setArrayValues] = useState<CsvData[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true); // loading state para sa table data
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    message: string;
  }>({ current: 0, total: 0, message: "" });

  // notification modal state para sa success/error messages
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    details: string[];
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    details: []
  });

  // confirmation modal state para sa delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    municipalityDeleteLoading: false,
    globalDeleteLoading: false
  });

  // pagination state para sa table records
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10); // 10 records per page





  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { refreshData } = useDiseaseData();

  const [userMunicipality, setUserMunicipality] = useState<string>("");
  const [validationError, setValidationError] = useState<{
    show: boolean;
    title: string;
    message: string;
    invalidMunicipalities: string[];
  }>({
    show: false,
    title: "",
    message: "",
    invalidMunicipalities: []
  });

  const auth = getAuth();
  const user = auth.currentUser;

  // helper function para mag show ng notification modal instead of alert
  const showNotification = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    details: string[] = []
  ) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message,
      details
    });
  };

  // close notification modal
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  // close delete confirmation modal
  const closeDeleteConfirmation = () => {
    if (!deleteConfirmation.municipalityDeleteLoading && !deleteConfirmation.globalDeleteLoading) {
      setDeleteConfirmation({
        isOpen: false,
        municipalityDeleteLoading: false,
        globalDeleteLoading: false
      });
    }
  };


  const fetchUserMunicipality = useCallback(async (): Promise<string | null> => {
    if (!user) return null;

    try {
      const userDocRef = doc(db, 'healthradarDB', 'users', 'healthworker', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const municipality = userData.municipality;
        console.log(`User's assigned municipality: ${municipality}`);
        return municipality;
      } else {
        console.error('User document not found');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user municipality:', error);
      return null;
    }
  }, [user]);
  // municipality validation function - users can only upload data for their assigned municipality
  // para ma ensure ang data integrity ug proper access control
  const validateMunicipalityData = (csvData: CsvData[], userMunicipality: string): {
    isValid: boolean;
    invalidMunicipalities: string[];
    invalidRecords: CsvData[];
    validRecords: CsvData[];
  } => {
    const invalidMunicipalities = new Set<string>();
    const invalidRecords: CsvData[] = [];
    const validRecords: CsvData[] = [];

    console.log(`🔍 Validating CSV data for user municipality: ${userMunicipality}`);

    csvData.forEach((record, index) => {
      const recordMunicipality = record.Municipality?.toString().trim();

      if (!recordMunicipality) {
        console.warn(`⚠️ Record ${index + 1}: Missing municipality data`);
        invalidRecords.push(record);
        return;
      }

      // handle both "Lilo-an" and "Liloan" formats for backward compatibility
      const normalizedRecord = recordMunicipality.toLowerCase().replace('-', '');
      const normalizedUser = userMunicipality.toLowerCase().replace('-', '');

      if (normalizedRecord !== normalizedUser) {
        console.warn(`❌ Record ${index + 1}: Municipality mismatch - Found: "${recordMunicipality}", Expected: "${userMunicipality}"`);
        invalidMunicipalities.add(recordMunicipality);
        invalidRecords.push(record);
      } else {
        console.log(`✅ Record ${index + 1}: Valid municipality - "${recordMunicipality}"`);
        validRecords.push(record);
      }
    });

    const isValid = invalidMunicipalities.size === 0;
    console.log(`📊 Validation Summary: ${validRecords.length} valid, ${invalidRecords.length} invalid records`);

    return {
      isValid,
      invalidMunicipalities: Array.from(invalidMunicipalities),
      invalidRecords,
      validRecords
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const file = event.target.files?.[0];
    if (!file) {
      setLoading(false);
      return;
    }

    // gamiton Papa Parse para ma parse ang CSV - mas reliable ni kaysa manual parsing
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        console.log("Parsed Results:", results.data);
        const parsedData = results.data as CsvData[];

        if (parsedData.length === 0) {
          setValidationError({
            show: true,
            title: "Empty CSV File",
            message: "The uploaded CSV file is empty or contains no valid data.",
            invalidMunicipalities: []
          });
          setLoading(false);
          return;
        }

        // enhanced user logging para makita kung kinsa nag login ug asa siya gikan
        console.log("=".repeat(60));
        console.log("🔐 USER AUTHENTICATION & MUNICIPALITY CHECK");
        console.log("=".repeat(60));
        console.log(`👤 Current User: ${user?.email}`);
        console.log(`🆔 User UID: ${user?.uid}`);

        if (!user) {
          console.error("❌ User not authenticated.");
          setLoading(false);
          return;
        }

        const userMunicipality = await fetchUserMunicipality();
        if (!userMunicipality) {
          console.error("❌ Could not determine user's municipality");
          showNotification(
            'error',
            'Municipality Not Found ❌',
            'Could not determine your assigned municipality. Please contact support.',
            [
              'Your user profile may be incomplete',
              'Contact your administrator',
              'Ensure your account is properly set up',
              'Try logging out and logging back in'
            ]
          );
          setLoading(false);
          return;
        }

        setUserMunicipality(userMunicipality);

        // enhanced municipality logging
        console.log(`🏘️ User's Assigned Municipality: ${userMunicipality.toUpperCase()}`);
        console.log(`📊 CSV Records to Process: ${parsedData.length}`);
        console.log(`🔍 Starting municipality validation...`);

        // municipality validation - users can only upload data for their assigned municipality
        const validation = validateMunicipalityData(parsedData, userMunicipality);

        if (!validation.isValid) {
          console.error("❌ MUNICIPALITY VALIDATION FAILED");
          console.error(`Invalid municipalities found: ${validation.invalidMunicipalities.join(', ')}`);
          console.error(`Valid records: ${validation.validRecords.length}`);
          console.error(`Invalid records: ${validation.invalidRecords.length}`);

          showNotification(
            'error',
            'Municipality Validation Failed ❌',
            `You can only upload data for your assigned municipality: ${userMunicipality}. The uploaded file contains data for other municipalities.`,
            [
              `Your municipality: ${userMunicipality}`,
              `Invalid municipalities found: ${validation.invalidMunicipalities.join(', ')}`,
              `Valid records: ${validation.validRecords.length}`,
              `Invalid records: ${validation.invalidRecords.length}`,
              'Please remove data from other municipalities and try again'
            ]
          );
          setLoading(false);
          return;
        }

        // validation passed
        console.log("✅ MUNICIPALITY VALIDATION PASSED");
        console.log(`All ${parsedData.length} records belong to municipality: ${userMunicipality}`);
        console.log(`🚀 Proceeding with upload to global database...`);

        if (parsedData.length > 0) {
          const keys = Object.keys(parsedData[0]);
          setArrayKeys(keys);
          setArrayValues(parsedData);
        }

        try {
          console.log("Starting BATCH upload process for", parsedData.length, "records");

          // initialize progress tracking
          setUploadProgress({
            current: 0,
            total: parsedData.length + 1, // +1 for batch calculation step
            message: "Preparing batch upload..."
          });

          // STEP 1: Calculate next batch number for this municipality
          console.log(`🔢 Calculating next batch number for municipality: ${userMunicipality}`);
          setUploadProgress({
            current: 0,
            total: parsedData.length + 1,
            message: `Calculating batch number for ${userMunicipality}...`
          });

          const centralizedRef = collection(db, "healthradarDB", "centralizedData", "allCases");
          const existingSnapshot = await getDocs(query(centralizedRef));

          // find highest batch number for this municipality
          let highestBatchNumber = 0;
          existingSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const recordMunicipality = data.Municipality?.toString().trim();

            if (recordMunicipality && recordMunicipality.toLowerCase() === userMunicipality.toLowerCase()) {
              const batchNumber = data.batchNumber || 0;
              if (batchNumber > highestBatchNumber) {
                highestBatchNumber = batchNumber;
              }
            }
          });

          const newBatchNumber = highestBatchNumber + 1;
          console.log(`📊 Next batch number for ${userMunicipality}: ${newBatchNumber} (previous highest: ${highestBatchNumber})`);

          // STEP 2: Upload new data with incremental batch number
          console.log(`📤 Uploading ${parsedData.length} new records as batch ${newBatchNumber} for ${userMunicipality}`);
          setUploadProgress({
            current: 1,
            total: parsedData.length + 1,
            message: `Uploading batch ${newBatchNumber} data...`
          });

          // upload in smaller batches para dili ma overwhelm ang Firebase
          // batch size of 10 para hindi ma overwhelm ang Firebase
          const batchSize = 10;
          let successCount = 0;
          let errorCount = 0;
          const errors: string[] = [];

          for (let i = 0; i < parsedData.length; i += batchSize) {
            const batch = parsedData.slice(i, i + batchSize);
            const batchNumber = Math.floor(i / batchSize) + 1;
            const totalBatches = Math.ceil(parsedData.length / batchSize);

            console.log(`Uploading batch ${batchNumber}/${totalBatches} (${batch.length} records)`);

            // update progress (account for batch calculation step)
            setUploadProgress({
              current: i + 1, // +1 for batch calculation step
              total: parsedData.length + 1,
              message: `Uploading batch ${batchNumber}/${totalBatches} (Municipality Batch #${newBatchNumber})...`
            });

            try {
              // upload current batch
              await Promise.all(
                batch.map(async (disease, index) => {
                  try {
                    await addDoc(
                      collection(
                        db,
                        "healthradarDB",
                        "centralizedData",
                        "allCases"
                      ),
                      {
                        ...disease,
                        uploadedBy: user.uid,
                        uploadedByEmail: user.email,
                        uploadedByMunicipality: userMunicipality,
                        uploadedAt: new Date().toISOString(),
                        uploadBatchNumber: batchNumber, // original batch from processing
                        recordIndex: i + index,
                        // batch metadata
                        batchNumber: newBatchNumber, // incremental batch number per municipality
                        municipalityBatch: `${userMunicipality}-${newBatchNumber}`, // unique identifier
                        isLatestBatch: true // mark as latest batch for this municipality
                      }
                    );
                    successCount++;
                  } catch (recordError) {
                    errorCount++;
                    const errorMsg = `Record ${i + index + 1}: ${recordError}`;
                    errors.push(errorMsg);
                    console.error(errorMsg);
                  }
                })
              );

              // update progress after batch completion (account for batch calculation step)
              setUploadProgress({
                current: Math.min(i + batchSize + 1, parsedData.length + 1), // +1 for batch calculation step
                total: parsedData.length + 1,
                message: `Completed batch ${batchNumber}/${totalBatches} (Municipality Batch #${newBatchNumber})`
              });

              // small delay between batches para hindi ma overwhelm ang Firebase
              if (i + batchSize < parsedData.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
              }

            } catch (batchError) {
              console.error(`Error uploading batch ${batchNumber}:`, batchError);
              errorCount += batch.length;
              errors.push(`Batch ${batchNumber}: ${batchError}`);
            }
          }

          console.log(`Batch upload completed! Success: ${successCount}, Errors: ${errorCount}, Batch: ${newBatchNumber}`);

          // update final progress (account for batch calculation step)
          setUploadProgress({
            current: parsedData.length + 1,
            total: parsedData.length + 1,
            message: errorCount > 0 ? `Batch ${newBatchNumber} upload completed with ${errorCount} errors` : `Batch ${newBatchNumber} upload completed successfully!`
          });

          if (errorCount > 0) {
            console.error("Upload errors:", errors);
            showNotification(
              'warning',
              'Batch Upload Completed with Errors',
              `Batch ${newBatchNumber} upload completed with some issues. ${successCount} records were successfully uploaded, but ${errorCount} records failed.`,
              [
                `📊 Municipality Batch: ${newBatchNumber}`,
                `✅ Successfully uploaded: ${successCount} records`,
                `❌ Failed uploads: ${errorCount} records`,
                '📚 All batches preserved for tracking',
                'Check browser console for detailed error information'
              ]
            );
          } else {
            console.log("✅ BATCH UPLOAD COMPLETED SUCCESSFULLY!");
            console.log(`Municipality: ${userMunicipality}`);
            console.log(`Records uploaded: ${successCount}`);
            console.log(`Batch Number: ${newBatchNumber}`);
            console.log(`User: ${user.email}`);

            showNotification(
              'success',
              'New Batch Uploaded Successfully! 📊',
              `Congratulations! Batch ${newBatchNumber} with ${successCount} disease records from ${userMunicipality} has been successfully uploaded.`,
              [
                `🏘️ Municipality: ${userMunicipality}`,
                `📊 Batch Number: ${newBatchNumber}`,
                `📈 Records uploaded: ${successCount}`,
                `👤 Uploaded by: ${user.email}`,
                '📚 All batches preserved for tracking',
                '🌍 Data is now available globally to all users'
              ]
            );
          }

          // wait a bit before refreshing para ma ensure na na process na sa Firebase ang writes
          setUploadProgress({
            current: parsedData.length + 1,
            total: parsedData.length + 1,
            message: "Processing batch data..."
          });

          console.log("Waiting for Firebase to process all writes...");
          await new Promise(resolve => setTimeout(resolve, 2000));

          // refresh both the data context (for charts) and table data
          setUploadProgress({
            current: parsedData.length + 1,
            total: parsedData.length + 1,
            message: "Refreshing display..."
          });

          console.log("Refreshing data...");
          await refreshData();
          await fetchUploadedCases();

          // verify na na save jud ang data by checking the count
          setUploadProgress({
            current: parsedData.length + 1,
            total: parsedData.length + 1,
            message: "Verifying batch data..."
          });

          // wait a bit more and verify na na save ang data
          await new Promise(resolve => setTimeout(resolve, 1000));

          try {
            const verificationRef = collection(db, "healthradarDB", "centralizedData", "allCases");
            const verificationSnapshot = await getDocs(query(verificationRef));
            const savedCount = verificationSnapshot.docs.length;

            console.log(`Verification: Found ${savedCount} total records in database`);

            if (savedCount >= successCount) {
              console.log("✅ Data verification successful!");
              setUploadProgress({
                current: parsedData.length,
                total: parsedData.length,
                message: `✅ Upload verified! ${savedCount} total records in database`
              });
            } else {
              console.warn(`⚠️ Verification warning: Expected at least ${successCount} records, found ${savedCount}`);
              setUploadProgress({
                current: parsedData.length,
                total: parsedData.length,
                message: `⚠️ Verification: ${savedCount} records found (expected ${successCount})`
              });
            }
          } catch (verificationError) {
            console.error("Error during verification:", verificationError);
            setUploadProgress({
              current: parsedData.length,
              total: parsedData.length,
              message: "Upload completed (verification failed)"
            });
          }

          // 📱 check if mag send na ug SMS after successful upload - automatic AI analysis ni
          try {
            console.log(`📱 UPLOAD PROCESS: Starting SMS check for municipality: ${userMunicipality}`);
            console.log(`📱 UPLOAD PROCESS: Parsed data length: ${parsedData.length}`);
            console.log(`📱 UPLOAD PROCESS: About to call checkAndSendUploadSMS...`);

            await checkAndSendUploadSMS(userMunicipality, parsedData);

            console.log(`📱 UPLOAD PROCESS: SMS check completed for ${userMunicipality}`);
          } catch (smsError) {
            console.error('❌ UPLOAD PROCESS: SMS notification error (non-critical):', smsError);
            console.error('❌ UPLOAD PROCESS: SMS error details:', {
              name: smsError instanceof Error ? smsError.name : 'Unknown',
              message: smsError instanceof Error ? smsError.message : String(smsError),
              stack: smsError instanceof Error ? smsError.stack : undefined
            });
            // SMS error is non-critical, di mag fail ang upload even if SMS fails
          }



        } catch (error) {
          console.error("Critical error during upload process:", error);
          showNotification(
            'error',
            'Upload Failed ❌',
            'A critical error occurred during the upload process. Please check your connection and try again.',
            [
              `Error details: ${error}`,
              'Check your internet connection',
              'Verify your CSV file format is correct',
              'Try uploading a smaller batch of records',
              'Contact support if the problem persists'
            ]
          );
          setUploadProgress({
            current: 0,
            total: 0,
            message: "Upload failed"
          });
        } finally {
          setLoading(false);
          // clear progress after a short delay
          setTimeout(() => {
            setUploadProgress({ current: 0, total: 0, message: "" });
          }, 3000);
        }
      },
    });
  };

  // pagination helper functions
  const totalPages = Math.ceil(ArrayValues.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = ArrayValues.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };


  // fetch global centralized data instead of user-specific data
  // para makita tanan users ang same data regardless of kung kinsa nag login
  const fetchUploadedCases = useCallback(async () => {
    if (!user) {
      setTableLoading(false);
      return;
    }

    setTableLoading(true);
    try {
      console.log("Fetching global centralized data for disease management table...");

      // fetch from centralized collection na naa ALL municipality data
      const centralizedCasesRef = collection(
        db,
        "healthradarDB",
        "centralizedData",
        "allCases"
      );

      const querySnapshot = await getDocs(query(centralizedCasesRef));
      console.log(`Found ${querySnapshot.docs.length} total records in centralized collection`);

      const fetchedData: CsvData[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        // include ALL records with batch numbers (no filtering)
        // remove metadata fields na gi add during upload
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { uploadedBy, uploadedByEmail, uploadedAt, uploadBatchNumber, batchNumber, municipalityBatch, isLatestBatch, ...cleanData } = data as CsvData & {
          uploadedBy?: string;
          uploadedByEmail?: string;
          uploadedAt?: string;
          uploadBatchNumber?: number;
          batchNumber?: number;
          municipalityBatch?: string;
          isLatestBatch?: boolean;
        };

        // add batch info to the clean data for display
        const dataWithBatch = {
          ...cleanData,
          BatchNumber: batchNumber || 'N/A' // show batch number in table
        };

        fetchedData.push(dataWithBatch);
      });

      console.log(`Showing all ${fetchedData.length} records with batch numbers`);

      if (fetchedData.length > 0) {
        // get all unique keys from all documents para complete ang table headers
        const allKeys = [
          ...new Set(fetchedData.flatMap((doc) => Object.keys(doc))),
        ];
        setArrayKeys(allKeys);
        setArrayValues(fetchedData);

        // store in localStorage as backup para dili mawala when navigating
        try {
          localStorage.setItem('diseaseManagementKeys', JSON.stringify(allKeys));
          localStorage.setItem('diseaseManagementData', JSON.stringify(fetchedData));
        } catch (error) {
          console.warn("Could not save to localStorage:", error);
        }

        console.log(`Successfully loaded ${fetchedData.length} global records for table display`);
      } else {
        // clear table if no data
        setArrayKeys([]);
        setArrayValues([]);

        // clear localStorage as well
        try {
          localStorage.removeItem('diseaseManagementKeys');
          localStorage.removeItem('diseaseManagementData');
        } catch (error) {
          console.warn("Could not clear localStorage:", error);
        }

        console.log("No global data found, table will be empty");
      }
    } catch (error) {
      console.error("Error fetching global centralized data:", error);

      // fallback: try to load from localStorage
      try {
        const savedKeys = localStorage.getItem('diseaseManagementKeys');
        const savedData = localStorage.getItem('diseaseManagementData');

        if (savedKeys && savedData) {
          const keys = JSON.parse(savedKeys);
          const data = JSON.parse(savedData);
          setArrayKeys(keys);
          setArrayValues(data);
          console.log(`Loaded ${data.length} records from localStorage backup`);
        } else {
          // no backup data available
          setArrayKeys([]);
          setArrayValues([]);
          console.log("No backup data available, table will be empty");
        }
      } catch (localStorageError) {
        console.error("Error loading from localStorage:", localStorageError);
        setArrayKeys([]);
        setArrayValues([]);
      }
    } finally {
      setTableLoading(false);
    }
  }, [user]);

  // function to show delete confirmation modal
  const showDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: true,
      municipalityDeleteLoading: false,
      globalDeleteLoading: false
    });
  };

  // function to delete only user's municipality data
  const performMunicipalityDelete = useCallback(async () => {
    if (!user) {
      console.log("❌ No user authenticated - kinsa man ni wala'y login?");
      return;
    }

    // set loading state for municipality delete
    setDeleteConfirmation(prev => ({ ...prev, municipalityDeleteLoading: true }));

    // get user municipality for filtering
    const userMunicipality = await fetchUserMunicipality();

    if (!userMunicipality) {
      console.error("❌ Could not determine user's municipality");
      setDeleteConfirmation(prev => ({ ...prev, municipalityDeleteLoading: false }));
      showNotification(
        'error',
        'Municipality Not Found ❌',
        'Could not determine your assigned municipality for deletion.',
        ['Contact your administrator', 'Try logging out and back in']
      );
      return;
    }

    // enhanced logging for municipality delete operation
    console.log("=".repeat(60));
    console.log("🗑️ MUNICIPALITY DELETE OPERATION INITIATED");
    console.log("=".repeat(60));
    console.log(`👤 User: ${user.email}`);
    console.log(`🏘️ Target Municipality: ${userMunicipality.toUpperCase()}`);
    console.log(`🆔 User UID: ${user.uid}`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    console.log("🚀 Starting municipality-specific deletion...");

    try {
      // delete records from centralized collection na belong sa user's municipality
      const centralizedRef = collection(
        db,
        "healthradarDB",
        "centralizedData",
        "allCases"
      );

      const centralizedSnapshot = await getDocs(query(centralizedRef));
      console.log(`Found ${centralizedSnapshot.docs.length} total records in centralized collection`);

      // filter records na belong sa user's municipality
      const municipalityRecords = centralizedSnapshot.docs.filter(doc => {
        const data = doc.data();
        const recordMunicipality = data.Municipality?.toString().trim();
        return recordMunicipality && recordMunicipality.toLowerCase() === userMunicipality.toLowerCase();
      });

      console.log(`Found ${municipalityRecords.length} records for municipality: ${userMunicipality}`);

      // delete municipality-specific records
      const deleteMunicipalityPromises = municipalityRecords.map((document) =>
        deleteDoc(doc(db, "healthradarDB", "centralizedData", "allCases", document.id))
      );

      await Promise.all(deleteMunicipalityPromises);

      // clear pud ang current user's personal collection
      const casesRef = collection(
        db,
        "healthradarDB",
        "users",
        "healthworker",
        user.uid,
        "UploadedCases"
      );

      const querySnapshot = await getDocs(query(casesRef));
      console.log(`Found ${querySnapshot.docs.length} records in user's personal collection`);

      const deletePersonalPromises = querySnapshot.docs.map((document) =>
        deleteDoc(doc(db, "healthradarDB", "users", "healthworker", user.uid, "UploadedCases", document.id))
      );

      await Promise.all(deletePersonalPromises);

      const totalDeleted = municipalityRecords.length;
      console.log(`✅ Successfully deleted ${totalDeleted} records for municipality: ${userMunicipality}`);

      // clear local state
      setArrayKeys([]);
      setArrayValues([]);

      // refresh data context para ma update ang charts
      await refreshData();

      // Close confirmation modal
      setDeleteConfirmation({
        isOpen: false,
        municipalityDeleteLoading: false,
        globalDeleteLoading: false
      });

      // show success notification
      showNotification(
        'success',
        'Municipality Data Cleared Successfully! 🗑️',
        `All ${totalDeleted} disease records from ${userMunicipality} have been permanently deleted.`,
        [
          `🏘️ Municipality: ${userMunicipality}`,
          `🗑️ Records deleted: ${totalDeleted}`,
          '🌍 Other municipalities\' data remains intact',
          '📊 Charts and analytics have been updated',
          '✅ Ready for fresh data upload'
        ]
      );
    } catch (error) {
      console.error("❌ Error deleting municipality cases:", error);

      // close confirmation modal
      setDeleteConfirmation({
        isOpen: false,
        municipalityDeleteLoading: false,
        globalDeleteLoading: false
      });

      // show error notification
      showNotification(
        'error',
        'Municipality Delete Failed ❌',
        `An error occurred while trying to delete data for ${userMunicipality}. Please try again.`,
        [
          `Error details: ${error}`,
          'Check your internet connection',
          'Verify you have proper permissions',
          'Try refreshing the page and attempting again',
          'Contact support if the problem persists'
        ]
      );
    }
  }, [user, refreshData, fetchUserMunicipality]);

  // function to handle global deletion after confirmation
  const performGlobalDelete = useCallback(async () => {
    if (!user) {
      console.log("❌ No user authenticated - kinsa man ni wala'y login?");
      return;
    }

    // set loading state for global delete
    setDeleteConfirmation(prev => ({ ...prev, globalDeleteLoading: true }));

    // get user municipality for logging
    const userMunicipality = await fetchUserMunicipality();

    // enhanced logging for delete operation
    console.log("=".repeat(60));
    console.log("🗑️ GLOBAL DELETE OPERATION INITIATED");
    console.log("=".repeat(60));
    console.log(`👤 User: ${user.email}`);
    console.log(`🏘️ User Municipality: ${userMunicipality || 'Unknown'}`);
    console.log(`🆔 User UID: ${user.uid}`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    console.log("🚀 Starting deletion process...");

    try {
      console.log("Starting global deletion of all disease data...");

      // delete ALL records from centralized collection (global data)
      const centralizedRef = collection(
        db,
        "healthradarDB",
        "centralizedData",
        "allCases"
      );

      const centralizedSnapshot = await getDocs(query(centralizedRef));
      console.log(`Found ${centralizedSnapshot.docs.length} records in centralized collection`);

      // delete tanan documents sa centralized collection
      const deleteCentralizedPromises = centralizedSnapshot.docs.map((document) =>
        deleteDoc(doc(db, "healthradarDB", "centralizedData", "allCases", document.id))
      );

      await Promise.all(deleteCentralizedPromises);

      // clear pud ang current user's personal collection for consistency
      const casesRef = collection(
        db,
        "healthradarDB",
        "users",
        "healthworker",
        user.uid,
        "UploadedCases"
      );

      const querySnapshot = await getDocs(query(casesRef));
      console.log(`Found ${querySnapshot.docs.length} records in user's personal collection`);

      // delete tanan documents sa personal user collection
      const deletePersonalPromises = querySnapshot.docs.map((document) =>
        deleteDoc(doc(db, "healthradarDB", "users", "healthworker", user.uid, "UploadedCases", document.id))
      );

      await Promise.all(deletePersonalPromises);

      const totalDeleted = centralizedSnapshot.docs.length;
      console.log(`✅ Successfully deleted ${totalDeleted} records from global database`);

      // clear local state
      setArrayKeys([]);
      setArrayValues([]);

      // refresh data context para ma update ang charts
      await refreshData();

      // Close confirmation modal
      setDeleteConfirmation({
        isOpen: false,
        municipalityDeleteLoading: false,
        globalDeleteLoading: false
      });

      // show success notification
      showNotification(
        'success',
        'Global Data Cleared Successfully! 🗑️',
        `All ${totalDeleted} disease records have been permanently deleted from the global database.`,
        [
          `🗑️ Total records deleted: ${totalDeleted}`,
          '🌍 All users will now see empty data',
          '📊 Charts and analytics have been reset',
          '✅ Database is ready for fresh data upload'
        ]
      );
    } catch (error) {
      console.error("❌ Error deleting global cases:", error);

      // close confirmation modal
      setDeleteConfirmation({
        isOpen: false,
        municipalityDeleteLoading: false,
        globalDeleteLoading: false
      });

      // show error notification
      showNotification(
        'error',
        'Global Delete Operation Failed ❌',
        'An error occurred while trying to delete all global data. Please try again.',
        [
          `Error details: ${error}`,
          'Check your internet connection',
          'Verify you have proper permissions',
          'Try refreshing the page and attempting again',
          'Contact support if the problem persists'
        ]
      );
    }
  }, [user, refreshData, fetchUserMunicipality]);


  // load data when component mounts and when user changes
  useEffect(() => {
    console.log("Disease management useEffect triggered", {
      hasUser: !!user,
      userEmail: user?.email
    });

    if (user) {
      console.log("Disease management component mounted, fetching data...");
      fetchUploadedCases();
    } else {
      console.log("No user authenticated, clearing table data");
      setArrayKeys([]);
      setArrayValues([]);
      setTableLoading(false);
    }
  }, [user, fetchUploadedCases]);

  // additional effect to monitor data changes
  useEffect(() => {
    console.log("Table data changed:", {
      keysLength: ArrayKeys.length,
      valuesLength: ArrayValues.length,
      keys: ArrayKeys,
      sampleData: ArrayValues.slice(0, 2) // show first 2 records for debugging
    });
  }, [ArrayKeys, ArrayValues]);

  // reset to page 1 when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [ArrayValues]);

  return (
    <div className="flex-1 overflow-auto">
      {/* enhanced header section - enhanced header na nag-complement sa background */}
      <div className="bg-white/95 backdrop-blur-xl shadow-sm border-b border-white/30 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#143D60] mb-2">Disease Management</h1>
            <p className="text-gray-600">Upload, manage, and analyze disease case data</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{ArrayValues.length} records</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* enhanced search and upload section - enhanced search section na nag-complement sa background */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/30 mb-6 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search disease name..."
                className="w-full"
                classNames={{
                  input: "text-gray-900 placeholder:text-gray-400",
                  inputWrapper: "border-gray-200 hover:border-[#A0C878] focus-within:border-[#A0C878] bg-gray-50 hover:bg-white transition-colors"
                }}
                startContent={
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
                size="lg"
                radius="lg"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onPress={onOpen}
                disabled={loading}
                className="bg-gradient-to-r from-[#143D60] to-[#1e4a6b] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                startContent={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                }
                size="lg"
                radius="lg"
              >
                Upload CSV
              </Button>

              <Button
                onPress={showDeleteConfirmation}
                disabled={deleteConfirmation.municipalityDeleteLoading || deleteConfirmation.globalDeleteLoading}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                startContent={
                  (deleteConfirmation.municipalityDeleteLoading || deleteConfirmation.globalDeleteLoading) ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )
                }
                size="lg"
                radius="lg"
              >
                {(deleteConfirmation.municipalityDeleteLoading || deleteConfirmation.globalDeleteLoading) ? "Deleting..." : "Delete CSV"}
              </Button>


            </div>
          </div>
        </div>



        {/* upload progress indicator */}
        {uploadProgress.total > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-2 border-[#143D60] border-t-transparent rounded-full animate-spin"></div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-[#143D60]">{uploadProgress.message}</span>
                  <span className="text-sm text-gray-600">
                    {uploadProgress.current}/{uploadProgress.total} records
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#143D60] to-[#1e4a6b] h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${uploadProgress.total > 0 ? (uploadProgress.current / uploadProgress.total) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* enhanced data table section - enhanced data table na nag-complement sa background */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#A0C878] to-[#DDEB9D] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#143D60]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v10z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#143D60]">Disease Case Data</h3>
                  <p className="text-sm text-gray-600">Uploaded CSV data overview</p>
                </div>
              </div>

              {/* pagination info sa header */}
              {ArrayValues.length > 0 && (
                <div className="text-right">
                  <p className="text-sm font-medium text-[#143D60]">{ArrayValues.length} Total Records</p>
                  <p className="text-xs text-gray-500">{recordsPerPage} records per page</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {tableLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 border-2 border-[#143D60] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Data...</h3>
                <p className="text-gray-500">Fetching global disease management data</p>
              </div>
            ) : ArrayValues.length > 0 ? (
              <div className="overflow-x-auto">
                <Table
                  aria-label="Disease case data table"
                  classNames={{
                    wrapper: "shadow-none border border-gray-200 rounded-xl",
                    th: "bg-gray-50 text-[#143D60] font-semibold",
                    td: "text-gray-700"
                  }}
                >
                  <TableHeader>
                    {ArrayKeys.map((key: string) => (
                      <TableColumn key={key} className="text-center">
                        {key}
                      </TableColumn>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {currentRecords.map((row: CsvData, index: number) => (
                      <TableRow key={startIndex + index} className="hover:bg-gray-50">
                        {ArrayKeys.map((key: string, idx: number) => (
                          <TableCell key={idx} className="text-center">
                            {row[key] || ""}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Data Available</h3>
                <p className="text-gray-500 mb-4">Upload a CSV file to view global disease case data</p>
                <Button
                  onPress={onOpen}
                  className="bg-gradient-to-r from-[#143D60] to-[#1e4a6b] text-white font-semibold"
                  startContent={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  }
                >
                  Upload CSV File
                </Button>
              </div>
            )}
          </div>

          {/* pagination controls - simple pagination para sa table records */}
          {ArrayValues.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, ArrayValues.length)} of {ArrayValues.length} records
              </div>

              <div className="flex items-center gap-2">
                {/* previous button */}
                <Button
                  size="sm"
                  variant="bordered"
                  isDisabled={currentPage === 1}
                  onPress={goToPreviousPage}
                  className="border-gray-300 text-gray-700 hover:border-[#A0C878] disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </Button>

                {/* page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      size="sm"
                      variant={currentPage === page ? 'solid' : 'bordered'}
                      onPress={() => goToPage(page)}
                      className={
                        currentPage === page
                          ? 'bg-[#143D60] text-white min-w-[40px]'
                          : 'border-gray-300 text-gray-700 hover:border-[#A0C878] min-w-[40px]'
                      }
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                {/* next button */}
                <Button
                  size="sm"
                  variant="bordered"
                  isDisabled={currentPage === totalPages}
                  onPress={goToNextPage}
                  className="border-gray-300 text-gray-700 hover:border-[#A0C878] disabled:opacity-50"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </div>
          )}
        </div>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="text-xl font-bold text-[#143D60] border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#143D60] to-[#1e4a6b] rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    Upload CSV File
                  </div>
                </ModalHeader>
                <ModalBody className="py-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">Select a CSV file containing disease case data</p>
                    </div>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        handleFileUpload(e);
                        onClose();
                      }}
                      className="w-full"
                      classNames={{
                        input: "text-gray-900",
                        inputWrapper: "border-2 border-dashed border-gray-300 hover:border-[#A0C878] bg-gray-50 hover:bg-white transition-colors h-20"
                      }}
                      size="lg"
                      radius="lg"
                    />
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">CSV Format Requirements:</h4>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Include columns: Municipality, DiseaseName, CaseCount</li>
                        <li>• Use proper municipality names (e.g., &quot;Lilo-an&quot;, &quot;Mandaue&quot;, &quot;Consolacion&quot;)</li>
                        <li>• Ensure CaseCount contains numeric values</li>
                        <li>• <strong>Important:</strong> You can only upload data for your assigned municipality</li>
                      </ul>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter className="border-t border-gray-200 pt-4">
                  <Button
                    color="danger"
                    variant="light"
                    onPress={onClose}
                    className="font-semibold"
                  >
                    Cancel
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* error validation sa pag submit csv */}
        <Modal
          isOpen={validationError.show}
          onOpenChange={(open) => setValidationError(prev => ({ ...prev, show: open }))}
          size="lg"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="text-xl font-bold text-red-600 border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    {validationError.title}
                  </div>
                </ModalHeader>
                <ModalBody className="py-6">
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      {validationError.message}
                    </p>

                    {validationError.invalidMunicipalities.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-red-800 mb-2">
                          Invalid municipalities found in your CSV:
                        </h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          {validationError.invalidMunicipalities.map((municipality, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              {municipality}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">
                         What you need to do:
                      </h4>                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Ensure all data in your CSV belongs to your assigned municipality</li>
                        <li>• Check the &quot;Municipality&quot; column in your CSV file</li>
                        <li>• Remove or correct any entries from other municipalities</li>
                        <li>• Upload only data for your municipality: <strong>{userMunicipality}</strong></li>
                      </ul>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter className="border-t border-gray-200 pt-4">
                  <Button
                    color="primary"
                    onPress={onClose}
                    className="bg-gradient-to-r from-[#143D60] to-[#1e4a6b] text-white font-semibold"
                  >
                    I Understand
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* notification modal para sa success/error messages */}
        <NotificationModal
          isOpen={notification.isOpen}
          onClose={closeNotification}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          details={notification.details}
          autoClose={notification.type === 'success'}
          autoCloseDelay={6000}
        />

        {/* confirmation modal para sa delete confirmation with multiple options */}
        <ConfirmationModal
          isOpen={deleteConfirmation.isOpen}
          onClose={closeDeleteConfirmation}
          title="Delete CSV Data"
          message="Choose which data you want to delete. You can delete only your municipality's data or all global data from all municipalities."
          details={[
            "Municipality Delete: Removes only data from your assigned municipality",
            "Global Delete: Removes ALL data from ALL municipalities (affects all users)",
            "Both actions cannot be undone",
            "You will need to re-upload CSV data to restore deleted information"
          ]}
          cancelText="Cancel"
          type="danger"
          actions={[
            {
              label: "Delete My Municipality Only",
              onClick: performMunicipalityDelete,
              type: 'warning',
              isLoading: deleteConfirmation.municipalityDeleteLoading
            },
            {
              label: "Delete All Global Data",
              onClick: performGlobalDelete,
              type: 'danger',
              isLoading: deleteConfirmation.globalDeleteLoading
            }
          ]}
        />
      </div>
    </div>
  );
}
