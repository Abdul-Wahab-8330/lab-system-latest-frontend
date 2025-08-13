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
import { Card } from "@/components/ui/card";
import { DollarSign, Info, Notebook, NotebookPen, NotebookPenIcon, Pencil, Printer, Search, Trash2, Wallet } from "lucide-react";
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
        <Card className="p-4  bg-white/80  backdrop-blur-md shadow-lg border rounded-2xl">
            {/* Search Box */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">Patients List</h2>
                    {user?.role?.toLowerCase() == 'admin' ? <Button
                        variant="outline"
                        size="sm"
                        className="border border-none bg-green-500 text-white rounded-2xl hover:bg-green-600"
                        onClick={exportToCSV}
                    >
                        Export as CSV/Excel <span className="bg-white rounded-full px-1 text-gray-700">{filteredPatients?.length}</span>
                    </Button> : <span className="bg-gray-700 rounded-full px-2 py-1 text-[12px] text-white">{filteredPatients?.length}</span>}
                </div>
                <div className=" gap-4 grid grid-cols-2 md:grid-cols-3 ">
                    {/* Search bar with icon */}
                    <div className="relative flex items-center">
                        <Input
                            placeholder="Search by Name or Ref No..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="xl:w-[300px] w-[250px]  rounded-2xl border-gray-500 pr-10" // space for icon
                        />
                        <Search
                            className="absolute right-3 text-gray-500 pointer-events-none"
                            size={18}
                        />
                    </div>
                    {/* Test Name search */}
                    <div className="relative flex items-center">
                        <Input
                            placeholder="Search by Test Name..."
                            value={testSearch}
                            onChange={(e) => setTestSearch(e.target.value)}
                            className="xl:w-[300px] w-[250px] rounded-2xl border-gray-500 pr-10"
                        />
                        <Search
                            className="absolute right-3 text-gray-500 pointer-events-none"
                            size={18}
                        />
                    </div>


                    {/* Date picker */}
                    <input
                        type="date"
                        title="Search by Date..."
                        value={dateSearch}
                        onChange={(e) => setDateSearch(e.target.value)}
                        className="border border-gray-500 px-3 rounded-3xl"
                    />
                </div>

            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-200">
                            <TableHead>Ref No</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Gender</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Payment Status</TableHead>
                            <TableHead>Result Status</TableHead>
                            <TableHead>View Details</TableHead>
                            <TableHead>Print</TableHead>
                            <TableHead>Delete</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPatients.length > 0 ? (
                            filteredPatients.slice().reverse().map((patient) => (
                                <TableRow
                                    key={patient._id}
                                    className="hover:bg-gray-100  transition-colors"
                                >
                                    <TableCell className="font-medium">{patient.refNo}</TableCell>
                                    <TableCell>{patient.name}</TableCell>
                                    <TableCell>{patient.age}</TableCell>
                                    <TableCell>{patient.gender}</TableCell>
                                    <TableCell>{patient.phone}</TableCell>
                                    <TableCell>
                                        {new Date(patient.createdAt).toLocaleString()}
                                    </TableCell>

                                    <TableCell>
                                        <Badge
                                            className={
                                                patient?.paymentStatus?.toLowerCase() === "not paid"
                                                    ? "bg-amber-400 text-white rounded-3xl pb-1"
                                                    : "bg-green-500 text-white rounded-3xl pb-1"
                                            }
                                        >
                                            <DollarSign /> {patient.paymentStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={
                                                patient?.resultStatus?.toLowerCase() === "pending"
                                                    ? "bg-amber-400 text-white rounded-3xl pb-1"
                                                    : "bg-green-500 text-white rounded-3xl pb-1"
                                            }
                                        >
                                            <NotebookPen /> {patient.resultStatus}
                                        </Badge>
                                    </TableCell>

                                    {/* View Details Dialog */}
                                    <TableCell>
                                        <Dialog >
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className='border border-gray-400 bg-amber-100' size="sm" >
                                                    <Info className="text-gray-800" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-lg bg-white rounded-2xl border-none">
                                                <DialogHeader>
                                                    <DialogTitle>Patient Details</DialogTitle>
                                                </DialogHeader>
                                                <Separator className='bg-black' />
                                                <div className="space-y-2">
                                                    <p><strong>Ref No:</strong> {patient.refNo}</p>
                                                    <p><strong>Name:</strong> {patient.name}</p>
                                                    <p><strong>Payment Status: &nbsp;</strong><Badge className={patient?.paymentStatus?.toLowerCase() == 'not paid' ? 'bg-amber-400 text-white pb-1 rounded-full' : 'bg-green-500 text-white pb-1 rounded-full'}><DollarSign /> {patient.paymentStatus}</Badge></p>
                                                    <p><strong>Result Status: &nbsp;</strong><Badge className={patient?.resultStatus?.toLowerCase() == 'pending' ? 'bg-amber-400 text-white pb-1 rounded-full' : 'bg-green-500 text-white pb-1 rounded-full'}><NotebookPenIcon /> {patient.resultStatus}</Badge></p>
                                                    <p><strong>Age:</strong> {patient.age}</p>
                                                    <p><strong>Gender:</strong> {patient.gender}</p>
                                                    <p><strong>Phone:</strong> {patient.phone}</p>
                                                    <p><strong>Date:</strong> {new Date(patient.createdAt).toLocaleString()}</p>
                                                    <p><strong>Registered By:</strong> {patient?.patientRegisteredBy}</p>
                                                    {patient.tests && patient.tests.length > 0 && (
                                                        <div>
                                                            <strong>Tests: <Badge className='bg-gray-700 rounded-3xl  text-white pb-1'>{patient?.tests?.length}</Badge></strong>
                                                            <ul className="list-disc ml-5">
                                                                {patient.tests.map((t, i) => (
                                                                    <li key={i}>{t.testName} - {t.price}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>

                                    {/* Print Button */}
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className='border border-gray-500 bg-blue-600 text-white'
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
                                            <Printer /> Print
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className='hover:bg-red-100 border border-red-300 rounded-full' >
                                                    <Trash2 className="text-red-500" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className='bg-white'>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Patient?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the patient’s record.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-red-500 hover:bg-red-600 text-white"
                                                        onClick={() => handleDeletePatient(patient._id)}
                                                    >
                                                        Yes, Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan="6" className="text-center py-6 text-gray-500">
                                    No patients found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}
