import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axiosInstance';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2 } from 'lucide-react';

export default function PrintRegistration() {
  const { id } = useParams();

  const [printPatient, setPrintPatient] = useState(null);
  const [labInfo, setLabInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch patient data with populated tests
      const patientRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/patients/${id}`
      );
      setPrintPatient(patientRes.data);

      // Fetch lab info
      const labRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/lab-info`
      );
      const info = Array.isArray(labRes.data) ? labRes.data[0] || null : labRes.data;
      setLabInfo(info || null);

    } catch (error) {
      console.error('Error loading print data:', error);
      setError('Failed to load registration data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-print when ready
  useEffect(() => {
    if (!loading && printPatient && labInfo && !error) {
      setTimeout(() => {
        window.print();
      }, 300);
    }
  }, [loading, printPatient, labInfo, error]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading registration...</span>
      </div>
    );
  }

  if (!printPatient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Patient not found</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
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

      {/* LAB COPY */}
      <div className="mb-2 pb-6 border-b-2 border-dashed border-gray-600">
        <div className="mb-2">
          <div className="text-center mb-3">
            <div className="inline-block px-6 py-1">
              <p className="text-sm font-bold text-blue-900">LAB COPY</p>
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-start">
              {labInfo?.logoUrl && (
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

        <div className="border-t-2 border-b-2 border-gray-800 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">Patient #:</span>
              <div className="text-center">
                <svg ref={el => {
                  if (el && printPatient?.refNo) {
                    JsBarcode(el, printPatient.refNo, {
                      format: "CODE128",
                      width: 1,
                      height: 20,
                      displayValue: false,
                      margin: 0
                    });
                  }
                }}></svg>
                <p className="text-xs mt-0.5">{printPatient?.refNo}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">Case #:</span>
              <div className="text-center">
                <svg ref={el => {
                  if (el && printPatient?.caseNo) {
                    JsBarcode(el, printPatient.caseNo, {
                      format: "CODE128",
                      width: 1,
                      height: 20,
                      displayValue: false,
                      margin: 0
                    });
                  }
                }}></svg>
                <p className="text-xs mt-0.5">{printPatient?.caseNo}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-800 p-2 mb-3 bg-gray-50">
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="font-semibold py-0.5 w-1/4">Patient's Name</td>
                <td className="py-0.5 w-1/4">{printPatient.name}</td>
                <td className="font-semibold py-0.5 w-1/4">Reg. Date</td>
                <td className="py-0.5 w-1/4">
                  {new Date(printPatient.createdAt).toLocaleDateString('en-GB')} {new Date(printPatient.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </td>
              </tr>
              <tr>
                <td className="font-semibold py-0.5">Father/Husband</td>
                <td className="py-0.5">{printPatient?.fatherHusbandName || "-"}</td>
                <td className="font-semibold py-0.5">Reg. Centre</td>
                <td className="py-0.5">Main Lab</td>
              </tr>
              <tr>
                <td className="font-semibold py-0.5">Age/Sex</td>
                <td className="py-0.5">{printPatient.age} Years / {printPatient.gender}</td>
                <td className="font-semibold py-0.5">Specimen</td>
                <td className="py-0.5">{printPatient.tests?.[0]?.testId?.specimen || printPatient.specimen || 'Taken in Lab'}</td>
              </tr>
              <tr>
                <td className="font-semibold py-0.5">Contact No</td>
                <td className="py-0.5">{printPatient.phone}</td>
                <td className="font-semibold py-0.5">Consultant</td>
                <td className="py-0.5">{printPatient.referencedBy || 'SELF'}</td>
              </tr>
              <tr>
                <td className="font-semibold py-0.5">NIC No</td>
                <td className="py-0.5">{printPatient?.nicNo || "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {printPatient.tests && printPatient.tests.length > 0 && (
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
                {printPatient.tests.map((test, idx) => (
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

        <div className="flex justify-end">
          <div className="text-xs space-y-0.5 min-w-[200px]">
            <div className="flex justify-between font-semibold">
              <span>Net Amount:</span>
              <span>Rs.{printPatient.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PATIENT COPY */}
      <div className="pt-4" style={{ pageBreakInside: 'avoid' }}>
        <div className="mb-2">
          <div className="text-center mb-3">
            <div className="inline-block px-6 py-1">
              <p className="text-sm font-bold text-blue-900">PATIENT COPY</p>
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-start">
              {labInfo?.logoUrl && (
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

        <div className="border-t-2 border-b-2 border-gray-800 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">Patient #:</span>
              <div className="text-center">
                <svg ref={el => {
                  if (el && printPatient?.refNo) {
                    JsBarcode(el, printPatient.refNo, {
                      format: "CODE128",
                      width: 1,
                      height: 20,
                      displayValue: false,
                      margin: 0
                    });
                  }
                }}></svg>
                <p className="text-xs mt-0.5">{printPatient?.refNo}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">Case #:</span>
              <div className="text-center">
                <svg ref={el => {
                  if (el && printPatient?.caseNo) {
                    JsBarcode(el, printPatient.caseNo, {
                      format: "CODE128",
                      width: 1,
                      height: 20,
                      displayValue: false,
                      margin: 0
                    });
                  }
                }}></svg>
                <p className="text-xs mt-0.5">{printPatient?.caseNo}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-800 p-2 mb-3 bg-gray-50">
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="font-semibold py-0.5 w-1/4">Patient's Name</td>
                <td className="py-0.5 w-1/4">{printPatient.name}</td>
                <td className="font-semibold py-0.5 w-1/4">Reg. Date</td>
                <td className="py-0.5 w-1/4">
                  {new Date(printPatient.createdAt).toLocaleDateString('en-GB')} {new Date(printPatient.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </td>
              </tr>
              <tr>
                <td className="font-semibold py-0.5">Father/Husband</td>
                <td className="py-0.5">{printPatient?.fatherHusbandName || "-"}</td>
                <td className="font-semibold py-0.5">Reg. Centre</td>
                <td className="py-0.5">Main Lab</td>
              </tr>
              <tr>
                <td className="font-semibold py-0.5">Age/Sex</td>
                <td className="py-0.5">{printPatient.age} Years / {printPatient.gender}</td>
                <td className="font-semibold py-0.5">Specimen</td>
                <td className="py-0.5">{printPatient.tests?.[0]?.testId?.specimen || printPatient.specimen || 'Taken in Lab'}</td>
              </tr>
              <tr>
                <td className="font-semibold py-0.5">Contact No</td>
                <td className="py-0.5">{printPatient.phone}</td>
                <td className="font-semibold py-0.5">Consultant</td>
                <td className="py-0.5">{printPatient.referencedBy || 'SELF'}</td>
              </tr>
              <tr>
                <td className="font-semibold py-0.5">NIC No</td>
                <td className="py-0.5">{printPatient?.nicNo || "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {printPatient.tests && printPatient.tests.length > 0 && (
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
                {printPatient.tests.map((test, idx) => (
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

        <div className="flex justify-end mb-3">
          <div className="text-xs space-y-0.5 min-w-[200px]">
            <div className="flex justify-between border-b border-gray-300 pb-0.5">
              <span>Total Amount:</span>
              <span>Rs.{printPatient.total || 0}</span>
            </div>

            {printPatient.discountAmount > 0 && (
              <div className="flex justify-between border-b border-gray-300 pb-0.5">
                <span>Discount {printPatient.discountPercentage > 0 && `(${printPatient.discountPercentage}%)`}:</span>
                <span>- Rs.{printPatient.discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between font-semibold border-b border-gray-300 pb-0.5">
              <span>Net Amount:</span>
              <span>Rs.{printPatient.netTotal || printPatient.total}</span>
            </div>

            <div className="flex justify-between border-b border-gray-300 pb-0.5">
              <span>Paid:</span>
              <span>Rs.{printPatient.paidAmount || (printPatient.paymentStatus === 'Paid' ? (printPatient.netTotal || printPatient.total) : 0)}</span>
            </div>

            <div className="flex justify-between font-semibold">
              <span>Due Amount:</span>
              <span>Rs.{printPatient.dueAmount || (printPatient.paymentStatus === 'Paid' ? 0 : (printPatient.netTotal || printPatient.total))}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-400 pt-2">
          <p className="text-center text-xs font-semibold mb-2">Computerized Receipt, No Signature(s) Required</p>
          <div className="text-center text-xs text-gray-700 space-y-0.5">
            <p className="font-medium">
              Phone: {labInfo?.phoneNumber || '0325-0020111'}
            </p>
            <p className="text-[10px] leading-tight">
              {labInfo?.address || 'Opposite THQ Hospital Near Punjab Pharmacy Sahiwal, District Sargodha'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}