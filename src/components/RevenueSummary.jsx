import React, { useState, useContext, useRef, useMemo } from 'react';
import { PatientsContext } from '@/context/PatientsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useReactToPrint } from 'react-to-print';
import {
  DollarSign,
  FileText,
  TrendingUp,
  Printer,
  CalendarCheck,
  Users,
  TestTube
} from 'lucide-react';
import toast from 'react-hot-toast';
import { LabInfoContext } from '@/context/LabnfoContext';

export default function RevenueSummary() {
  const { patients } = useContext(PatientsContext);
  const { info } = useContext(LabInfoContext)
  console.log(patients[0]);
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [detailedDialogOpen, setDetailedDialogOpen] = useState(false);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);

  const detailedReportRef = useRef();
  const summaryReportRef = useRef();
  const labID = info?.labID;


  const handlePrintDetailed = useReactToPrint({
    contentRef: detailedReportRef,
    documentTitle: `Detailed_Revenue_Report_${dateRangeFilter.startDate}_to_${dateRangeFilter.endDate}`,
  });

  const handlePrintSummary = useReactToPrint({
    contentRef: summaryReportRef,
    documentTitle: `Summary_Revenue_Report_${dateRangeFilter.startDate}_to_${dateRangeFilter.endDate}`,
  });

  const handleTodaySummary = () => {
    const today = new Date().toISOString().split('T')[0];
    setDateRangeFilter({ startDate: today, endDate: today });
    setSummaryDialogOpen(true);
  };

  // Auto-filter patients based on date range
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const patientDate = new Date(patient.createdAt).toISOString().split('T')[0];
      return patientDate >= dateRangeFilter.startDate && patientDate <= dateRangeFilter.endDate;
    });
  }, [patients, dateRangeFilter]);

  // Group patients by date
  const groupPatientsByDate = (patientsList) => {
    const grouped = {};
    patientsList.forEach(patient => {
      const dateKey = new Date(patient.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(patient);
    });
    return grouped;
  };

  const calculateDateTotals = (patientsList) => {
    const totalTests = patientsList.reduce((sum, p) => sum + p.tests.length, 0);
    const totalDiscount = patientsList.reduce((sum, p) => sum + (p.discountAmount || 0), 0);
    const totalNetTotal = patientsList.reduce((sum, p) => sum + (p.netTotal !== undefined ? p.netTotal : p.total), 0);
    const totalPaid = patientsList.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
    const totalDue = patientsList.reduce((sum, p) => sum + (p.dueAmount || 0), 0);
    return { totalTests, totalDiscount, totalNetTotal, totalPaid, totalDue, totalRevenue: totalNetTotal };
  };

  // Calculate test-wise breakdown for a date
  const getTestBreakdown = (patientsList) => {
    const testBreakdown = {};
    patientsList.forEach(patient => {
      patient.tests.forEach(test => {
        if (!testBreakdown[test.testName]) {
          testBreakdown[test.testName] = { count: 0, revenue: 0 };
        }
        testBreakdown[test.testName].count += 1;
        if (patient.paymentStatus === 'Paid') {
          testBreakdown[test.testName].revenue += test.price;
        }
      });
    });
    return testBreakdown;
  };

  const formatAge = (patient) => {
    if (!patient?.age) return "-";

    const unit =
      patient.ageUnit === "months"
        ? "M"
        : patient.ageUnit === "days"
          ? "D"
          : "Y"; // default for old records

    return `${patient.age} ${unit}`;
  };


  const groupedPatients = groupPatientsByDate(filteredPatients);
  const grandTotal = filteredPatients.reduce((sum, p) => sum + (p.netTotal !== undefined ? p.netTotal : p.total), 0);
  const grandTotalTests = filteredPatients.reduce((sum, p) => sum + p.tests.length, 0);
  const totalPaid = filteredPatients.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  const totalUnpaid = filteredPatients.reduce((sum, p) => sum + (p.dueAmount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <DollarSign className="w-6 h-6" />
                  Revenue Summary & Reports
                </h2>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Date Range Filter */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Start Date</label>
                  <Input
                    type="date"
                    value={dateRangeFilter.startDate}
                    onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, startDate: e.target.value })}
                    className="h-12 border-2 border-gray-200 rounded-xl px-4 bg-gray-50 focus:bg-white focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">End Date</label>
                  <Input
                    type="date"
                    value={dateRangeFilter.endDate}
                    onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, endDate: e.target.value })}
                    className="h-12 border-2 border-gray-200 rounded-xl px-4 bg-gray-50 focus:bg-white focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Quick Action</label>
                  <Button style={{ height: '3rem', width: '100%', backgroundColor: '#16a34a', color: '#ffffff', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: 600, padding: '0 0.5rem' }}
                    onClick={handleTodaySummary} className="h-12 w-full bg-green-600 hover:bg-green-700 text-white rounded-xl text-md font-semibold">
                    <CalendarCheck className="h-4 w-4 mr-2" />
                    Today's Summary
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-blue-600">Rs. {grandTotal.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-10 w-10 text-blue-600" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Paid Amount</p>
                    <p className="text-2xl font-bold text-green-600">Rs. {totalPaid.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Total Tests</p>
                    <p className="text-2xl font-bold text-purple-600">{grandTotalTests}</p>
                  </div>
                  <TestTube className="h-10 w-10 text-purple-600" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5 border-2 border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Total Patients</p>
                    <p className="text-2xl font-bold text-orange-600">{filteredPatients.length}</p>
                  </div>
                  <Users className="h-10 w-10 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Report Buttons */}
            <div className="flex gap-4">
              <Button style={{ height: '3.5rem', backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '0.75rem', fontSize: '1.125rem', fontWeight: 700, boxShadow: '0 10px 15px rgba(0,0,0,0.1)', padding: '0 0.5rem' }}
                onClick={() => setSummaryDialogOpen(true)}
                className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 rounded-xl font-bold text-lg shadow-lg"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                Daily Summary Report
              </Button>
              <Button style={{ height: '3.5rem', backgroundColor: '#7c3aed', color: '#ffffff', borderRadius: '0.75rem', fontSize: '1.125rem', fontWeight: 700, boxShadow: '0 10px 15px rgba(0,0,0,0.1)', padding: '0 0.5rem' }}
                onClick={() => setDetailedDialogOpen(true)}
                className="flex-1 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold text-lg shadow-lg"
              >
                <FileText className="h-5 w-5 mr-2" />
                Detailed Report
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Report Dialog */}
        <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
          <DialogContent className="min-w-[80vw] max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-gray-700">

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 -m-6 mb-6 px-8 py-6">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                      <TrendingUp className="w-6 h-6" />
                      Daily Revenue Summary Report
                    </DialogTitle>
                    <p className="text-blue-100 mt-1">Daily cash/sale position with test breakdown</p>
                  </div>
                  <Button onClick={handlePrintSummary} className="bg-white/20 hover:bg-white/30 text-white border border-white/30">
                    <Printer className="h-4 w-4 mr-2" />
                    Print / Download PDF
                  </Button>
                </div>
              </DialogHeader>
            </div>

            <div ref={summaryReportRef} className="px-4 pb-4">
              {/* Header */}
              <div className="mb-3 mt-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    {labID === "demo_lab_system" ? (
                      <>
                        {info?.logoUrl && (
                          <img
                            src={info?.logoUrl}
                            alt="Lab Logo"
                            className="h-20 w-20 mr-4 object-contain"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        )}
                        <div className="text-left">
                          <h1 className="text-2xl font-bold mb-0">LabSync Pro</h1>
                          <p className="text-sm mb-1 text-gray-500">v_1.0</p>
                          <p className="text-xs italic">Smart Lab Reporting System</p>
                        </div>
                      </>
                    ) : labID === "doctor_lab_sahiwal" ? (
                      <>
                        {info?.logoUrl && (
                          <img
                            src={info?.logoUrl}
                            alt="Lab Logo"
                            className="h-20 w-20 mr-4 object-contain"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        )}
                        <div className="text-left">
                          <h1 className="text-2xl font-bold mb-0">
                            <span style={{ letterSpacing: "0.3em" }}>DOCTOR</span>{" "}
                            <span style={{ letterSpacing: "0.25em" }}>LAB</span>
                          </h1>
                          <p className="text-sm mb-1">
                            <span style={{ letterSpacing: "0.02em" }}>&</span>{" "}
                            <span style={{ letterSpacing: "0.08em" }}>Imaging Center Sahiwal</span>
                          </p>
                          <p className="text-xs italic" style={{ letterSpacing: "0.03em" }}>
                            Better Diagnosis - Better Treatment
                          </p>
                        </div>
                      </>
                    ) : labID === "fatima_medical_lab_bhera" ? (
                      <>
                        {info?.headerUrl && (
                          <img
                            src={info?.headerUrl}
                            alt="Lab Header"
                            className="w-full"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        )}
                        {/* <div className="text-left">
                          <h1 className="text-2xl font-bold mb-0">
                            <span style={{ letterSpacing: "0.1em" }}>FATIMA </span>{" "}
                            <span style={{ letterSpacing: "0.1em" }}>MEDICAL LAB</span>
                          </h1>
                          <p className="text-xs italic">Fatima Medical Lab Bhera</p>
                        </div> */}
                      </>
                    ) : (
                      <>
                        {info?.logoUrl && (
                          <img
                            src={info?.logoUrl}
                            alt="Lab Logo"
                            className="h-20 w-20 mr-4 object-contain"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        )}
                        <div className="text-left">
                          <h1 className="text-2xl font-bold mb-0">LabSync Pro</h1>
                          <p className="text-sm mb-1 text-gray-500">v_1.0</p>
                          <p className="text-xs italic">Smart Lab Reporting System</p>
                        </div>
                      </>
                    )}
                  </div>

                </div>
              </div>

              <div className="text-center mb-3 pb-2 border-b border-gray-800">
                <p className="text-gray-700 text-sm font-semibold">Daily Cash/Sale Revenue Report</p>
                <p className="text-xs text-gray-600 mt-1">
                  Period: {new Date(dateRangeFilter.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} - {new Date(dateRangeFilter.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>

              {/* Daily breakdown with PATIENT-WISE listing */}
              {Object.entries(groupedPatients).map(([date, datePatients]) => {
                const { totalTests, totalRevenue, totalPaid, totalDue } = calculateDateTotals(datePatients);
                const testBreakdown = getTestBreakdown(datePatients);

                return (
                  <div key={date} className="mb-4 break-inside-avoid border border-gray-800">
                    {/* Date Header */}
                    <div className="bg-gray-800 text-white px-3 py-1.5 font-bold text-sm">
                      {date}
                    </div>

                    {/* Date Summary Stats */}
                    <div className="border-b border-gray-800 bg-gray-50">
                      <div className="grid grid-cols-4 divide-x divide-gray-800">
                        <div className="px-2 py-1.5 text-center">
                          <span className="text-xs font-semibold text-gray-600 block">Patients</span>
                          <span className="text-sm font-bold text-gray-900">{datePatients.length}</span>
                        </div>
                        <div className="px-2 py-1.5 text-center">
                          <span className="text-xs font-semibold text-gray-600 block">Tests</span>
                          <span className="text-sm font-bold text-gray-900">{totalTests}</span>
                        </div>
                        <div className="px-2 py-1.5 text-center">
                          <span className="text-xs font-semibold text-gray-600 block">Paid</span>
                          <span className="text-sm font-bold text-gray-900">Rs. {totalPaid.toLocaleString()}</span>
                        </div>
                        <div className="px-2 py-1.5 text-center">
                          <span className="text-xs font-semibold text-gray-600 block">Due</span>
                          <span className="text-sm font-bold text-gray-900">Rs. {totalDue?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* PATIENT-WISE Table */}
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-800">
                          <th className="px-3 py-1.5 text-left font-bold text-gray-900">Case#</th>
                          <th className="px-3 py-1.5 text-left font-bold text-gray-900 border-l border-gray-300">Patient Name</th>
                          <th className="px-3 py-1.5 text-left font-bold text-gray-900 border-l border-gray-300">Tests</th>
                          <th className="px-3 py-1.5 text-right font-bold text-gray-900 border-l border-gray-300">Amount</th>
                          <th className="px-3 py-1.5 text-center font-bold text-gray-900 border-l border-gray-300">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datePatients.map((patient, idx) => {
                          const isPaid = patient.paymentStatus === 'Paid';
                          return (
                            <tr key={patient._id} className={`border-b border-gray-300 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                              <td className="px-3 py-1 font-semibold text-gray-900">{patient.caseNo}</td>
                              <td className="px-3 py-1 font-medium text-gray-900 border-l border-gray-300">{patient.name}</td>
                              <td className="px-3 py-1 text-gray-700 border-l border-gray-300">
                                {patient.tests.map(t => t.testName).join(', ')}
                              </td>
                              <td className="px-3 py-1 text-right font-bold text-gray-900 border-l border-gray-300">
                                Rs. {(patient.netTotal !== undefined ? patient.netTotal : patient.total).toLocaleString()}
                              </td>
                              <td className="px-3 py-1 text-center border-l border-gray-300">
                                <span className={`px-2 py-0.5 text-xs font-bold ${isPaid ? 'bg-gray-200 text-gray-900' : 'bg-gray-800 text-white'
                                  }`}>
                                  {patient.paymentStatus}
                                </span>
                              </td>
                            </tr>
                          );
                        })}

                        {/* Daily Total Row */}
                        <tr className="bg-gray-800 text-white border-t-2 border-gray-900">
                          <td colSpan="3" className="px-3 py-2 font-bold">DAILY TOTAL</td>
                          <td className="px-3 py-2 text-right font-bold border-l border-gray-600">
                            Rs. {totalRevenue?.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-center border-l border-gray-600 font-bold">
                            {datePatients.length} Patients
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Test Breakdown Section (Optional - shows what tests were done) */}
                    <div className="bg-gray-50 px-3 py-2 border-t border-gray-400">
                      <p className="text-xs font-bold text-gray-700 mb-1">Test Summary:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(testBreakdown).map(([testName, data]) => (
                          <div key={testName} className="text-xs text-gray-600">
                            <span className="font-semibold">{testName}:</span> {data.count}× (Rs. {data.revenue.toLocaleString()})
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Grand Total */}
              <div className="mt-4 pt-2 border-t-2 border-gray-800">
                <div className="flex justify-end items-center gap-2 bg-gray-100 px-3 py-2">
                  <span className="text-base font-bold text-gray-900">Grand Total:</span>
                  <span className="text-xl font-bold text-gray-900">Rs. {grandTotal?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Detailed Report Dialog */}
        <Dialog open={detailedDialogOpen} onOpenChange={setDetailedDialogOpen}>
          <DialogContent className="min-w-[80vw] max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-gray-700">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 -m-6 mb-6 px-8 py-6">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                      <FileText className="w-6 h-6" />
                      Detailed Revenue Report
                    </DialogTitle>
                    <p className="text-purple-100 mt-1">Complete patient-wise transaction details</p>
                  </div>
                  <Button onClick={handlePrintDetailed} className="bg-white/20 hover:bg-white/30 text-white border border-white/30">
                    <Printer className="h-4 w-4 mr-2" />
                    Print / Download PDF
                  </Button>
                </div>
              </DialogHeader>
            </div>

            <div ref={detailedReportRef} className="px-4 pb-4">
              {/* Header - keep same */}
              <div className="mb-3 mt-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    {labID === "demo_lab_system" ? (
                      <>
                        {info?.logoUrl && (
                          <img
                            src={info?.logoUrl}
                            alt="Lab Logo"
                            className="h-20 w-20 mr-4 object-contain"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        )}
                        <div className="text-left">
                          <h1 className="text-2xl font-bold mb-0">LabSync Pro</h1>
                          <p className="text-sm mb-1 text-gray-500">v_1.0</p>
                          <p className="text-xs italic">Smart Lab Reporting System</p>
                        </div>
                      </>
                    ) : labID === "doctor_lab_sahiwal" ? (
                      <>
                        {info?.logoUrl && (
                          <img
                            src={info?.logoUrl}
                            alt="Lab Logo"
                            className="h-20 w-20 mr-4 object-contain"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        )}
                        <div className="text-left">
                          <h1 className="text-2xl font-bold mb-0">
                            <span style={{ letterSpacing: "0.3em" }}>DOCTOR</span>{" "}
                            <span style={{ letterSpacing: "0.25em" }}>LAB</span>
                          </h1>
                          <p className="text-sm mb-1">
                            <span style={{ letterSpacing: "0.02em" }}>&</span>{" "}
                            <span style={{ letterSpacing: "0.08em" }}>Imaging Center Sahiwal</span>
                          </p>
                          <p className="text-xs italic" style={{ letterSpacing: "0.03em" }}>
                            Better Diagnosis - Better Treatment
                          </p>
                        </div>
                      </>
                    ) : labID === "fatima_medical_lab_bhera" ? (
                      <>
                        {info?.headerUrl && (
                          <img
                            src={info?.headerUrl}
                            alt="Lab Header"
                            className="w-full"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        )}

                        <div className="text-left">
                          <h1 className="text-2xl font-bold mb-0">
                            <span style={{ letterSpacing: "0.1em" }}>FATIMA </span>{" "}
                            <span style={{ letterSpacing: "0.1em" }}>MEDICAL LAB</span>
                          </h1>
                          <p className="text-xs italic">Fatima Medical Lab Bhera</p>
                        </div>
                      </>
                    ) : (
                      <>
                        {info?.logoUrl && (
                          <img
                            src={info?.logoUrl}
                            alt="Lab Logo"
                            className="h-20 w-20 mr-4 object-contain"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        )}
                        <div className="text-left">
                          <h1 className="text-2xl font-bold mb-0">LabSync Pro</h1>
                          <p className="text-sm mb-1 text-gray-500">v_1.0</p>
                          <p className="text-xs italic">Smart Lab Reporting System</p>
                        </div>
                      </>
                    )}
                  </div>

                </div>
              </div>

              <div className="text-center mb-3 pb-2 border-b-2 border-gray-800">
                <p className="text-gray-900 text-base font-bold">Detailed Revenue Report</p>
                <p className="text-xs text-gray-600 mt-1">
                  Period: {new Date(dateRangeFilter.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} to {new Date(dateRangeFilter.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>

              {/* Grouped by Date */}
              {Object.entries(groupedPatients).map(([date, datePatients], dateIndex) => {
                const dateTotals = calculateDateTotals(datePatients);
                let serialNumber = filteredPatients.findIndex(p => p._id === datePatients[0]._id) + 1;

                return (
                  <div key={date} className="mb-4 break-inside-avoid">
                    {/* Date Header */}
                    <div className="bg-gray-800 text-white px-3 py-1.5 font-bold text-sm mb-0">
                      {date} - {datePatients.length} Patients
                    </div>

                    {/* Table for this date */}
                    <table className="w-full text-xs border-collapse border-2 border-gray-800 border-t-0">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="px-2 py-1.5 text-left font-bold border-r border-gray-400">S.No</th>
                          <th className="px-2 py-1.5 text-left font-bold border-r border-gray-400">Case#</th>
                          <th className="px-2 py-1.5 text-left font-bold border-r border-gray-400">Patient Name</th>
                          <th className="px-2 py-1.5 text-left font-bold border-r border-gray-400">Age/Gender</th>
                          <th className="px-2 py-1.5 text-left font-bold border-r border-gray-400">Phone</th>
                          <th className="px-2 py-1.5 text-left font-bold border-r border-gray-400">Referred By</th>
                          <th className="px-2 py-1.5 text-left font-bold border-r border-gray-400">Tests Ordered</th>
                          <th className="px-2 py-1.5 text-right font-bold border-r border-gray-400">Discount</th>
                          <th className="px-2 py-1.5 text-right font-bold border-r border-gray-400">Net Total</th>
                          <th className="px-2 py-1.5 text-right font-bold border-r border-gray-400">Paid</th>
                          <th className="px-2 py-1.5 text-right font-bold border-r border-gray-400">Due</th>
                          <th className="px-2 py-1.5 text-center font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datePatients.map((patient, index) => {
                          const isPaid = patient.paymentStatus === 'Paid';
                          const isPartiallyPaid = patient.paymentStatus === 'Partially Paid';
                          const currentSerial = serialNumber + index;

                          return (
                            <tr
                              key={patient._id}
                              className={`border-b border-gray-300 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                            >
                              <td className="px-2 py-1 text-gray-900 border-r border-gray-300">{currentSerial}</td>
                              <td className="px-2 py-1 font-semibold text-gray-900 border-r border-gray-300">
                                {patient.caseNo}
                              </td>
                              <td className="px-2 py-1 font-semibold text-gray-900 border-r border-gray-300">
                                {patient.name}
                              </td>
                              <td className="px-2 py-1 text-gray-700 border-r border-gray-300">
                                {formatAge(patient)} / {patient.gender?.charAt(0)}
                              </td>
                              <td className="px-2 py-1 text-gray-700 border-r border-gray-300">
                                {patient.phone}
                              </td>
                              <td className="px-2 py-1 text-gray-700 border-r border-gray-300">
                                {patient.referencedBy || 'Self'}
                              </td>
                              <td className="px-2 py-1 text-gray-700 border-r border-gray-300">
                                {patient.tests.map(t => t.testName).join(', ')}
                              </td>
                              <td className="px-2 py-1 text-right text-gray-900 border-r border-gray-300">
                                {patient.discountAmount > 0 ? `Rs. ${patient.discountAmount.toLocaleString()}` : '-'}
                              </td>
                              <td className="px-2 py-1 text-right font-bold text-gray-900 border-r border-gray-300">
                                Rs. {(patient.netTotal !== undefined ? patient.netTotal : patient.total).toLocaleString()}
                              </td>
                              <td className="px-2 py-1 text-right font-bold text-green-700 border-r border-gray-300">
                                {patient.paidAmount > 0 ? `Rs. ${patient.paidAmount.toLocaleString()}` : 'Rs. 0'}
                              </td>
                              <td className="px-2 py-1 text-right font-bold text-red-700 border-r border-gray-300">
                                {patient.dueAmount > 0 ? `Rs. ${patient.dueAmount.toLocaleString()}` : 'Rs. 0'}
                              </td>
                              <td className="px-2 py-1 text-center">
                                <span className={`px-2 py-0.5 text-xs font-bold ${isPaid ? 'bg-green-200 text-green-900' :
                                  isPartiallyPaid ? 'bg-yellow-200 text-yellow-900' :
                                    'bg-red-200 text-red-900'
                                  }`}>
                                  {patient.paymentStatus}
                                </span>
                              </td>
                            </tr>
                          );
                        })}

                        {/* Date Total Row */}
                        <tr className="bg-gray-700 text-white border-t-2 border-gray-900">
                          <td colSpan="7" className="px-2 py-1.5 text-right font-bold">
                            Date Total:
                          </td>
                          <td className="px-2 py-1.5 text-right font-bold border-l border-gray-500">
                            Rs. {dateTotals.totalDiscount.toLocaleString()}
                          </td>
                          <td className="px-2 py-1.5 text-right font-bold border-l border-gray-500">
                            Rs. {dateTotals.totalNetTotal.toLocaleString()}
                          </td>
                          <td className="px-2 py-1.5 text-right font-bold border-l border-gray-500">
                            Rs. {dateTotals.totalPaid.toLocaleString()}
                          </td>
                          <td className="px-2 py-1.5 text-right font-bold border-l border-gray-500">
                            Rs. {dateTotals.totalDue.toLocaleString()}
                          </td>
                          <td className="px-2 py-1.5 border-l border-gray-500"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })}

              {/* Grand Total */}
              {/* <div className="border-2 border-gray-900 bg-gray-900 text-white">
                <table className="w-full text-xs">
                  <tbody>
                    <tr>
                      <td colSpan="7" className="px-3 py-2 text-right font-bold text-sm">
                        GRAND TOTAL ({filteredPatients.length} Patients, {grandTotalTests} Tests):
                      </td>
                      <td className="px-3 py-2 text-right font-bold border-l border-gray-700">
                        Rs. {filteredPatients.reduce((sum, p) => sum + (p.discountAmount || 0), 0).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right font-bold border-l border-gray-700">
                        Rs. {filteredPatients.reduce((sum, p) => sum + (p.netTotal || p.total), 0).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right font-bold border-l border-gray-700">
                        Rs. {filteredPatients.reduce((sum, p) => sum + (p.paidAmount || 0), 0).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right font-bold border-l border-gray-700">
                        Rs. {filteredPatients.reduce((sum, p) => sum + (p.dueAmount || 0), 0).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 border-l border-gray-700"></td>
                    </tr>
                  </tbody>
                </table>
              </div> */}

              {/* Summary Stats - keep same */}
              <div className="mt-4 grid grid-cols-5 gap-3 text-center">
                <div className="border border-gray-800 bg-gray-50 p-2">
                  <p className="text-xs font-semibold text-gray-600">Total Patients</p>
                  <p className="text-lg font-bold text-gray-900">{filteredPatients.length}</p>
                </div>
                <div className="border border-gray-800 bg-gray-50 p-2">
                  <p className="text-xs font-semibold text-gray-600">Total Tests</p>
                  <p className="text-lg font-bold text-gray-900">{grandTotalTests}</p>
                </div>
                <div className="border border-gray-800 bg-blue-50 p-2">
                  <p className="text-xs font-semibold text-gray-600">Gross Revenue</p>
                  <p className="text-lg font-bold text-blue-900">
                    Rs. {filteredPatients.reduce((sum, p) => sum + (p.netTotal !== undefined ? p.netTotal : p.total), 0).toLocaleString()}
                  </p>
                </div>
                <div className="border border-gray-800 bg-green-50 p-2">
                  <p className="text-xs font-semibold text-gray-600">Total Paid</p>
                  <p className="text-lg font-bold text-green-900">Rs. {totalPaid.toLocaleString()}</p>
                </div>
                <div className="border border-gray-800 bg-red-50 p-2">
                  <p className="text-xs font-semibold text-gray-600">Total Due</p>
                  <p className="text-lg font-bold text-red-900">Rs. {totalUnpaid.toLocaleString()}</p>
                </div>
              </div>

              {/* Payment Status Breakdown */}
              <div className="mt-3 border border-gray-800 bg-gray-50 p-3">
                <p className="text-xs font-bold text-gray-800 mb-2">Payment Status Breakdown:</p>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="font-semibold">Paid:</span> {filteredPatients.filter(p => p.paymentStatus === 'Paid').length} patients
                  </div>
                  <div>
                    <span className="font-semibold">Partially Paid:</span> {filteredPatients.filter(p => p.paymentStatus === 'Partially Paid').length} patients
                  </div>
                  <div>
                    <span className="font-semibold">Not Paid:</span> {filteredPatients.filter(p => p.paymentStatus === 'Not Paid').length} patients
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}