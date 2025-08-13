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
import { Card } from "@/components/ui/card";
import { Check, DollarSign, Info, NotebookPenIcon, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import axios from "axios";

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
                `http://localhost:5000/api/patients/${id}/payment`,
                {
                    paymentStatus: "Paid",
                    paymentStatusUpdatedBy: user.name
                }
            );

            if (res.status === 200) {
                fetchPatients();
            }
        } catch (error) {
            console.error(error);
            alert("Error updating payment status");
        }
    };

    return (
        <Card className="p-4 mt-8 bg-white/80 backdrop-blur-md shadow-lg border rounded-2xl">
            {/* Filters */}
            <div className="mb-4 flex items-center justify-between ">
                <div className="text-xl font-semibold">Manage Payments <span className="bg-gray-700 rounded-full px-2 py-1 text-[12px] text-gray-300">{filteredPatients?.length}</span></div>
                <div className=" grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="relative">
                        <Input placeholder="Search Name / Ref No..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-2xl border-gray-500 pr-10" />
                        <Search className="absolute right-3 top-2 text-gray-500" size={18} />
                    </div>
                    <div className="relative">
                        <Input placeholder="Search Test Name..." value={testSearch} onChange={(e) => setTestSearch(e.target.value)} className="rounded-2xl border-gray-500 pr-10" />
                        <Search className="absolute right-3 top-2 text-gray-500" size={18} />
                    </div>
                    <input type="date" value={dateSearch} onChange={(e) => setDateSearch(e.target.value)} className="border border-gray-500 px-3 rounded-3xl" />
                    <Select
                        value={paymentFilter}
                        onValueChange={setPaymentFilter}
                    >
                        <SelectTrigger className="w-full border border-gray-500 rounded-3xl">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className='bg-white'>
                            <SelectItem value="All">All Status</SelectItem>
                            <SelectItem value="Not Paid">Not Paid</SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                        </SelectContent>
                    </Select>
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
                            <TableHead>Phone</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Payment Status</TableHead>
                            <TableHead>Result Status</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPatients.length > 0 ? (
                            filteredPatients.slice().reverse().map((patient) => {
                                const disableRow = patient.paymentStatus === "Completed" || patient.resultStatus !== "Added";
                                return (
                                    <TableRow key={patient._id} className={disableRow ? "opacity-50 pointer-events-none" : ""}>
                                        <TableCell>{patient.refNo}</TableCell>
                                        <TableCell>{patient.name}</TableCell>
                                        <TableCell>{patient.age}</TableCell>
                                        <TableCell>{patient.gender}</TableCell>
                                        <TableCell>{patient.phone}</TableCell>
                                        <TableCell>{new Date(patient.createdAt).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge className={patient?.paymentStatus?.toLowerCase() === "not paid" ? "bg-amber-400 text-white" : "bg-green-500 text-white"}>
                                                <DollarSign /> {patient.paymentStatus}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={patient?.resultStatus?.toLowerCase() === "pending" ? "bg-amber-400 text-white" : "bg-green-500 text-white"}>
                                                <NotebookPenIcon /> {patient.resultStatus}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {patient?.resultStatus === "Added" && patient?.paymentStatus.toLowerCase() === "not paid" ? (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" className="button-animation">
                                                            Mark as Paid
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="bg-white rounded-2xl border-none max-w-md">
                                                        <DialogHeader>
                                                            <DialogTitle>Confirm Payment Update</DialogTitle>
                                                        </DialogHeader>
                                                        <p>
                                                            Are you sure you want to mark the payment as complete for
                                                            <strong> {patient.name} </strong> as user
                                                            <strong> {user.name}</strong>?
                                                        </p>
                                                        <div className="flex justify-end gap-2 mt-4">
                                                            <Button
                                                                className="bg-green-500 text-white"
                                                                onClick={() => handlePaymentUpdate(patient._id)}
                                                            >
                                                                Yes, Mark as Paid
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            ) : (
                                                <span className="text-gray-500 text-sm">{patient?.resultStatus?.toLowerCase()=='pending' && patient?.paymentStatus?.toLowerCase()=='not paid' ? 'Waiting for Results...' : 'Payment Done'}</span>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="outline" className="border border-gray-400 bg-amber-100">
                                                        <Info className="text-gray-800" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-lg bg-white rounded-2xl border-none">
                                                    <DialogHeader>
                                                        <DialogTitle>Patient Details</DialogTitle>
                                                    </DialogHeader>
                                                    <Separator className="bg-black" />
                                                    <div className="space-y-2">
                                                        <p><strong>Ref No:</strong> {patient.refNo}</p>
                                                        <p><strong>Name:</strong> {patient.name}</p>
                                                        <p><strong>Payment Status:</strong> {patient.paymentStatus}</p>
                                                        <p><strong>Payment Status Updated By:</strong> {patient.paymentStatusUpdatedBy}</p>
                                                        <p><strong>Result Status:</strong> {patient.resultStatus}</p>
                                                        <p><strong>Age:</strong> {patient.age}</p>
                                                        <p><strong>Gender:</strong> {patient.gender}</p>
                                                        <p><strong>Phone:</strong> {patient.phone}</p>
                                                        <p><strong>Date:</strong> {new Date(patient.createdAt).toLocaleString()}</p>
                                                        <p><strong>Total Amount:</strong> {patient?.total}</p>
                                                        {patient.tests?.length > 0 && (
                                                            <div>
                                                                <strong>Tests:</strong>
                                                                <ul className="list-disc ml-5">
                                                                    {patient.tests.map((t, i) => (
                                                                        <li key={i}>{t.testName} - Rs.{t.price}</li>
                                                                    ))}
                                                                </ul>
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
                                <TableCell colSpan="10" className="text-center py-6 text-gray-500">
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
