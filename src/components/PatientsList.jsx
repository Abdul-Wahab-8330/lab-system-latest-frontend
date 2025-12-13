import { useState, useMemo, useContext, useRef } from "react";
import { useReactToPrint } from 'react-to-print';
import { PatientsContext } from "@/context/PatientsContext"; // your context
import { Input } from "@/components/ui/input";
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import { isAdmin } from '@/utils/permissions'; 

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DollarSign,
    Info,
    Notebook,
    NotebookPen,
    NotebookPenIcon,
    Pencil,
    Printer,
    Search,
    Trash2,
    Wallet,
    Users,
    Download,
    Calendar,
    TestTube,
    FileText,
    Eye,
    Crown,
    ArrowBigRight,
    Edit,
    X,
    MessageCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { LabInfoContext } from "@/context/LabnfoContext";
import { AuthContext } from "@/context/AuthProvider";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import axios from "../api/axiosInstance";
import toast from "react-hot-toast";
import { SystemFiltersContext } from '@/context/SystemFiltersContext';
import GlobalDateFilter from './GlobalDateFilter';
import { AlertTriangle } from "lucide-react";

export default function PatientsList() {
    const { patients, fetchPatients } = useContext(PatientsContext);
    const { info } = useContext(LabInfoContext)
    const { user } = useContext(AuthContext)

    const { checkDateFilter } = useContext(SystemFiltersContext);
    const [search, setSearch] = useState("");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState(null);
    const [testSearch, setTestSearch] = useState("");

    const [editOpen, setEditOpen] = useState(false);
    const [patientToEdit, setPatientToEdit] = useState(null);
    const [editedPatient, setEditedPatient] = useState({
        name: '',
        age: '',
        gender: '',
        phone: '',
        fatherHusbandName: '',
        nicNo: ''
    });

    // State for date search
    const [dateSearch, setDateSearch] = useState("");
    const [printPatient, setPrintPatient] = useState(null);
    const reportRef = useRef();

    // Filtering with both text and date search
    const filteredPatients = useMemo(() => {
        return patients.filter((p) => {
            const searchLower = search.toLowerCase();
            const testLower = testSearch.toLowerCase();
            const formattedDate = new Date(p.createdAt).toISOString().split("T")[0];

            const matchesText =
                p.name?.toLowerCase().includes(searchLower) ||
                p.refNo?.toLowerCase().includes(searchLower) ||
                p.caseNo?.toLowerCase().includes(searchLower);

            const matchesDate =
                dateSearch === "" || formattedDate === dateSearch;

            const matchesTest =
                testSearch === "" ||
                (p.tests && p.tests.some((t) => t.testName?.toLowerCase().includes(testLower)));

            // ✅ Check global filter from context
            const matchesGlobalFilter = checkDateFilter(p.createdAt, 'registration');

            return matchesText && matchesDate && matchesTest && matchesGlobalFilter;
        });
    }, [patients, search, dateSearch, testSearch, checkDateFilter]);

    // 🔹 NEW: Function to export filtered patients to CSV
    const exportToCSV = () => {
        if (filteredPatients.length === 0) {
            alert("No data to export");
            return;
        }

        const headers = [
            "Ref No",
            "Name",
            "Age",
            "Gender",
            "Contact",
            "Date",
            "Payment Status",
            "Tests",
            "Total"
        ];

        const rows = filteredPatients.map((p) => [
            p.refNo,
            p.name,
            p.age,
            p.gender,
            p.phone,
            new Date(p.createdAt).toLocaleString(),
            p.paymentStatus,
            p.tests ? p.tests.map((t) => `${t.testName} (${t.price})`).join(", ") : "",
            p.total
        ]);

        const csvContent = [headers, ...rows]
            .map((row) => row.map((cell) => `"${cell}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `patients_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
    };

    const handleDeletePatient = async () => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/patients/delete/${patientToDelete._id}`);
            if (res.data.success) {
                console.log('patient deleted');
                setDeleteOpen(false);
                setPatientToDelete(null);
                fetchPatients();
                toast.success('Deleted Successfully!');
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to delete patient. Please try again.');
        }
    };

    // Print handler using react-to-print
    const handlePrintRegistration = useReactToPrint({
        contentRef: reportRef,
        documentTitle: `Registration_Report_${new Date().toISOString().split('T')[0]}`,
    });

    // Trigger print with patient data
    const handlePrintClick = (patient) => {
        setPrintPatient(patient);
        setTimeout(() => {
            handlePrintRegistration();
        }, 100);
    };


    const handlePrintInNewWindow = (patient) => {
        window.open(`/print-registration/${patient._id}`, '_blank');
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


    const handleWhatsAppShare = (patient) => {
        const formattedPhone = formatPhoneNumber(patient.phone);

        const message = `🏥 *DOCTOR LAB & Imaging Center Sahiwal*

Dear *${patient.name}*,

Thank you for choosing our services! ✅

📋 *Patient No:* ${patient.refNo}
💰 *Amount Paid:* Rs. ${patient.paidAmount || 0}

Your registration is complete. Test results will be available soon. ⏳

*To access your report:*
1. Click the link above
2. Enter your Patient No: *${patient.refNo} & Phone Number from your receipt.*

🔗 *Check Status Online:*
${window.location.origin}/public-report

You can view your registration receipt and check for results anytime using this link.

📞 *For assistance, call:* ${info?.phoneNumber || '0325-0020111'}`;

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





    const openDeleteDialog = (patient) => {
        setPatientToDelete(patient);
        setDeleteOpen(true);
    };

    const openEditDialog = (patient) => {
        setPatientToEdit(patient);
        setEditedPatient({
            name: patient.name || '',
            age: patient.age || '',
            gender: patient.gender || '',
            phone: patient.phone || '',
            fatherHusbandName: patient.fatherHusbandName || '',
            nicNo: patient.nicNo || ''
        });
        setEditOpen(true);
    };

    const handleEditChange = (field, value) => {
        setEditedPatient(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUpdatePatient = async () => {
        try {
            const res = await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/patients/update/${patientToEdit._id}`,
                editedPatient
            );
            if (res.data.success) {
                toast.success('Patient updated successfully!');
                setEditOpen(false);
                setPatientToEdit(null);
                fetchPatients();
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to update patient. Please try again.');
        }
    };

    const handleDeleteTest = async (testId) => {
        try {
            const res = await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/patients/${patientToEdit._id}/test/${testId}`
            );
            if (res.data.success) {
                toast.success('Test deleted successfully!');
                // Update the patientToEdit state to reflect the change
                setPatientToEdit(prev => ({
                    ...prev,
                    tests: prev.tests.filter(t => t._id !== testId)
                }));
                fetchPatients();
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to delete test.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 m-2">
            <div className="max-w-7xl mx-auto">
                <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-0 overflow-hidden p-0">
                    {/* card header */}
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold">Registration Reports</CardTitle>
                                    <p className="text-blue-100 mt-1">Manage registered Patients & Print Reports</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 flex-wrap">
                                {/* ✅ Global Date Filter Component */}
                                <GlobalDateFilter filterType="registration" />

                                {isAdmin(user?.role) ? (
                                    <Button
                                        variant="outline"
                                        className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-xl backdrop-blur-sm font-semibold"
                                        onClick={exportToCSV}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Export CSV <Crown className='text-amber-300' size={17} />
                                        <Badge className="ml-2 bg-white/20 text-white border-0">
                                            {filteredPatients?.length}
                                        </Badge>
                                    </Button>
                                ) : (
                                    <Badge className="bg-white/20 text-white border-0 px-4 py-2 rounded-xl">
                                        <Users className="h-4 w-4 mr-1" />
                                        {filteredPatients?.length} Patients
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="px-8 py-1">
                        {/* Enhanced Search Section */}
                        <div className="mb-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Name/Ref Search */}
                                <div className="relative group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <Search className="inline h-4 w-4 mr-1" />
                                        Search by Name or Reference
                                    </label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Enter name, Case No or Pat No..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="h-12 pl-4 pr-10 border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70"
                                        />
                                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    </div>
                                </div>

                                {/* Test Search */}
                                <div className="relative group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <TestTube className="inline h-4 w-4 mr-1" />
                                        Search by Test Name
                                    </label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Enter test name..."
                                            value={testSearch}
                                            onChange={(e) => setTestSearch(e.target.value)}
                                            className="h-12 pl-4 pr-10 border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70"
                                        />
                                        <TestTube className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    </div>
                                </div>

                                {/* Date Search */}
                                <div className="relative group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <Calendar className="inline h-4 w-4 mr-1" />
                                        Filter by Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dateSearch}
                                        onChange={(e) => setDateSearch(e.target.value)}
                                        className="h-12 w-full px-4 border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Table */}
                        <div className="rounded-2xl overflow-hidden border-2 border-gray-100 shadow-lg bg-white">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150">

                                            <TableHead className="font-bold text-gray-800 py-4">
                                                {/* <FileText className="inline h-4 w-4 mr-2"/> */}
                                                Case No
                                            </TableHead>
                                            <TableHead className="font-bold text-gray-800">
                                                <Users className="inline h-4 w-4 mr-2" />
                                                Name
                                            </TableHead>
                                            <TableHead className="font-bold text-gray-800">
                                                <Calendar className="inline h-4 w-4 mr-2" />
                                                Date
                                            </TableHead>
                                            <TableHead className="font-bold text-gray-800">
                                                <DollarSign className="inline h-4 w-4 mr-2" />
                                                Payment
                                            </TableHead>
                                            <TableHead className="font-bold text-gray-800">
                                                <NotebookPen className="inline h-4 w-4 mr-2" />
                                                Result
                                            </TableHead>
                                            <TableHead className="font-bold text-gray-800">Details</TableHead>
                                            <TableHead className="font-bold text-gray-800">Print</TableHead>
                                            <TableHead className="font-bold text-gray-800">
                                                <Edit className="inline h-4 w-4 mr-2" />
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPatients.length > 0 ? (
                                            filteredPatients.slice().reverse().map((patient, index) => (
                                                <TableRow
                                                    key={patient._id}
                                                    className={`transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
                                                        }`}
                                                >

                                                    <TableCell className="font-semibold text-blue-700 py-4">
                                                        {patient.caseNo}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-gray-900">
                                                        {patient.name}
                                                    </TableCell>
                                                    <TableCell className="text-gray-600 text-sm">
                                                        {new Date(patient.createdAt).toLocaleString()}
                                                    </TableCell>

                                                    <TableCell>
                                                        <Badge
                                                            className={`${patient?.paymentStatus?.toLowerCase() === "not paid"
                                                                ? "bg-red-100 text-red-700 border-red-200"
                                                                : patient?.paymentStatus?.toLowerCase() === "partially paid"
                                                                    ? "bg-orange-100 text-orange-700 border-orange-200"
                                                                    : "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                                } rounded-full px-3 py-1 font-medium border`}
                                                        >
                                                            <DollarSign className="h-3 w-3 mr-1" />
                                                            {patient.paymentStatus}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={`${patient?.resultStatus?.toLowerCase() === "pending"
                                                                ? "bg-orange-100 text-orange-700 border-orange-200"
                                                                : "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                                } rounded-full px-3 py-1 font-medium border`}
                                                        >
                                                            <NotebookPen className="h-3 w-3 mr-1" />
                                                            {patient.resultStatus}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Enhanced View Details Dialog */}
                                                    <TableCell>
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className='bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 rounded-lg transition-all duration-200'
                                                                >
                                                                    <Eye className="h-4 w-4 text-blue-600" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-2xl max-h-[95vh] overflow-auto bg-white rounded-2xl border-0 shadow-2xl">
                                                                <DialogHeader className="pb-4">
                                                                    <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
                                                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                                            <Users className="h-4 w-4 text-blue-600" />
                                                                        </div>
                                                                        Patient Details
                                                                    </DialogTitle>
                                                                </DialogHeader>
                                                                <Separator className="bg-gray-200" />
                                                                <div className="space-y-4 py-4">
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="space-y-3">
                                                                            <p className="flex items-center text-sm">
                                                                                <strong className="text-gray-700">Ref/Patient No:</strong>
                                                                                <span className="ml-2 text-blue-600 font-semibold">{patient.refNo}</span>
                                                                            </p>
                                                                            <p className="flex items-center text-sm">
                                                                                <strong className="text-gray-700">Case No:</strong>
                                                                                <span className="ml-2 text-blue-600 font-semibold">{patient.caseNo}</span>
                                                                            </p>
                                                                            <p className="flex items-center text-sm">
                                                                                <Users className="h-4 w-4 mr-2 text-gray-500" />
                                                                                <strong className="text-gray-700">Name:</strong>
                                                                                <span className="ml-2">{patient.name}</span>
                                                                            </p>
                                                                            <p className="flex items-center text-sm">
                                                                                <strong className="text-gray-700">Age:</strong>
                                                                                <span className="ml-2">{patient.age}</span>
                                                                            </p>
                                                                            <p className="flex items-center text-sm">
                                                                                <strong className="text-gray-700">Gender:</strong>
                                                                                <span className="ml-2">{patient.gender}</span>
                                                                            </p>
                                                                        </div>
                                                                        <div className="space-y-3">
                                                                            <p className="flex items-center text-sm">
                                                                                <strong className="text-gray-700">Phone:</strong>
                                                                                <span className="ml-2">{patient.phone}</span>
                                                                            </p>
                                                                            <p className="flex items-center text-sm">
                                                                                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                                                                <strong className="text-gray-700">Date:</strong>
                                                                                <span className="ml-2 text-sm">{new Date(patient.createdAt).toLocaleString()}</span>
                                                                            </p>
                                                                            <p className="flex items-center text-sm">
                                                                                <strong className="text-gray-700">Registered By:</strong>
                                                                                <span className="ml-2">{patient?.patientRegisteredBy}</span>
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex flex-col gap-4 pt-2">
                                                                        <div className="flex items-center">
                                                                            <strong className="text-gray-700 mr-2">Payment Status:</strong>
                                                                            <Badge
                                                                                className={`${patient?.paymentStatus?.toLowerCase() === "not paid"
                                                                                    ? "bg-red-100 text-red-700 border-red-200"
                                                                                    : patient?.paymentStatus?.toLowerCase() === "partially paid"
                                                                                        ? "bg-orange-100 text-orange-700 border-orange-200"
                                                                                        : "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                                                    } rounded-full px-3 py-1 font-medium border`}
                                                                            >
                                                                                <DollarSign className="h-3 w-3 mr-1" />
                                                                                {patient.paymentStatus}
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="flex items-center">
                                                                            <strong className="text-gray-700 mr-2">Result Status:</strong>
                                                                            <Badge
                                                                                className={`${patient?.resultStatus?.toLowerCase() === "pending"
                                                                                    ? "bg-orange-100 text-orange-700 border-orange-200"
                                                                                    : "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                                                    } rounded-full px-3 py-1 font-medium border`}
                                                                            >
                                                                                <NotebookPen className="h-3 w-3 mr-1" />
                                                                                {patient.resultStatus}
                                                                            </Badge>
                                                                        </div>
                                                                        <div>
                                                                            {/* total tests */}
                                                                            <div className="flex items-center">
                                                                                <TestTube className="h-4 w-4 mr-2 text-gray-500" />
                                                                                <strong className="text-gray-700">Total Tests:</strong>
                                                                                <span className="ml-2 font-semibold text-gray-700">{patient?.tests?.length}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            {/* total fees */}
                                                                            <div className="flex items-center">
                                                                                <Wallet className="h-4 w-4 mr-2 text-gray-500" />
                                                                                <strong className="text-gray-700">Total Amount:</strong>
                                                                                <span className="ml-2 font-semibold text-gray-700">Rs.{patient.total}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Test Fields/Parameters Section - Add this after the tests list */}
                                                                    {/* {patient.tests && patient.tests.length > 0 && (
                                                                        <div className="">
                                                                            <div className="space-y-4">
                                                                                {patient.tests.map((t, idx) => (
                                                                                    t.testId?.fields && t.testId.fields.length > 0 && (
                                                                                        <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                                                                                            <div className="flex items-center mb-3">
                                                                                                <TestTube className="h-4 w-4 mr-2 text-blue-600" />
                                                                                                <strong className="text-gray-800">{t.testName} - Parameters:</strong>
                                                                                                <Badge className='bg-blue-100 text-blue-800 rounded-full px-2 py-1 ml-2 text-xs'>
                                                                                                    {t.testId.fields.length} fields
                                                                                                </Badge>
                                                                                            </div>
                                                                                            <ol className="space-y-2 list-decimal pl-5">
                                                                                                {t.testId.fields.map((f, fi) => (
                                                                                                    <li key={fi} className="text-sm text-gray-700 pl-2">
                                                                                                        <span className="font-medium">{f.fieldName}</span>
                                                                                                        {(f.unit || f.range) && (
                                                                                                            <span className="text-gray-500 text-xs ml-2">
                                                                                                                {f.unit && `(${f.unit})`}
                                                                                                                {f.range && ` • Range: ${f.range}`}
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </li>
                                                                                                ))}
                                                                                            </ol>
                                                                                        </div>
                                                                                    )
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )} */}

                                                                    {patient.tests && patient.tests.length > 0 && (
                                                                        <div className="">
                                                                            <div className="flex items-center mb-4">
                                                                                <TestTube className="h-5 w-5 mr-2 text-blue-600" />
                                                                                <strong className="text-gray-800 text-lg">Tests & Parameters</strong>
                                                                                <Badge className='bg-blue-100 text-blue-800 rounded-full px-3 py-1 ml-2'>
                                                                                    {patient.tests.length} tests
                                                                                </Badge>
                                                                            </div>
                                                                            <div className="space-y-4">
                                                                                {patient.tests.map((t, idx) => (
                                                                                    <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                                                                                        {/* Test Header with Name and Price */}
                                                                                        <div className="flex justify-between items-center mb-3 pb-3 border-b border-blue-200">
                                                                                            <div>
                                                                                                <h4 className="font-semibold text-lg text-gray-800">
                                                                                                    {t.testName}
                                                                                                </h4>
                                                                                                {t.price && (
                                                                                                    <span className="text-sm text-green-600 font-medium">Rs.{t.price}</span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* Test Details (Code, Specimen, Performed, Reported) */}
                                                                                        {(t?.testId?.testCode || t?.testId?.specimen || t?.testId?.performed || t?.testId?.reported) && (
                                                                                            <div className="bg-white/60 rounded-lg p-3 mb-3">
                                                                                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                                                                    {t.testId?.testCode && (
                                                                                                        <div className="flex items-start">
                                                                                                            <strong className="text-gray-600 mr-2 min-w-[70px]">Code:</strong>
                                                                                                            <span className="text-gray-800">{t.testId.testCode}</span>
                                                                                                        </div>
                                                                                                    )}
                                                                                                    {t.testId?.specimen && (
                                                                                                        <div className="flex items-start">
                                                                                                            <strong className="text-gray-600 mr-2 min-w-[70px]">Specimen:</strong>
                                                                                                            <span className="text-gray-800">{t.testId.specimen}</span>
                                                                                                        </div>
                                                                                                    )}
                                                                                                    {t.testId?.performed && (
                                                                                                        <div className="flex items-start">
                                                                                                            <strong className="text-gray-600 mr-2 min-w-[70px]">Performed:</strong>
                                                                                                            <span className="text-gray-800">{t.testId.performed}</span>
                                                                                                        </div>
                                                                                                    )}
                                                                                                    {t.testId?.reported && (
                                                                                                        <div className="flex items-start">
                                                                                                            <strong className="text-gray-600 mr-2 min-w-[70px]">Reported:</strong>
                                                                                                            <span className="text-gray-800">{t.testId.reported}</span>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        )}

                                                                                        {/* Test Parameters/Fields */}
                                                                                        {t.testId?.fields && t.testId.fields.length > 0 && (
                                                                                            <div>
                                                                                                <div className="flex items-center mb-2">
                                                                                                    <strong className="text-gray-700 text-sm">Parameters:</strong>
                                                                                                    <Badge className='bg-blue-100 text-blue-800 rounded-full px-2 py-1 ml-2 text-xs'>
                                                                                                        {t.testId.fields.length} fields
                                                                                                    </Badge>
                                                                                                </div>
                                                                                                <ol className="space-y-2 list-decimal pl-5">
                                                                                                    {t.testId.fields.map((f, fi) => (
                                                                                                        <li key={fi} className="bg-white/60 rounded-lg p-2 text-sm text-gray-700">
                                                                                                            <span className="font-medium">{f.fieldName}</span>
                                                                                                            {(f.unit || f.range) && (
                                                                                                                <span className="text-gray-500 text-xs ml-2">
                                                                                                                    {f.unit && `(${f.unit})`}
                                                                                                                    {f.range && ` • Range: ${f.range}`}
                                                                                                                </span>
                                                                                                            )}
                                                                                                        </li>
                                                                                                    ))}
                                                                                                </ol>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </DialogContent>

                                                        </Dialog>
                                                    </TableCell>

                                                    <TableCell>
                                                        <div className="flex gap-2 ">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className='bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 text-green-700 rounded-lg transition-all duration-200'
                                                                onClick={() => handlePrintClick(patient)}
                                                            >
                                                                <Printer className="h-4 w-4 mr-1" />
                                                                Print
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 text-green-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                                                onClick={() => handlePrintInNewWindow(patient)}
                                                            >
                                                                <ArrowBigRight className="h-4 w-4 mr-1" />
                                                                New Window
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 text-green-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                                                onClick={() => handleWhatsAppShare(patient)}
                                                                title="Share registration via WhatsApp"
                                                            >
                                                                <svg
                                                                    className="h-4 w-4 text-green-600"
                                                                    viewBox="0 0 24 24"
                                                                    fill="currentColor"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                >
                                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                                </svg>
                                                                {/* <MessageCircle className="h-4 w-4 text-green-600" /> */}
                                                                Share
                                                            </Button>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            {/* Edit Button */}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 rounded-lg transition-all duration-200"
                                                                onClick={() => openEditDialog(patient)}
                                                            >
                                                                <Edit className="h-4 w-4 text-blue-600" />
                                                            </Button>

                                                            {/* Delete Button - Admin Only */}
                                                            {isAdmin(user?.role) && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300 rounded-lg transition-all duration-200"
                                                                    onClick={() => openDeleteDialog(patient)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>


                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan="9" className="text-center py-12">
                                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                                        <Users className="h-12 w-12 mb-4 text-gray-300" />
                                                        <p className="text-lg font-medium mb-1">No patients found</p>
                                                        <p className="text-sm">Try adjusting your search criteria</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="max-w-md bg-white rounded-2xl border-0 shadow-2xl">
                    <DialogHeader className="pb-4">
                        <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                            </div>
                            Delete Patient
                        </DialogTitle>
                    </DialogHeader>
                    <Separator className="bg-gray-200" />
                    <div className="py-4">
                        <div className="mb-4">
                            <p className="text-gray-600">
                                Are you sure you want to delete patient{" "}
                                <span className="font-semibold text-gray-900">{patientToDelete?.name}</span>
                                {" "}(Ref: {patientToDelete?.refNo})?
                            </p>
                            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                <p className="text-sm text-red-700 flex items-center">
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    This action cannot be undone. All associated test results will also be deleted.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setDeleteOpen(false)}
                                className="rounded-lg"
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg"
                                onClick={handleDeletePatient}
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete Patient
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>


            {/* Edit Patient Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-3xl bg-white rounded-2xl border-0 shadow-2xl max-h-[95vh] overflow-auto">
                    <DialogHeader className="pb-4">
                        <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                <Edit className="h-4 w-4 text-blue-600" />
                            </div>
                            Edit Patient Details
                        </DialogTitle>
                    </DialogHeader>
                    <Separator className="bg-gray-200" />

                    {patientToEdit && (
                        <div className="py-4 space-y-6">
                            {/* Patient Info Section */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-800 flex items-center">
                                    <Users className="h-4 w-4 mr-2" />
                                    Patient Information
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Patient Name *
                                        </label>
                                        <Input
                                            value={editedPatient.name}
                                            onChange={(e) => handleEditChange('name', e.target.value)}
                                            className="border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Age
                                        </label>
                                        <Input
                                            type="number"
                                            value={editedPatient.age}
                                            onChange={(e) => handleEditChange('age', e.target.value)}
                                            className="border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Gender
                                        </label>
                                        <select
                                            value={editedPatient.gender}
                                            onChange={(e) => handleEditChange('gender', e.target.value)}
                                            className="w-full h-10 px-3 border-2 border-gray-200 focus:border-blue-500 rounded-lg bg-white"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number
                                        </label>
                                        <Input
                                            value={editedPatient.phone}
                                            onChange={(e) => handleEditChange('phone', e.target.value)}
                                            className="border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Father/Husband Name
                                        </label>
                                        <Input
                                            value={editedPatient.fatherHusbandName}
                                            onChange={(e) => handleEditChange('fatherHusbandName', e.target.value)}
                                            className="border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            NIC Number
                                        </label>
                                        <Input
                                            value={editedPatient.nicNo}
                                            onChange={(e) => handleEditChange('nicNo', e.target.value)}
                                            className="border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-gray-200" />

                            {/* Tests Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-800 flex items-center">
                                        <TestTube className="h-4 w-4 mr-2" />
                                        Registered Tests
                                    </h3>
                                    <Badge className="bg-blue-100 text-blue-800 rounded-full px-3 py-1">
                                        {patientToEdit.tests?.length || 0} tests
                                    </Badge>
                                </div>

                                {patientToEdit.tests && patientToEdit.tests.length > 0 ? (
                                    <div className="space-y-2">
                                        {patientToEdit.tests.map((test, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{test.testName}</p>
                                                    <p className="text-sm text-gray-600">Rs.{test.price}</p>
                                                </div>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300"
                                                        >
                                                            <X className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className=" bg-white rounded-2xl border-0 shadow-2xl">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Test</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete "{test.testName}" from this patient's registration?
                                                                This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel >Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteTest(test._id)}
                                                                className="bg-red-600 hover:bg-red-700 border text-white"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <TestTube className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>No tests found</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setEditOpen(false)}
                                    className="rounded-lg"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg"
                                    onClick={handleUpdatePatient}
                                >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Update Patient
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ========================================
    HIDDEN PRINT TEMPLATE FOR REGISTRATION
    ======================================== */}
            {printPatient && (
                <div style={{ display: 'none' }}>
                    <div ref={reportRef} className="bg-white">
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
                            LAB COPY
                        ======================================== */}
                        <div className="mb-2 pb-6 border-b-2 border-dashed border-gray-600">


                            {/* LAB COPY Header */}
                            <div className="mb-2">
                                <div className="text-center mb-3">
                                    <div className="inline-block px-6 py-1">
                                        <p className="text-sm font-bold text-blue-900">LAB COPY</p>
                                    </div>
                                </div>

                                <div className="flex items-start justify-between">
                                    {/* Left: Logo and Lab Info */}
                                    <div className="flex items-start">
                                        {info?.logoUrl && (
                                            <img
                                                src={info.logoUrl}
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

                            {/* Patient Info in ONE Box */}
                            <div className="border border-gray-800 p-2 mb-3 bg-gray-50">
                                <table className="w-full text-xs">
                                    <tbody>
                                        <tr>
                                            <td className="font-semibold py-0.5 w-1/4">Patient's Name</td>
                                            <td className="py-0.5 w-1/4">{printPatient.name}</td>
                                            <td className="font-semibold py-0.5 w-1/4">Reg. Date</td>
                                            <td className="py-0.5 w-1/4">{new Date(printPatient.createdAt).toLocaleDateString('en-GB')} {new Date(printPatient.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
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
                                            <td className="py-0.5">{printPatient.tests?.[0]?.testId?.specimen || 'Taken in Lab'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-0.5">Contact No</td>
                                            <td className="py-0.5">{printPatient.phone}</td>
                                            <td className="font-semibold py-0.5">Consultant</td>
                                            <td className="py-0.5">SELF</td>
                                        </tr>
                                        <tr>

                                            <td className="font-semibold py-0.5">NIC No</td>
                                            <td className="py-0.5">{printPatient?.nicNo || "-"}</td>

                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Tests Table */}
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

                            {/* Totals */}
                            <div className="flex justify-end">
                                <div className="text-xs space-y-0.5 min-w-[200px]">
                                    <div className="flex justify-between font-semibold">
                                        <span>Net Amount:</span>
                                        <span>Rs.{printPatient.total}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ========================================
                            PATIENT COPY
                        ======================================== */}
                        <div className="pt-4" style={{ pageBreakInside: 'avoid' }}>
                            {/* PATIENT COPY Header */}
                            <div className="mb-2">
                                <div className="text-center mb-3">
                                    <div className="inline-block px-6 py-1">
                                        <p className="text-sm font-bold text-blue-900">PATIENT COPY</p>
                                    </div>
                                </div>

                                <div className="flex items-start justify-between">
                                    {/* Left: Logo and Lab Info */}
                                    <div className="flex items-start">
                                        {info.logoUrl && (
                                            <img
                                                src={info.logoUrl}
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


                            {/* Patient Info in ONE Box */}
                            <div className="border border-gray-800 p-2 mb-3 bg-gray-50">
                                <table className="w-full text-xs">
                                    <tbody>
                                        <tr>
                                            <td className="font-semibold py-0.5 w-1/4">Patient's Name</td>
                                            <td className="py-0.5 w-1/4">{printPatient.name}</td>
                                            <td className="font-semibold py-0.5 w-1/4">Reg. Date</td>
                                            <td className="py-0.5 w-1/4">{new Date(printPatient.createdAt).toLocaleDateString('en-GB')} {new Date(printPatient.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
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
                                            <td className="py-0.5">{printPatient.tests?.[0]?.testId?.specimen || 'Taken in Lab'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-0.5">Contact No</td>
                                            <td className="py-0.5">{printPatient.phone}</td>
                                            <td className="font-semibold py-0.5">Consultant</td>
                                            <td className="py-0.5">SELF</td>
                                        </tr>
                                        <tr>

                                            <td className="font-semibold py-0.5">NIC No</td>
                                            <td className="py-0.5">{printPatient?.nicNo || "-"}</td>

                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Tests Table */}
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

                            {/* Totals Section */}
                            <div className="flex justify-end mb-3">
                                <div className="text-xs space-y-0.5 min-w-[200px]">
                                    {/* Total Amount */}
                                    <div className="flex justify-between border-b border-gray-300 pb-0.5">
                                        <span>Total Amount:</span>
                                        <span>Rs.{printPatient.total || 0}</span>
                                    </div>

                                    {/* Discount (if exists) */}
                                    {printPatient.discountAmount > 0 && (
                                        <div className="flex justify-between border-b border-gray-300 pb-0.5">
                                            <span>Discount {printPatient.discountPercentage > 0 && `(${printPatient.discountPercentage}%)`}:</span>
                                            <span>- Rs.{printPatient.discountAmount}</span>
                                        </div>
                                    )}

                                    {/* Net Amount */}
                                    <div className="flex justify-between font-semibold border-b border-gray-300 pb-0.5">
                                        <span>Net Amount:</span>
                                        <span>Rs.{printPatient.netTotal || printPatient.total}</span>
                                    </div>

                                    {/* Paid Amount */}
                                    <div className="flex justify-between border-b border-gray-300 pb-0.5">
                                        <span>Paid:</span>
                                        <span>Rs.{printPatient.paidAmount || (printPatient.paymentStatus === 'Paid' ? (printPatient.netTotal || printPatient.total) : 0)}</span>
                                    </div>

                                    {/* Due Amount */}
                                    <div className="flex justify-between font-semibold">
                                        <span>Due Amount:</span>
                                        <span>Rs.{printPatient.dueAmount || (printPatient.paymentStatus === 'Paid' ? 0 : (printPatient.netTotal || printPatient.total))}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-400 pt-2">
                                <p className="text-center text-xs font-semibold mb-2">Computerized Receipt, No Signature(s) Required</p>
                                <div className="text-center text-xs text-gray-700 space-y-0.5">
                                    <p className="font-medium">
                                        Phone: {info?.phoneNumber || '0325-0020111'}
                                    </p>
                                    <p className="text-[10px] leading-tight">
                                        {info?.address || 'Opposite THQ Hospital Near Punjab Pharmacy Sahiwal, District Sargodha'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}