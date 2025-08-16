// import { useState, useEffect, useContext } from "react";
// import { PatientsContext } from "@/context/PatientsContext";
// import { AuthContext } from "@/context/AuthProvider";
// import { Card } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Label } from "@/components/ui/label";
// import axios from "axios";
// import { Search, ClipboardList, Check, Edit, Info, Plus, BellPlus } from "lucide-react";
// import { Progress } from "@/components/ui/progress";
// import { AddedPatientsContext } from "@/context/AddedPatientsContext";


// export default function ResultAddingComponent() {


//     const [detailsOpen, setDetailsOpen] = useState(false);
//     const [detailsPatient, setDetailsPatient] = useState(null);

//     const { fetchAddedPatients } = useContext(AddedPatientsContext)


//     const { fetchPatients, patients } = useContext(PatientsContext);
//     const { user } = useContext(AuthContext);

//     const [changedTests, setChangedTests] = useState([]);


//     const [pendingPatients, setPendingPatients] = useState([]);
//     const [filteredPatients, setFilteredPatients] = useState([]);
//     const [search, setSearch] = useState("");
//     const [testSearch, setTestSearch] = useState("");
//     const [genderFilter, setGenderFilter] = useState("All");
//     const [selectedPatient, setSelectedPatient] = useState(null);
//     const [open, setOpen] = useState(false);
//     const [confirmOpen, setConfirmOpen] = useState(false);

//     const [editedFields, setEditedFields] = useState({}); // { testId_fieldName: true }


//     // helper to compute percent based on tests where ALL fields are filled
//     const computePercentCompleted = (patient) => {
//         if (!patient?.results || patient.results.length === 0) return 0;
//         const completedCount = patient?.results?.length;
//         return Math.round((completedCount / patient.tests.length) * 100);
//     };

//     const percentCompleted = computePercentCompleted(selectedPatient);


//     useEffect(() => {
//         loadPendingPatients();
//     }, [patients]); // <-- runs whenever PatientsContext updates


//     useEffect(() => {
//         loadPendingPatients();
//     }, []);

//     const loadPendingPatients = async () => {
//         const res = await axios.get("http://localhost:5000/api/results/pending");
//         setPendingPatients(res.data);
//         setFilteredPatients(res.data);
//     };

//     // Filter function
//     useEffect(() => {
//         let data = [...pendingPatients];

//         if (search) {
//             data = data.filter(p =>
//                 p.name.toLowerCase().includes(search.toLowerCase()) ||
//                 p.refNo.toString().includes(search)
//             );
//         }
//         if (testSearch) {
//             data = data.filter(p =>
//                 p.tests.some(t => t.testName.toLowerCase().includes(testSearch.toLowerCase()))
//             );
//         }

//         setFilteredPatients(data);
//     }, [search, testSearch, pendingPatients]);


//     const openDetailsDialog = (patient) => {
//         setDetailsPatient(patient);
//         setDetailsOpen(true);
//     };


//     const openResultDialog = async (patient) => {
//         const res = await axios.get(`http://localhost:5000/api/results/${patient._id}/tests`);
//         setSelectedPatient(res.data);
//         setOpen(true);
//     };

//     const handleFieldChange = (testIndex, fieldIndex, value) => {
//         const updated = JSON.parse(JSON.stringify(selectedPatient));
//         updated.tests[testIndex].fields[fieldIndex].defaultValue = value;
//         setSelectedPatient(updated);

//         setChangedTests(prev => {
//             const updatedTest = updated.tests[testIndex];
//             const exists = prev.find(t => t._id === updatedTest._id);
//             return exists
//                 ? prev.map(t => (t._id === updatedTest._id ? updatedTest : t))
//                 : [...prev, updatedTest];
//         });


//     };


//     const submitResults = async () => {
//         if (changedTests.length === 0) {
//             alert("No changes to save!");
//             return;
//         }

//         await axios.patch(`http://localhost:5000/api/results/${selectedPatient._id}/results`, {
//             tests: changedTests,
//             resultAddedBy: user?.name
//         });

//         // Update results instantly for Saved badge & progress bar
//         setSelectedPatient(prev => {
//             const updatedResults = [...prev.results];
//             changedTests.forEach(ct => {
//                 const idx = updatedResults.findIndex(r => r.testId?.toString() === ct.testId?.toString());
//                 if (idx > -1) {
//                     updatedResults[idx] = { ...ct, testId: ct.testId }; // update existing
//                 } else {
//                     updatedResults.push({ ...ct, testId: ct.testId }); // add new
//                 }
//             });

//             return {
//                 ...prev,
//                 results: updatedResults
//             };
//         });

//         // Reset changed tests
//         setChangedTests([]);

//         // Close dialogs based on completion
//         const totalResultsAfterSave = selectedPatient.results.length + changedTests.length;
//         const allCompleted = totalResultsAfterSave >= selectedPatient.tests.length;

//         if (allCompleted) {
//             setConfirmOpen(false);
//             setOpen(false);
//             fetchPatients()
//         } else {
//             setConfirmOpen(false);
//             fetchPatients()
//         }

//         // Refresh other lists
//         loadPendingPatients();
//         await fetchPatients();
//         fetchAddedPatients()

//     };




//     return (
//         <Card className="p-4 bg-white/80 backdrop-blur-md shadow-lg border border-gray-200 m-3 rounded-2xl">
//             {/* Header */}
//             <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-3">
//                 <h2 className="text-xl font-semibold flex items-center gap-2">
//                     Add/Pending Results
//                     <Badge className='border-none bg-gray-700 text-gray-300 rounded-2xl' variant="outline">
//                         {filteredPatients.length}
//                     </Badge>
//                 </h2>

//                 {/* Filters */}
//                 <div className="grid md:grid-cols-2 grid-cols-1 items-center gap-3">
//                     <div className="flex items-center border-none relative overflow-hidden">
//                         <Input
//                             placeholder="Search by name or ref no..."
//                             className="border md:w-xs w-[250px] border-gray-500 rounded-2xl focus-visible:ring-0"
//                             value={search}
//                             onChange={(e) => setSearch(e.target.value)}
//                         />
//                         <Search className="w-4 absolute right-3 h-4 text-gray-500 ml-2" />
//                     </div>
//                     <div className="flex items-center border-none relative overflow-hidden">
//                         <Input
//                             placeholder="Search by tests..."
//                             className="border md:w-xs w-[250px] border-gray-500 rounded-2xl focus-visible:ring-0"
//                             value={testSearch}
//                             onChange={(e) => setTestSearch(e.target.value)}
//                         />
//                         <Search className="w-4 absolute right-3 h-4 text-gray-500 ml-2" />
//                     </div>
//                 </div>
//             </div>

//             <Separator className="mb-4" />

//             {/* Table */}
//             <div className="overflow-x-auto">
//                 {filteredPatients && filteredPatients?.length > 0 ? <Table className=''>
//                     <TableHeader className="bg-gray-300">
//                         <TableRow>
//                             <TableHead className="font-semibold">Ref No</TableHead>
//                             <TableHead className="font-semibold">Name</TableHead>
//                             <TableHead className="font-semibold">Gender</TableHead>
//                             <TableHead className="font-semibold">Details</TableHead>
//                             <TableHead className="font-semibold">Results Completed</TableHead>
//                             <TableHead className="font-semibold">Action</TableHead>
//                         </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                         {filteredPatients && filteredPatients?.length > 0 && filteredPatients.slice().reverse().map((p) => (
//                             <TableRow key={p._id} className="hover:bg-purple-50">
//                                 <TableCell>{p.refNo}</TableCell>
//                                 <TableCell>{p.name}</TableCell>
//                                 <TableCell>{p.gender}</TableCell>
//                                 <TableCell>
//                                     <Button
//                                         variant="outline"
//                                         size="sm"
//                                         className="border border-gray-400 bg-amber-100"
//                                         onClick={() => openDetailsDialog(p)}
//                                     >
//                                         <Info className="text-gray-800" />
//                                     </Button>
//                                 </TableCell>
//                                 <TableCell>
//                                     {p.results?.length || 0} / {p.tests.length}
//                                 </TableCell>
//                                 <TableCell>
//                                     <Button className='bg-purple-700 hover:bg-purple-800 text-white' size="sm" onClick={() => openResultDialog(p)}>
//                                         <Edit className="w-4 h-4 mr-1" /> Add Results
//                                     </Button>
//                                 </TableCell>
//                             </TableRow>
//                         ))}
//                     </TableBody>
//                 </Table> : <span className="font-semibold text-md px-1 flex gap-2 text-gray-600"><BellPlus /> No Results Pending!</span>}
//             </div>

//             {/* Add Results Dialog */}
//             <Dialog open={open} onOpenChange={setOpen}>
//                 <DialogContent className="max-w-3xl bg-white rounded-2xl border-none max-h-[90vh] overflow-auto ">
//                     <DialogHeader>
//                         <DialogTitle>Add Results for "{selectedPatient?.name}"</DialogTitle>
//                     </DialogHeader>

//                     {/* Patient Info */}
//                     {selectedPatient && (
//                         <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
//                             <p>
//                                 <span className="text-gray-600">Ref No:</span>{" "}
//                                 <span className="font-semibold text-gray-900">{selectedPatient.refNo}</span>
//                             </p>
//                             <p>
//                                 <span className="text-gray-600">Gender:</span>{" "}
//                                 <span className="font-semibold text-gray-900">{selectedPatient.gender}</span>
//                             </p>
//                             <p>
//                                 <span className="text-gray-600">Age:</span>{" "}
//                                 <span className="font-semibold text-gray-900">{selectedPatient.age || "—"}</span>
//                             </p>
//                             <p>
//                                 <span className="text-gray-600">Contact:</span>{" "}
//                                 <span className="font-semibold text-gray-900">{selectedPatient.phone || "—"}</span>
//                             </p>
//                         </div>

//                     )}
//                     {selectedPatient?.tests && (
//                         <div className="mb-4">
//                             <Progress value={percentCompleted} className="w-full h-3" />
//                             <p className="text-xs text-gray-600 mt-1">
//                                 {percentCompleted}% completed
//                             </p>
//                         </div>
//                     )}




//                     {selectedPatient?.tests?.map((test, ti) => {
//                         const isSaved = selectedPatient.results?.some(r => r.testId?.toString() === test.testId?.toString());
//                         return (
//                             <div key={ti} className="mb-2 p-3 border border-gray-400 shadow-lg rounded-lg bg-white">
//                                 <div disabled={isSaved} className="flex justify-between items-center">
//                                     <h3 className="font-semibold text-purple-700">{test.testName}</h3>
//                                     {isSaved && <Badge className="bg-white-500 text-green-500 border border-green-500 rounded-full px-2 py-0.5 mb-2">Saved</Badge>}
//                                 </div>
//                                 {test.fields.map((f, fi) => (
//                                     <div key={fi} className="flex items-center gap-2 mb-2">
//                                         <span className=" text-sm">{f.fieldName}:</span>
//                                         <Input disabled={isSaved}
//                                             value={f.defaultValue}
//                                             onChange={(e) => handleFieldChange(ti, fi, e.target.value)}
//                                             className="flex-1 border border-gray-400 rounded-xl"
//                                         />
//                                         {f.unit && <span title='Unit' className="text-sm bg-blue-50 p-1 rounded-2xl cursor-pointer">{f.unit}</span>}
//                                         {f.range && <span title='Range' className="text-sm bg-blue-50 p-1 rounded-2xl cursor-pointer">{f.range}</span>}
//                                     </div>
//                                 ))}
//                             </div>
//                         );
//                     })}


//                     <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={() => setConfirmOpen(true)}>
//                         <Check className="mr-1" /> Save Results
//                     </Button>
//                 </DialogContent>
//             </Dialog>

//             {/* Confirmation Dialog */}
//             <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
//                 <DialogContent className="max-w-md bg-white rounded-2xl border-none">
//                     <DialogHeader>
//                         <DialogTitle>Confirm Save</DialogTitle>
//                     </DialogHeader>
//                     <p>Are you sure you want to save results for <strong>{selectedPatient?.name}</strong>?</p>
//                     <div className="flex justify-end gap-2 mt-4">
//                         <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
//                         <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={submitResults}>
//                             Yes, Save
//                         </Button>
//                     </div>
//                 </DialogContent>
//             </Dialog>


//             <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
//                 <DialogContent className="max-w-lg bg-white rounded-2xl border-none shadow-lg p-6">
//                     <DialogHeader>
//                         <DialogTitle className="text-lg font-semibold text-gray-800">
//                             Patient Details
//                         </DialogTitle>
//                     </DialogHeader>

//                     {detailsPatient && (
//                         <div className="space-y-4">
//                             {/* Basic Info */}
//                             <div className="space-y-2 text-sm">
//                                 <p>
//                                     <span className="text-gray-700">Ref No:</span>{" "}
//                                     <span className="font-semibold">{detailsPatient.refNo}</span>
//                                 </p>
//                                 <p>
//                                     <span className="text-gray-700">Name:</span>{" "}
//                                     <span className="font-semibold">{detailsPatient.name}</span>
//                                 </p>
//                                 <p>
//                                     <span className="text-gray-700">Gender:</span>{" "}
//                                     <span className="font-semibold">{detailsPatient.gender}</span>
//                                 </p>
//                                 <p>
//                                     <span className="text-gray-700">Age:</span>{" "}
//                                     <span className="font-semibold">{detailsPatient.age || "—"}</span>
//                                 </p>
//                                 <p>
//                                     <span className="text-gray-700">Contact:</span>{" "}
//                                     <span className="font-semibold">{detailsPatient.phone || "—"}</span>
//                                 </p>
//                             </div>

//                             <Separator className="bg-gray-300" />

//                             {/* Tests Info */}
//                             <div>
//                                 <h3 className="font-semibold mb-3">Tests:</h3>
//                                 {detailsPatient.tests?.length > 0 ? (
//                                     detailsPatient.tests.map((t, i) => (
//                                         <div key={i} className="mb-3">
//                                             <li className="font-semibold">{t.testName}</li>
//                                             <ul className="list-disc ml-5">
//                                                 {t.fields?.map((f, fi) => (
//                                                     <li key={fi} className="text-sm">
//                                                         {f.fieldName}:{" "}
//                                                         <span className="font-semibold">
//                                                             {f.defaultValue || "—"} {f.unit || ""}
//                                                         </span>
//                                                     </li>
//                                                 ))}
//                                             </ul>
//                                         </div>
//                                     ))
//                                 ) : (
//                                     <p className="text-sm">No tests found</p>
//                                 )}
//                             </div>


//                         </div>
//                     )}
//                 </DialogContent>
//             </Dialog>






//         </Card>
//     );
// }























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
    ClipboardList, 
    Check, 
    Edit, 
    Info, 
    Plus, 
    BellPlus,
    TestTube,
    User,
    Phone,
    Calendar,
    FileText,
    Activity,
    CheckCircle,
    Clock,
    Users
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AddedPatientsContext } from "@/context/AddedPatientsContext";

export default function ResultAddingComponent() {
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [detailsPatient, setDetailsPatient] = useState(null);

    const { fetchAddedPatients } = useContext(AddedPatientsContext);
    const { fetchPatients, patients } = useContext(PatientsContext);
    const { user } = useContext(AuthContext);

    const [changedTests, setChangedTests] = useState([]);
    const [pendingPatients, setPendingPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [search, setSearch] = useState("");
    const [testSearch, setTestSearch] = useState("");
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [open, setOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const [editedFields, setEditedFields] = useState({});

    // helper to compute percent based on tests where ALL fields are filled
    const computePercentCompleted = (patient) => {
        if (!patient?.results || patient.results.length === 0) return 0;
        const completedCount = patient?.results?.length;
        return Math.round((completedCount / patient.tests.length) * 100);
    };

    const percentCompleted = computePercentCompleted(selectedPatient);

    useEffect(() => {
        loadPendingPatients();
    }, [patients]);

    useEffect(() => {
        loadPendingPatients();
    }, []);

    const loadPendingPatients = async () => {
        const res = await axios.get("http://localhost:5000/api/results/pending");
        setPendingPatients(res.data);
        setFilteredPatients(res.data);
    };

    // Filter function
    useEffect(() => {
        let data = [...pendingPatients];

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

        setFilteredPatients(data);
    }, [search, testSearch, pendingPatients]);

    const openDetailsDialog = (patient) => {
        setDetailsPatient(patient);
        setDetailsOpen(true);
    };

    const openResultDialog = async (patient) => {
        const res = await axios.get(`http://localhost:5000/api/results/${patient._id}/tests`);
        setSelectedPatient(res.data);
        setOpen(true);
    };

    const handleFieldChange = (testIndex, fieldIndex, value) => {
        const updated = JSON.parse(JSON.stringify(selectedPatient));
        updated.tests[testIndex].fields[fieldIndex].defaultValue = value;
        setSelectedPatient(updated);

        setChangedTests(prev => {
            const updatedTest = updated.tests[testIndex];
            const exists = prev.find(t => t._id === updatedTest._id);
            return exists
                ? prev.map(t => (t._id === updatedTest._id ? updatedTest : t))
                : [...prev, updatedTest];
        });
    };

    const submitResults = async () => {
        if (changedTests.length === 0) {
            alert("No changes to save!");
            return;
        }

        await axios.patch(`http://localhost:5000/api/results/${selectedPatient._id}/results`, {
            tests: changedTests,
            resultAddedBy: user?.name
        });

        // Update results instantly for Saved badge & progress bar
        setSelectedPatient(prev => {
            const updatedResults = [...prev.results];
            changedTests.forEach(ct => {
                const idx = updatedResults.findIndex(r => r.testId?.toString() === ct.testId?.toString());
                if (idx > -1) {
                    updatedResults[idx] = { ...ct, testId: ct.testId };
                } else {
                    updatedResults.push({ ...ct, testId: ct.testId });
                }
            });

            return {
                ...prev,
                results: updatedResults
            };
        });

        // Reset changed tests
        setChangedTests([]);

        // Close dialogs based on completion
        const totalResultsAfterSave = selectedPatient.results.length + changedTests.length;
        const allCompleted = totalResultsAfterSave >= selectedPatient.tests.length;

        if (allCompleted) {
            setConfirmOpen(false);
            setOpen(false);
            fetchPatients();
        } else {
            setConfirmOpen(false);
            fetchPatients();
        }

        // Refresh other lists
        loadPendingPatients();
        await fetchPatients();
        fetchAddedPatients();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 p-2">
            <div className="max-w-7xl mx-auto">
                <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-0 overflow-hidden">
                    {/* Enhanced Header */}
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 py-2">
                                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl">
                                    <ClipboardList className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold">Results Management</CardTitle>
                                    <p className="text-purple-100 mt-1">Add and manage patient test results</p>
                                </div>
                            </div>
                            <Badge className="bg-white/20 text-white border-0 px-4 py-2 rounded-xl">
                                <Activity className="h-4 w-4 mr-1" />
                                {filteredPatients?.length || 0} Pending
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8">
                        {/* Enhanced Filter Section */}
                        <div className="mb-8">
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
                                            className="h-12 pl-4 pr-10 border-2 border-gray-200 focus:border-purple-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70"
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
                                            className="h-12 pl-4 pr-10 border-2 border-gray-200 focus:border-purple-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70"
                                            value={testSearch}
                                            onChange={(e) => setTestSearch(e.target.value)}
                                        />
                                        <TestTube className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    </div>
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
                                                    <Users className="inline h-4 w-4 mr-2" />
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
                                                    Progress
                                                </TableHead>
                                                <TableHead className="font-bold text-gray-800">
                                                    <Edit className="inline h-4 w-4 mr-2" />
                                                    Action
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredPatients.slice().reverse().map((p, index) => (
                                                <TableRow 
                                                    key={p._id} 
                                                    className={`transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 ${
                                                        index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
                                                    }`}
                                                >
                                                    <TableCell className="font-semibold text-purple-700 py-4">
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
                                                            onClick={() => openDetailsDialog(p)}
                                                        >
                                                            <Info className="h-4 w-4 text-amber-600" />
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-gray-600">
                                                                {p.results?.length || 0} / {p.tests.length}
                                                            </span>
                                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-300"
                                                                    style={{
                                                                        width: `${((p.results?.length || 0) / p.tests.length) * 100}%`
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button 
                                                            size="sm" 
                                                            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                                            onClick={() => openResultDialog(p)}
                                                        >
                                                            <Edit className="w-4 h-4 mr-1" />
                                                            Add Results
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                                                <BellPlus className="h-8 w-8 text-purple-400" />
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Results</h3>
                                                <p className="text-gray-500">All results have been completed or no patients found matching your search.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Add Results Dialog */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-4xl h-[95vh] overflow-auto bg-white rounded-2xl border-0 shadow-2xl max-h-[90vh] overflow-auto">
                        <DialogHeader className="pb-4">
                            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                    <TestTube className="h-4 w-4 text-purple-600" />
                                </div>
                                Add Results for "{selectedPatient?.name}"
                            </DialogTitle>
                        </DialogHeader>
                        <Separator className="bg-gray-200" />

                        {/* Patient Info Card */}
                        {selectedPatient && (
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-6">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center">
                                        <FileText className="h-4 w-4 mr-2 text-purple-600" />
                                        <span className="text-gray-600">Ref No:</span>
                                        <span className="font-semibold text-gray-900 ml-2">{selectedPatient.refNo}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <User className="h-4 w-4 mr-2 text-purple-600" />
                                        <span className="text-gray-600">Gender:</span>
                                        <span className="font-semibold text-gray-900 ml-2">{selectedPatient.gender}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                                        <span className="text-gray-600">Age:</span>
                                        <span className="font-semibold text-gray-900 ml-2">{selectedPatient.age || "—"}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Phone className="h-4 w-4 mr-2 text-purple-600" />
                                        <span className="text-gray-600">Contact:</span>
                                        <span className="font-semibold text-gray-900 ml-2">{selectedPatient.phone || "—"}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Progress Bar */}
                        {selectedPatient?.tests && (
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                                    <span className="text-sm font-semibold text-purple-600">{percentCompleted}% completed</span>
                                </div>
                                <Progress value={percentCompleted} className="w-full h-3 bg-gray-200">
                                    <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-500" />
                                </Progress>
                            </div>
                        )}

                        {/* Tests */}
                        <div className="space-y-4">
                            {selectedPatient?.tests?.map((test, ti) => {
                                const isSaved = selectedPatient.results?.some(r => r.testId?.toString() === test.testId?.toString());
                                return (
                                    <div key={ti} className={`p-4 border-2 rounded-xl shadow-sm transition-all duration-200 ${
                                        isSaved ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white hover:border-purple-200'
                                    }`}>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-semibold text-lg text-purple-700 flex items-center">
                                                <TestTube className="h-5 w-5 mr-2" />
                                                {test.testName}
                                            </h3>
                                            {isSaved && (
                                                <Badge className="bg-green-100 text-green-700 border border-green-300 rounded-full px-3 py-1">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Saved
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {test.fields.map((f, fi) => (
                                                <div key={fi} className="space-y-2">
                                                    <Label className="text-sm font-medium text-gray-700">{f.fieldName}</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            disabled={isSaved}
                                                            value={f.defaultValue}
                                                            onChange={(e) => handleFieldChange(ti, fi, e.target.value)}
                                                            className={`flex-1 border-2 rounded-lg transition-all duration-200 ${
                                                                isSaved 
                                                                ? 'border-green-200 bg-green-50' 
                                                                : 'border-gray-200 focus:border-purple-500'
                                                            }`}
                                                        />
                                                        {f.unit && (
                                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                                {f.unit}
                                                            </Badge>
                                                        )}
                                                        {f.range && (
                                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                                                {f.range}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-end pt-6">
                            <Button 
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                onClick={() => setConfirmOpen(true)}
                            >
                                <Check className="mr-2 h-4 w-4" />
                                Save Results
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Confirmation Dialog */}
                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogContent className="max-w-md bg-white rounded-2xl border-0 shadow-2xl">
                        <DialogHeader className="pb-4">
                            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                                Confirm Save
                            </DialogTitle>
                        </DialogHeader>
                        <Separator className="bg-gray-200" />
                        <div className="py-4">
                            <p className="text-gray-600">
                                Are you sure you want to save results for{" "}
                                <span className="font-semibold text-gray-900">{selectedPatient?.name}</span>?
                            </p>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setConfirmOpen(false)}
                                    className="rounded-lg"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg"
                                    onClick={submitResults}
                                >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Yes, Save
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Patient Details Dialog */}
                <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                    <DialogContent className="max-w-2xl bg-white rounded-2xl border-0 shadow-2xl">
                        <DialogHeader className="pb-4">
                            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
                                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                                    <Info className="h-4 w-4 text-amber-600" />
                                </div>
                                Patient Details
                            </DialogTitle>
                        </DialogHeader>
                        <Separator className="bg-gray-200" />

                        {detailsPatient && (
                            <div className="py-4 space-y-6">
                                {/* Basic Info */}
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6">
                                    <h3 className="font-semibold text-amber-800 mb-4 flex items-center">
                                        <User className="h-4 w-4 mr-2" />
                                        Basic Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Ref No:</span>
                                            <span className="font-semibold text-amber-700 ml-2">{detailsPatient.refNo}</span>
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
                                    </div>
                                </div>

                                {/* Tests Info */}
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                                        <TestTube className="h-4 w-4 mr-2" />
                                        Tests & Parameters
                                        <Badge className="bg-purple-100 text-purple-800 rounded-full px-3 py-1 ml-2">
                                            {detailsPatient.tests?.length || 0}
                                        </Badge>
                                    </h3>
                                    {detailsPatient.tests?.length > 0 ? (
                                        <div className="space-y-4">
                                            {detailsPatient.tests.map((t, i) => (
                                                <div key={i} className="bg-purple-50 rounded-lg p-4">
                                                    <h4 className="font-semibold text-purple-800 mb-3">{t.testName}</h4>
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
                                            ))}
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
            </div>
        </div>
    );
}