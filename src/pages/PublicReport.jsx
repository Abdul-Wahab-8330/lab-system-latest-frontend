import { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, AlertCircle, CheckCircle, Clock, Download, Star } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import React from 'react';
import TestScaleVisualization from '@/components/TestScaleVisualization';
import VisualScaleVisualization from '@/components/VisualScaleVisualization';
import SmallTestScaleVisualization from '@/components/SmallTestScale';
import { ReviewDialog, PublicReviewsWidget } from '@/components/AdminReviewManagement';

export default function PublicReport() {

  console.log('🟢 PublicReport component loaded!');

  const [formData, setFormData] = useState({
    name: '',
    patientNumber: ['', '', '', '', '', '', '', '', '', ''],
    phone: ''
  });

  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasShownReviewDialog, setHasShownReviewDialog] = useState(false);
  const [attempts, setAttempts] = useState(() => {
    const saved = localStorage.getItem('reportAttempts');
    return saved ? parseInt(saved) : 0;
  });
  const [blocked, setBlocked] = useState(() => {
    const blockTime = localStorage.getItem('reportBlockedUntil');
    if (blockTime) {
      const unblockTime = parseInt(blockTime);
      if (Date.now() < unblockTime) {
        return true;
      } else {
        localStorage.removeItem('reportBlockedUntil');
        localStorage.removeItem('reportAttempts');
        return false;
      }
    }
    return false;
  });
  const [labInfo, setLabInfo] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [refreshReviews, setRefreshReviews] = useState(0);
  const [historySettings, setHistorySettings] = useState({
    historyResultsCount: 4,
    historyResultsDirection: 'left-to-right'
  });
  const labID = labInfo?.labID;


  const inputRefs = useRef([]);
  const regReportRef = useRef();
  const finalReportRef = useRef();

  useEffect(() => {
    fetchLabInfo();
    loadHistorySettings();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleReviewSubmitted = () => {
    console.log('🎉 Review submitted! Refreshing widget...');
    setRefreshReviews(prev => prev + 1); // Force refresh
  };

  useEffect(() => {
    if (blocked) {
      const blockTime = localStorage.getItem('reportBlockedUntil');
      if (blockTime) {
        const remaining = Math.ceil((parseInt(blockTime) - Date.now()) / 60000);
        setError(`Too many failed attempts. Please try again after ${remaining} minute(s).`);

        // Update countdown every minute
        const interval = setInterval(() => {
          const newRemaining = Math.ceil((parseInt(blockTime) - Date.now()) / 60000);
          if (newRemaining <= 0) {
            setError('');
            clearInterval(interval);
          } else {
            setError(`Too many failed attempts. Please try again after ${newRemaining} minute(s).`);
          }
        }, 60000); // Update every minute

        return () => clearInterval(interval);
      }
    } else {
      setError('');
    }
  }, [blocked]);


  useEffect(() => {
    if (blocked) {
      const blockTime = localStorage.getItem('reportBlockedUntil');
      if (blockTime) {
        const remaining = parseInt(blockTime) - Date.now();
        if (remaining > 0) {
          const timer = setTimeout(() => {
            setBlocked(false);
            setAttempts(0);
            localStorage.removeItem('reportBlockedUntil');
            localStorage.removeItem('reportAttempts');
          }, remaining);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [blocked]);


  const fetchLabInfo = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lab-info`);
      const data = await res.json();
      setLabInfo(data || {});
    } catch (err) {
      setLabInfo({
        labName: 'LabSync Pro'
      });
      console.error('Error fetching lab info:', err);
    }
  };

  const loadHistorySettings = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/system/filters/results`);
      if (res.ok) {
        const data = await res.json();
        setHistorySettings({
          historyResultsCount: data.historyResultsCount || 4,
          historyResultsDirection: data.historyResultsDirection || 'left-to-right'
        });
      }
    } catch (err) {
      console.error('Error loading history settings:', err);
    }
  };

  const checkCanReview = async (refNo) => {
    try {
      const alreadyReviewed = localStorage.getItem(`reviewed_${refNo}`);
      if (alreadyReviewed) {
        setCanReview(false);
        return false;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reviews/can-review/${refNo}`
      );
      const data = await response.json();

      if (data.success) {
        setCanReview(data.canReview);
        return data.canReview;
      }
      return false;
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      return false;
    }
  };
  useEffect(() => {
    if (reports && reports.hasResults && !hasShownReviewDialog) {
      checkCanReview(reports.finalReport.refNo);

      const timer = setTimeout(() => {
        const dialogShownKey = `reviewDialogShown_${reports.finalReport.refNo}`;
        const alreadyShown = localStorage.getItem(dialogShownKey);

        if (!alreadyShown && canReview) {
          setReviewDialogOpen(true);
          setHasShownReviewDialog(true);
          localStorage.setItem(dialogShownKey, 'true');
        }
      }, 15000);

      return () => clearTimeout(timer);
    }
  }, [reports, canReview, hasShownReviewDialog]);

  const formatAge = (patient) => {
    if (!patient?.age) return "-";

    const unit =
      patient.ageUnit === "months"
        ? "Months"
        : patient.ageUnit === "days"
          ? "Days"
          : "Years"; // default for old records

    return `${patient.age} ${unit}`;
  };



  // Process historical data per test
  const processHistoricalData = (currentPatient, historicalPatients, settings) => {
    if (!historicalPatients || historicalPatients.length === 0) {
      return null;
    }

    let hasAnyMatchingTests = false;

    const processedTests = currentPatient.tests.map(currentTest => {
      const hasSpecialRender = currentTest.testId?.fields?.some(f => f.specialRender?.enabled);
      const isNarrative = currentTest.testId?.isNarrativeFormat;

      if (hasSpecialRender || isNarrative) {
        return currentTest;
      }

      const historyDataMap = new Map();

      historicalPatients.forEach((hp) => {
        let matchedTest = hp.tests?.find(ht =>
          ht.testId?._id?.toString() === currentTest.testId?._id?.toString()
        );

        if (!matchedTest) {
          matchedTest = hp.tests?.find(ht =>
            ht.testName?.toLowerCase() === currentTest.testName?.toLowerCase()
          );
        }

        if (!matchedTest) return;

        const result = hp.results?.find(r =>
          r.testId?.toString() === matchedTest.testId?._id?.toString() ||
          r.testName?.toLowerCase() === matchedTest.testName?.toLowerCase()
        );

        const hasRealData = result?.fields?.some(f =>
          f.defaultValue &&
          f.defaultValue.trim() !== "" &&
          f.defaultValue !== "—"
        );

        if (hasRealData) {
          historyDataMap.set(hp.refNo, {
            date: hp.createdAt,
            refNo: hp.refNo,
            caseNo: hp.caseNo,
            result: result
          });
        }
      });

      if (historyDataMap.size === 0) {
        return currentTest;
      }

      hasAnyMatchingTests = true;

      const testHistoryColumns = Array.from(historyDataMap.values())
        .sort((a, b) => {
          if (settings.historyResultsDirection === 'right-to-left') {
            return new Date(a.date) - new Date(b.date);
          } else {
            return new Date(b.date) - new Date(a.date);
          }
        });

      const fieldsWithHistory = currentTest.fields.map(field => {
        const historicalValues = testHistoryColumns.map(histData => {
          const historicalField = histData.result.fields?.find(
            hf => hf.fieldName === field.fieldName
          );
          return historicalField?.defaultValue || "—";
        });

        return {
          ...field,
          historicalValues
        };
      });

      return {
        ...currentTest,
        fields: fieldsWithHistory,
        hasHistory: true,
        historyColumns: testHistoryColumns
      };
    });

    if (!hasAnyMatchingTests) {
      return null;
    }

    return {
      tests: processedTests,
      hasHistory: true
    };
  };

  const handlePrintReg = () => {
    const element = regReportRef.current;
    const printWindow = window.open('', '_blank');

    // Get all stylesheets from current page
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          return '';
        }
      })
      .join('\n');

    printWindow.document.write(`
    <html>
      <head>
        <title>Registration_${reports?.registrationReport?.name || 'Report'}</title>
        <style>${styles}</style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handlePrintFinal = () => {
    const element = finalReportRef.current;
    const printWindow = window.open('', '_blank');

    // Get all stylesheets from current page
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          return '';
        }
      })
      .join('\n');

    printWindow.document.write(`
    <html>
      <head>
        <title>TestResults_${reports?.finalReport?.name || 'Report'}</title>
        <style>${styles}</style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handlePatientNumberChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newNumber = [...formData.patientNumber];
    newNumber[index] = value;
    if (value && index < 9) {
      inputRefs.current[index + 1]?.focus();
    }
    setFormData(prev => ({ ...prev, patientNumber: newNumber }));
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !formData.patientNumber[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (blocked) {
      const blockTime = localStorage.getItem('reportBlockedUntil');
      if (blockTime) {
        const remaining = Math.ceil((parseInt(blockTime) - Date.now()) / 60000);
        setError(`Too many failed attempts. Please try again after ${remaining} minute(s).`);
      } else {
        setError('Too many failed attempts. Please try again after 15 minutes.');
      }
      return;
    }

    const patientNum = formData.patientNumber.join('');
    if (patientNum.length !== 10) {
      setError('Please enter complete 10-digit patient number');
      return;
    }

    const formattedNumber = `${patientNum.slice(0, 4)}-${patientNum.slice(4, 6)}-${patientNum.slice(6, 10)}`;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/get-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          patientNumber: formattedNumber,
          phone: formData.phone.trim()
        })
      });

      const data = await res.json();

      console.log('📊 Full response data:', data);

      if (data.success) {

        // ✅ Process history if it exists in the response
        if (data.finalReport?.historicalPatients) {
          console.log('🔄 Processing history...');
          console.log('📦 Historical patients count:', data.finalReport.historicalPatients.length);
          console.log('⚙️ History settings:', historySettings);

          const processedHistory = processHistoricalData(
            data.finalReport,
            data.finalReport.historicalPatients,
            historySettings
          );

          console.log('📈 Processed history:', processedHistory);

          if (processedHistory) {
            data.finalReport.historicalData = processedHistory;
            console.log('✅ History attached successfully');
          } else {
            console.log('⚠️ No matching tests found in history');
          }
        } else {
          console.log('ℹ️ No historical data available');
        }

        if (data.finalReport) {
          checkCanReview(data.finalReport.refNo);
        }

        setReports(data);
        setAttempts(0);
        localStorage.removeItem('reportAttempts');
        localStorage.removeItem('reportBlockedUntil');
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('reportAttempts', newAttempts.toString());

      if (newAttempts >= 5) {
        const blockUntil = Date.now() + (15 * 60 * 1000);
        localStorage.setItem('reportBlockedUntil', blockUntil.toString());
        setBlocked(true);
        setError('Too many failed attempts. Access blocked for 15 minutes.');
      } else {
        setError(err.message || 'Invalid details. Please check and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // If reports loaded, show results
  if (reports) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Patient Reports</h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Patient No: {reports.registrationReport.refNo}</p>
              </div>
              <button
                onClick={() => setReports(null)}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base"
              >
                ← Back to Search
              </button>
            </div>
          </div>

          {/* Registration Report Card */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" /> Registration Report
              </h2>
              <button
                onClick={handlePrintReg}
                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            </div>

            {/* Registration Report - Visible on screen and printable */}
            <div style={{ display: isMobile ? 'none' : 'block' }}>
              {/* ========================================
                  HIDDEN PRINT TEMPLATE FOR REGISTRATION
                  ======================================== */}
              {reports.registrationReport && (
                <div>
                  <div ref={regReportRef} className="bg-white">
                    <style>
                      {`
              @media print {
                  @page { 
                      margin: 0mm 20mm; 
                      size: A4 portrait;
                  }
                  body { 
                      print-color-adjust: exact; 
                      -webkit-print-color-adjust: exact; 
                  }
              }
              `}
                    </style>



                    {/* ========================================
                                          PATIENT COPY
                                      ======================================== */}
                    <div className="pt-4" style={{ pageBreakInside: 'avoid' }}>
                      {/* PATIENT COPY Header */}
                      <div className="mb-1">
                        <div className="text-center mb-3">
                          <div className="inline-block px-6 py-1">
                            <p className="text-sm font-bold text-blue-900">PATIENT COPY - (Downloaded From Online Lab Public Portal)</p>
                          </div>
                        </div>

                        <div className="flex items-start justify-between">
                          {/* Left: Logo and Lab labInfo */}
                          <div className="flex items-start">
                            {labInfo.logoUrl && (
                              <img
                                src={labInfo.logoUrl}
                                alt="Lab Logo"
                                className="h-16 w-16 mr-4 object-contain"
                                onError={(e) => e.target.style.display = 'none'}
                              />
                            )}
                            <div className="text-left">
                              <h1 className="text-2xl font-bold mb-0">
                                <span style={{ letterSpacing: '0.3em' }}>DOCTOR</span>{' '}
                                <span style={{ letterSpacing: '0.25em' }}>LAB</span>
                              </h1>
                              <p className="text-sm mb-1">
                                <span style={{ letterSpacing: '0.02em' }}>&</span>{' '}
                                <span style={{ letterSpacing: '0.08em' }}>Imaging Center Sahiwal</span>
                              </p>
                              <p className="text-xs italic" style={{ letterSpacing: '0.03em' }}>
                                Better Diagnosis - Better Treatment
                              </p>
                            </div>
                          </div>

                          {/* Right: QR Code */}
                          <div className="flex flex-col items-center">
                            {/*text - scan to see online */}
                            <div className="flex flex-col">
                              <div className="text-[10px]">
                                <div>Scan to View</div>
                              </div>
                              <QRCodeSVG
                                value={`${window.location.origin}/public-report`}
                                size={60}
                                level="M"
                              />
                              <div className="text-[10px]">
                                <div>Online Report</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Patient No and Case No with Barcodes */}
                      <div className="border-t-2 border-b-2 border-gray-800 py-2">
                        <div className="flex justify-between items-center">
                          {/* Patient No */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">Patient #:</span>
                            <div className="text-center">
                              <svg ref={el => {
                                if (el && reports.registrationReport?.refNo) {
                                  JsBarcode(el, reports.registrationReport.refNo, {
                                    format: "CODE128",
                                    width: 1,
                                    height: 20,
                                    displayValue: false,
                                    margin: 0
                                  });
                                }
                              }}></svg>
                              <p className="text-xs mt-0.5">{reports.registrationReport?.refNo}</p>
                            </div>
                          </div>

                          {/* Case No */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">Case #:</span>
                            <div className="text-center">
                              <svg ref={el => {
                                if (el && reports.registrationReport?.caseNo) {
                                  JsBarcode(el, reports.registrationReport.caseNo, {
                                    format: "CODE128",
                                    width: 1,
                                    height: 20,
                                    displayValue: false,
                                    margin: 0
                                  });
                                }
                              }}></svg>
                              <p className="text-xs mt-0.5">{reports.registrationReport?.caseNo}</p>
                            </div>
                          </div>
                        </div>
                      </div>


                      {/* Patient labInfo in ONE Box */}
                      <div className="border border-gray-800 p-2 mb-3 bg-gray-50">
                        <table className="w-full text-xs">
                          <tbody>
                            <tr>
                              <td className="font-semibold py-0.5 w-1/4">Patient's Name</td>
                              <td className="py-0.5 w-1/4">{reports.registrationReport.name}</td>
                              <td className="font-semibold py-0.5 w-1/4">Reg. Date</td>
                              <td className="py-0.5 w-1/4">{new Date(reports.registrationReport.createdAt).toLocaleDateString('en-GB')} {new Date(reports.registrationReport.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold py-0.5">Father/Husband</td>
                              <td className="py-0.5">{reports.registrationReport?.fatherHusbandName || "-"}</td>
                              <td className="font-semibold py-0.5">Reg. Centre</td>
                              <td className="py-0.5">Main Lab</td>
                            </tr>
                            <tr>
                              <td className="font-semibold py-0.5">Age/Sex</td>
                              <td className="py-0.5">{formatAge(reports.registrationReport)} / {reports.registrationReport.gender}</td>
                              <td className="font-semibold py-0.5">Specimen</td>
                              <td className="py-0.5">{reports.registrationReport.tests?.[0]?.testId?.specimen || 'Taken in Lab'}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold py-0.5">Contact No</td>
                              <td className="py-0.5">{reports.registrationReport.phone}</td>
                              <td className="font-semibold py-0.5">Consultant</td>
                              <td className="py-0.5">SELF</td>
                            </tr>
                            <tr>

                              <td className="font-semibold py-0.5">NIC No</td>
                              <td className="py-0.5">{reports.registrationReport?.nicNo || "-"}</td>

                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Tests Table */}
                      {reports.registrationReport.tests && reports.registrationReport.tests.length > 0 && (
                        <div className="mb-3">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-gray-400">
                                <th className="text-left py-1 font-semibold">S.No</th>
                                <th className="text-left py-1 font-semibold">Test Descriptions</th>
                                <th className="text-right py-1 font-semibold">Charges</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reports.registrationReport.tests.map((test, idx) => (
                                <tr key={idx} className="border-b border-gray-300">
                                  <td className="py-1.5">{idx + 1}</td>
                                  <td className="py-1.5">{test.testName}</td>
                                  <td className="text-right py-1.5">Rs.{test.price}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Totals Section */}
                      <div className="flex justify-end mb-3">
                        <div className="text-xs space-y-0.5 min-w-[200px]">
                          {/* Total Amount */}
                          <div className="flex justify-between border-b border-gray-300 pb-0.5">
                            <span>Total Amount:</span>
                            <span>Rs.{reports.registrationReport.total || 0}</span>
                          </div>

                          {/* Discount (if exists) */}
                          {reports.registrationReport.discountAmount > 0 && (
                            <div className="flex justify-between border-b border-gray-300 pb-0.5">
                              <span>Discount {reports.registrationReport.discountPercentage > 0 && `(${reports.registrationReport.discountPercentage}%)`}:</span>
                              <span>- Rs.{reports.registrationReport.discountAmount}</span>
                            </div>
                          )}

                          {/* Net Amount */}
                          <div className="flex justify-between font-semibold border-b border-gray-300 pb-0.5">
                            <span>Net Amount:</span>
                            <span>Rs.{reports.registrationReport.netTotal || reports.registrationReport.total}</span>
                          </div>

                          {/* Paid Amount */}
                          <div className="flex justify-between border-b border-gray-300 pb-0.5">
                            <span>Paid:</span>
                            <span>Rs.{reports.registrationReport.paidAmount || (reports.registrationReport.paymentStatus === 'Paid' ? (reports.registrationReport.netTotal || reports.registrationReport.total) : 0)}</span>
                          </div>

                          {/* Due Amount */}
                          <div className="flex justify-between font-semibold">
                            <span>Due Amount:</span>
                            <span>Rs.{reports?.registrationReport.dueAmount ?? (reports.registrationReport.paymentStatus === 'Paid' ? 0 : (reports.registrationReport.netTotal || reports.registrationReport.total))}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="border-t border-gray-400 pt-2">
                        <p className="text-center text-xs font-semibold mb-2">Computerized Receipt, No Signature(s) Required</p>
                        <div className="text-center text-xs text-gray-700 space-y-0.5">
                          <p className="font-medium">
                            Phone: {labInfo?.phoneNumber || '0325-0020111'} | Email: doctorlab91@gmail.com
                          </p>
                          <p className="text-[10px] leading-tight">
                            {labInfo?.address || 'Opposite THQ Hospital Near Punjab Pharmacy Sahiwal, District Sargodha'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Final Report Section */}
          {reports.hasResults ? (
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Final Report
                </h2>
                <button
                  onClick={handlePrintFinal}
                  className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-green-700 text-sm sm:text-base w-full sm:w-auto justify-center"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
              </div>

              {/* Final Report - Visible on screen and printable */}
              {reports.finalReport && (
                <div style={{ display: isMobile ? 'none' : 'block' }}>
                  <div ref={finalReportRef} className="bg-white">
                    <style>{`
  @media print {
    @page {
      size: A4 portrait;
      margin: 5mm 8mm;
    }
  
    html, body {
      height: 100%;
      margin: 0;
      padding: 0;
    }
  
    body {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
  
    table.main-wrapper {
      width: 100%;
      border-collapse: collapse;
      min-height: 100vh;
      display: table;
    }
  
    thead.print-header {
      display: table-header-group;
    }
  
    tbody.print-content {
      display: table-row-group;
      height: 100%;
    }
  
    tbody.print-content tr {
      height: 100%;
    }
  
    tbody.print-content td {
      vertical-align: top;
      height: 100%;
    }
  
    tfoot.print-footer {
      display: table-footer-group;
      vertical-align: bottom;
    }
  
    .print-footer td {
      vertical-align: bottom;
    }
  
    .test-section {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    tbody.test-block {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .special-field-container {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .special-field-container h4,
    .special-field-container p,
    .special-field-container > div {
      page-break-inside: avoid;
      break-inside: avoid;
    }
  
    .no-margin {
      margin: 0;
      padding: 0;
    }

    tbody.print-content::after {
      content: "";
      display: table-row;
      height: 160px;
    }
  }
`}</style>
                    {/* ✅ TABLE WRAPPER FOR PROPER PRINTING */}
                    <table className="main-wrapper w-full border-collapse no-margin">

                      {/* ========================================
                          HEADER (Repeats Automatically)
                      ======================================== */}
                      <thead className="print-header">

                        <tr>
                          <td>
                            <div className="text-xs font-semibold mb-2 text-center">(Downloaded From Online Lab Public Portal)</div>
                            <div className="flex items-start justify-between border-b-2 border-gray-800 pb-2 mb-2">

                              {/* Left: Logo and Lab Info */}
                              <div className="flex items-start">
                                {labInfo?.logoUrl && (
                                  <img
                                    src={labInfo.logoUrl}
                                    alt="Lab Logo"
                                    className="h-24 w-24 mr-4 object-contain"
                                    onError={(e) => (e.target.style.display = "none")}
                                  />
                                )}
                                <div className="text-left">
                                  <h1 className="text-3xl font-bold mb-1">
                                    <span style={{ letterSpacing: "0.3em" }}>DOCTOR</span>{" "}
                                    <span style={{ letterSpacing: "0.25em" }}>LAB</span>
                                  </h1>
                                  <p className="text-md font-semibold mb-2">
                                    <span style={{ letterSpacing: "0.02em" }}>&</span>{" "}
                                    <span style={{ letterSpacing: "0.08em" }}>
                                      Imaging Center Sahiwal
                                    </span>
                                  </p>
                                  <p className="text-xs italic" style={{ letterSpacing: "0.03em" }}>
                                    Better Diagnosis - Better Treatment
                                  </p>
                                </div>
                              </div>

                              {/* Right: QR Code and Barcodes */}
                              <div className="flex items-center justify-center">
                                <div className="mr-6 pt-3">
                                  <div className="flex flex-col items-center">
                                    {/* Patient No */}
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold">Patient #:</span>
                                      <div className="text-center">
                                        <svg
                                          ref={(el) => {
                                            if (el && reports.finalReport?.refNo) {
                                              JsBarcode(el, reports.finalReport.refNo, {
                                                format: "CODE128",
                                                width: 1,
                                                height: 20,
                                                displayValue: false,
                                                margin: 0,
                                              });
                                            }
                                          }}
                                        ></svg>
                                        <p className="text-xs mt-0.5">{reports.finalReport?.refNo}</p>
                                      </div>
                                    </div>

                                    {/* Case No */}
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold">Case #:</span>
                                      <div className="text-center">
                                        <svg
                                          ref={(el) => {
                                            if (el && reports.finalReport?.caseNo) {
                                              JsBarcode(el, reports.finalReport.caseNo, {
                                                format: "CODE128",
                                                width: 1,
                                                height: 20,
                                                displayValue: false,
                                                margin: 0,
                                              });
                                            }
                                          }}
                                        ></svg>
                                        <p className="text-xs mt-0.5">{reports.finalReport?.caseNo}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {/*text - scan to see online */}
                                <div className="flex flex-col">
                                  <div className="text-[11px]">
                                    <div>Scan to View</div>
                                  </div>
                                  <QRCodeSVG
                                    value={`${window.location.origin}/public-report`}
                                    size={70}
                                    level="M"
                                  />
                                  <div className="text-[11px]">
                                    <div>Online Report</div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Patient Info Box */}
                            <div className="border-b border-gray-800 pb-3  bg-white">
                              <table className="w-full text-xs">
                                <tbody>
                                  <tr>
                                    <td className="font-semibold py-0.5 w-1/4">Patient's Name</td>
                                    <td className="py-0.5 w-1/4 font-semibold text-md uppercase">
                                      {reports.finalReport?.name}
                                    </td>
                                    <td className="font-semibold py-0.5 w-1/4">Reg. Date</td>
                                    <td className="py-0.5 w-1/4">
                                      {new Date(reports.finalReport?.createdAt).toLocaleDateString("en-GB")}{" "}
                                      {new Date(reports.finalReport?.createdAt).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      })}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="font-semibold py-0.5">Age/Sex</td>
                                    <td className="py-0.5">
                                      {formatAge(reports.finalReport)} / {reports.finalReport?.gender}
                                    </td>
                                    {/* this is the second specimen status we add while registering patient */}
                                    <td className="font-semibold py-0.5">Specimen</td>
                                    <td className="py-0.5">
                                      {reports.finalReport?.specimen || "Taken in Lab"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="font-semibold py-0.5">Father/Husband</td>
                                    <td className="py-0.5">{reports.finalReport?.fatherHusbandName || "-"}</td>
                                    <td className="font-semibold py-0.5">Reg. Centre</td>
                                    <td className="py-0.5">Main Lab</td>
                                  </tr>
                                  <tr>
                                    <td className="font-semibold py-0.5">Contact No</td>
                                    <td className="py-0.5">{reports.finalReport?.phone}</td>
                                    <td className="font-semibold py-0.5">Consultant</td>
                                    <td className="py-0.5">{reports.finalReport?.referencedBy || "SELF"}</td>
                                  </tr>
                                  <tr>
                                    <td className="font-semibold py-0.5">Hosp/ MR #</td>
                                    <td className="py-0.5">-</td>
                                    <td className="font-semibold py-0.5">NIC No</td>
                                    <td className="py-0.5">{reports.finalReport?.nicNo || "-"}</td>



                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      </thead>

                      {/* ========================================
                          MAIN CONTENT
                      ======================================== */}
                      <tbody className="print-content">
                        <tr>
                          <td>
                            {/* Group tests by category */}
                            {(() => {
                              // Use historical data if available
                              const testsToRender = reports.finalReport?.historicalData?.tests || reports.finalReport?.tests || [];
                              const nonDiagnosticTests = testsToRender.filter(test => !test.testId?.isDiagnosticTest);

                              const testsByCategory = {};
                              nonDiagnosticTests.forEach(test => {
                                const category = test.testId?.category || "OTHER TESTS";
                                if (!testsByCategory[category]) {
                                  testsByCategory[category] = [];
                                }
                                testsByCategory[category].push(test);
                              });

                              return Object.entries(testsByCategory).map(([category, categoryTests], catIndex) => {
                                const testsWithData = categoryTests.filter(test =>
                                  test.fields?.some(f =>
                                    f.defaultValue &&
                                    f.defaultValue.trim() !== "" &&
                                    f.defaultValue !== "—"
                                  )
                                );

                                if (testsWithData.length === 0) return null;

                                return (
                                  <div key={catIndex} className="test-section mb-3 pt-8">
                                    {/* Category Header */}
                                    <div className="my-2 -mb-5">
                                      <h3 className="text-md font-bold uppercase">{category} REPORT</h3>
                                    </div>

                                    {/* Mixed Rendering: Special + Narrative + Table */}
                                    {(() => {
                                      // Merge result fields with template specialRender config
                                      const testsWithConfig = testsWithData.map(test => {
                                        const templateFields = test.testId?.fields || [];
                                        const mergedFields = test.fields?.map(resultField => {
                                          const templateField = templateFields.find(
                                            tf => tf.fieldName === resultField.fieldName
                                          );
                                          return {
                                            ...resultField,
                                            specialRender: templateField?.specialRender || { enabled: false }
                                          };
                                        }) || [];

                                        return {
                                          ...test,
                                          fields: mergedFields
                                        };
                                      });

                                      // Separate tests by render mode
                                      const specialTests = testsWithConfig.filter(test =>
                                        test.fields?.some(f => f.specialRender?.enabled)
                                      );

                                      const narrativeTests = testsWithConfig.filter(test =>
                                        test.testId?.isNarrativeFormat &&
                                        !test.fields?.some(f => f.specialRender?.enabled)
                                      );

                                      const normalTests = testsWithConfig.filter(test =>
                                        !test.fields?.some(f => f.specialRender?.enabled) &&
                                        !test.testId?.isNarrativeFormat
                                      );

                                      return (
                                        <>
                                          {/* SPECIAL RENDER TESTS */}
                                          {specialTests.map((test, testIndex) => {
                                            const specialFields = test.fields.filter(
                                              f => f.specialRender?.enabled &&
                                                f.defaultValue &&
                                                f.defaultValue.trim() !== "" &&
                                                f.defaultValue !== "—"
                                            );

                                            if (specialFields.length === 0) return null;

                                            return (
                                              <div
                                                key={`special-${testIndex}`}
                                                style={{
                                                  pageBreakInside: "avoid",
                                                  breakInside: "avoid",
                                                  marginBottom: "16px",
                                                  marginTop: "16px"
                                                }}
                                              >
                                                <div className="mt-6">
                                                  <h3 className="text-sm font-semibold uppercase">{test.testName}</h3>
                                                </div>
                                                <div className="h-[1px] w-full bg-gray-400 mb-1"></div>

                                                {specialFields.map((field, fieldIndex) => (
                                                  <div
                                                    key={fieldIndex}
                                                    className="special-field-container"
                                                    style={{
                                                      pageBreakInside: "avoid",
                                                      breakInside: "avoid",
                                                      marginBottom: "8px"
                                                    }}
                                                  >
                                                    <h4 className="font-semibold text-gray-900 text-[13px] mb-1">
                                                      {field.fieldName}
                                                    </h4>

                                                    <div className="flex items-start justify-between gap-4">
                                                      {field.specialRender?.description && (
                                                        <p className="text-[11px] text-gray-900 leading-tight flex-1">
                                                          {field.specialRender.description}
                                                        </p>
                                                      )}

                                                      {field.specialRender?.scaleConfig && (
                                                        <div style={{ width: '180px', flexShrink: 0 }}>
                                                          <SmallTestScaleVisualization
                                                            scaleConfig={field.specialRender.scaleConfig}
                                                            resultValue={field.defaultValue}
                                                            unit={field.unit}
                                                          />
                                                        </div>
                                                      )}
                                                    </div>
                                                    <div className="h-[1px] w-full bg-gray-400 mt-2 mb-0"></div>
                                                  </div>
                                                ))}
                                              </div>
                                            );
                                          })}

                                          {/* NARRATIVE TESTS */}
                                          {narrativeTests.map((test, testIndex) => {
                                            const filledFields = test.fields.filter(
                                              f => f.defaultValue &&
                                                f.defaultValue.trim() !== "" &&
                                                f.defaultValue !== "—"
                                            );

                                            if (filledFields.length === 0) return null;

                                            return (
                                              <div
                                                key={`narrative-${testIndex}`}
                                                style={{
                                                  pageBreakInside: "avoid",
                                                  breakInside: "avoid",
                                                  marginBottom: "16px",
                                                  marginTop: "16px"
                                                }}
                                              >
                                                <div className="mt-6">
                                                  <h3 className="text-sm font-semibold uppercase">{test.testName}</h3>
                                                </div>
                                                <div className="h-[1px] w-full bg-gray-400 mb-4"></div>

                                                {filledFields.map((field, fieldIndex) => (
                                                  <div
                                                    key={fieldIndex}
                                                    style={{
                                                      pageBreakInside: "avoid",
                                                      breakInside: "avoid",
                                                      marginBottom: "12px"
                                                    }}
                                                  >
                                                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                                      {field.fieldName}
                                                    </h4>

                                                    <p className="text-xs text-gray-900 leading-relaxed whitespace-pre-line">
                                                      {field.defaultValue}
                                                    </p>
                                                  </div>
                                                ))}
                                              </div>
                                            );
                                          })}

                                          {/* NORMAL TABLE TESTS */}
                                          {normalTests.length > 0 && (() => {
                                            // Collect all unique history columns
                                            const allHistoryColumnsMap = new Map();

                                            normalTests.forEach(test => {
                                              test.historyColumns?.forEach(col => {
                                                if (!allHistoryColumnsMap.has(col.refNo)) {
                                                  allHistoryColumnsMap.set(col.refNo, col);
                                                }
                                              });
                                            });

                                            const allHistoryColumns = Array.from(allHistoryColumnsMap.values())
                                              .sort((a, b) => {
                                                if (historySettings.historyResultsDirection === 'right-to-left') {
                                                  return new Date(a.date) - new Date(b.date);
                                                } else {
                                                  return new Date(b.date) - new Date(a.date);
                                                }
                                              });

                                            return (
                                              <table
                                                className="text-xs border-collapse mb-2"
                                                style={{
                                                  width: allHistoryColumns.length > 0 ? "100%" : "83%"
                                                }}
                                              >
                                                <thead>
                                                  <tr className="border-b border-gray-800">
                                                    <th className="text-left pl-2 font-semibold align-bottom">TEST</th>
                                                    <th className="text-center font-semibold align-bottom">REFERENCE RANGE</th>
                                                    <th className="text-center font-semibold align-bottom">UNIT</th>

                                                    {historySettings.historyResultsDirection === 'left-to-right' && (
                                                      <th className="text-center font-semibold align-top">
                                                        <div>RESULT</div>
                                                        <div className="text-[10px] font-semibold">
                                                          {reports.finalReport?.refNo}
                                                        </div>
                                                        <div className="text-[10px] font-normal">
                                                          {new Date().toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric"
                                                          }).replace(/ /g, "-")} {" "}
                                                          {new Date().toLocaleTimeString("en-US", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            hour12: true,
                                                          })}
                                                        </div>
                                                      </th>
                                                    )}

                                                    {allHistoryColumns.map((col, idx) => (
                                                      <th key={idx} className="text-center font-semibold align-top">
                                                        <div>RESULT</div>
                                                        <div className="text-[10px] font-semibold">
                                                          {col.refNo}
                                                        </div>
                                                        <div className="text-[10px] font-normal">
                                                          {new Date(col.date).toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric"
                                                          }).replace(/ /g, "-")} {" "}
                                                          {new Date(col.date).toLocaleTimeString("en-US", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            hour12: true,
                                                          })}
                                                        </div>
                                                      </th>
                                                    ))}

                                                    {historySettings.historyResultsDirection === 'right-to-left' && (
                                                      <th className="text-center font-semibold align-top">
                                                        <div>RESULT</div>
                                                        <div className="text-[10px] font-semibold">
                                                          {reports.finalReport?.refNo}
                                                        </div>
                                                        <div className="text-[10px] font-normal">
                                                          {new Date().toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric"
                                                          }).replace(/ /g, "-")} {" "}
                                                          {new Date().toLocaleTimeString("en-US", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            hour12: true,
                                                          })}
                                                        </div>
                                                      </th>
                                                    )}
                                                  </tr>
                                                </thead>

                                                {normalTests.map((test, testIndex) => {
                                                  const filledFields = test.fields?.filter(
                                                    f => f.defaultValue &&
                                                      f.defaultValue.trim() !== "" &&
                                                      f.defaultValue !== "—"
                                                  ) || [];

                                                  return (
                                                    <tbody
                                                      key={testIndex}
                                                      className="test-block"
                                                      style={{
                                                        pageBreakInside: "avoid",
                                                        breakInside: "avoid"
                                                      }}
                                                    >
                                                      {test.testName && (
                                                        <tr>
                                                          <td colSpan={4 + allHistoryColumns.length} className="py-2 font-semibold uppercase text-sm">
                                                            {test.testName}
                                                          </td>
                                                        </tr>
                                                      )}

                                                      {(() => {
                                                        const hasCategories = filledFields.some(f => f.category);

                                                        if (!hasCategories) {
                                                          return filledFields.map((f, fi) => (
                                                            <tr key={fi} className="border-b border-gray-400" style={{ borderBottomStyle: "dashed" }}>
                                                              <td className="py-0.5 pl-2">{f.fieldName}</td>
                                                              <td className="text-center py-0.5">
                                                                <div className='whitespace-pre-line'>
                                                                  {(() => {
                                                                    const rangeStr = f.range || "-";
                                                                    const patientGender = reports.finalReport?.gender?.toUpperCase();
                                                                    if (rangeStr.includes('M:') || rangeStr.includes('F:')) {
                                                                      const parts = rangeStr.split(',');
                                                                      for (let part of parts) {
                                                                        part = part.trim();
                                                                        if (patientGender === 'MALE' && part.startsWith('M:')) {
                                                                          return part.substring(2).trim();
                                                                        }
                                                                        if (patientGender === 'FEMALE' && part.startsWith('F:')) {
                                                                          return part.substring(2).trim();
                                                                        }
                                                                      }
                                                                      return rangeStr;
                                                                    }
                                                                    return rangeStr;
                                                                  })()}
                                                                </div>
                                                              </td>
                                                              <td className="text-center py-0.5">{f.unit || "."}</td>

                                                              {historySettings.historyResultsDirection === 'left-to-right' && (
                                                                <td className="text-center font-semibold py-0.5">
                                                                  {f.defaultValue}
                                                                </td>
                                                              )}

                                                              {allHistoryColumns.map((col, colIdx) => {
                                                                const testHasThisColumn = test.historyColumns?.some(
                                                                  tc => tc.refNo === col.refNo
                                                                );

                                                                if (!testHasThisColumn) {
                                                                  return (
                                                                    <td key={colIdx} className="text-center py-0.5 text-gray-400">
                                                                      —
                                                                    </td>
                                                                  );
                                                                }

                                                                const testHistoryIndex = test.historyColumns.findIndex(
                                                                  tc => tc.refNo === col.refNo
                                                                );

                                                                const histVal = testHistoryIndex !== -1
                                                                  ? f.historicalValues?.[testHistoryIndex]
                                                                  : "—";

                                                                const histData = test.historyColumns[testHistoryIndex];
                                                                const histField = histData?.result?.fields?.find(
                                                                  hf => hf.fieldName === f.fieldName
                                                                );
                                                                const histUnit = histField?.unit?.trim() || '';
                                                                const currentUnit = f.unit?.trim() || '';

                                                                const unitMismatch = histUnit && currentUnit &&
                                                                  histUnit.toLowerCase() !== currentUnit.toLowerCase();

                                                                return (
                                                                  <td key={colIdx} className="text-center font-semibold py-0.5">
                                                                    {histVal || "—"}
                                                                    {unitMismatch && <span className="text-red-600 font-bold ml-0.5">*</span>}
                                                                  </td>
                                                                );
                                                              })}

                                                              {historySettings.historyResultsDirection === 'right-to-left' && (
                                                                <td className="text-center font-semibold py-0.5">
                                                                  {f.defaultValue}
                                                                </td>
                                                              )}
                                                            </tr>
                                                          ));
                                                        } else {
                                                          const fieldsByCategory = {};
                                                          filledFields.forEach(f => {
                                                            const cat = f.category || "Other";
                                                            if (!fieldsByCategory[cat]) {
                                                              fieldsByCategory[cat] = [];
                                                            }
                                                            fieldsByCategory[cat].push(f);
                                                          });

                                                          return Object.entries(fieldsByCategory).map(([category, fields], catIdx) => (
                                                            <React.Fragment key={catIdx}>
                                                              <tr>
                                                                <td colSpan={4 + allHistoryColumns.length} className="py-1.5 font-bold text-xs uppercase bg-gray-50">
                                                                  {category}
                                                                </td>
                                                              </tr>

                                                              {fields.map((f, fi) => (
                                                                <tr key={fi} className="border-b border-gray-400" style={{ borderBottomStyle: "dashed" }}>
                                                                  <td className="py-0.5 pl-2">{f.fieldName}</td>
                                                                  <td className="text-center py-0.5">
                                                                    <div className='whitespace-pre-line'>
                                                                      {(() => {
                                                                        const rangeStr = f.range || "-";
                                                                        const patientGender = reports.finalReport?.gender?.toUpperCase();
                                                                        if (rangeStr.includes('M:') || rangeStr.includes('F:')) {
                                                                          const parts = rangeStr.split(',');
                                                                          for (let part of parts) {
                                                                            part = part.trim();
                                                                            if (patientGender === 'MALE' && part.startsWith('M:')) {
                                                                              return part.substring(2).trim();
                                                                            }
                                                                            if (patientGender === 'FEMALE' && part.startsWith('F:')) {
                                                                              return part.substring(2).trim();
                                                                            }
                                                                          }
                                                                          return rangeStr;
                                                                        }
                                                                        return rangeStr;
                                                                      })()}
                                                                    </div>
                                                                  </td>
                                                                  <td className="text-center py-0.5">{f.unit || "."}</td>

                                                                  {historySettings.historyResultsDirection === 'left-to-right' && (
                                                                    <td className="text-center font-semibold py-0.5">
                                                                      {f.defaultValue}
                                                                    </td>
                                                                  )}

                                                                  {allHistoryColumns.map((col, colIdx) => {
                                                                    const testHasThisColumn = test.historyColumns?.some(
                                                                      tc => tc.refNo === col.refNo
                                                                    );

                                                                    if (!testHasThisColumn) {
                                                                      return (
                                                                        <td key={colIdx} className="text-center py-0.5 text-gray-400">
                                                                          —
                                                                        </td>
                                                                      );
                                                                    }

                                                                    const testHistoryIndex = test.historyColumns.findIndex(
                                                                      tc => tc.refNo === col.refNo
                                                                    );

                                                                    const histVal = testHistoryIndex !== -1
                                                                      ? f.historicalValues?.[testHistoryIndex]
                                                                      : "—";

                                                                    const histData = test.historyColumns[testHistoryIndex];
                                                                    const histField = histData?.result?.fields?.find(
                                                                      hf => hf.fieldName === f.fieldName
                                                                    );
                                                                    const histUnit = histField?.unit?.trim() || '';
                                                                    const currentUnit = f.unit?.trim() || '';

                                                                    const unitMismatch = histUnit && currentUnit &&
                                                                      histUnit.toLowerCase() !== currentUnit.toLowerCase();

                                                                    return (
                                                                      <td key={colIdx} className="text-center font-semibold py-0.5">
                                                                        {histVal || "—"}
                                                                        {unitMismatch && <span className="text-red-600 font-bold ml-0.5">*</span>}
                                                                      </td>
                                                                    );
                                                                  })}

                                                                  {historySettings.historyResultsDirection === 'right-to-left' && (
                                                                    <td className="text-center font-semibold py-0.5">
                                                                      {f.defaultValue}
                                                                    </td>
                                                                  )}
                                                                </tr>
                                                              ))}
                                                            </React.Fragment>
                                                          ));
                                                        }
                                                      })()}

                                                      {/* TEST SCALE */}
                                                      {(() => {
                                                        const testData = test.testId || test;
                                                        const scaleConfig = testData.scaleConfig;
                                                        const firstField = test.fields?.[0];
                                                        const resultValue = firstField?.defaultValue;
                                                        const unit = firstField?.unit || '';

                                                        if (!scaleConfig?.thresholds || !scaleConfig?.labels || !resultValue) return null;

                                                        return (
                                                          <tr>
                                                            <td colSpan={4 + allHistoryColumns.length}>
                                                              <TestScaleVisualization
                                                                scaleConfig={scaleConfig}
                                                                resultValue={resultValue}
                                                                unit={unit}
                                                              />
                                                            </td>
                                                          </tr>
                                                        );
                                                      })()}

                                                      {/* VISUAL SCALE */}
                                                      {(() => {
                                                        const testData = test.testId || test;
                                                        const visualScale = testData.visualScale;
                                                        const firstField = test.fields?.[0];
                                                        const resultValue = firstField?.defaultValue;
                                                        const unit = firstField?.unit || '';

                                                        if (!visualScale?.thresholds || !visualScale?.labels || !resultValue) return null;

                                                        return (
                                                          <tr>
                                                            <td colSpan={4 + allHistoryColumns.length}>
                                                              <VisualScaleVisualization
                                                                visualScale={visualScale}
                                                                resultValue={resultValue}
                                                                unit={unit}
                                                              />
                                                            </td>
                                                          </tr>
                                                        );
                                                      })()}

                                                      {/* REPORT EXTRAS */}
                                                      {(() => {
                                                        const extras = (test.testId || test)?.reportExtras;
                                                        if (!extras || Object.keys(extras).length === 0) return null;

                                                        return (
                                                          <tr>
                                                            <td colSpan={4 + allHistoryColumns.length}>
                                                              {Object.entries(extras).map(([key, value]) => {
                                                                if (!value || (typeof value === 'string' && !value.trim())) return null;

                                                                const heading = key.replace(/([A-Z])/g, ' $1').toUpperCase();

                                                                return (
                                                                  <div key={key} className="mb-3 mt-2">
                                                                    <h4 className="font-bold text-sm underline mb-1">
                                                                      {heading}
                                                                    </h4>

                                                                    {typeof value === 'string' ? (
                                                                      <p className="text-xs whitespace-pre-line">{value}</p>
                                                                    ) : (
                                                                      <ol className="list-decimal ml-4 text-xs">
                                                                        {value.map((v, i) => <li key={i}>{v}</li>)}
                                                                      </ol>
                                                                    )}
                                                                  </div>
                                                                );
                                                              })}
                                                            </td>
                                                          </tr>
                                                        );
                                                      })()}
                                                    </tbody>
                                                  );
                                                })}
                                              </table>
                                            );
                                          })()}
                                        </>
                                      );
                                    })()}
                                  </div>
                                );
                              });
                            })()}
                          </td>
                        </tr>
                      </tbody>
                      {/* ========================================
                          FOOTER (Repeats Automatically)
                      ======================================== */}
                      <tfoot className="print-footer">
                        <tr>
                          <td>
                            <div className="text-center mb-1 mt-10">
                              <p className="text-xs font-semibold">
                                Electronically Verified Report, No Signature(s) Required.
                              </p>
                            </div>

                            <div className="border-t border-gray-800 pt-1">
                              <div className="flex justify-start items-end text-xs mb-1">
                                <div className="">
                                  <p className="font-semibold">Dr. Mudaser Hussain</p>
                                  <p className="text-left">Consultant Pathologist</p>
                                  <p>MBBS, MPhil. (Biochemistry)</p>
                                </div>
                              </div>

                              <div className="text-center">
                                <p className="text-[10px] text-gray-600 mb-1">
                                  NOTE: All the tests are performed on the most advanced,
                                  highly sophisticated, appropriate, and state of the art
                                  instruments with highly sensitive chemicals under strict
                                  conditions and with all care and diligence. However, the
                                  above results are NOT the DIAGNOSIS and should be correlated
                                  with clinical findings, patient's history, signs and
                                  symptoms and other diagnostic tests. Lab to lab variation
                                  may occur. This document is NEVER challengeable at any
                                  PLACE/COURT and in any CONDITION.
                                </p>
                              </div>

                              <div className="text-center text-xs">
                                <p>
                                  Opposite THQ Hospital Near Punjab Pharmacy Sahiwal, District Sargodha
                                </p>
                                <p>
                                  Contact # 0325-0020111 | Email: doctorlab91@gmail.com
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 text-center">
              <Clock className="h-12 w-12 text-orange-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-orange-800 mb-2">Results Pending</h3>
              <p className="text-orange-700">Your test results have not been uploaded yet. Please check back later.</p>
            </div>
          )}

          {/* ===================================
    REVIEWS SECTION  
=================================== */}
          {reports.hasResults && (
            <>
              {/* Reviews Widget */}
              <PublicReviewsWidget key={refreshReviews} />

              {/* Floating Review Button */}
              {canReview && (
                <button
                  onClick={() => setReviewDialogOpen(true)}
                  className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 flex items-center gap-2 font-semibold"
                >
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  Rate Us
                </button>
              )}

              {/* Review Dialog */}
              <ReviewDialog
                open={reviewDialogOpen}
                onOpenChange={setReviewDialogOpen}
                patientData={{
                  refNo: reports.finalReport.refNo,
                  phone: formData.phone,
                  name: reports.finalReport.name
                }}
                onReviewSubmitted={handleReviewSubmitted}
              />
            </>
          )}
        </div>
      </div>
    );
  }

  // Search form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          {/* Lab Logo and Name */}
          <div className="flex justify-center  items-center">
            {labInfo?.logoUrl && (
              <img
                src={labInfo.logoUrl}
                alt="Lab Logo"
                className="h-11 w-11 mr-3 object-contain mb-3"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <div className="text-center -mt-2">
              {labID === "demo_lab_system" ? (
                <>
                  <h1 className="text-[19px] font-bold mb-0">LabSync Pro</h1>
                  <p className="text-[11px] mb-1 text-gray-500">v_1.0</p>
                </>
              ) : labID === "doctor_lab_sahiwal" ? (
                <>
                  <h1 className="text-[19px] font-bold mb-0">
                    <span style={{ letterSpacing: '0.3em' }}>DOCTOR</span>{' '}
                    <span style={{ letterSpacing: '0.25em' }}>LAB</span>
                  </h1>
                  <p className="text-[11px] mb-1">
                    <span style={{ letterSpacing: '0.02em' }}>&</span>{' '}
                    <span style={{ letterSpacing: '0.08em' }}>Imaging Center Sahiwal</span>
                  </p>
                </>
              ) : labID === "fatima_medical_lab_bhera" ? (
                <>
                  <h1 className="text-[19px] font-bold mb-0">
                    <span style={{ letterSpacing: '0.3em' }}>FATIMA</span>{' '}
                    <span style={{ letterSpacing: '0.25em' }}>LAB</span>
                  </h1>
                  <p className="text-[11px] mb-1">
                    <span style={{ letterSpacing: '0.08em' }}>Fatima Medical Lab Bhera</span>
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-[19px] font-bold mb-0">LabSync Pro</h1>
                  <p className="text-[11px] mb-1 text-gray-500">v_1.0</p>
                </>
              )}
            </div>

          </div>

          <h2 className="text-xl font-bold text-gray-800 mt-4">View Your Report Online</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Patient Name <span className="text-gray-400 font-normal text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Patient Number (10 digits)
                <span className="text-xs text-gray-500 ml-2">Format: XXXX-XX-XXXX</span>
              </label>
              <div className="flex gap-0.5 sm:gap-2 justify-between">
                {formData.patientNumber.map((digit, index) => (
                  <React.Fragment key={index}>
                    <input
                      required
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="tel"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePatientNumberChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-5 h-9 sm:w-7 sm:h-10 text-center border-2 border-gray-300 rounded-lg font-semibold text-sm sm:text-lg focus:border-blue-500 focus:outline-none"
                    />
                    {(index === 3 || index === 5) && <span className="flex items-center font-bold text-gray-400 text-sm sm:text-base">-</span>}
                  </React.Fragment>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Tip: Your patient number is shown at the top-right of your report
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="03XXXXXXXXX"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              disabled={loading || blocked}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'View My Reports'}
            </button>

            {attempts > 0 && !blocked && (
              <p className="text-xs text-orange-600 text-center">
                ⚠️ Failed attempts: {attempts}/5
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
