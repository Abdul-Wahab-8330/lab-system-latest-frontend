import React, { useState, useEffect, useContext } from "react";
import TestScaleVisualization from './TestScaleVisualization';
import axios from "../api/axiosInstance";
import {
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { RefreshCcw, AlertTriangle, ArrowRight, MessageCircle, Check } from "lucide-react";
import toast from "react-hot-toast";
import { PatientsContext } from "@/context/PatientsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Search, Clock, Printer, Info, FileText, User, Calendar, Phone, TestTube, Activity, ChevronDown, ChevronRight, CheckCircle, Edit } from "lucide-react";
import { AddedPatientsContext } from "@/context/AddedPatientsContext";
import { AuthContext } from "@/context/AuthProvider";
import { SystemFiltersContext } from '@/context/SystemFiltersContext';
import GlobalDateFilter from './GlobalDateFilter';
import VisualScaleVisualization from './VisualScaleVisualization';

import { useRef } from "react";
import { useReactToPrint } from 'react-to-print';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import { socket } from '@/socket';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";




export default function ResultPrintComponent() {
    const { fetchPatients, patients, setPatients } = useContext(PatientsContext);
    const { addedPatients, setAddedPatients, fetchAddedPatients } = useContext(AddedPatientsContext);
    const { user } = useContext(AuthContext);
    const { checkDateFilter } = useContext(SystemFiltersContext);


    const [filteredPatients, setFilteredPatients] = useState([]);
    const [search, setSearch] = useState("");
    const [testSearch, setTestSearch] = useState("");
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [printPatient, setPrintPatient] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [labInfo, setLabInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editPatient, setEditPatient] = useState(null);
    const [changedTests, setChangedTests] = useState([]);

    // Dialog state for delete confirmation
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState(null);

    const [printSpacer, setPrintSpacer] = useState(0);


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
                    p.name?.toLowerCase().includes(search.toLowerCase()) ||
                    p.refNo?.toString().includes(search) ||
                    p.caseNo?.toString().includes(search)
            );
        }

        if (testSearch) {
            data = data.filter((p) =>
                p.tests?.some((t) =>
                    t.testName?.toLowerCase().includes(testSearch.toLowerCase())
                )
            );
        }

        // ✅ Apply global filter from context
        data = data.filter(p => checkDateFilter(p.createdAt, 'results'));

        setFilteredPatients(data);
    }, [search, testSearch, addedPatients, checkDateFilter]);

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

    const formatPhoneNumber = (phone) => {
        if (!phone) return '';

        // Remove all spaces, dashes, and brackets
        let cleaned = phone.replace(/[\s\-\(\)\+]/g, ''); // Added \+ to remove plus signs

        // If already starts with 92, return as is
        if (cleaned.startsWith('92')) {
            return cleaned;
        }

        // If starts with 0, replace with 92
        if (cleaned.startsWith('0')) {
            return '92' + cleaned.substring(1);
        }

        // If none of above, assume it needs 92 prefix
        return '92' + cleaned;
    };

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


    const handleWhatsAppShare = (patient) => {
        const formattedPhone = formatPhoneNumber(patient.phone);

        const message = `🏥 *DOCTOR LAB & Imaging Center Sahiwal*

Dear *${patient.name}*,

Thank you for choosing our services! ✅

📋 *Patient No:* ${patient.refNo}
💰 *Amount Paid:* Rs. ${patient.paidAmount || 0}

✅ Your medical reports are READY!

*To access your report:*
1. Click the link above
2. Enter your Patient No: *${patient.refNo} & Phone Number from Report*
3. View and download your results anytime, anywhere.

🔗 *View & Download:*
${window.location.origin}/public-report

Click the link above to view and download your complete test results anytime.

📞 *For assistance, call:* ${labInfo?.phoneNumber || '0325-0020111'}`;

        const encodedMessage = encodeURIComponent(message);

        // Detect if mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        let whatsappUrl;

        if (isMobile) {
            // Mobile: Use wa.me (opens app directly with message)
            whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
        } else {
            // Desktop: Use web.whatsapp.com
            whatsappUrl = `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
        }

        window.open(whatsappUrl, '_blank');
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

            // ✅ FILTER: Remove diagnostic tests from details
            const filteredPatient = {
                ...res.data,
                tests: res.data.tests.filter(test => !test.testId?.isDiagnosticTest)
            };

            setSelectedPatient(filteredPatient);
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

            console.log('Printing results for patient:', res.data);
            console.log(printPatient?.tests?.[0]?.testId?.specimen)
            console.log(printPatient?.tests?.[0]?.testId?.category)
            // Small delay to ensure state updates before printing
            setTimeout(() => {
                handlePrintResults();
            }, 100);
        } catch (err) {
            console.error("Error loading patient data:", err);
            toast.error("Failed to load patient data for printing");
        }
    };

    const handlePrintInNewWindow = (patient) => {
        // Open in new tab
        window.open(
            `/print-report/${patient._id}?spacer=${printSpacer}`,
            '_blank'
        );

    };

    const openEditDialog = async (patient) => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/results/${patient._id}/tests`
            );

            // ✅ FILTER: Remove diagnostic tests from edit dialog
            const filteredPatient = {
                ...res.data,
                tests: res.data.tests.filter(test => test.testId?.isDiagnosticTest !== true)
            };

            setEditPatient(filteredPatient);
            setChangedTests([]); // Reset changed tests
            setEditDialogOpen(true);
        } catch (err) {
            console.error("Error loading patient data:", err);
            toast.error("Failed to load patient data");
        }
    };

    const handleEditFieldChange = (testIndex, fieldIndex, value) => {
        const updated = JSON.parse(JSON.stringify(editPatient));
        updated.tests[testIndex].fields[fieldIndex].defaultValue = value;
        setEditPatient(updated);

        setChangedTests(prev => {
            const updatedTest = updated.tests[testIndex];
            // ✅ FIX: Handle both nested and direct testId formats
            const testIdToCompare = updatedTest.testId?._id || updatedTest.testId;

            const exists = prev.find(t => {
                const existingTestId = t.testId?._id || t.testId;
                return existingTestId?.toString() === testIdToCompare?.toString();
            });

            if (exists) {
                // Update existing changed test
                return prev.map(t => {
                    const existingTestId = t.testId?._id || t.testId;
                    return existingTestId?.toString() === testIdToCompare?.toString() ? updatedTest : t;
                });
            } else {
                // Add new changed test
                return [...prev, updatedTest];
            }
        });
    };

    const saveEditedResults = async () => {
        console.log('🟢 Save button clicked!');
        console.log('🔍 Changed Tests RAW:', changedTests);

        // ✅ ADD DETAILED LOGGING:
        changedTests.forEach((test, i) => {
            console.log(`Test ${i}:`, {
                testId: test.testId,
                'testId._id': test.testId?._id,
                'testId.toString()': test.testId?.toString?.(),
                testName: test.testName,
                fullTest: test
            });
        });

        if (changedTests.length === 0) {
            toast("No changes to save!");
            return;
        }

        setLoading(true);
        try {
            const testsToSend = changedTests.map(test => ({
                testId: test.testId?._id || test.testId,
                testName: test.testName,
                fields: test.fields.map(f => ({
                    fieldName: f.fieldName,
                    defaultValue: f.defaultValue,
                    unit: f.unit,
                    range: f.range
                }))
            }));

            console.log('🔵 Tests to send:', testsToSend);

            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/results/${editPatient._id}/results`,
                {
                    tests: testsToSend,
                    resultAddedBy: user?.name || 'Admin',
                    socketId: socket.id
                }
            );

            console.log('✅ PATCH Response:', response.data);

            toast.success('Results updated successfully!');
            setEditDialogOpen(false);
            setChangedTests([]);

            await fetchPatients();
        } catch (error) {
            console.error("❌ Error updating results:", error);
            console.error("❌ Error response:", error.response?.data);
            toast.error('Failed to update results!');
        } finally {
            setLoading(false);
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
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl">
                                    <Printer className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold">Print Results</CardTitle>
                                    <p className="text-blue-100 mt-1">Generate and print patient reports</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* ✅ Global Date Filter Component */}
                                <GlobalDateFilter filterType="results" />

                                <Badge className="bg-white/20 text-white border-0 px-4 py-2 rounded-xl">
                                    <FileText className="h-4 w-4 mr-1" />
                                    {filteredPatients?.length || 0} Reports
                                </Badge>
                            </div>
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
                                            placeholder="Name, Case No or Pat No..."
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
                                            placeholder="Search by Test name..."
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
                                                    Case No
                                                </TableHead>
                                                <TableHead className="font-bold text-gray-800 py-4">
                                                    <FileText className="inline h-4 w-4 mr-2" />
                                                    Pat No
                                                </TableHead>
                                                <TableHead className="font-bold text-gray-800">
                                                    <User className="inline h-4 w-4 mr-2" />
                                                    Name
                                                </TableHead>

                                                <TableHead className="font-bold text-gray-800">
                                                    {/* <Info className="inline h-4 w-4 mr-2" /> */}
                                                    Details
                                                </TableHead>
                                                <TableHead className="font-bold text-gray-800">
                                                    <Activity className="inline h-4 w-4 mr-2" />
                                                    Results Added
                                                </TableHead>
                                                <TableHead className="font-bold text-gray-800">
                                                    <Printer className="inline h-4 w-4 mr-2" />
                                                    Action
                                                </TableHead>
                                                {(user?.role === 'admin' || user?.role === 'senior_lab_tech' || user?.role == 'senior_receptionist') && (
                                                    <TableHead className="font-bold text-gray-800">
                                                        <RefreshCcw className="inline h-4 w-4 mr-2" />
                                                        Reset Result
                                                    </TableHead>
                                                )}
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
                                                            {p.caseNo}
                                                        </TableCell>
                                                        <TableCell className="font-semibold text-blue-700 py-4">
                                                            {p.refNo}
                                                        </TableCell>
                                                        <TableCell className="font-medium text-gray-900">
                                                            {p.name}
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
                                                                    {/* ✅ FILTER: Only count non-diagnostic tests */}
                                                                    {p.results?.length || 0} / {p.tests?.filter(t => !t.testId?.isDiagnosticTest).length || 0}
                                                                </span>
                                                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                                                    <div
                                                                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                                                                        style={{
                                                                            width: `${((p.results?.length || 0) / (p.tests?.filter(t => !t.testId?.isDiagnosticTest).length || 1)) * 100}%`
                                                                        }}
                                                                    ></div>
                                                                </div>

                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button className='bg-blue-600 text-white border' onClick={() => openEditDialog(p)}>
                                                                    <Edit className="w-4 h-4 mr-1" />
                                                                    Edit
                                                                </Button>
                                                                <div className="flex shadow-sm rounded-lg overflow-hidden  border-green-600">
                                                                    {/* MAIN PRINT BUTTON */}
                                                                    <Button
                                                                        size="sm"
                                                                        className="rounded-none rounded-l-lg bg-gradient-to-r from-green-500 to-green-600
               hover:from-green-600 hover:to-green-700 text-white font-semibold px-4"
                                                                        onClick={() => handlePrintClick(p)}
                                                                    >
                                                                        <Printer className="w-4 h-4 mr-1" />
                                                                        Print
                                                                    </Button>

                                                                    {/* DROPDOWN BUTTON */}
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button
                                                                                size="sm"
                                                                                className="rounded-none rounded-r-lg bg-gradient-to-r from-green-500 to-green-600  text-white px-2
                   border-none flex items-center gap-1"
                                                                            >
                                                                                <span className="text-xs font-semibold">
                                                                                    {printSpacer === 0 ? "" : `${printSpacer}%`}
                                                                                </span>
                                                                                <ChevronDown className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>

                                                                        <DropdownMenuContent
                                                                            align="end"
                                                                            className="w-44 p-1 bg-white border shadow-md rounded-md"
                                                                        >
                                                                            {[0, 20, 30, 40, 50].map((value) => (
                                                                                <DropdownMenuItem
                                                                                    key={value}
                                                                                    onClick={() => setPrintSpacer(value)}
                                                                                    className={`
            flex items-center justify-between rounded-sm px-2 py-2 text-sm
            cursor-pointer transition-colors
            ${printSpacer === value
                                                                                            ? "bg-green-100 text-green-700 font-semibold"
                                                                                            : "hover:bg-gray-100"
                                                                                        }
          `}
                                                                                >
                                                                                    <span>
                                                                                        {value === 0 ? "Default spacing" : `Spacer ${value}%`}
                                                                                    </span>

                                                                                    {printSpacer === value && (
                                                                                        <Check className="h-4 w-4 text-green-600" />
                                                                                    )}
                                                                                </DropdownMenuItem>
                                                                            ))}
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>


                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-sm hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                                                    onClick={() => handlePrintInNewWindow(p)}
                                                                >
                                                                    <ArrowRight className="w-4 h-4 mr-1" />
                                                                    New Window
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    title="Share registration via WhatsApp"
                                                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-sm hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                                                    onClick={() => handleWhatsAppShare(p)}
                                                                >
                                                                    <svg
                                                                        className="h-4 w-4 text-white"
                                                                        viewBox="0 0 24 24"
                                                                        fill="currentColor"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                    >
                                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                                    </svg>
                                                                    {/* <MessageCircle className="w-4 h-4 mr-1" /> */}
                                                                    Share
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {(user?.role === 'admin' || user?.role === 'senior_lab_tech' || user?.role == 'senior_receptionist') && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300 text-red-700 hover:text-red-800 rounded-lg transition-all duration-200"
                                                                    onClick={() => openDeleteDialog(p)}
                                                                >
                                                                    <RefreshCcw className="w-4 h-4 mr-1" />
                                                                    Reset
                                                                </Button>
                                                            )}
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

                {/* Edit Results Dialog */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="max-w-4xl bg-white rounded-2xl border-0 shadow-2xl max-h-[95vh] overflow-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center mt-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                    <Edit className="h-4 w-4 text-blue-600" />
                                </div>
                                Edit Results for "{editPatient?.name}"
                            </DialogTitle>
                        </DialogHeader>
                        <Separator className="bg-gray-200" />

                        {/* Patient Info Card */}
                        {editPatient && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-2">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center">
                                        <FileText className="h-4 w-4 mr-2 text-blue-600" />
                                        <span className="text-gray-600">Case No:</span>
                                        <span className="font-semibold text-gray-900 ml-2">{editPatient.caseNo}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <FileText className="h-4 w-4 mr-2 text-blue-600" />
                                        <span className="text-gray-600">Pat No:</span>
                                        <span className="font-semibold text-gray-900 ml-2">{editPatient.refNo}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <User className="h-4 w-4 mr-2 text-blue-600" />
                                        <span className="text-gray-600">Gender:</span>
                                        <span className="font-semibold text-gray-900 ml-2">{editPatient.gender}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                                        <span className="text-gray-600">Age:</span>
                                        <span className="font-semibold text-gray-900 ml-2">{formatAge(editPatient) || "—"}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Phone className="h-4 w-4 mr-2 text-blue-600" />
                                        <span className="text-gray-600">Contact:</span>
                                        <span className="font-semibold text-gray-900 ml-2">{editPatient.phone || "—"}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tests - Simple Non-Collapsible Layout */}
                        <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                            {editPatient?.tests?.map((test, ti) => (
                                <div key={ti} className="border-2 rounded-lg shadow-sm border-gray-200 bg-white p-4">
                                    {/* Test Header */}
                                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                                        <TestTube className="h-4 w-4 text-blue-600" />
                                        <h3 className="font-semibold text-sm text-blue-700">
                                            {test.testName}
                                        </h3>
                                        <span className="text-xs text-gray-500">
                                            ({test.fields?.length || 0} parameters)
                                        </span>
                                    </div>

                                    {/* Fields */}
                                    <div className="space-y-3">
                                        {test.fields?.map((f, fi) => (
                                            <div key={fi} className="w-full">
                                                <Label className="block text-xs font-medium text-gray-700 mb-1">
                                                    {f.fieldName}
                                                </Label>
                                                <Input
                                                    value={f.defaultValue || ''}
                                                    onChange={(e) => handleEditFieldChange(ti, fi, e.target.value)}
                                                    className="w-full h-9 px-3 border rounded-md text-sm transition-all duration-200 border-blue-300 focus:border-blue-500 hover:border-gray-300 focus:ring-1 focus:ring-blue-200"
                                                    placeholder={`Enter ${f.fieldName.toLowerCase()}...`}
                                                />

                                                {/* Unit and Range */}
                                                {(f.unit || f.range) && (
                                                    <div className="flex items-center gap-3 mt-0.5 text-xs pl-2 text-gray-400">
                                                        {f.unit && (
                                                            <span>Unit: <span className="text-gray-400">{f.unit}</span></span>
                                                        )}
                                                        {f.range && (
                                                            <span>Range: <span className="text-gray-400">{f.range}</span></span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-6 border-t">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setEditDialogOpen(false);
                                    setChangedTests([]);
                                }}
                                className="rounded-lg"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                onClick={saveEditedResults}
                                disabled={loading || changedTests.length === 0}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Patient Details Dialog */}


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
                                                    <label className="font-semibold text-sm text-gray-600">Pat No:</label>
                                                    <p className="text-base font-medium text-blue-700">{selectedPatient.refNo || "—"}</p>
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-sm text-gray-600">Case No:</label>
                                                    <p className="text-base font-medium text-blue-700">{selectedPatient.caseNo || "—"}</p>
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-sm text-gray-600">Age:</label>
                                                    <p className="text-base text-gray-900">{formatAge(selectedPatient) || "—"}</p>
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
                    <div style={{ display: "none" }}>
                        <div ref={reportRef} className="bg-white">
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
     tr.print-spacer td {
  border: none;
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
                                                                            if (el && printPatient?.refNo) {
                                                                                JsBarcode(el, printPatient.refNo, {
                                                                                    format: "CODE128",
                                                                                    width: 1,
                                                                                    height: 20,
                                                                                    displayValue: false,
                                                                                    margin: 0,
                                                                                });
                                                                            }
                                                                        }}
                                                                    ></svg>
                                                                    <p className="text-xs mt-0.5">{printPatient?.refNo}</p>
                                                                </div>
                                                            </div>

                                                            {/* Case No */}
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold">Case #:</span>
                                                                <div className="text-center">
                                                                    <svg
                                                                        ref={(el) => {
                                                                            if (el && printPatient?.caseNo) {
                                                                                JsBarcode(el, printPatient.caseNo, {
                                                                                    format: "CODE128",
                                                                                    width: 1,
                                                                                    height: 20,
                                                                                    displayValue: false,
                                                                                    margin: 0,
                                                                                });
                                                                            }
                                                                        }}
                                                                    ></svg>
                                                                    <p className="text-xs mt-0.5">{printPatient?.caseNo}</p>
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
                                                                {printPatient?.name}
                                                            </td>
                                                            <td className="font-semibold py-0.5 w-1/4">Reg. Date</td>
                                                            <td className="py-0.5 w-1/4">
                                                                {new Date(printPatient?.createdAt).toLocaleDateString("en-GB")}{" "}
                                                                {new Date(printPatient?.createdAt).toLocaleTimeString("en-US", {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                    hour12: true,
                                                                })}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="font-semibold py-0.5">Age/Sex</td>
                                                            <td className="py-0.5">
                                                                {formatAge(printPatient)} / {printPatient?.gender}
                                                            </td>
                                                            {/* this is the second specimen status we add while registering patient */}
                                                            <td className="font-semibold py-0.5">Specimen</td>
                                                            <td className="py-0.5">
                                                                {printPatient?.specimen || "Taken in Lab"}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="font-semibold py-0.5">Father/Husband</td>
                                                            <td className="py-0.5">{printPatient?.fatherHusbandName || "-"}</td>
                                                            <td className="font-semibold py-0.5">Reg. Centre</td>
                                                            <td className="py-0.5">Main Lab</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="font-semibold py-0.5">Contact No</td>
                                                            <td className="py-0.5">{printPatient?.phone}</td>
                                                            <td className="font-semibold py-0.5">Consultant</td>
                                                            <td className="py-0.5">{printPatient?.referencedBy || "SELF"}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="font-semibold py-0.5">Hosp/ MR #</td>
                                                            <td className="py-0.5">-</td>
                                                            <td className="font-semibold py-0.5">NIC No</td>
                                                            <td className="py-0.5">{printPatient?.nicNo || "-"}</td>



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
                                                const nonDiagnosticTests = printPatient?.tests?.filter(test => !test.testId?.isDiagnosticTest) || [];

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
                                                                                {printPatient?.refNo}
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
                                                                                                const patientGender = printPatient?.gender?.toUpperCase();

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
                                                                                                <td className="py-0.5 pl-2 whitespace-pre-line">{f.fieldName}</td>
                                                                                                <td className="text-center py-0.5">
                                                                                                    <div className="whitespace-pre-line">
                                                                                                        {(() => {
                                                                                                            const rangeStr = f.range || "-";
                                                                                                            const patientGender = printPatient?.gender?.toUpperCase();
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
                                                                                                            <div className="whitespace-pre-line">
                                                                                                                {(() => {
                                                                                                                    const rangeStr = f.range || "-";
                                                                                                                    const patientGender = printPatient?.gender?.toUpperCase();
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


                                                                                {/* ===============================
   TEST-LEVEL SCALE
=============================== */}
                                                                                {(() => {
                                                                                    const testData = test.testId || test;
                                                                                    const scaleConfig = testData.scaleConfig;
                                                                                    const firstField = test.fields?.[0];
                                                                                    const resultValue = firstField?.defaultValue;
                                                                                    const unit = firstField?.unit || '';

                                                                                    if (!scaleConfig?.thresholds || !scaleConfig?.labels || !resultValue) return null;

                                                                                    return (
                                                                                        <tr>
                                                                                            <td colSpan="4">
                                                                                                <TestScaleVisualization
                                                                                                    scaleConfig={scaleConfig}
                                                                                                    resultValue={resultValue}
                                                                                                    unit={unit}
                                                                                                />
                                                                                            </td>
                                                                                        </tr>
                                                                                    );
                                                                                })()}

                                                                                {/* ===============================
   TEST-LEVEL VISUAL SCALE
=============================== */}
                                                                                {(() => {
                                                                                    const testData = test.testId || test;
                                                                                    const visualScale = testData.visualScale;
                                                                                    const firstField = test.fields?.[0];
                                                                                    const resultValue = firstField?.defaultValue;
                                                                                    const unit = firstField?.unit || '';

                                                                                    if (!visualScale?.thresholds || !visualScale?.labels || !resultValue) return null;

                                                                                    return (
                                                                                        <tr>
                                                                                            <td colSpan="4">
                                                                                                <VisualScaleVisualization
                                                                                                    visualScale={visualScale}
                                                                                                    resultValue={resultValue}
                                                                                                    unit={unit}
                                                                                                />
                                                                                            </td>
                                                                                        </tr>
                                                                                    );
                                                                                })()}

                                                                                {/* ===============================
   TEST-LEVEL REPORT EXTRAS
=============================== */}
                                                                                {(() => {
                                                                                    const extras = (test.testId || test)?.reportExtras;
                                                                                    if (!extras || Object.keys(extras).length === 0) return null;

                                                                                    return (
                                                                                        <tr>
                                                                                            <td colSpan="4">
                                                                                                {Object.entries(extras).map(([key, value]) => {
                                                                                                    if (!value || (typeof value === 'string' && !value.trim())) return null;

                                                                                                    const heading = key.replace(/([A-Z])/g, ' $1').toUpperCase();

                                                                                                    return (
                                                                                                        <div key={key} className="mb-3">
                                                                                                            <h4 className="font-bold text-sm underline">{heading}</h4>
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

                                                                            </React.Fragment>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>


                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </td>
                                    </tr>
                                    {printSpacer > 0 && (
                                        <tr
                                            className="print-spacer"
                                            style={{ height: `${printSpacer}vh` }}
                                        >
                                            <td>&nbsp;</td>
                                        </tr>
                                    )}


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
        </div>
    );
}