

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

import { useRef } from "react";
import { useReactToPrint } from 'react-to-print';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';

export default function ResultPrintComponent() {
    const { fetchPatients, patients, setPatients } = useContext(PatientsContext);
    const { addedPatients, setAddedPatients } = useContext(AddedPatientsContext);

    const [filteredPatients, setFilteredPatients] = useState([]);
    const [search, setSearch] = useState("");
    const [testSearch, setTestSearch] = useState("");
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [printPatient, setPrintPatient] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [labInfo, setLabInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    // Dialog state for delete confirmation
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState(null);

    const reportRef = useRef();
    

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
    // Print handler using react-to-print
    const handlePrintResults = useReactToPrint({
        contentRef: reportRef,
        documentTitle: `Lab_Results_${printPatient?.name}_${new Date().toISOString().split('T')[0]}`,
    });
    
    // Trigger print with patient data
    const handlePrintClick = async (patient) => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/results/${patient._id}/tests`
            );
            setPrintPatient(res.data);
            console.log(printPatient?.tests?.[0]?.testId?.specimen) 
            // Small delay to ensure state updates before printing
            setTimeout(() => {
                handlePrintResults();
            }, 100);
        } catch (err) {
            console.error("Error loading patient data:", err);
            toast.error("Failed to load patient data for printing");
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
                                                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                                                onClick={() => handlePrintClick(p)}
                                                            >
                                                                <Printer className="w-4 h-4 mr-1" />
                                                                Print
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

                {/* ========================================
    HIDDEN PRINT TEMPLATE FOR RESULTS
======================================== */}
                {printPatient && (
                    <div style={{ display: 'none' }}>
                        <div ref={reportRef} className="bg-white">
                            <style>
                                {`
@media print {
    @page { 
        margin: 5mm 10mm; 
        size: A4 portrait;
    }
    body { 
        print-color-adjust: exact; 
        -webkit-print-color-adjust: exact; 
    }
}
                `}
                            </style>

                            {/* LAB HEADER - Same as Registration Report */}
                            <div className="mb-4">
                                <div className="flex items-start justify-between border-b-2 border-gray-800 pb-3">
                                    {/* Left: Logo and Lab Info */}
                                    <div className="flex items-start">
                                        {labInfo?.logoUrl && (
                                            <img
                                                src={labInfo.logoUrl}
                                                alt="Lab Logo"
                                                className="h-20 w-20 mr-4 object-contain"
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
                                        <QRCodeSVG
                                            value={JSON.stringify({
                                                labName: labInfo?.labName || 'DOCTOR LAB & Imaging Center Sahiwal',
                                                address: labInfo?.address || 'Opposite THQ Hospital Near Punjab Pharmacy Sahiwal, District Sargodha',
                                                phone: labInfo?.phoneNumber || '0325-0020111'
                                            })}
                                            size={60}
                                            level="M"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Lab # and Case # with Barcodes */}
                            <div className="border-t border-b border-gray-800 py-2 mb-3">
                                <div className="flex justify-between items-center">
                                    {/* Lab No */}
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

                                    {/* Case No */}
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

                            {/* Patient Info Box - Matching PDF Format */}
                            <div className="border border-gray-800 p-2 mb-3 bg-white">
                                <table className="w-full text-xs">
                                    <tbody>
                                        <tr>
                                            <td className="font-semibold py-0.5 w-1/4">Patient's Name</td>
                                            <td className="py-0.5 w-1/4 font-semibold text-md">{printPatient?.name}</td>
                                            <td className="font-semibold py-0.5 w-1/4">Reg. Date</td>
                                            <td className="py-0.5 w-1/4">
                                                {new Date(printPatient?.createdAt).toLocaleDateString('en-GB')} {new Date(printPatient?.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-0.5">Age/Sex</td>
                                            <td className="py-0.5">{printPatient?.age} Years / {printPatient?.gender}</td>
                                            <td className="font-semibold py-0.5">Specimen</td>
                                            <td className="py-0.5">{printPatient?.tests?.[0]?.testId?.specimen || 'Taken in Lab'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-0.5">Father/Husband</td>
                                            <td className="py-0.5">-</td>
                                            <td className="font-semibold py-0.5">Contact No</td>
                                            <td className="py-0.5">{printPatient?.phone}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-0.5">NIC No</td>
                                            <td className="py-0.5">-</td>
                                            <td className="font-semibold py-0.5">Consultant</td>
                                            <td className="py-0.5">{printPatient?.referencedBy || 'SELF'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-0.5">Hosp/ MR #</td>
                                            <td className="py-0.5">-</td>
                                            <td className="font-semibold py-0.5">Reg. Centre</td>
                                            <td className="py-0.5">Main Lab</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* TEST RESULTS - Matching PDF Format */}
                            {printPatient?.tests?.map((test, ti) => {
                                const filledFields = test.fields?.filter(f =>
                                    f.defaultValue &&
                                    f.defaultValue.trim() !== "" &&
                                    f.defaultValue !== "—"
                                ) || [];

                                if (filledFields.length === 0) return null;

                                return (
                                    <div key={ti} className="mb-4">
                                        <div className="bg-gray-100 border border-gray-800 px-2 py-1 mb-2">
                                            <h3 className="text-sm font-bold uppercase">{test.testName}</h3>
                                        </div>

                                        <table className="w-full text-xs border-collapse">
                                            <thead>
                                                <tr className="border-b border-gray-800">
                                                    <th className="text-left py-1 font-semibold">TEST</th>
                                                    <th className="text-center py-1 font-semibold">RESULT</th>
                                                    <th className="text-center py-1 font-semibold">UNIT</th>
                                                    <th className="text-center py-1 font-semibold">REFERENCE RANGE</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filledFields.map((f, fi) => (
                                                    <tr key={fi} className="border-b border-gray-300">
                                                        <td className="py-1.5">{f.fieldName}</td>
                                                        <td className="text-center py-1.5 font-semibold">{f.defaultValue}</td>
                                                        <td className="text-center py-1.5">{f.unit || '.'}</td>
                                                        <td className="text-center py-1.5">{f.range || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })}

                            {/* FOOTER - Matching PDF Format */}
                            <div className="mt-6 pt-4 border-t border-gray-800">
                                <div className="flex justify-between items-end text-xs">
                                    <div>
                                        <p className="font-semibold mb-1">Lab Technician</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">Dr. Mudaser Hussain Abbasi</p>
                                        <p>MBBS, DMJ. Mphil</p>
                                    </div>
                                </div>

                                <div className="mt-4 text-center">
                                    <p className="text-xs font-semibold">Electronically Verified Report, No Signature(s) Required.</p>
                                    <p className="text-[10px] mt-2 text-gray-600">
                                        NOTE: All the tests are performed on the most advanced, highly sophisticated, appropriate, and state of the art instruments with highly sensitive chemicals under strict conditions and with all care and diligence. However, the above results are NOT the DIAGNOSIS and should be correlated with clinical findings, patient's history, signs and symptoms and other diagnostic tests. Lab to lab variation may occur. This document is NEVER challengeable at any PLACE/COURT and in any CONDITION.
                                    </p>
                                </div>

                                <div className="text-center mt-2 text-xs">
                                    <p>Opposite THQ Hospital Near Punjab Pharmacy Sahiwal, District Sargodha - Contact # 0325-0020111</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}