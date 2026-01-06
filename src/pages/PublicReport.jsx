import { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, AlertCircle, CheckCircle, Clock, Download } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import React from 'react';
import TestScaleVisualization from '@/components/TestScaleVisualization';
import VisualScaleVisualization from '@/components/VisualScaleVisualization';

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

  const inputRefs = useRef([]);
  const regReportRef = useRef();
  const finalReportRef = useRef();

  useEffect(() => {
    fetchLabInfo();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



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
        labName: 'DOCTOR LAB & Imaging Center Sahiwal',
        address: 'Opposite THQ Hospital Near Punjab Pharmacy Sahiwal, District Sargodha',
        phoneNumber: '0325-0020111'
      });
    }
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
        const remaining = Math.ceil((parseInt(blockTime) - Date.now()) / 60000); // minutes remaining
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
      if (data.success) {
        setReports(data);
        setAttempts(0);
        localStorage.removeItem('reportAttempts');
        localStorage.removeItem('reportBlockedUntil');
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('reportAttempts', newAttempts.toString());

      if (newAttempts >= 5) {
        const blockUntil = Date.now() + (15 * 60 * 1000); // 15 minutes from now
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
                              <td className="py-0.5">{reports.registrationReport.age} Years / {reports.registrationReport.gender}</td>
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
              
                /* Main table takes full page height */
                table.main-wrapper {
                  width: 100%;
                  border-collapse: collapse;
                  min-height: 100vh;
                  display: table;
                }
              
                /* Header stays at top */
                thead.print-header {
                  display: table-header-group;
                }
              
                /* Content fills available space */
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
              
                /* Footer sticks to bottom */
                tfoot.print-footer {
                  display: table-footer-group;
                  vertical-align: bottom;
                }
              
                .print-footer td {
                  vertical-align: bottom;
                }
              
                /* Avoid content breaking */
                .test-section {
                  page-break-inside: avoid;
                  break-inside: avoid;
                }
              
                .no-margin {
                  margin: 0;
                  padding: 0;
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
                                      {reports.finalReport?.age} Years / {reports.finalReport?.gender}
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
                              // ✅ FILTER: Remove diagnostic tests before grouping
                              const nonDiagnosticTests = reports.finalReport?.tests?.filter(test => !test.testId?.isDiagnosticTest) || [];

                              // Group tests by category
                              const testsByCategory = {};
                              nonDiagnosticTests.forEach(test => {
                                const category = test.testId?.category || "OTHER TESTS";
                                if (!testsByCategory[category]) {
                                  testsByCategory[category] = [];
                                }
                                testsByCategory[category].push(test);
                              });

                              // Render each category
                              return Object.entries(testsByCategory).map(([category, categoryTests], catIndex) => {
                                // Filter tests that have filled fields
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

                                    {/* Table with headers (once per category) */}
                                    <table className=" text-xs border-collapse mb-2 " style={{ width: "83%" }}>
                                      <thead>
                                        <tr className="border-b border-gray-800">
                                          <th className="text-left pl-2 font-semibold align-bottom">TEST</th>
                                          <th className="text-center font-semibold align-bottom">
                                            REFERENCE RANGE
                                          </th>
                                          <th className="text-center font-semibold align-bottom">UNIT</th>
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
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* Render all tests under this category */}
                                        {testsWithData.map((test, testIndex) => {
                                          const filledFields = test.fields?.filter(
                                            f => f.defaultValue &&
                                              f.defaultValue.trim() !== "" &&
                                              f.defaultValue !== "—"
                                          ) || [];

                                          return (
                                            <React.Fragment key={testIndex}>
                                              {/* Test Name Row (if test has name) */}
                                              {test.testName && test.testName.trim() && (
                                                <tr>
                                                  <td colSpan="4" className="py-2 font-semibold uppercase text-sm">
                                                    {test.testName}
                                                  </td>
                                                </tr>
                                              )}

                                              {/* Field Rows */}
                                              {/* {filledFields.map((f, fi) => (
                                                                                                  <tr key={fi} className="border-b border-gray-400" style={{ borderBottomStyle: "dashed" }}>
                                                                                                      <td className="py-0.5 pl-2">{f.fieldName}</td>
                                                                                                      <td className="text-center py-0.5">
                                                                                                          {(() => {
                                                                                                              const rangeStr = f.range || "-";
                                                                                                              const patientGender = reports.finalReport?.gender?.toUpperCase();
              
                                                                                                              // Check if range contains gender-specific format
                                                                                                              if (rangeStr.includes('M:') || rangeStr.includes('F:')) {
                                                                                                                  // Split by comma
                                                                                                                  const parts = rangeStr.split(',');
              
                                                                                                                  // Find matching gender part
                                                                                                                  for (let part of parts) {
                                                                                                                      part = part.trim();
                                                                                                                      if (patientGender === 'MALE' && part.startsWith('M:')) {
                                                                                                                          return part.substring(2).trim();
                                                                                                                      }
                                                                                                                      if (patientGender === 'FEMALE' && part.startsWith('F:')) {
                                                                                                                          return part.substring(2).trim();
                                                                                                                      }
                                                                                                                  }
              
                                                                                                                  // If no match found, return first available or original
                                                                                                                  return rangeStr;
                                                                                                              }
              
                                                                                                              // No gender-specific format, return as is
                                                                                                              return rangeStr;
                                                                                                          })()}
                                                                                                      </td>
                                                                                                      <td className="text-center py-0.5">{f.unit || "."}</td>
                                                                                                      <td className="text-center font-semibold py-0.5">
                                                                                                          {f.defaultValue}
                                                                                                      </td>
                                                                                                  </tr>
                                                                                              ))} */}

                                              {/* Field Rows - WITH CATEGORY SUPPORT */}
                                              {(() => {
                                                // Check if ANY field has a category
                                                const hasCategories = filledFields.some(f => f.category);

                                                if (!hasCategories) {
                                                  // NO CATEGORIES: Render normally (existing behavior)
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
                                                      <td className="text-center font-semibold py-0.5">
                                                        {f.defaultValue}
                                                      </td>
                                                    </tr>
                                                  ));
                                                } else {
                                                  // HAS CATEGORIES: Group by category
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
                                                      {/* Category Heading */}
                                                      <tr>
                                                        <td colSpan="4" className="py-1.5 font-bold text-xs uppercase bg-gray-50">
                                                          {category}
                                                        </td>
                                                      </tr>

                                                      {/* Fields in this category */}
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
                                                          <td className="text-center font-semibold py-0.5">
                                                            {f.defaultValue}
                                                          </td>
                                                        </tr>
                                                      ))}
                                                    </React.Fragment>
                                                  ));
                                                }
                                              })()}


                                              {/* ========================================
                  REPORT EXTRAS - DYNAMIC NARRATIVE SECTIONS
                  ======================================== */}


                                            </React.Fragment>
                                          );
                                        })}
                                      </tbody>
                                    </table>

                                    {/* ✅ ADD SCALE VISUALIZATION HERE - RIGHT AFTER </table> */}
                                    {testsWithData.map((test, testIndex) => {
                                      const testData = test.testId || test;
                                      const scaleConfig = testData.scaleConfig;

                                      // Get the first field's value as the result
                                      const firstField = test.fields?.[0];
                                      const resultValue = firstField?.defaultValue;
                                      const unit = firstField?.unit || '';

                                      // ✅ ADD THESE DEBUG LOGS
                                      console.log('🔍 Test:', test.testName);
                                      console.log('📊 Scale Config:', scaleConfig);
                                      console.log('📈 Result Value:', resultValue);
                                      console.log('🔢 Has thresholds?', scaleConfig?.thresholds);
                                      console.log('🏷️ Has labels?', scaleConfig?.labels);

                                      // Check for thresholds instead of items
                                      if (!scaleConfig || !scaleConfig.thresholds || !scaleConfig.labels ||
                                        !resultValue || isNaN(parseFloat(resultValue))) {
                                        console.log('❌ Scale not rendering - missing data');
                                        return null;
                                      }

                                      console.log('✅ Rendering scale for:', test.testName);

                                      return (
                                        <div key={`scale-${testIndex}`} className="mt-4 mb-6">
                                          <TestScaleVisualization
                                            scaleConfig={scaleConfig}
                                            resultValue={resultValue}
                                            unit={unit}
                                          />
                                        </div>
                                      );
                                    })}


                                    {/* ✅ NEW: Render Visual Scale (Vertical Thermometer) - SECOND SCALE */}
                                    {testsWithData.map((test, testIndex) => {
                                      const testData = test.testId || test;
                                      const visualScale = testData.visualScale;

                                      // Get the first field's value as the result
                                      const firstField = test.fields?.[0];
                                      const resultValue = firstField?.defaultValue;
                                      const unit = firstField?.unit || '';

                                      // Check if visualScale exists and has required data
                                      if (!visualScale || !visualScale.thresholds || !visualScale.labels ||
                                        !resultValue || isNaN(parseFloat(resultValue))) {
                                        return null;
                                      }

                                      return (
                                        <div key={`visual-scale-${testIndex}`} className="mt-4 mb-12">
                                          <VisualScaleVisualization
                                            visualScale={visualScale}
                                            resultValue={resultValue}
                                            unit={unit}
                                          />
                                        </div>
                                      );
                                    })}


                                    {testsWithData.map((test, testIndex) => {
                                      const testData = test.testId || test;
                                      const extras = testData.reportExtras;

                                      if (!extras || Object.keys(extras).length === 0) {
                                        return null;
                                      }

                                      return (
                                        <div key={`extras-${testIndex}`} className="mt-4 mb-4 w-full">
                                          {Object.entries(extras).map(([key, value]) => {
                                            if (!value ||
                                              (typeof value === 'string' && value.trim() === '') ||
                                              (Array.isArray(value) && value.length === 0)) {
                                              return null;
                                            }

                                            const heading = key
                                              .replace(/([A-Z])/g, ' $1')
                                              .trim()
                                              .split(' ')
                                              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                              .join(' ');

                                            return (
                                              <div key={key} className="mb-3">
                                                <h4 className="font-bold text-sm uppercase mb-1 underline text-gray-800">
                                                  {heading}:
                                                </h4>

                                                {typeof value === 'string' ? (
                                                  <p className="text-xs leading-relaxed text-gray-800 whitespace-pre-line">
                                                    {value}
                                                  </p>
                                                ) : Array.isArray(value) ? (
                                                  <ol className="list-decimal list-inside text-xs text-gray-700 space-y-0.5 ml-2">
                                                    {value.map((item, i) => (
                                                      <li key={i} className="leading-relaxed">{item}</li>
                                                    ))}
                                                  </ol>
                                                ) : null}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      );
                                    })}
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
                            <div className="text-center mb-1 mt-24">
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
              <h1 className="text-[19px] font-bold mb-0">
                <span style={{ letterSpacing: '0.3em' }}>DOCTOR</span>{' '}
                <span style={{ letterSpacing: '0.25em' }}>LAB</span>
              </h1>
              <p className="text-[11px] mb-1">
                <span style={{ letterSpacing: '0.02em' }}>&</span>{' '}
                <span style={{ letterSpacing: '0.08em' }}>Imaging Center Sahiwal</span>
              </p>
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
