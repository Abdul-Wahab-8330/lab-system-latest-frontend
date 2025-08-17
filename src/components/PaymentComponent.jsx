// import { useState, useMemo, useContext, useEffect } from "react";
// import { PatientsContext } from "@/context/PatientsContext";
// import { AuthContext } from "@/context/AuthProvider";
// import { Input } from "@/components/ui/input";
// import {
//     Table, TableBody, TableCell, TableHead, TableHeader, TableRow
// } from "@/components/ui/table";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select"
// import { Card } from "@/components/ui/card";
// import { Check, DollarSign, Info, NotebookPenIcon, Search } from "lucide-react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import axios from "axios";

// export default function PaymentComponent() {
//     const { patients, fetchPatients } = useContext(PatientsContext);
//     const { user } = useContext(AuthContext);

//     const [search, setSearch] = useState("");
//     const [testSearch, setTestSearch] = useState("");
//     const [dateSearch, setDateSearch] = useState("");
//     const [paymentFilter, setPaymentFilter] = useState("All");

//     useEffect(() => {
//         fetchPatients();
//     }, []);

//     const filteredPatients = useMemo(() => {
//         return patients.filter((p) => {
//             const searchLower = search.toLowerCase();
//             const testLower = testSearch.toLowerCase();
//             const formattedDate = new Date(p.createdAt).toISOString().split("T")[0];

//             const matchesText =
//                 p.name?.toLowerCase().includes(searchLower) ||
//                 p.refNo?.toLowerCase().includes(searchLower);

//             const matchesDate =
//                 dateSearch === "" || formattedDate === dateSearch;

//             const matchesTest =
//                 testSearch === "" ||
//                 (p.tests && p.tests.some((t) => t.testName?.toLowerCase().includes(testLower)));

//             const matchesPayment =
//                 paymentFilter === "All" || p.paymentStatus === paymentFilter;

//             return matchesText && matchesDate && matchesTest && matchesPayment;
//         });
//     }, [patients, search, testSearch, dateSearch, paymentFilter]);

//     const handlePaymentUpdate = async (id) => {
//         try {
//             const res = await axios.patch(
//                 `http://localhost:5000/api/patients/${id}/payment`,
//                 {
//                     paymentStatus: "Paid",
//                     paymentStatusUpdatedBy: user.name
//                 }
//             );

//             if (res.status === 200) {
//                 fetchPatients();
//             }
//         } catch (error) {
//             console.error(error);
//             alert("Error updating payment status");
//         }
//     };

//     return (
//         <Card className="p-4 bg-white/80 backdrop-blur-md shadow-lg overflow-y-auto border border-gray-200 rounded-2xl m-3">
//             {/* Filters */}
//             <div className="mb-4 flex items-center justify-between ">
//                 <div className="text-xl font-semibold">Manage Payments <span className="bg-gray-700 rounded-full px-2 py-1 text-[12px] text-gray-300">{filteredPatients?.length}</span></div>
//                 <div className=" grid grid-cols-2 md:grid-cols-4 gap-2">
//                     <div className="relative">
//                         <Input placeholder="Search Name / Ref No..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-2xl border-gray-500 pr-10" />
//                         <Search className="absolute right-3 top-2 text-gray-500" size={18} />
//                     </div>
//                     <div className="relative">
//                         <Input placeholder="Search Test Name..." value={testSearch} onChange={(e) => setTestSearch(e.target.value)} className="rounded-2xl border-gray-500 pr-10" />
//                         <Search className="absolute right-3 top-2 text-gray-500" size={18} />
//                     </div>
//                     <input type="date" value={dateSearch} onChange={(e) => setDateSearch(e.target.value)} className="border border-gray-500 px-3 rounded-3xl" />
//                     <Select
//                         value={paymentFilter}
//                         onValueChange={setPaymentFilter}
//                     >
//                         <SelectTrigger className="w-full border border-gray-500 rounded-3xl">
//                             <SelectValue placeholder="All Status" />
//                         </SelectTrigger>
//                         <SelectContent className='bg-white'>
//                             <SelectItem value="All">All Status</SelectItem>
//                             <SelectItem value="Not Paid">Not Paid</SelectItem>
//                             <SelectItem value="Paid">Paid</SelectItem>
//                         </SelectContent>
//                     </Select>
//                 </div>
//             </div>

//             {/* Table */}
//             <div className="overflow-x-auto">
//                 <Table>
//                     <TableHeader>
//                         <TableRow className="bg-gray-200">
//                             <TableHead>Ref No</TableHead>
//                             <TableHead>Name</TableHead>
//                             <TableHead>Age</TableHead>
//                             <TableHead>Gender</TableHead>
//                             <TableHead>Phone</TableHead>
//                             <TableHead>Date</TableHead>
//                             <TableHead>Payment Status</TableHead>
//                             <TableHead>Result Status</TableHead>
//                             <TableHead>Action</TableHead>
//                             <TableHead>Details</TableHead>
//                         </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                         {filteredPatients.length > 0 ? (
//                             filteredPatients.slice().reverse().map((patient) => {
//                                 const disableRow = patient.paymentStatus === "Completed" || patient.resultStatus !== "Added";
//                                 return (
//                                     <TableRow key={patient._id} className={disableRow ? "opacity-50 pointer-events-none" : ""}>
//                                         <TableCell>{patient.refNo}</TableCell>
//                                         <TableCell>{patient.name}</TableCell>
//                                         <TableCell>{patient.age}</TableCell>
//                                         <TableCell>{patient.gender}</TableCell>
//                                         <TableCell>{patient.phone}</TableCell>
//                                         <TableCell>{new Date(patient.createdAt).toLocaleString()}</TableCell>
//                                         <TableCell>
//                                             <Badge className={patient?.paymentStatus?.toLowerCase() === "not paid" ? "bg-amber-400 text-white" : "bg-green-500 text-white"}>
//                                                 <DollarSign /> {patient.paymentStatus}
//                                             </Badge>
//                                         </TableCell>
//                                         <TableCell>
//                                             <Badge className={patient?.resultStatus?.toLowerCase() === "pending" ? "bg-amber-400 text-white" : "bg-green-500 text-white"}>
//                                                 <NotebookPenIcon /> {patient.resultStatus}
//                                             </Badge>
//                                         </TableCell>
//                                         <TableCell>
//                                             {patient?.resultStatus === "Added" && patient?.paymentStatus.toLowerCase() === "not paid" ? (
//                                                 <Dialog>
//                                                     <DialogTrigger asChild>
//                                                         <Button size="sm" className="button-animation">
//                                                             Mark as Paid
//                                                         </Button>
//                                                     </DialogTrigger>
//                                                     <DialogContent className="bg-white rounded-2xl border-none max-w-md">
//                                                         <DialogHeader>
//                                                             <DialogTitle>Confirm Payment Update</DialogTitle>
//                                                         </DialogHeader>
//                                                         <p>
//                                                             Are you sure you want to mark the payment as complete for
//                                                             <strong> {patient.name} </strong> as user
//                                                             <strong> {user.name}</strong>?
//                                                         </p>
//                                                         <div className="flex justify-end gap-2 mt-4">
//                                                             <Button
//                                                                 className="bg-green-500 text-white"
//                                                                 onClick={() => handlePaymentUpdate(patient._id)}
//                                                             >
//                                                                 Yes, Mark as Paid
//                                                             </Button>
//                                                         </div>
//                                                     </DialogContent>
//                                                 </Dialog>
//                                             ) : (
//                                                 <span className="text-gray-500 text-sm">{patient?.resultStatus?.toLowerCase()=='pending' && patient?.paymentStatus?.toLowerCase()=='not paid' ? 'Waiting for Results...' : 'Payment Done'}</span>
//                                             )}
//                                         </TableCell>

//                                         <TableCell>
//                                             <Dialog>
//                                                 <DialogTrigger asChild>
//                                                     <Button size="sm" variant="outline" className="border border-gray-400 bg-amber-100">
//                                                         <Info className="text-gray-800" />
//                                                     </Button>
//                                                 </DialogTrigger>
//                                                 <DialogContent className="max-w-lg bg-white rounded-2xl border-none">
//                                                     <DialogHeader>
//                                                         <DialogTitle>Patient Details</DialogTitle>
//                                                     </DialogHeader>
//                                                     <Separator className="bg-black" />
//                                                     <div className="space-y-2">
//                                                         <p><strong>Ref No:</strong> {patient.refNo}</p>
//                                                         <p><strong>Name:</strong> {patient.name}</p>
//                                                         <p><strong>Payment Status:</strong> {patient.paymentStatus}</p>
//                                                         <p><strong>Payment Status Updated By:</strong> {patient.paymentStatusUpdatedBy}</p>
//                                                         <p><strong>Result Status:</strong> {patient.resultStatus}</p>
//                                                         <p><strong>Age:</strong> {patient.age}</p>
//                                                         <p><strong>Gender:</strong> {patient.gender}</p>
//                                                         <p><strong>Phone:</strong> {patient.phone}</p>
//                                                         <p><strong>Date:</strong> {new Date(patient.createdAt).toLocaleString()}</p>
//                                                         <p><strong>Total Amount:</strong> {patient?.total}</p>
//                                                         {patient.tests?.length > 0 && (
//                                                             <div>
//                                                                 <strong>Tests:</strong>
//                                                                 <ul className="list-disc ml-5">
//                                                                     {patient.tests.map((t, i) => (
//                                                                         <li key={i}>{t.testName} - Rs.{t.price}</li>
//                                                                     ))}
//                                                                 </ul>
//                                                             </div>
//                                                         )}
//                                                     </div>
//                                                 </DialogContent>
//                                             </Dialog>
//                                         </TableCell>
//                                     </TableRow>
//                                 );
//                             })
//                         ) : (
//                             <TableRow>
//                                 <TableCell colSpan="10" className="text-center py-6 text-gray-500">
//                                     No patients found
//                                 </TableCell>
//                             </TableRow>
//                         )}
//                     </TableBody>
//                 </Table>
//             </div>
//         </Card>
//     );
// }











import { useState, useMemo, useContext, useEffect } from "react";
import { PatientsContext } from "@/context/PatientsContext";
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
    Phone
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import toast from "react-hot-toast";

export default function PaymentComponent() {
    const { patients, fetchPatients } = useContext(PatientsContext);
    const { user } = useContext(AuthContext);

    const [search, setSearch] = useState("");
    const [testSearch, setTestSearch] = useState("");
    const [dateSearch, setDateSearch] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("All");

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
                p.refNo?.toLowerCase().includes(searchLower);

            const matchesDate =
                dateSearch === "" || formattedDate === dateSearch;

            const matchesTest =
                testSearch === "" ||
                (p.tests && p.tests.some((t) => t.testName?.toLowerCase().includes(testLower)));

            const matchesPayment =
                paymentFilter === "All" || p.paymentStatus === paymentFilter;

            return matchesText && matchesDate && matchesTest && matchesPayment;
        });
    }, [patients, search, testSearch, dateSearch, paymentFilter]);

    const handlePaymentUpdate = async (id) => {
        try {
            const res = await axios.patch(
                `https://labsync-lab-reporting-system-backend.onrender.com/api/patients/${id}/payment`,
                {
                    paymentStatus: "Paid",
                    paymentStatusUpdatedBy: user.name
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-3">
                    <Card className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl border-0 overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Patients</p>
                                    <p className="text-3xl font-bold text-gray-900">{paymentStats.total}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl border-0 overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Paid</p>
                                    <p className="text-3xl font-bold text-green-600">{paymentStats.paid}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl border-0 overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Unpaid</p>
                                    <p className="text-3xl font-bold text-amber-600">{paymentStats.unpaid}</p>
                                </div>
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl border-0 overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-emerald-600">Rs.{paymentStats.totalAmount.toLocaleString()}</p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Card */}
                <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-0 overflow-hidden p-0">
                    {/* Enhanced Header */}
                    <CardHeader className="bg-gradient-to-r from-green-700 to-emerald-600 py-3 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl">
                                    <CreditCard className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold">Payment Management</CardTitle>
                                    <p className="text-green-100 mt-1">Track and manage patient payments</p>
                                </div>
                            </div>
                            <Badge className="bg-white/20 text-white border-0 px-4 py-2 rounded-xl">
                                <FileText className="h-4 w-4 mr-1" />
                                {filteredPatients?.length} Records
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8">
                        {/* Enhanced Filter Section */}
                        <div className="mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Name/Ref Search */}
                                <div className="relative group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <Search className="inline h-4 w-4 mr-1" />
                                        Search Patient
                                    </label>
                                    <div className="relative">
                                        <Input 
                                            placeholder="Name or Reference No..." 
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
                                                Ref No
                                            </TableHead>
                                            <TableHead className="font-bold text-gray-800">
                                                <Users className="inline h-4 w-4 mr-2" />
                                                Name
                                            </TableHead>
                                            <TableHead className="font-bold text-gray-800">Gender</TableHead>
                                            
                                            <TableHead className="font-bold text-gray-800">
                                                <Calendar className="inline h-4 w-4 mr-2" />
                                                Date
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
                                                const disableRow = patient.paymentStatus === "Completed" || patient.resultStatus !== "Added";
                                                return (
                                                    <TableRow 
                                                        key={patient._id} 
                                                        className={`transition-all duration-200 ${
                                                            disableRow ? "opacity-50 pointer-events-none" : "hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50"
                                                        } ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}
                                                    >
                                                        <TableCell className="font-semibold text-emerald-700 py-4">
                                                            {patient.refNo}
                                                        </TableCell>
                                                        <TableCell className="font-medium text-gray-900">
                                                            {patient.name}
                                                        </TableCell>
                                                        <TableCell className="text-gray-700">{patient.gender}</TableCell>
                                                        <TableCell className="text-gray-600 text-sm">
                                                            {new Date(patient.createdAt).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge 
                                                                className={`${
                                                                    patient?.paymentStatus?.toLowerCase() === "not paid" 
                                                                        ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white" 
                                                                        : "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                                                                } rounded-full px-3 py-1 font-medium shadow-sm`}
                                                            >
                                                                <DollarSign className="h-3 w-3 mr-1" />
                                                                {patient.paymentStatus}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge 
                                                                className={`${
                                                                    patient?.resultStatus?.toLowerCase() === "pending" 
                                                                        ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white" 
                                                                        : "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                                                                } rounded-full px-3 py-1 font-medium shadow-sm`}
                                                            >
                                                                <NotebookPenIcon className="h-3 w-3 mr-1" />
                                                                {patient.resultStatus}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {patient?.resultStatus === "Added" && patient?.paymentStatus.toLowerCase() === "not paid" ? (
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <Button 
                                                                            size="sm" 
                                                                            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                                                        >
                                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                                            Mark as Paid
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="bg-white rounded-2xl border-0 shadow-2xl max-w-md">
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
                                                                            <div className="bg-emerald-50 p-4 rounded-xl mb-4">
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-sm font-medium text-emerald-800">Total Amount:</span>
                                                                                    <span className="text-lg font-bold text-emerald-600">Rs.{patient.total}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex justify-end gap-3">
                                                                                <Button
                                                                                    variant="outline"
                                                                                    className="rounded-lg"
                                                                                >
                                                                                    Cancel
                                                                                </Button>
                                                                                <Button
                                                                                    className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg"
                                                                                    onClick={() => handlePaymentUpdate(patient._id)}
                                                                                >
                                                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                                                    Yes, Mark as Paid
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            ) : (
                                                                <div className="flex items-center text-sm">
                                                                    {patient?.resultStatus?.toLowerCase() == 'pending' && patient?.paymentStatus?.toLowerCase() == 'not paid' ? (
                                                                        <div className="flex items-center text-amber-600">
                                                                            <Clock className="h-4 w-4 mr-1" />
                                                                            Waiting for Results...
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center text-green-600">
                                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                                            Payment Done
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
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
                                                                <DialogContent className="max-w-2xl max-h-[95vh] overflow-auto bg-white rounded-2xl border-0 shadow-2xl">
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
                                                                                    <strong className="text-gray-700">Ref No:</strong> 
                                                                                    <span className="ml-2 text-emerald-600 font-semibold">{patient.refNo}</span>
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
                                                                                <div className="bg-emerald-50 p-4 rounded-xl">
                                                                                    <div className="flex justify-between items-center mb-2">
                                                                                        <span className="text-sm font-medium text-emerald-800">Total Amount:</span>
                                                                                        <span className="text-xl font-bold text-emerald-600">Rs.{patient?.total}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Payment Status Info */}
                                                                        <div className="bg-gray-50 p-4 rounded-xl">
                                                                            <h4 className="font-semibold text-gray-800 mb-3">Payment Information</h4>
                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                <div className="flex items-center">
                                                                                    <strong className="text-gray-700 mr-2">Payment Status:</strong>
                                                                                    <Badge className={`${patient?.paymentStatus?.toLowerCase() == 'not paid' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'} rounded-full px-3 py-1`}>
                                                                                        <DollarSign className="h-3 w-3 mr-1" />
                                                                                        {patient.paymentStatus}
                                                                                    </Badge>
                                                                                </div>
                                                                                <div className="flex items-center">
                                                                                    <strong className="text-gray-700 mr-2">Result Status:</strong>
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
                                                <TableCell colSpan={10} className="text-center py-12">
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
        </div>
    );
}