
import { useState, useMemo, useContext, useEffect } from "react";
import { PatientsContext } from "@/context/PatientsContext";
import PaymentMethodDialog from './PaymentMethodDialog';
import { AuthContext } from "@/context/AuthProvider";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Check,
    DollarSign,
    Info,
    NotebookPenIcon,
    Search,
    CreditCard,
    Users,
    Calendar,
    TestTube,
    Eye,
    CheckCircle,
    Clock,
    FileText,
    Phone,
    Percent,
    Banknote
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import axios from "../api/axiosInstance";
import toast from "react-hot-toast";
import { SystemFiltersContext } from '@/context/SystemFiltersContext';
import GlobalDateFilter from './GlobalDateFilter';

export default function PaymentComponent() {
    const { patients, fetchPatients } = useContext(PatientsContext);
    const { user } = useContext(AuthContext);
    const { checkDateFilter } = useContext(SystemFiltersContext);

    const [search, setSearch] = useState("");
    const [testSearch, setTestSearch] = useState("");
    const [dateSearch, setDateSearch] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("All");

    // ========== PAYMENT METHOD DIALOG STATE ==========
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    // =================================================


    useEffect(() => {
        fetchPatients();
    }, []);

    const filteredPatients = useMemo(() => {
        return patients.filter((p) => {
            const searchLower = search.toLowerCase();
            const testLower = testSearch.toLowerCase();
            const formattedDate = new Date(p.createdAt).toISOString().split("T")[0];

            const matchesText =
                p.name?.toLowerCase().includes(searchLower) ||
                p.refNo?.toLowerCase().includes(searchLower) ||
                p.caseNo?.toLowerCase().includes(searchLower);

            const matchesDate = dateSearch === "" || formattedDate === dateSearch;

            const matchesTest =
                testSearch === "" ||
                (p.tests && p.tests.some((t) => t.testName?.toLowerCase().includes(testLower)));

            const matchesPayment =
                paymentFilter === "All" || p.paymentStatus === paymentFilter;

            // ✅ Check global filter from context
            const matchesGlobalFilter = checkDateFilter(p.createdAt, 'payment');

            return matchesText && matchesDate && matchesTest && matchesPayment && matchesGlobalFilter;
        });
    }, [patients, search, testSearch, dateSearch, paymentFilter, user, checkDateFilter]);

    const handlePaymentUpdate = async (id, patient) => {
        try {
            // Calculate the amount to be paid (net total if discount exists, otherwise total)
            const amountToPay = patient.netTotal || patient.total;

            const res = await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/patients/${id}/payment`,
                {
                    paymentStatus: "Paid",
                    paymentStatusUpdatedBy: user.name,
                    paidAmount: amountToPay, // Set paid amount
                    dueAmount: 0 // Clear due amount
                }
            );

            if (res.status === 200) {
                toast.success('Payment Status Updated!')
                fetchPatients();
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating payment status");
        }
    };


    // ========== MARK REMAINING AS CASH (Quick Action) ==========
    const handleMarkRemainingAsCash = async (patient) => {
        try {
            const remainingDue = patient.dueAmount;

            // Calculate new totals
            const newPaidAmount = patient.paidAmount + remainingDue;
            const newCashAmount = patient.cashAmount + remainingDue; // ADD to existing cash
            const newBankAmount = patient.bankAmount; // Keep bank amount same

            const res = await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/patients/${patient._id}/payment`,
                {
                    paymentStatus: "Paid",
                    paymentStatusUpdatedBy: user.name,
                    paidAmount: newPaidAmount,
                    dueAmount: 0,
                    cashAmount: newCashAmount,
                    bankAmount: newBankAmount
                }
            );

            if (res.status === 200) {
                toast.success(`Rs.${remainingDue} marked as cash payment`);
                fetchPatients();
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating payment");
        }
    };

    // ========== ADD PAYMENT (Detailed with Cash/Bank/Split) ==========
    const handleAddPayment = async (patient, paymentData) => {
        try {
            const res = await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/patients/${patient._id}/payment`,
                {
                    paymentStatus: paymentData.paymentStatus,
                    paymentStatusUpdatedBy: user.name,
                    paidAmount: paymentData.paidAmount,
                    dueAmount: paymentData.dueAmount,
                    cashAmount: paymentData.cashAmount,
                    bankAmount: paymentData.bankAmount
                }
            );

            if (res.status === 200) {
                toast.success('Payment recorded successfully!');
                fetchPatients();
            }
        } catch (error) {
            console.error(error);
            toast.error("Error recording payment");
        }
    };
    // ============================================================


    // Calculate payment statistics
    const paymentStats = useMemo(() => {
        const stats = {
            total: filteredPatients.length,
            paid: filteredPatients.filter(p => p.paymentStatus === "Paid").length,
            unpaid: filteredPatients.filter(p => p.paymentStatus === "Not Paid").length,
            totalAmount: filteredPatients.reduce((sum, p) => sum + (p.total || 0), 0),
            paidAmount: filteredPatients.filter(p => p.paymentStatus === "Paid").reduce((sum, p) => sum + (p.total || 0), 0)
        };
        return stats;
    }, [filteredPatients]);

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


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 p-6">
            <div className="max-w-7xl mx-auto">


                {/* Main Content Card */}
                <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-0 overflow-hidden p-0">
                    {/* Enhanced Header */}
                    <CardHeader className="bg-gradient-to-r from-green-700 to-emerald-600 py-3 text-white">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div style={{
                                display: 'flex',             // fallback for flex
                                alignItems: 'center',        // fallback for items-center
                                gap: '12px'                  // fallback for gap-3
                            }} className="flex items-center gap-3">
                                <div style={{
                                    display: 'flex',            // fallback flex
                                    justifyContent: 'center',   // fallback justify-center
                                    alignItems: 'center',       // fallback items-center
                                    width: '48px',              // fallback w-12
                                    height: '48px',             // fallback h-12
                                    backgroundColor: '#008000', // fallback for bg-white/20
                                    borderRadius: '0.5rem'      // fallback rounded-xl
                                }} className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl">
                                    <CreditCard className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle style={{
                                        fontSize: '1.5rem',       // fallback for text-2xl
                                        fontWeight: '700',        // fallback for font-bold
                                        color: '#ffffff',         // fallback in case Tailwind fails
                                        margin: '0'
                                    }} className="text-2xl font-bold">Payment Management</CardTitle>
                                    <p style={{
                                        fontSize: '0.875rem',     // fallback for text-sm
                                        color: '#68d391',         // fallback for green-100
                                        marginTop: '4px'          // fallback for mt-1
                                    }} className="text-green-100 mt-1">Track and manage patient payments</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* ✅ Global Date Filter Component */}
                                <GlobalDateFilter filterType="payment" />

                                <Badge className="bg-white/20 text-white border-0 px-4 py-2 rounded-xl">
                                    <FileText className="h-4 w-4 mr-1" />
                                    {filteredPatients?.length} Records
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="px-8 py-3">
                        {/* Enhanced Filter Section */}
                        <div className="mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Name/Ref Search */}
                                <div className="relative group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <Search className="inline h-4 w-4 mr-1" />
                                        Search Patient
                                    </label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Name, Case No or Pat No..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="h-12 pl-4 pr-10 border-2 border-gray-200 focus:border-emerald-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70"
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
                                            value={testSearch}
                                            onChange={(e) => setTestSearch(e.target.value)}
                                            className="h-12 pl-4 pr-10 border-2 border-gray-200 focus:border-emerald-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70"
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
                                        className="h-12 w-full px-4 border-2 border-gray-200 focus:border-emerald-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70 focus:outline-none"
                                    />
                                </div>

                                {/* Payment Filter */}
                                <div className="relative group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <CreditCard className="inline h-4 w-4 mr-1" />
                                        Payment Status
                                    </label>
                                    <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                                        <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-emerald-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent className='bg-white border-0 shadow-xl rounded-xl'>
                                            <SelectItem className='hover:bg-emerald-50 rounded-lg m-1' value="All">All Status</SelectItem>
                                            <SelectItem className='hover:bg-emerald-50 rounded-lg m-1' value="Not Paid">Not Paid</SelectItem>
                                            <SelectItem className='hover:bg-emerald-50 rounded-lg m-1' value="Partially Paid">Partially Paid</SelectItem>
                                            <SelectItem className='hover:bg-emerald-50 rounded-lg m-1' value="Paid">Paid</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                                <FileText className="inline h-4 w-4 mr-2" />
                                                Case No
                                            </TableHead>
                                            {/* <TableHead className="font-bold text-gray-800 py-4">
                                                <FileText className="inline h-4 w-4 mr-2" />
                                                Pat No
                                            </TableHead> */}
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
                                                Amount
                                            </TableHead>
                                            <TableHead className="font-bold text-gray-800">
                                                <Percent className="inline h-4 w-4 mr-2" />
                                                Discount
                                            </TableHead>
                                            <TableHead className="font-bold text-gray-800">
                                                <DollarSign className="inline h-4 w-4 mr-2" />
                                                Payment
                                            </TableHead>
                                            <TableHead className="font-bold text-gray-800">
                                                <NotebookPenIcon className="inline h-4 w-4 mr-2" />
                                                Result
                                            </TableHead>
                                            <TableHead className="font-bold text-gray-800">Action</TableHead>
                                            <TableHead className="font-bold text-gray-800">Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPatients.length > 0 ? (
                                            filteredPatients.slice().reverse().map((patient, index) => {
                                                return (
                                                    <TableRow
                                                        key={patient._id}
                                                        className={`transition-all duration-200 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}
                                                    >
                                                        <TableCell className="font-semibold text-emerald-700 py-4">
                                                            {patient.caseNo}
                                                        </TableCell>
                                                        {/* <TableCell className="font-semibold text-emerald-700 py-4">
                                                            {patient.refNo}
                                                        </TableCell> */}
                                                        <TableCell className="font-medium text-gray-900">
                                                            {patient.name}
                                                        </TableCell>
                                                        <TableCell className="text-gray-600 text-sm">
                                                            {new Date(patient.createdAt).toLocaleString()}
                                                        </TableCell>

                                                        {/* Amount Column */}
                                                        <TableCell className="text-gray-900 font-semibold">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm">Total: Rs.{patient.total || 0}</span>
                                                                {patient.discountAmount > 0 && (
                                                                    <span className="text-xs text-green-600">Net: Rs.{patient.netTotal || 0}</span>
                                                                )}
                                                            </div>
                                                        </TableCell>

                                                        {/* Discount Column */}
                                                        <TableCell>
                                                            {patient.discountAmount > 0 ? (
                                                                <Badge className="bg-purple-100 text-purple-800 rounded-full px-3 py-1 font-medium">
                                                                    <Percent className="h-3 w-3 mr-1" />
                                                                    Rs.{patient.discountAmount}
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-gray-400 text-sm">No Discount</span>
                                                            )}
                                                        </TableCell>

                                                        {/* Payment Status Column */}
                                                        {/* Payment Status Column */}
                                                        <TableCell>
                                                            <Badge
                                                                className={`${patient?.paymentStatus?.toLowerCase() === "not paid"
                                                                    ? "bg-gradient-to-r from-red-400 to-red-500 text-white"
                                                                    : patient?.paymentStatus?.toLowerCase() === "partially paid"
                                                                        ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                                                                        : "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                                                                    } rounded-full px-3 py-1 font-medium shadow-sm`}
                                                                style={{
                                                                    backgroundColor:
                                                                        patient?.paymentStatus?.toLowerCase() === "not paid"
                                                                            ? "#EF4444"
                                                                            : patient?.paymentStatus?.toLowerCase() === "partially paid"
                                                                                ? "#F59E0B"
                                                                                : "#10B981"
                                                                }}
                                                            >
                                                                <DollarSign className="h-3 w-3 mr-1" />
                                                                {patient.paymentStatus}
                                                            </Badge>

                                                            {/* Minimal Cash/Bank Display - Only if payment exists */}
                                                            {patient?.paidAmount > 0 && (
                                                                <div className="text-xs text-green-600 mt-1">
                                                                    Cash: {patient?.cashAmount ? patient.cashAmount : patient.paidAmount}
                                                                    {patient?.bankAmount !== undefined && patient.bankAmount > 0 && (
                                                                        <> | Bank: {patient.bankAmount}</>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {patient.dueAmount > 0 && patient?.paymentStatus?.toLowerCase() !== "paid" && (
                                                                <div className="text-xs text-red-600 mt-1">Due: Rs.{patient.dueAmount}</div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                style={{
                                                                    backgroundColor:
                                                                        patient?.resultStatus?.toLowerCase() === "pending"
                                                                            ? "#F59E0B"
                                                                            : "#10B981"
                                                                }}
                                                                className={`${patient?.resultStatus?.toLowerCase() === "pending"
                                                                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                                                                    : "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                                                                    } rounded-full px-3 py-1 font-medium shadow-sm`}
                                                            >
                                                                <NotebookPenIcon className="h-3 w-3 mr-1" />
                                                                {patient.resultStatus}
                                                            </Badge>
                                                        </TableCell>
                                                        {/* <TableCell>
                                                            {patient?.paymentStatus.toLowerCase() !== "paid" ? (
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <Button
                                                                            style={{ backgroundColor: "#10B981" }}
                                                                            size="sm"
                                                                            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                                                        >
                                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                                            Mark as Paid
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="bg-white rounded-2xl border border-gray-700 shadow-2xl max-w-md">
                                                                        <DialogHeader className="pb-4">
                                                                            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
                                                                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                                                                                    <CreditCard className="h-4 w-4 text-emerald-600" />
                                                                                </div>
                                                                                Confirm Payment Update
                                                                            </DialogTitle>
                                                                        </DialogHeader>
                                                                        <Separator className="bg-gray-200" />
                                                                        <div className="py-4">
                                                                            <p className="text-gray-600 mb-4">
                                                                                Are you sure you want to mark the payment as complete for
                                                                                <span className="font-semibold text-gray-900"> {patient.name}</span> as user
                                                                                <span className="font-semibold text-emerald-600"> {user.name}</span>?
                                                                            </p>
                                                                            <div className="bg-gray-50 p-4 rounded-xl mb-4 space-y-2">
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                                                                                    <span className="text-base font-semibold text-gray-900">Rs.{patient.total || 0}</span>
                                                                                </div>
                                                                                {patient.discountAmount > 0 && (
                                                                                    <>
                                                                                        <div className="flex justify-between items-center">
                                                                                            <span className="text-sm font-medium text-purple-700">Discount:</span>
                                                                                            <span className="text-base font-semibold text-purple-600">
                                                                                                - Rs.{patient.discountAmount}
                                                                                                {patient.discountPercentage > 0 && ` (${patient.discountPercentage}%)`}
                                                                                            </span>
                                                                                        </div>
                                                                                        <Separator className="bg-gray-300" />
                                                                                        <div className="flex justify-between items-center">
                                                                                            <span className="text-sm font-medium text-emerald-700">Net Amount to Pay:</span>
                                                                                            <span className="text-xl font-bold text-emerald-600">Rs.{patient.netTotal || patient.total}</span>
                                                                                        </div>
                                                                                    </>
                                                                                )}
                                                                                {!patient.discountAmount && (
                                                                                    <div className="flex justify-between items-center">
                                                                                        <span className="text-sm font-medium text-emerald-700">Amount to Pay:</span>
                                                                                        <span className="text-xl font-bold text-emerald-600">Rs.{patient.total}</span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex justify-end gap-3">

                                                                                <Button
                                                                                    className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg"
                                                                                    onClick={() => handlePaymentUpdate(patient._id, patient)}
                                                                                >
                                                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                                                    Yes, Mark as Paid
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            ) : (
                                                                <div className="flex items-center text-green-600 text-sm">
                                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                                    Payment Done
                                                                </div>
                                                            )}
                                                        </TableCell> */}
                                                        <TableCell>
                                                            {/* ========== NEW: TWO-BUTTON APPROACH FOR UNPAID/PARTIAL ========== */}
                                                            {patient?.paymentStatus.toLowerCase() !== "paid" ? (
                                                                <div className="flex gap-2">
                                                                    {/* Button 1: Quick Cash Payment (Most Common) */}
                                                                    <Dialog>
                                                                        <DialogTrigger asChild>
                                                                            <Button
                                                                                size="sm"
                                                                                style={{ backgroundColor: "#10B981", borderColor: "#10B981", color: "#ffffff" }}
                                                                                className=" hover:scale-105 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                                                                                title="Mark remaining amount as cash payment (Quick action)"
                                                                            >
                                                                                <Banknote className="h-4 w-4 mr-1" />
                                                                                Cash
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                        <DialogContent className="bg-white rounded-2xl border border-gray-700 shadow-2xl max-w-md">
                                                                            <DialogHeader className="pb-4">
                                                                                <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
                                                                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                                                                        <Banknote className="h-4 w-4 text-green-600" />
                                                                                    </div>
                                                                                    Mark as Paid (Cash)
                                                                                </DialogTitle>
                                                                            </DialogHeader>
                                                                            <Separator className="bg-gray-200" />
                                                                            <div className="py-4">
                                                                                <p className="text-gray-600 mb-4">
                                                                                    Mark the remaining amount as <strong className="text-green-600">cash payment</strong> for
                                                                                    <span className="font-semibold text-gray-900"> {patient.name}</span>?
                                                                                </p>
                                                                                <div className="bg-gray-50 p-4 rounded-xl mb-4 space-y-2">
                                                                                    <div className="flex justify-between items-center">
                                                                                        <span className="text-sm font-medium text-gray-700">Net Total:</span>
                                                                                        <span className="text-base font-semibold text-gray-900">Rs.{patient?.netTotal || 0}</span>
                                                                                    </div>
                                                                                    <div className="flex justify-between items-center">
                                                                                        <span className="text-sm font-medium text-gray-700">Already Paid:</span>
                                                                                        <span className="text-base font-semibold text-green-600">Rs.{patient?.paidAmount || 0}</span>
                                                                                    </div>
                                                                                    <Separator className="bg-gray-300" />
                                                                                    <div className="flex justify-between items-center">
                                                                                        <span className="text-sm font-medium text-green-700">Amount to Pay (Cash):</span>
                                                                                        <span className="text-xl font-bold text-green-600">Rs.{patient?.dueAmount || 0}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex justify-end gap-3">
                                                                                    <Button
                                                                                        variant="outline"
                                                                                        onClick={() => { }}
                                                                                        className="border-gray-300 hover:bg-gray-50"
                                                                                    >
                                                                                        Cancel
                                                                                    </Button>
                                                                                    <Button
                                                                                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg"
                                                                                        onClick={() => handleMarkRemainingAsCash(patient)}
                                                                                    >
                                                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                                                        Yes, Mark as Cash
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        </DialogContent>
                                                                    </Dialog>

                                                                    {/* Button 2: Detailed Payment (Bank/Split Options) */}
                                                                    <Button
                                                                        size="sm"
                                                                        style={{ backgroundColor: "#3B82F6", borderColor: "#3B82F6", color: "#ffffff" }}
                                                                        variant="outline"
                                                                        className="border-2 border-blue-500 text-blue-700 hover:scale-105 rounded-lg font-semibold transition-all duration-200"
                                                                        onClick={() => {
                                                                            setSelectedPatient(patient);
                                                                            setPaymentDialogOpen(true);
                                                                        }}
                                                                        title="Add payment with bank/split options (Detailed)"
                                                                    >
                                                                        <CreditCard className="h-4 w-4 mr-1" />
                                                                        Bank/Split
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center text-green-600 text-sm font-semibold">
                                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                                    Payment Done
                                                                </div>
                                                            )}
                                                            {/* ================================================================= */}
                                                        </TableCell>

                                                        {/* Enhanced Details Dialog */}
                                                        <TableCell>
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 rounded-lg transition-all duration-200"
                                                                    >
                                                                        <Eye className="h-4 w-4 text-blue-600" />
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="max-w-2xl max-h-[95vh] overflow-auto bg-white rounded-2xl border border-gray-700 shadow-2xl">
                                                                    <DialogHeader className="pb-4">
                                                                        <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
                                                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                                                <Users className="h-4 w-4 text-blue-600" />
                                                                            </div>
                                                                            Patient Payment Details
                                                                        </DialogTitle>
                                                                    </DialogHeader>
                                                                    <Separator className="bg-gray-200" />
                                                                    <div className="py-4 space-y-6">
                                                                        {/* Patient Basic Info */}
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <div className="space-y-3">
                                                                                <p className="flex items-center text-sm">
                                                                                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                                                                    <strong className="text-gray-700">Case No:</strong>
                                                                                    <span className="ml-2 text-emerald-600 font-semibold">{patient.caseNo}</span>
                                                                                </p>
                                                                                <p className="flex items-center text-sm">
                                                                                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                                                                    <strong className="text-gray-700">Pat No:</strong>
                                                                                    <span className="ml-2 text-emerald-600 font-semibold">{patient.refNo}</span>
                                                                                </p>
                                                                                <p className="flex items-center text-sm">
                                                                                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                                                                                    <strong className="text-gray-700">Name:</strong>
                                                                                    <span className="ml-2">{patient.name}</span>
                                                                                </p>
                                                                                <p className="flex items-center text-sm">
                                                                                    <strong className="text-gray-700">Age:</strong>
                                                                                    <span className="ml-2">{formatAge(patient)}</span>

                                                                                </p>
                                                                                <p className="flex items-center text-sm">
                                                                                    <strong className="text-gray-700">Gender:</strong>
                                                                                    <span className="ml-2">{patient.gender}</span>
                                                                                </p>
                                                                                <p className="flex items-center text-sm">
                                                                                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                                                                                    <strong className="text-gray-700">Phone:</strong>
                                                                                    <span className="ml-2">{patient.phone}</span>
                                                                                </p>
                                                                            </div>
                                                                            <div className="space-y-3">
                                                                                <p className="flex items-center text-sm">
                                                                                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                                                                    <strong className="text-gray-700">Date:</strong>
                                                                                    <span className="ml-2 text-sm">{new Date(patient.createdAt).toLocaleString()}</span>
                                                                                </p>
                                                                                <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                                                                                    <div className="flex justify-between items-center">
                                                                                        <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                                                                                        <span className="text-lg font-bold text-gray-900">Rs.{patient?.total || 0}</span>
                                                                                    </div>
                                                                                    {patient.discountAmount > 0 && (
                                                                                        <>
                                                                                            <div className="flex justify-between items-center">
                                                                                                <span className="text-sm font-medium text-purple-700">Discount:</span>
                                                                                                <span className="text-base font-semibold text-purple-600">
                                                                                                    {patient.discountPercentage > 0 && `${patient.discountPercentage}% `}
                                                                                                    (Rs.{patient.discountAmount})
                                                                                                </span>
                                                                                            </div>
                                                                                            <Separator className="bg-gray-300" />
                                                                                            <div className="flex justify-between items-center">
                                                                                                <span className="text-sm font-medium text-emerald-700">Net Total:</span>
                                                                                                <span className="text-xl font-bold text-emerald-600">Rs.{patient?.netTotal || 0}</span>
                                                                                            </div>
                                                                                        </>
                                                                                    )}
                                                                                    {(patient.paidAmount > 0 || patient.dueAmount > 0) && (
                                                                                        <>
                                                                                            <Separator className="bg-gray-300" />

                                                                                            {/* ========== SHOW CASH/BANK BREAKDOWN ========== */}
                                                                                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                                                                                <div className="flex justify-between items-center mb-2">
                                                                                                    <span className="text-sm font-medium text-green-700">Paid Amount:</span>
                                                                                                    <span className="text-base font-semibold text-green-600">
                                                                                                        Rs.{patient?.paidAmount || 0}
                                                                                                    </span>
                                                                                                </div>

                                                                                                {/* Cash/Bank Breakdown */}
                                                                                                {patient?.paidAmount > 0 && (
                                                                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                                                                        <div className="bg-white p-2 rounded-lg border border-green-200">
                                                                                                            <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                                                                                                                <Banknote className="h-3 w-3" />
                                                                                                                <span>Cash</span>
                                                                                                            </div>
                                                                                                            <div className="text-sm font-bold text-green-700">
                                                                                                                Rs.{patient?.cashAmount ? patient.cashAmount : patient?.paidAmount || 0}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className="bg-white p-2 rounded-lg border border-blue-200">
                                                                                                            <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                                                                                                                <CreditCard className="h-3 w-3" />
                                                                                                                <span>Bank</span>
                                                                                                            </div>
                                                                                                            <div className="text-sm font-bold text-blue-700">
                                                                                                                Rs.{patient?.bankAmount !== undefined ? patient.bankAmount : 0}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                            {/* ============================================== */}

                                                                                            {patient?.paymentStatus !== 'Paid' && (patient.dueAmount > 0 || (patient?.paidAmount || 0) < (patient?.netTotal || patient?.total)) && (
                                                                                                <div className="flex justify-between items-center">
                                                                                                    <span className="text-sm font-medium text-red-700">Due Amount:</span>
                                                                                                    <span className="text-lg font-bold text-red-600">
                                                                                                        Rs.{patient?.dueAmount || ((patient?.netTotal || patient?.total) - (patient?.paidAmount || 0))}
                                                                                                    </span>
                                                                                                </div>
                                                                                            )}
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Payment Status Info */}
                                                                        <div className="bg-gray-50 p-4 rounded-xl">
                                                                            <h4 className="font-semibold text-gray-800 mb-3">Payment Information</h4>
                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                <div className="flex items-center">
                                                                                    <strong className="text-gray-700 text-sm mr-2">Payment Status:</strong>
                                                                                    <Badge className={`${patient?.paymentStatus?.toLowerCase() == 'not paid' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'} rounded-full px-3 py-1`}>
                                                                                        <DollarSign className="h-3 w-3 mr-1" />
                                                                                        {patient.paymentStatus}
                                                                                    </Badge>
                                                                                </div>
                                                                                <div className="flex items-center">
                                                                                    <strong className="text-gray-700 text-sm mr-2">Result Status:</strong>
                                                                                    <Badge className={`${patient?.resultStatus?.toLowerCase() == 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'} rounded-full px-3 py-1`}>
                                                                                        <NotebookPenIcon className="h-3 w-3 mr-1" />
                                                                                        {patient.resultStatus}
                                                                                    </Badge>
                                                                                </div>
                                                                            </div>
                                                                            <p className="text-sm text-gray-600 mt-2">
                                                                                <strong>Payment Updated By:</strong> {patient.paymentStatusUpdatedBy}
                                                                            </p>
                                                                        </div>

                                                                        {/* Tests Information */}
                                                                        {patient.tests?.length > 0 && (
                                                                            <div>
                                                                                <div className="flex items-center mb-3">
                                                                                    <TestTube className="h-4 w-4 mr-2 text-gray-500" />
                                                                                    <strong className="text-gray-700">Tests:</strong>
                                                                                    <Badge className='bg-blue-100 text-blue-800 rounded-full px-3 py-1 ml-2'>
                                                                                        {patient?.tests?.length}
                                                                                    </Badge>
                                                                                </div>
                                                                                <div className="bg-blue-50 rounded-xl p-4">
                                                                                    <ul className="space-y-2">
                                                                                        {patient.tests.map((t, i) => (
                                                                                            <li key={i} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                                                                                                <span className="text-gray-900 font-medium">{t.testName}</span>
                                                                                                <span className="text-emerald-600 font-bold">Rs.{t.price}</span>
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={11} className="text-center py-12">
                                                    <div className="flex flex-col items-center justify-center space-y-4">
                                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                            <Search className="h-8 w-8 text-gray-400" />
                                                        </div>
                                                        <div className="text-center">
                                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
                                                            <p className="text-gray-500">Try adjusting your search filters or check back later.</p>
                                                        </div>
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
            {/* ========== PAYMENT METHOD DIALOG ========== */}
            <PaymentMethodDialog
                open={paymentDialogOpen}
                onOpenChange={setPaymentDialogOpen}
                patient={selectedPatient}
                onConfirm={(paymentData) => handleAddPayment(selectedPatient, paymentData)}
            />
            {/* =========================================== */}
        </div>
    );
}