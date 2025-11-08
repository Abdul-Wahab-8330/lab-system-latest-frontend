

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { RefreshCcw, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { PatientsContext } from "@/context/PatientsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Printer, Info, FileText, User, Calendar, Phone, TestTube, Activity } from "lucide-react";
import { AddedPatientsContext } from "@/context/AddedPatientsContext";

export default function ResultPrintComponent() {
    const { fetchPatients, patients, setPatients } = useContext(PatientsContext);
    const { addedPatients, setAddedPatients } = useContext(AddedPatientsContext);

    const [filteredPatients, setFilteredPatients] = useState([]);
    const [search, setSearch] = useState("");
    const [testSearch, setTestSearch] = useState("");
    const [previewOpen, setPreviewOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [printPatient, setPrintPatient] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [labInfo, setLabInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    // Dialog state for delete confirmation
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState(null);

    useEffect(() => {
        loadLabInfo();
    }, []);

    // NEW: Sync addedPatients with patients context changes
    useEffect(() => {
        if (patients && patients.length > 0) {
            // Filter patients that have resultStatus 'added' from the main patients context
            const patientsWithResults = patients.filter(patient =>
                patient.resultStatus?.toLowerCase() === 'added'
            );

            // Update addedPatients context to stay in sync
            setAddedPatients(patientsWithResults);
        }
    }, [patients, setAddedPatients]);

    // Update filtered patients whenever addedPatients, search, or testSearch changes
    useEffect(() => {
        let data = [...(addedPatients || [])];
        if (search) {
            data = data.filter(
                (p) =>
                    p.name.toLowerCase().includes(search.toLowerCase()) ||
                    p.refNo.toString().includes(search)
            );
        }
        if (testSearch) {
            data = data.filter((p) =>
                p.tests?.some((t) =>
                    t.testName?.toLowerCase().includes(testSearch.toLowerCase())
                )
            );
        }
        setFilteredPatients(data);
    }, [search, testSearch, addedPatients]);

    const handleDeleteResubmit = async (patientId) => {
        try {
            setLoading(true);
            await axios.patch(`${import.meta.env.VITE_API_URL}/api/results/${patientId}/reset`);

            // Update the context by removing the patient
            setAddedPatients(addedPatients.filter((patient) => patient._id !== patientId));

            // Refresh patients context
            await fetchPatients();

            setDeleteDialogOpen(false);
            setPatientToDelete(null);
            toast.success('Results restored! Please go to results section to add results again');
        } catch (error) {
            toast.error("Error deleting and resubmitting results");
            console.error("Error deleting and resubmitting results:", error);
        } finally {
            setLoading(false);
        }
    };

    const openDeleteDialog = (patient) => {
        setPatientToDelete(patient);
        setDeleteDialogOpen(true);
    };

    async function loadLabInfo() {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/lab-info`);
            const info = Array.isArray(res.data) ? res.data[0] || null : res.data;
            setLabInfo(info || null);
        } catch (err) {
            console.error("loadLabInfo:", err);
        }
    }

    async function openPrintPreview(patient) {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/results/${patient._id}/tests`
            );
            setPrintPatient(res.data);
            await loadLabInfo();
            setPreviewOpen(true);
        } catch (err) {
            console.error("openPrintPreview:", err);
        }
    }

    async function openPatientDetails(patient) {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/results/${patient._id}/tests`
            );
            setSelectedPatient(res.data);
            setDetailsOpen(true);
        } catch (err) {
            console.error("openPatientDetails:", err);
        }
    }

    const handlePrint = async () => {
        const content = document.getElementById("printable-report").innerHTML;
        const printWindow = window.open("", "", "width=900,height=650");

        printWindow.document.write(`
      <html>
        <head>
          <title>Lab Report - ${printPatient?.name || 'Patient'} (${printPatient?.refNo || 'N/A'})</title>
          <style>
            @page { 
              size: A4; 
              margin: 15mm 20mm 20mm 20mm;
            }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              font-size: 13px; 
              line-height: 1; 
              color: #1a1a1a;
              margin: 0;
              padding: 0;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 8px 0;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            th, td { 
              border: 1px solid #d1d5db; 
              padding: 10px 8px; 
              text-align: left; 
            }
            th { 
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              font-weight: 600;
              color: #374151;
            }
            .rp-letterhead { 
              background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
              color: #fff; 
              padding: 20px 24px; 
              display: flex; 
              justify-content: space-between; 
              align-items: center;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .rp-logo { 
              width: 75px; 
              height: 75px; 
              object-fit: contain; 
              background: white; 
              padding: 10px; 
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .rp-lab-info h1 {
              font-size: 24px;
              font-weight: 700;
              margin: 0 0 4px 0;
              text-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }
            .rp-lab-info p {
              margin: 2px 0;
              font-size: 13px;
              opacity: 0.9;
            }
            .rp-contact-info {
              text-align: right;
              font-size: 12px;
            }
            .rp-contact-info div {
              margin: 2px 0;
              opacity: 0.9;
            }
            .rp-patient { 
              display: flex; 
              justify-content: space-between; 
              padding: 16px 8px; 
              border-bottom: 3px solid #3b82f6;
              margin: 12px 0;
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            }
            .rp-patient-info h2 {
              font-size: 18px;
              font-weight: 600;
              color: #1e40af;
              margin: 0 0 6px 0;
            }
            .rp-patient-info p {
              margin: 3px 0;
              color: #4b5563;
              font-size: 13px;
            }
            .rp-dates {
              text-align: right;
              color: #6b7280;
              font-size: 12px;
            }
            .rp-dates div {
              margin: 3px 0;
            }
            .rp-results th, .rp-results td { 
              border: 1px solid #cbd5e1; 
              padding: 10px 8px;
            }
            .rp-results th { 
              background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
              font-weight: 600;
              color: #374151;
            }
            .rp-results tbody tr:nth-child(even) {
              background-color: #f8fafc;
            }
            .rp-results tbody tr:hover {
              background-color: #f1f5f9;
            }
            .rp-test-block { 
              margin: 16px 0; 
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              overflow: hidden;
              page-break-inside: avoid;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .rp-test-header {
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
              padding: 12px 16px;
              font-weight: 700;
              color: #1e40af;
              border-bottom: 2px solid #3b82f6;
            }
            .rp-footer-note { 
              margin-top: 20px; 
              background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
              padding: 16px; 
              font-size: 12px;
              border: 1px solid #fbbf24;
              border-radius: 6px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .rp-footer-note strong {
              color: #92400e;
            }
            .rp-signs { 
              display: flex; 
              justify-content: space-between; 
              margin-top: 24px; 
              font-size: 12px;
              border-top: 1px solid #e5e7eb;
              padding-top: 16px;
            }
            .rp-signature-block {
              text-align: center;
              padding: 8px 16px;
            }
            .rp-signature-line {
              border-top: 1px solid #9ca3af;
              margin-top: 40px;
              padding-top: 8px;
              font-weight: 600;
              color: #374151;
            }
            .value-cell {
              font-weight: 600;
              color: #059669;
            }
            @media print {
              .rp-test-block {
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

        printWindow.document.close();

        // Wait for images to load before printing
        if (labInfo?.logoUrl) {
            const images = printWindow.document.getElementsByTagName('img');
            if (images.length > 0) {
                const imagePromises = Array.from(images).map(img => {
                    return new Promise((resolve) => {
                        if (img.complete) {
                            resolve();
                        } else {
                            img.onload = resolve;
                            img.onerror = resolve; // Still resolve on error to not block printing
                        }
                    });
                });

                try {
                    await Promise.all(imagePromises);
                    // Small additional delay to ensure rendering
                    setTimeout(() => {
                        printWindow.focus();
                        printWindow.print();
                    }, 100);
                } catch (error) {
                    console.error('Error loading images for print:', error);
                    printWindow.focus();
                    printWindow.print();
                }
            } else {
                printWindow.focus();
                printWindow.print();
            }
        } else {
            printWindow.focus();
            printWindow.print();
        }
    };

    const fmt = (iso) => {
        if (!iso) return "—";
        try {
            const d = new Date(iso);
            return d.toLocaleString();
        } catch {
            return iso;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-2">
            <div className="max-w-7xl mx-auto">
                <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-0 overflow-hidden p-0">
                    {/* Enhanced Header */}
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl">
                                    <Printer className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold">Print Results</CardTitle>
                                    <p className="text-blue-100 mt-1">Generate and print patient reports</p>
                                </div>
                            </div>
                            <Badge className="bg-white/20 text-white border-0 px-4 py-2 rounded-xl">
                                <FileText className="h-4 w-4 mr-1" />
                                {filteredPatients?.length || 0} Reports
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="px-8 py-2">
                        {/* Enhanced Filter Section */}
                        <div className="mb-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name/Ref Search */}
                                <div className="relative group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <Search className="inline h-4 w-4 mr-1" />
                                        Search Patient
                                    </label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Name or Reference No..."
                                            className="h-12 pl-4 pr-10 border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    </div>
                                </div>

                                {/* Test Search */}
                                <div className="relative group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <TestTube className="inline h-4 w-4 mr-1" />
                                        Search Test
                                    </label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Test name..."
                                            className="h-12 pl-4 pr-10 border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70"
                                            value={testSearch}
                                            onChange={(e) => setTestSearch(e.target.value)}
                                        />
                                        <TestTube className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="mb-5 bg-gray-200" />

                        {/* Enhanced Table */}
                        <div className="rounded-2xl overflow-hidden border-2 border-gray-100 shadow-lg bg-white">
                            <div className="overflow-x-auto">
                                {filteredPatients?.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150">
                                                <TableHead className="font-bold text-gray-800 py-4">
                                                    <FileText className="inline h-4 w-4 mr-2" />
                                                    Ref No
                                                </TableHead>
                                                <TableHead className="font-bold text-gray-800">
                                                    <User className="inline h-4 w-4 mr-2" />
                                                    Name
                                                </TableHead>
                                                <TableHead className="font-bold text-gray-800">
                                                    <User className="inline h-4 w-4 mr-2" />
                                                    Gender
                                                </TableHead>
                                                <TableHead className="font-bold text-gray-800">
                                                    <Info className="inline h-4 w-4 mr-2" />
                                                    Details
                                                </TableHead>
                                                <TableHead className="font-bold text-gray-800">
                                                    <Activity className="inline h-4 w-4 mr-2" />
                                                    Results Completed
                                                </TableHead>
                                                <TableHead className="font-bold text-gray-800">
                                                    <Printer className="inline h-4 w-4 mr-2" />
                                                    Action
                                                </TableHead>
                                                <TableHead className="font-bold text-gray-800">
                                                    <RefreshCcw className="inline h-4 w-4 mr-2" />
                                                    Reset Result
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredPatients
                                                .slice()
                                                .reverse()
                                                .map((p, index) => (
                                                    <TableRow
                                                        key={p._id}
                                                        className={`transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
                                                            }`}
                                                    >
                                                        <TableCell className="font-semibold text-blue-700 py-4">
                                                            {p.refNo}
                                                        </TableCell>
                                                        <TableCell className="font-medium text-gray-900">
                                                            {p.name}
                                                        </TableCell>
                                                        <TableCell className="text-gray-700">
                                                            {p.gender}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300 rounded-lg transition-all duration-200"
                                                                onClick={() => openPatientDetails(p)}
                                                            >
                                                                <Info className="h-4 w-4 text-amber-600" />
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-gray-600">
                                                                    {p.results?.length || 0} / {p.tests?.length || 0}
                                                                </span>
                                                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                                                    <div
                                                                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                                                                        style={{
                                                                            width: `${((p.results?.length || 0) / (p.tests?.length || 1)) * 100}%`
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                size="sm"
                                                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                                                onClick={() => openPrintPreview(p)}
                                                            >
                                                                <Printer className="w-4 h-4 mr-1" />
                                                                Preview
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300 text-red-700 hover:text-red-800 rounded-lg transition-all duration-200"
                                                                onClick={() => openDeleteDialog(p)}
                                                            >
                                                                <RefreshCcw className="w-4 h-4 mr-1" />
                                                                Reset
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Printer className="h-8 w-8 text-blue-400" />
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Pending!</h3>
                                                <p className="text-gray-500">All reports have been processed or no patients found matching your search.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent className="max-w-md bg-white rounded-2xl border-0 shadow-2xl">
                        <DialogHeader className="pb-4">
                            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                </div>
                                Confirm Reset
                            </DialogTitle>
                        </DialogHeader>
                        <Separator className="bg-gray-200" />
                        <div className="py-4">
                            <DialogDescription className="text-gray-600 mb-4">
                                {patientToDelete &&
                                    `Are you sure you want to delete all results for "${patientToDelete.name}" and resubmit? This action cannot be undone.`
                                }
                            </DialogDescription>
                            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                                <p className="text-sm text-red-700 flex items-center">
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    This will reset all test results and require re-entry.
                                </p>
                            </div>
                            <DialogFooter className="mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setDeleteDialogOpen(false);
                                        setPatientToDelete(null);
                                    }}
                                    className="rounded-lg"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg"
                                    onClick={() => handleDeleteResubmit(patientToDelete._id)}
                                    disabled={loading}
                                >
                                    <RefreshCcw className="h-4 w-4 mr-1" />
                                    {loading ? "Processing..." : "Yes, Reset"}
                                </Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Patient Details Dialog */}
                <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                    <DialogContent className="max-w-2xl max-h-[95vh] overflow-auto bg-white rounded-2xl border-0 shadow-2xl">
                        <DialogHeader className="pb-4">
                            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
                                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                                    <Info className="h-4 w-4 text-amber-600" />
                                </div>
                                Patient Details — {selectedPatient?.name || ""}
                            </DialogTitle>
                        </DialogHeader>
                        <Separator className="bg-gray-200" />

                        <div className="space-y-6 max-h-[70vh] overflow-y-auto py-4">
                            {selectedPatient && (
                                <>
                                    {/* Basic Info */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                                        <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
                                            <User className="h-4 w-4 mr-2" />
                                            Basic Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="font-semibold text-sm text-gray-600">Name:</label>
                                                    <p className="text-base font-medium text-gray-900">{selectedPatient.name || "—"}</p>
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-sm text-gray-600">Reference No:</label>
                                                    <p className="text-base font-medium text-blue-700">{selectedPatient.refNo || "—"}</p>
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-sm text-gray-600">Case No:</label>
                                                    <p className="text-base font-medium text-blue-700">{selectedPatient.caseNo || "—"}</p>
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-sm text-gray-600">Age:</label>
                                                    <p className="text-base text-gray-900">{selectedPatient.age || "—"}</p>
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-sm text-gray-600">Gender:</label>
                                                    <p className="text-base text-gray-900">{selectedPatient.gender || "—"}</p>
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-sm text-gray-600">Result Added By:</label>
                                                    <p className="text-base text-gray-900">{selectedPatient.resultAddedBy || "—"}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="font-semibold text-sm text-gray-600">Phone:</label>
                                                    <p className="text-base text-gray-900">{selectedPatient.phone || "—"}</p>
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-sm text-gray-600">Referred By:</label>
                                                    <p className="text-base text-gray-900">{selectedPatient.referencedBy || "—"}</p>
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-sm text-gray-600">Total Amount:</label>
                                                    <p className="text-base font-semibold text-green-700">{selectedPatient.total ? `${selectedPatient.total} PKR` : "—"}</p>
                                                </div>
                                            </div>
                                            <div className="col-span-2 space-y-3 mt-4 pt-4 border-t border-blue-200">
                                                <div>
                                                    <label className="font-semibold text-sm text-gray-600">Registered:</label>
                                                    <p className="text-base text-gray-900">{fmt(selectedPatient.createdAt)}</p>
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-sm text-gray-600">Last Updated:</label>
                                                    <p className="text-base text-gray-900">{fmt(selectedPatient.updatedAt)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tests Information */}
                                    {selectedPatient?.tests && selectedPatient.tests.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-lg mb-4 flex items-center">
                                                <TestTube className="h-5 w-5 mr-2 text-blue-600" />
                                                Ordered Tests
                                                <Badge className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 ml-2">
                                                    {selectedPatient.tests.length}
                                                </Badge>
                                            </h3>
                                            <div className="space-y-3">
                                                {selectedPatient.tests.map((test, index) => (
                                                    <Card key={index} className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 shadow-md border border-cyan-200 rounded-xl">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-medium text-base text-cyan-800 mb-1">{test.testName}</h4>
                                                                <p className="text-sm text-gray-600 flex items-center">
                                                                    <TestTube className="h-3 w-3 mr-1" />
                                                                    Fields: {test.fields?.length || 0}
                                                                </p>
                                                            </div>
                                                            <Badge
                                                                className={selectedPatient?.resultStatus?.toLowerCase() === 'added'
                                                                    ? "bg-green-100 text-green-800 border-green-200"
                                                                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                                }
                                                            >
                                                                {selectedPatient?.resultStatus?.toLowerCase() === 'added' ? "✓ Completed" : "⏳ Pending"}
                                                            </Badge>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Print Preview Dialog */}
                <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                    <DialogContent className="max-w-5xl max-h-[95vh] overflow-auto bg-white p-6 rounded-2xl border-0 shadow-2xl">
                        <DialogHeader className="pb-4">
                            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                    <Printer className="h-4 w-4 text-green-600" />
                                </div>
                                Print Preview — {printPatient?.name || ""}
                            </DialogTitle>
                        </DialogHeader>
                        <Separator className="bg-gray-300" />

                        <div className="flex gap-3 justify-end mb-4 mt-4">
                            <Button
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                onClick={handlePrint}
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Print Report
                            </Button>
                        </div>

                        <div
                            id="printable-report"
                            className="mx-auto max-h-[75vh] overflow-y-auto bg-white shadow-2xl border border-gray-200 rounded-lg"
                            style={{ maxWidth: '794px' }}
                        >
                            <style jsx>{`
                .preview-content {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 13px;
                    line-height: 1.5;
                    color: #1a1a1a;
                }
                .preview-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 8px 0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .preview-table th,
                .preview-table td {
                    border: 1px solid #d1d5db;
                    padding: 10px 8px;
                    text-align: left;
                }
                .preview-table th {
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    font-weight: 600;
                    color: #374151;
                }
                .preview-table tbody tr:nth-child(even) {
                    background-color: #f8fafc;
                }
                .preview-letterhead {
                    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
                    color: #fff;
                    padding: 20px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .preview-logo {
                    width: 75px;
                    height: 75px;
                    object-fit: contain;
                    background: white;
                    padding: 10px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .preview-lab-info h1 {
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0 0 4px 0;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.1);
                }
                .preview-lab-info p {
                    margin: 2px 0;
                    font-size: 13px;
                    opacity: 0.9;
                }
                .preview-contact-info {
                    text-align: right;
                    font-size: 12px;
                }
                .preview-contact-info div {
                    margin: 2px 0;
                    opacity: 0.9;
                }
                .preview-patient {
                    display: flex;
                    justify-content: space-between;
                    padding: 16px 8px;
                    border-bottom: 3px solid #3b82f6;
                    margin: 12px 0;
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                }
                .preview-patient-info h2 {
                    font-size: 18px;
                    font-weight: 600;
                    color: #1e40af;
                    margin: 0 0 6px 0;
                }
                .preview-patient-info p {
                    margin: 3px 0;
                    color: #4b5563;
                    font-size: 13px;
                }
                .preview-dates {
                    text-align: right;
                    color: #6b7280;
                    font-size: 12px;
                }
                .preview-dates div {
                    margin: 3px 0;
                }
                .preview-test-block {
                    margin: 16px 0;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .preview-test-header {
                    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                    padding: 12px 16px;
                    font-weight: 700;
                    color: #1e40af;
                    border-bottom: 2px solid #3b82f6;
                }
                .preview-footer-note {
                    margin-top: 20px;
                    background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
                    padding: 16px;
                    font-size: 12px;
                    border: 1px solid #fbbf24;
                    border-radius: 6px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .preview-footer-note strong {
                    color: #92400e;
                }
                .preview-signs {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 24px;
                    font-size: 12px;
                    border-top: 1px solid #e5e7eb;
                    padding-top: 16px;
                }
                .preview-signature-block {
                    text-align: center;
                    padding: 8px 16px;
                }
                .preview-signature-line {
                    border-top: 1px solid #9ca3af;
                    margin-top: 40px;
                    padding-top: 8px;
                    font-weight: 600;
                    color: #374151;
                }
                .preview-value-cell {
                    font-weight: 600;
                    color: #059669;
                    text-align: center;
                }
            `}</style>

                            <div className="preview-content">
                                {/* ENHANCED HEADER */}
                                <div className="preview-letterhead">
                                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                                        {labInfo?.logoUrl ? (
                                            <img
                                                src={labInfo.logoUrl}
                                                alt="lab logo"
                                                className="preview-logo"
                                            />
                                        ) : (
                                            <div className="preview-logo" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#1e40af',
                                                fontWeight: 'bold',
                                                fontSize: '14px'
                                            }}>
                                                LAB
                                            </div>
                                        )}
                                        <div className="preview-lab-info">
                                            <h1>{labInfo?.labName || "Your Lab Name"}</h1>
                                            <p>{labInfo?.address || "Lab Address"}</p>
                                        </div>
                                    </div>
                                    <div className="preview-contact-info">
                                        <div><strong>📞</strong> {labInfo?.phoneNumber || "Phone Number"}</div>
                                        <div><strong>📧</strong> {labInfo?.email || "email@lab.com"}</div>
                                        <div><strong>🌐</strong> {labInfo?.website || "www.lab.com"}</div>
                                    </div>
                                </div>

                                {/* ENHANCED PATIENT INFO */}
                                <div className="preview-patient">
                                    <div className="preview-patient-info">
                                        <h2>{printPatient?.name || "—"}</h2>
                                        <p><strong>Age / Sex:</strong> {printPatient?.age || "—"} / {printPatient?.gender || "—"}</p>
                                        <p><strong>Referred by:</strong> {printPatient?.referencedBy || "—"}</p>
                                        <p><strong>Registration No:</strong> {printPatient?.refNo || "—"}</p>
                                    </div>
                                    <div className="preview-dates">
                                        <div><strong>Registered:</strong><br />{fmt(printPatient?.createdAt)}</div>
                                        <div><strong>Reported:</strong><br />{fmt(printPatient?.updatedAt)}</div>
                                    </div>
                                </div>

                                {/* ENHANCED RESULTS */}
                                <div>
                                    {printPatient?.tests?.map((test, ti) => (
                                        <div key={ti} className="preview-test-block">
                                            <div className="preview-test-header">
                                                {test.testName}
                                            </div>
                                            <table className="preview-table">
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: '35%' }}>TEST PARAMETER</th>
                                                        <th style={{ width: '20%' }}>RESULT</th>
                                                        <th style={{ width: '15%' }}>UNIT</th>
                                                        <th style={{ width: '30%' }}>REFERENCE RANGE</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {test.fields?.map((f, fi) => (
                                                        <tr key={fi}>
                                                            <td style={{ fontWeight: '500' }}>{f.fieldName}</td>
                                                            <td className="preview-value-cell">{f.defaultValue || "—"}</td>
                                                            <td style={{
                                                                textAlign: "center",
                                                                fontSize: '12px',
                                                                color: '#6b7280'
                                                            }}>{f.unit || "—"}</td>
                                                            <td style={{
                                                                textAlign: "center",
                                                                fontSize: '12px',
                                                                color: '#6b7280'
                                                            }}>{f.range || "—"}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ))}
                                </div>

                                {/* ENHANCED FOOTER */}
                                <div className="preview-footer-note">
                                    <strong>📋 Clinical Notes:</strong> {labInfo?.description || "Standard laboratory procedures followed. Results are based on the sample provided."}
                                </div>

                                <div className="preview-signs">
                                    <div className="preview-signature-block">
                                        <div className="preview-signature-line">Lab Incharge</div>
                                    </div>
                                    <div className="preview-signature-block">
                                        <div className="preview-signature-line">Pathologist</div>
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