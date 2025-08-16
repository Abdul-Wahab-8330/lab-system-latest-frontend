// import { useState, useMemo, useContext } from "react";
// import { PatientsContext } from "@/context/PatientsContext"; // your context
// import { Input } from "@/components/ui/input";
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from "@/components/ui/table";
// import {
//     AlertDialog,
//     AlertDialogAction,
//     AlertDialogCancel,
//     AlertDialogContent,
//     AlertDialogDescription,
//     AlertDialogFooter,
//     AlertDialogHeader,
//     AlertDialogTitle,
//     AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { Card } from "@/components/ui/card";
// import { DollarSign, Info, Notebook, NotebookPen, NotebookPenIcon, Pencil, Printer, Search, Trash2, Wallet } from "lucide-react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
// import { Button } from "./ui/button";
// import { LabInfoContext } from "@/context/LabnfoContext";
// import { AuthContext } from "@/context/AuthProvider";
// import { Badge } from "./ui/badge";
// import { Separator } from "./ui/separator";
// import axios from "axios";


// export default function PatientsList() {
//     const { patients, fetchPatients } = useContext(PatientsContext);
//     const { info } = useContext(LabInfoContext)
//     const { user } = useContext(AuthContext)
//     const [search, setSearch] = useState("");
//     const [testSearch, setTestSearch] = useState("");


//     // State for date search
//     const [dateSearch, setDateSearch] = useState("");

//     // Filtering with both text and date search
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

//             return matchesText && matchesDate && matchesTest;
//         });
//     }, [patients, search, dateSearch, testSearch]);




//     // 🔹 NEW: Function to export filtered patients to CSV
//     const exportToCSV = () => {
//         if (filteredPatients.length === 0) {
//             alert("No data to export");
//             return;
//         }

//         const headers = [
//             "Ref No",
//             "Name",
//             "Age",
//             "Gender",
//             "Contact",
//             "Date",
//             "Payment Status",
//             "Tests",
//             "Total"
//         ];

//         const rows = filteredPatients.map((p) => [
//             p.refNo,
//             p.name,
//             p.age,
//             p.gender,
//             p.phone,
//             new Date(p.createdAt).toLocaleString(),
//             p.paymentStatus,
//             p.tests ? p.tests.map((t) => `${t.testName} (${t.price})`).join(", ") : "",
//             p.total
//         ]);

//         const csvContent = [headers, ...rows]
//             .map((row) => row.map((cell) => `"${cell}"`).join(","))
//             .join("\n");

//         const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//         const link = document.createElement("a");
//         link.href = URL.createObjectURL(blob);
//         link.download = `patients_${new Date().toISOString().split("T")[0]}.csv`;
//         link.click();
//     };

//     const handleDeletePatient = async (patiendId) => {
//         try {
//             const res = await axios.delete(`http://localhost:5000/api/patients/delete/${patiendId}`)
//             if (res.data.success) {
//                 console.log('patient deleted')
//                 fetchPatients()
//             }
//         } catch (error) {

//             console.log(error)
//         }
//     }






//     return (
//         <Card className="p-4 my-3 mx-3  bg-white/80  backdrop-blur-md shadow-lg border border-gray-200 ">
//             {/* Search Box */}
//             <div className="mb-4 flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                     <h2 className="text-xl font-semibold">Patients</h2>
//                     {user?.role?.toLowerCase() == 'admin' ? <Button
//                         variant="outline"
//                         size="sm"
//                         className="border border-none bg-green-500 text-white rounded-2xl hover:bg-green-600"
//                         onClick={exportToCSV}
//                     >
//                         Export as CSV/Excel <span className="bg-white rounded-full px-1 text-gray-700">{filteredPatients?.length}</span>
//                     </Button> : <span className="bg-gray-700 rounded-full px-2 py-1 text-[12px] text-white">{filteredPatients?.length}</span>}
//                 </div>
//                 <div className=" gap-4 grid grid-cols-2 md:grid-cols-3 ">
//                     {/* Search bar with icon */}
//                     <div className="relative flex items-center">
//                         <Input
//                             placeholder="Search by Name or Ref No..."
//                             value={search}
//                             onChange={(e) => setSearch(e.target.value)}
//                             className="xl:w-[300px] w-[250px]  rounded-2xl border-gray-500 pr-10" // space for icon
//                         />
//                         <Search
//                             className="absolute right-3 text-gray-500 pointer-events-none"
//                             size={18}
//                         />
//                     </div>
//                     {/* Test Name search */}
//                     <div className="relative flex items-center">
//                         <Input
//                             placeholder="Search by Test Name..."
//                             value={testSearch}
//                             onChange={(e) => setTestSearch(e.target.value)}
//                             className="xl:w-[300px] w-[250px] rounded-2xl border-gray-500 pr-10"
//                         />
//                         <Search
//                             className="absolute right-3 text-gray-500 pointer-events-none"
//                             size={18}
//                         />
//                     </div>


//                     {/* Date picker */}
//                     <input
//                         type="date"
//                         title="Search by Date..."
//                         value={dateSearch}
//                         onChange={(e) => setDateSearch(e.target.value)}
//                         className="border border-gray-500 px-3 rounded-3xl"
//                     />
//                 </div>

//             </div>

//             {/* Table */}
//             <div className="overflow-x-auto">
//                 <Table>
//                     <TableHeader>
//                         <TableRow className="bg-gray-200">
//                             <TableHead>Ref No</TableHead>
//                             <TableHead>Name</TableHead>
//                             <TableHead>Gender</TableHead>
//                             <TableHead>Date</TableHead>
//                             <TableHead>Payment Status</TableHead>
//                             <TableHead>Result Status</TableHead>
//                             <TableHead>View Details</TableHead>
//                             <TableHead>Print</TableHead>
//                             <TableHead>Delete</TableHead>
//                         </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                         {filteredPatients.length > 0 ? (
//                             filteredPatients.slice().reverse().map((patient) => (
//                                 <TableRow
//                                     key={patient._id}
//                                     className="hover:bg-gray-100  transition-colors"
//                                 >
//                                     <TableCell className="font-medium">{patient.refNo}</TableCell>
//                                     <TableCell>{patient.name}</TableCell>
//                                     <TableCell>{patient.gender}</TableCell>
//                                     <TableCell>
//                                         {new Date(patient.createdAt).toLocaleString()}
//                                     </TableCell>

//                                     <TableCell>
//                                         <Badge
//                                             className={
//                                                 patient?.paymentStatus?.toLowerCase() === "not paid"
//                                                     ? "bg-amber-400 text-white rounded-3xl pb-1"
//                                                     : "bg-green-500 text-white rounded-3xl pb-1"
//                                             }
//                                         >
//                                             <DollarSign /> {patient.paymentStatus}
//                                         </Badge>
//                                     </TableCell>
//                                     <TableCell>
//                                         <Badge
//                                             className={
//                                                 patient?.resultStatus?.toLowerCase() === "pending"
//                                                     ? "bg-amber-400 text-white rounded-3xl pb-1"
//                                                     : "bg-green-500 text-white rounded-3xl pb-1"
//                                             }
//                                         >
//                                             <NotebookPen /> {patient.resultStatus}
//                                         </Badge>
//                                     </TableCell>

//                                     {/* View Details Dialog */}
//                                     <TableCell>
//                                         <Dialog >
//                                             <DialogTrigger asChild>
//                                                 <Button variant="outline" className='border border-gray-400 bg-amber-100' size="sm" >
//                                                     <Info className="text-gray-800" />
//                                                 </Button>
//                                             </DialogTrigger>
//                                             <DialogContent className="max-w-lg bg-white rounded-2xl border-none">
//                                                 <DialogHeader>
//                                                     <DialogTitle>Patient Details</DialogTitle>
//                                                 </DialogHeader>
//                                                 <Separator className='bg-black' />
//                                                 <div className="space-y-2">
//                                                     <p><strong>Ref No:</strong> {patient.refNo}</p>
//                                                     <p><strong>Name:</strong> {patient.name}</p>
//                                                     <p><strong>Payment Status: &nbsp;</strong><Badge className={patient?.paymentStatus?.toLowerCase() == 'not paid' ? 'bg-amber-400 text-white pb-1 rounded-full' : 'bg-green-500 text-white pb-1 rounded-full'}><DollarSign /> {patient.paymentStatus}</Badge></p>
//                                                     <p><strong>Result Status: &nbsp;</strong><Badge className={patient?.resultStatus?.toLowerCase() == 'pending' ? 'bg-amber-400 text-white pb-1 rounded-full' : 'bg-green-500 text-white pb-1 rounded-full'}><NotebookPenIcon /> {patient.resultStatus}</Badge></p>
//                                                     <p><strong>Age:</strong> {patient.age}</p>
//                                                     <p><strong>Gender:</strong> {patient.gender}</p>
//                                                     <p><strong>Phone:</strong> {patient.phone}</p>
//                                                     <p><strong>Date:</strong> {new Date(patient.createdAt).toLocaleString()}</p>
//                                                     <p><strong>Registered By:</strong> {patient?.patientRegisteredBy}</p>
//                                                     {patient.tests && patient.tests.length > 0 && (
//                                                         <div>
//                                                             <strong>Tests: <Badge className='bg-gray-700 rounded-3xl  text-white pb-1'>{patient?.tests?.length}</Badge></strong>
//                                                             <ul className="list-disc ml-5">
//                                                                 {patient.tests.map((t, i) => (
//                                                                     <li key={i}>{t.testName} - {t.price}</li>
//                                                                 ))}
//                                                             </ul>
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                             </DialogContent>
//                                         </Dialog>
//                                     </TableCell>

//                                     {/* Print Button */}
//                                     <TableCell>
//                                         <Button
//                                             variant="outline"
//                                             size="sm"
//                                             className='border border-gray-500 bg-blue-600 text-white'
//                                             onClick={() => {
//                                                 const win = window.open("", "_blank");

//                                                 const reportHTML = `
//         <html>
//         <head>
//             <title>Patient Report</title>
//             <style>
//                 body { font-family: Arial, sans-serif; padding: 20px; }
//                 h1, h2, h3 { margin: 0; text-align: center; }
//                 table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//                 th, td { border: 1px solid #000; padding: 8px; text-align: left; }
//                 .header { text-align: center; margin-bottom: 20px; }
//                 .image{width:70px}
//                 .total{text-align:end; margin-top:15px;}
//             </style>
//         </head>
//         <body>
//             <div class="header">
//                 <img class='image' src="${info.logoUrl}" id="lab-logo"/>
//                 <h3>${info.labName}</h3>
//                 <p>📍 ${info.address} | 📞 ${info.phoneNumber} | ✉ ${info.email}</p>
//                 <h2>Patient Registration Report</h2>
//             </div>
//             <p><strong>Ref No:</strong> ${patient.refNo}</p>
//             <p><strong>Name:</strong> ${patient.name}</p>
//             <p><strong>Age:</strong> ${patient.age}</p>
//             <p><strong>Gender:</strong> ${patient.gender}</p>
//             <p><strong>Phone:</strong> ${patient.phone}</p>
//             <p><strong>Payment Status:</strong> ${patient?.paymentStatus}</p>

//             <p><strong>Date:</strong> ${new Date(patient.createdAt).toLocaleString()}</p>
//             ${patient.tests && patient.tests.length > 0
//                                                         ? `<h3>Tests</h3>
//                 <table>
//                     <thead>
//                         <tr>
//                             <th class='head'>Test Name</th>
//                             <th class='head'>Price</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         ${patient.tests
//                                                             .map(
//                                                                 (t) => `
//                             <tr>
//                                 <td>${t.testName}</td>
//                                 <td>Rs.${t.price}</td>
//                             </tr>
//                         `
//                                                             )
//                                                             .join("")}
//                     </tbody>
//                 </table>`
//                                                         : ""
//                                                     }
//             <p class="total"><strong>Total: </strong>Rs.${patient.total}</p>
//         </body>
//         </html>
//     `;

//                                                 win.document.write(reportHTML);
//                                                 win.document.close();

//                                                 // Wait for image to load before printing
//                                                 const img = win.document.getElementById("lab-logo");
//                                                 img.onload = () => {
//                                                     win.print();
//                                                 };
//                                                 img.onerror = () => {
//                                                     console.warn("Logo failed to load, printing without it.");
//                                                     win.print();
//                                                 };
//                                             }}

//                                         >
//                                             <Printer /> Print
//                                         </Button>
//                                     </TableCell>
//                                     <TableCell>
//                                         <AlertDialog>
//                                             <AlertDialogTrigger asChild>
//                                                 <Button variant="ghost" size="icon" className='hover:bg-red-100 border border-red-300 rounded-full' >
//                                                     <Trash2 className="text-red-500" />
//                                                 </Button>
//                                             </AlertDialogTrigger>
//                                             <AlertDialogContent className='bg-white'>
//                                                 <AlertDialogHeader>
//                                                     <AlertDialogTitle>Delete Patient?</AlertDialogTitle>
//                                                     <AlertDialogDescription>
//                                                         This action cannot be undone. This will permanently delete the patient’s record.
//                                                     </AlertDialogDescription>
//                                                 </AlertDialogHeader>
//                                                 <AlertDialogFooter>
//                                                     <AlertDialogCancel>Cancel</AlertDialogCancel>
//                                                     <AlertDialogAction
//                                                         className="bg-red-500 hover:bg-red-600 text-white"
//                                                         onClick={() => handleDeletePatient(patient._id)}
//                                                     >
//                                                         Yes, Delete
//                                                     </AlertDialogAction>
//                                                 </AlertDialogFooter>
//                                             </AlertDialogContent>
//                                         </AlertDialog>
//                                     </TableCell>                                </TableRow>
//                             ))
//                         ) : (
//                             <TableRow>
//                                 <TableCell colSpan="6" className="text-center py-6 text-gray-500">
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























import { useState, useMemo, useContext } from "react";
import { PatientsContext } from "@/context/PatientsContext"; // your context
import { Input } from "@/components/ui/input";
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
    Eye
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { LabInfoContext } from "@/context/LabnfoContext";
import { AuthContext } from "@/context/AuthProvider";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import axios from "axios";

export default function PatientsList() {
    const { patients, fetchPatients } = useContext(PatientsContext);
    const { info } = useContext(LabInfoContext)
    const { user } = useContext(AuthContext)
    const [search, setSearch] = useState("");
    const [testSearch, setTestSearch] = useState("");

    // State for date search
    const [dateSearch, setDateSearch] = useState("");

    // Filtering with both text and date search
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

            return matchesText && matchesDate && matchesTest;
        });
    }, [patients, search, dateSearch, testSearch]);

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

    const handleDeletePatient = async (patiendId) => {
        try {
            const res = await axios.delete(`http://localhost:5000/api/patients/delete/${patiendId}`)
            if (res.data.success) {
                console.log('patient deleted')
                fetchPatients()
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 m-2">
            <div className="max-w-7xl mx-auto">
                <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-0 overflow-hidden">
                    {/* Enhanced Header */}
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold">Patient Management</CardTitle>
                                    <p className="text-blue-100 mt-1">Manage and track patient records</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {user?.role?.toLowerCase() === 'admin' ? (
                                    <Button
                                        variant="outline"
                                        className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-xl backdrop-blur-sm font-semibold"
                                        onClick={exportToCSV}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Export CSV
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

                    <CardContent className="p-8">
                        {/* Enhanced Search Section */}
                        <div className="mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Name/Ref Search */}
                                <div className="relative group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <Search className="inline h-4 w-4 mr-1" />
                                        Search by Name or Reference
                                    </label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Enter name or reference number..."
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
                                                <NotebookPen className="inline h-4 w-4 mr-2" />
                                                Result
                                            </TableHead>
                                            <TableHead className="font-bold text-gray-800">Details</TableHead>
                                            <TableHead className="font-bold text-gray-800">Print</TableHead>
                                            <TableHead className="font-bold text-gray-800">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPatients.length > 0 ? (
                                            filteredPatients.slice().reverse().map((patient, index) => (
                                                <TableRow
                                                    key={patient._id}
                                                    className={`transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 ${
                                                        index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
                                                    }`}
                                                >
                                                    <TableCell className="font-semibold text-blue-700 py-4">
                                                        {patient.refNo}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-gray-900">
                                                        {patient.name}
                                                    </TableCell>
                                                    <TableCell className="text-gray-700">
                                                        {patient.gender}
                                                    </TableCell>
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
                                                            <DialogContent className="max-w-2xl h-[95vh] overflow-auto bg-white rounded-2xl border-0 shadow-2xl">
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
                                                                                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                                                                <strong className="text-gray-700">Ref No:</strong> 
                                                                                <span className="ml-2 text-blue-600 font-semibold">{patient.refNo}</span>
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
                                                                    
                                                                    <div className="flex gap-4 pt-2">
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

                                                                    {patient.tests && patient.tests.length > 0 && (
                                                                        <div className="pt-4">
                                                                            <div className="flex items-center mb-3">
                                                                                <TestTube className="h-4 w-4 mr-2 text-gray-500" />
                                                                                <strong className="text-gray-700">Tests:</strong> 
                                                                                <Badge className='bg-blue-100 text-blue-800 rounded-full px-3 py-1 ml-2'>
                                                                                    {patient?.tests?.length}
                                                                                </Badge>
                                                                            </div>
                                                                            <div className="bg-gray-50 rounded-xl p-4">
                                                                                <ul className="space-y-2">
                                                                                    {patient.tests.map((t, i) => (
                                                                                        <li key={i} className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                                                                                            <span className="text-gray-900">{t.testName}</span>
                                                                                            <span className="text-green-600 font-semibold">Rs.{t.price}</span>
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

                                                    {/* Enhanced Print Button */}
                                                    <TableCell>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className='bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 text-green-700 rounded-lg transition-all duration-200'
                                                            onClick={() => {
                                                                const win = window.open("", "_blank");

                                                                const reportHTML = `
        <html>
        <head>
            <title>Patient Report</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1, h2, h3 { margin: 0; text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                .header { text-align: center; margin-bottom: 20px; }
                .image{width:70px}
                .total{text-align:end; margin-top:15px;}
            </style>
        </head>
        <body>
            <div class="header">
                <img class='image' src="${info.logoUrl}" id="lab-logo"/>
                <h3>${info.labName}</h3>
                <p>📍 ${info.address} | 📞 ${info.phoneNumber} | ✉ ${info.email}</p>
                <h2>Patient Registration Report</h2>
            </div>
            <p><strong>Ref No:</strong> ${patient.refNo}</p>
            <p><strong>Name:</strong> ${patient.name}</p>
            <p><strong>Age:</strong> ${patient.age}</p>
            <p><strong>Gender:</strong> ${patient.gender}</p>
            <p><strong>Phone:</strong> ${patient.phone}</p>
            <p><strong>Payment Status:</strong> ${patient?.paymentStatus}</p>

            <p><strong>Date:</strong> ${new Date(patient.createdAt).toLocaleString()}</p>
            ${patient.tests && patient.tests.length > 0
                                                                    ? `<h3>Tests</h3>
                <table>
                    <thead>
                        <tr>
                            <th class='head'>Test Name</th>
                            <th class='head'>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${patient.tests
                                                                        .map(
                                                                            (t) => `
                            <tr>
                                <td>${t.testName}</td>
                                <td>Rs.${t.price}</td>
                            </tr>
                        `
                                                                        )
                                                                        .join("")}
                    </tbody>
                </table>`
                                                                    : ""
                                                                }
            <p class="total"><strong>Total: </strong>Rs.${patient.total}</p>
        </body>
        </html>
    `;

                                                                win.document.write(reportHTML);
                                                                win.document.close();

                                                                // Wait for image to load before printing
                                                                const img = win.document.getElementById("lab-logo");
                                                                img.onload = () => {
                                                                    win.print();
                                                                };
                                                                img.onerror = () => {
                                                                    console.warn("Logo failed to load, printing without it.");
                                                                    win.print();
                                                                };
                                                            }}
                                                        >
                                                            <Printer className="h-4 w-4 mr-1" />
                                                            Print
                                                        </Button>
                                                    </TableCell>

                                                    {/* Enhanced Delete Button */}
                                                    <TableCell>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm" 
                                                                    className='bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-lg transition-all duration-200'
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent className='bg-white rounded-2xl border-0 shadow-2xl'>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle className="text-xl font-bold text-gray-900 flex items-center">
                                                                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                                        </div>
                                                                        Delete Patient Record?
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription className="text-gray-600 mt-2">
                                                                        This action cannot be undone. This will permanently delete the patient's record and all associated data.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter className="gap-3">
                                                                    <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className="bg-red-500 hover:bg-red-600 text-white rounded-lg"
                                                                        onClick={() => handleDeletePatient(patient._id)}
                                                                    >
                                                                        Yes, Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
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
        </div>
    );
}