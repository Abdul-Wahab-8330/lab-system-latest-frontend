import { useState, useEffect, useContext } from "react";
import { PatientsContext } from "@/context/PatientsContext";
import { AuthContext } from "@/context/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { 
    Search, 
    Users, 
    Check, 
    Edit, 
    Info, 
    Plus, 
    UserCheck,
    TestTube,
    User,
    Phone,
    Calendar,
    FileText,
    Activity,
    CheckCircle,
    Clock,
    Database,
    Trash2,
    AlertTriangle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export default function AllPatientsComponent() {
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [detailsPatient, setDetailsPatient] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState(null);

    const { fetchPatients, patients } = useContext(PatientsContext);
    const { user } = useContext(AuthContext);

    const [filteredPatients, setFilteredPatients] = useState([]);
    const [search, setSearch] = useState("");
    const [testSearch, setTestSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // helper to compute percent based on tests where ALL fields are filled
    const computePercentCompleted = (patient) => {
        if (!patient?.results || patient.results.length === 0) return 0;
        const completedCount = patient?.results?.length;
        return Math.round((completedCount / patient.tests.length) * 100);
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    // Filter function
    useEffect(() => {
        let data = [...(patients || [])];

        if (search) {
            data = data.filter(p =>
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.refNo.toString().includes(search)
            );
        }
        
        if (testSearch) {
            data = data.filter(p =>
                p.tests.some(t => t.testName.toLowerCase().includes(testSearch.toLowerCase()))
            );
        }

        if (statusFilter !== "all") {
            data = data.filter(p => {
                const completionPercent = computePercentCompleted(p);
                if (statusFilter === "completed") return completionPercent === 100;
                if (statusFilter === "pending") return completionPercent < 100;
                if (statusFilter === "in-progress") return completionPercent > 0 && completionPercent < 100;
                return true;
            });
        }

        setFilteredPatients(data);
    }, [search, testSearch, statusFilter, patients]);

    const openDetailsDialog = (patient) => {
        setDetailsPatient(patient);
        setDetailsOpen(true);
    };

    const openDeleteDialog = (patient) => {
        setPatientToDelete(patient);
        setDeleteOpen(true);
    };

    const handleDeletePatient = async () => {
        try {
            const res = await axios.delete(`http://localhost:5000/api/patients/delete/${patientToDelete._id}`);
            if (res.data.success) {
                console.log('patient deleted');
                setDeleteOpen(false);
                setPatientToDelete(null);
                fetchPatients(); // Refresh the patients list
            }
        } catch (error) {
            console.log(error);
            alert("Failed to delete patient. Please try again.");
        }
    };

    const getStatusBadge = (patient) => {
        const percent = computePercentCompleted(patient);
        if (percent === 100) {
            return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 rounded-full px-3 py-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
            </Badge>;
        } else if (percent > 0) {
            return <Badge className="bg-blue-100 text-blue-700 border-blue-200 rounded-full px-3 py-1">
                <Clock className="h-3 w-3 mr-1" />
                In Progress
            </Badge>;
        } else {
            return <Badge className="bg-orange-100 text-orange-700 border-orange-200 rounded-full px-3 py-1">
                <Clock className="h-3 w-3 mr-1" />
                Pending
            </Badge>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 p-2">
            <div className="max-w-7xl mx-auto">
                <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-0 overflow-hidden">
                    {/* Enhanced Header */}
                    <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold">All Patients</CardTitle>
                                    <p className="text-emerald-100 mt-1">View and manage all patient records</p>
                                </div>
                            </div>
                            <Badge className="bg-white/20 text-white border-0 px-4 py-2 rounded-xl">
                                <Database className="h-4 w-4 mr-1" />
                                {filteredPatients?.length || 0} Total
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8">
                        {/* Enhanced Filter Section */}
                        <div className="mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Name/Ref Search */}
                                <div className="relative group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <Search className="inline h-4 w-4 mr-1" />
                                        Search Patient
                                    </label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Name or Reference No..."
                                            className="h-12 pl-4 pr-10 border-2 border-gray-200 focus:border-emerald-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70"
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
                                            className="h-12 pl-4 pr-10 border-2 border-gray-200 focus:border-emerald-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70"
                                            value={testSearch}
                                            onChange={(e) => setTestSearch(e.target.value)}
                                        />
                                        <TestTube className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    </div>
                                </div>

                                {/* Status Filter */}
                                 <div className="relative group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <Activity className="inline h-4 w-4 mr-1" />
                                        Status Filter
                                    </label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="h-12 w-full border-2 border-gray-200 focus:border-emerald-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70 text-gray-700">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                                            <SelectItem value="all" className="hover:bg-emerald-50">All Patients</SelectItem>
                                            <SelectItem value="completed" className="hover:bg-emerald-50">Completed</SelectItem>
                                            <SelectItem value="in-progress" className="hover:bg-emerald-50">In Progress</SelectItem>
                                            <SelectItem value="pending" className="hover:bg-emerald-50">Pending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <Separator className="mb-8 bg-gray-200" />

                        {/* Enhanced Table */}
                        <div className="rounded-2xl overflow-hidden border-2 border-gray-100 shadow-lg bg-white">
                            <div className="overflow-x-auto">
                                {filteredPatients && filteredPatients?.length > 0 ? (
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
                                                    <Users className="inline h-4 w-4 mr-2" />
                                                    Gender
                                                </TableHead>
                                                <TableHead className="font-bold text-gray-800">
                                                    <Calendar className="inline h-4 w-4 mr-2" />
                                                    Age
                                                </TableHead>
                                                <TableHead className="font-bold text-gray-800">
                                                    <Activity className="inline h-4 w-4 mr-2" />
                                                    Status
                                                </TableHead>
                                                <TableHead className="font-bold text-gray-800">
                                                    <Activity className="inline h-4 w-4 mr-2" />
                                                    Progress
                                                </TableHead>
                                                <TableHead className="font-bold text-gray-800">
                                                    <Info className="inline h-4 w-4 mr-2" />
                                                    Details
                                                </TableHead>
                                                <TableHead className="font-bold text-gray-800">
                                                    <Edit className="inline h-4 w-4 mr-2" />
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredPatients.slice().reverse().map((p, index) => (
                                                <TableRow 
                                                    key={p._id} 
                                                    className={`transition-all duration-200 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 ${
                                                        index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
                                                    }`}
                                                >
                                                    <TableCell className="font-semibold text-emerald-700 py-4">
                                                        {p.refNo}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-gray-900">
                                                        {p.name}
                                                    </TableCell>
                                                    <TableCell className="text-gray-700">
                                                        {p.gender}
                                                    </TableCell>
                                                    <TableCell className="text-gray-700">
                                                        {p.age || "—"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(p)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-gray-600">
                                                                {p.results?.length || 0} / {p.tests.length}
                                                            </span>
                                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-300"
                                                                    style={{
                                                                        width: `${computePercentCompleted(p)}%`
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 rounded-lg transition-all duration-200"
                                                            onClick={() => openDetailsDialog(p)}
                                                        >
                                                            <Info className="h-4 w-4 text-blue-600" />
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300 rounded-lg transition-all duration-200"
                                                                onClick={() => openDeleteDialog(p)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-600" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <Users className="h-8 w-8 text-emerald-400" />
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Patients Found</h3>
                                                <p className="text-gray-500">No patients match your current search criteria.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Patient Details Dialog */}
                <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                    <DialogContent className="max-w-2xl h-[95vh] overflow-auto bg-white rounded-2xl border-0 shadow-2xl">
                        <DialogHeader className="pb-4">
                            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                    <Info className="h-4 w-4 text-blue-600" />
                                </div>
                                Patient Details
                            </DialogTitle>
                        </DialogHeader>
                        <Separator className="bg-gray-200" />

                        {detailsPatient && (
                            <div className="py-4 space-y-6">
                                {/* Basic Info */}
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6">
                                    <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
                                        <User className="h-4 w-4 mr-2" />
                                        Basic Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Ref No:</span>
                                            <span className="font-semibold text-blue-700 ml-2">{detailsPatient.refNo}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Name:</span>
                                            <span className="font-semibold text-gray-900 ml-2">{detailsPatient.name}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Gender:</span>
                                            <span className="font-semibold text-gray-900 ml-2">{detailsPatient.gender}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Age:</span>
                                            <span className="font-semibold text-gray-900 ml-2">{detailsPatient.age || "—"}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-600">Contact:</span>
                                            <span className="font-semibold text-gray-900 ml-2">{detailsPatient.phone || "—"}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-600">Status:</span>
                                            <span className="ml-2">{getStatusBadge(detailsPatient)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Overview */}
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6">
                                    <h3 className="font-semibold text-emerald-800 mb-4 flex items-center">
                                        <Activity className="h-4 w-4 mr-2" />
                                        Progress Overview
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-700">Overall Completion</span>
                                            <span className="text-sm font-semibold text-emerald-600">
                                                {computePercentCompleted(detailsPatient)}% completed
                                            </span>
                                        </div>
                                        <Progress value={computePercentCompleted(detailsPatient)} className="w-full h-3 bg-gray-200">
                                            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500" />
                                        </Progress>
                                        <div className="text-sm text-gray-600">
                                            {detailsPatient.results?.length || 0} of {detailsPatient.tests?.length || 0} tests completed
                                        </div>
                                    </div>
                                </div>

                                {/* Tests Info */}
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                                        <TestTube className="h-4 w-4 mr-2" />
                                        Tests & Parameters
                                        <Badge className="bg-emerald-100 text-emerald-800 rounded-full px-3 py-1 ml-2">
                                            {detailsPatient.tests?.length || 0}
                                        </Badge>
                                    </h3>
                                    {detailsPatient.tests?.length > 0 ? (
                                        <div className="space-y-4">
                                            {detailsPatient.tests.map((t, i) => {
                                                const isCompleted = detailsPatient.results?.some(r => r.testId?.toString() === t.testId?.toString());
                                                return (
                                                    <div key={i} className={`rounded-lg p-4 ${isCompleted ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50'}`}>
                                                        <div className="flex justify-between items-center mb-3">
                                                            <h4 className={`font-semibold ${isCompleted ? 'text-emerald-800' : 'text-gray-800'}`}>
                                                                {t.testName}
                                                            </h4>
                                                            {isCompleted && (
                                                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 rounded-full px-2 py-1 text-xs">
                                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                                    Completed
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {t.fields?.map((f, fi) => (
                                                                <div key={fi} className="bg-white rounded-lg p-3 text-sm">
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-gray-700">{f.fieldName}:</span>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-semibold text-gray-900">
                                                                                {f.defaultValue || "—"}
                                                                            </span>
                                                                            {f.unit && (
                                                                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                                                                    {f.unit}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {f.range && (
                                                                        <div className="text-xs text-gray-500 mt-1">
                                                                            Range: {f.range}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <TestTube className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p>No tests found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

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
            </div>
        </div>
    );
}