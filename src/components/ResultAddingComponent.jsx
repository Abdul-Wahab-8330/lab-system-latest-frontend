import { useState, useEffect, useContext } from "react";
import { PatientsContext } from "@/context/PatientsContext";
import { AuthContext } from "@/context/AuthProvider";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { Search, ClipboardList, Check, Edit, Info, Plus, BellPlus } from "lucide-react";
import { Progress } from "@/components/ui/progress";


export default function ResultAddingComponent() {


    const [detailsOpen, setDetailsOpen] = useState(false);
    const [detailsPatient, setDetailsPatient] = useState(null);



    const { fetchPatients, patients } = useContext(PatientsContext);
    const { user } = useContext(AuthContext);

    const [changedTests, setChangedTests] = useState([]);


    const [pendingPatients, setPendingPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [search, setSearch] = useState("");
    const [testSearch, setTestSearch] = useState("");
    const [genderFilter, setGenderFilter] = useState("All");
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [open, setOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const [editedFields, setEditedFields] = useState({}); // { testId_fieldName: true }


    // helper to compute percent based on tests where ALL fields are filled
    const computePercentCompleted = (patient) => {
        if (!patient?.results || patient.results.length === 0) return 0;
        const completedCount = patient?.results?.length;
        return Math.round((completedCount / patient.tests.length) * 100);
    };

    const percentCompleted = computePercentCompleted(selectedPatient);


    useEffect(() => {
        loadPendingPatients();
    }, [patients]); // <-- runs whenever PatientsContext updates


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
                    updatedResults[idx] = { ...ct, testId: ct.testId }; // update existing
                } else {
                    updatedResults.push({ ...ct, testId: ct.testId }); // add new
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
            fetchPatients()
        } else {
            setConfirmOpen(false);
            fetchPatients()
        }

        // Refresh other lists
        loadPendingPatients();
        await fetchPatients();
    };




    return (
        <Card className="p-4 mt-8 bg-white/80 backdrop-blur-md shadow-lg border rounded-2xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-3">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    Pending Results
                    <Badge className='border-none bg-gray-700 text-gray-300 rounded-2xl pb-1' variant="outline">
                        {filteredPatients.length}
                    </Badge>
                </h2>

                {/* Filters */}
                <div className="grid md:grid-cols-2 grid-cols-1 items-center gap-3">
                    <div className="flex items-center border-none relative overflow-hidden">
                        <Input
                            placeholder="Search by name or ref no..."
                            className="border md:w-xs w-[250px] border-gray-500 rounded-2xl focus-visible:ring-0"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Search className="w-4 absolute right-3 h-4 text-gray-500 ml-2" />
                    </div>
                    <div className="flex items-center border-none relative overflow-hidden">
                        <Input
                            placeholder="Search by tests..."
                            className="border md:w-xs w-[250px] border-gray-500 rounded-2xl focus-visible:ring-0"
                            value={testSearch}
                            onChange={(e) => setTestSearch(e.target.value)}
                        />
                        <Search className="w-4 absolute right-3 h-4 text-gray-500 ml-2" />
                    </div>
                </div>
            </div>

            <Separator className="mb-4" />

            {/* Table */}
            <div className="overflow-x-auto">
                {filteredPatients && filteredPatients?.length > 0 ? <Table className=''>
                    <TableHeader className="bg-gray-300">
                        <TableRow>
                            <TableHead className="font-semibold">Ref No</TableHead>
                            <TableHead className="font-semibold">Name</TableHead>
                            <TableHead className="font-semibold">Gender</TableHead>
                            <TableHead className="font-semibold">Details</TableHead>
                            <TableHead className="font-semibold">Results Completed</TableHead>
                            <TableHead className="font-semibold">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPatients && filteredPatients?.length > 0 && filteredPatients.slice().reverse().map((p) => (
                            <TableRow key={p._id} className="hover:bg-purple-50">
                                <TableCell>{p.refNo}</TableCell>
                                <TableCell>{p.name}</TableCell>
                                <TableCell>{p.gender}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border border-gray-400 bg-amber-100"
                                        onClick={() => openDetailsDialog(p)}
                                    >
                                        <Info className="text-gray-800" />
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    {p.results?.length || 0} / {p.tests.length}
                                </TableCell>
                                <TableCell>
                                    <Button className='bg-purple-700 hover:bg-purple-800 text-white' size="sm" onClick={() => openResultDialog(p)}>
                                        <Edit className="w-4 h-4 mr-1" /> Add Results
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table> : <span className="font-semibold text-md px-1 flex gap-2 text-gray-600"><BellPlus /> No Results Pending!</span>}
            </div>

            {/* Add Results Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-3xl bg-white rounded-2xl border-none max-h-[90vh] overflow-auto ">
                    <DialogHeader>
                        <DialogTitle>Add Results for "{selectedPatient?.name}"</DialogTitle>
                    </DialogHeader>

                    {/* Patient Info */}
                    {selectedPatient && (
                        <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                            <p>
                                <span className="text-gray-600">Ref No:</span>{" "}
                                <span className="font-semibold text-gray-900">{selectedPatient.refNo}</span>
                            </p>
                            <p>
                                <span className="text-gray-600">Gender:</span>{" "}
                                <span className="font-semibold text-gray-900">{selectedPatient.gender}</span>
                            </p>
                            <p>
                                <span className="text-gray-600">Age:</span>{" "}
                                <span className="font-semibold text-gray-900">{selectedPatient.age || "—"}</span>
                            </p>
                            <p>
                                <span className="text-gray-600">Contact:</span>{" "}
                                <span className="font-semibold text-gray-900">{selectedPatient.phone || "—"}</span>
                            </p>
                        </div>

                    )}
                    {selectedPatient?.tests && (
                        <div className="mb-4">
                            <Progress value={percentCompleted} className="w-full h-3" />
                            <p className="text-xs text-gray-600 mt-1">
                                {percentCompleted}% completed
                            </p>
                        </div>
                    )}




                    {selectedPatient?.tests?.map((test, ti) => {
                        const isSaved = selectedPatient.results?.some(r => r.testId?.toString() === test.testId?.toString());
                        return (
                            <div key={ti} className="mb-2 p-3 border border-gray-400 shadow-lg rounded-lg bg-white">
                                <div disabled={isSaved} className="flex justify-between items-center">
                                    <h3 className="font-semibold text-purple-700">{test.testName}</h3>
                                    {isSaved && <Badge className="bg-white-500 text-green-500 border border-green-500 rounded-full px-2 py-0.5 mb-2">Saved</Badge>}
                                </div>
                                {test.fields.map((f, fi) => (
                                    <div  key={fi} className="flex items-center gap-2 mb-2">
                                        <span className="w-20 text-sm">{f.fieldName}:</span>
                                        <Input disabled={isSaved}
                                            value={f.defaultValue}
                                            onChange={(e) => handleFieldChange(ti, fi, e.target.value)}
                                            className="flex-1 border border-gray-400 rounded-xl"
                                        />
                                        {f.unit && <span title='Unit' className="text-sm bg-blue-50 p-1 rounded-2xl cursor-pointer">{f.unit}</span>}
                                        {f.range && <span title='Range' className="text-sm bg-blue-50 p-1 rounded-2xl cursor-pointer">{f.range}</span>}
                                    </div>
                                ))}
                            </div>
                        );
                    })}


                    <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={() => setConfirmOpen(true)}>
                        <Check className="mr-1" /> Save Results
                    </Button>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="max-w-md bg-white rounded-2xl border-none">
                    <DialogHeader>
                        <DialogTitle>Confirm Save</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to save results for <strong>{selectedPatient?.name}</strong>?</p>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                        <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={submitResults}>
                            Yes, Save
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>


            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-lg bg-white rounded-2xl border-none shadow-lg p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-gray-800">
                            Patient Details
                        </DialogTitle>
                    </DialogHeader>

                    {detailsPatient && (
                        <div className="space-y-4">
                            {/* Basic Info */}
                            <div className="space-y-2 text-sm">
                                <p>
                                    <span className="text-gray-700">Ref No:</span>{" "}
                                    <span className="font-semibold">{detailsPatient.refNo}</span>
                                </p>
                                <p>
                                    <span className="text-gray-700">Name:</span>{" "}
                                    <span className="font-semibold">{detailsPatient.name}</span>
                                </p>
                                <p>
                                    <span className="text-gray-700">Gender:</span>{" "}
                                    <span className="font-semibold">{detailsPatient.gender}</span>
                                </p>
                                <p>
                                    <span className="text-gray-700">Age:</span>{" "}
                                    <span className="font-semibold">{detailsPatient.age || "—"}</span>
                                </p>
                                <p>
                                    <span className="text-gray-700">Contact:</span>{" "}
                                    <span className="font-semibold">{detailsPatient.phone || "—"}</span>
                                </p>
                            </div>

                            <Separator className="bg-gray-300" />

                            {/* Tests Info */}
                            <div>
                                <h3 className="font-semibold mb-3">Tests:</h3>
                                {detailsPatient.tests?.length > 0 ? (
                                    detailsPatient.tests.map((t, i) => (
                                        <div key={i} className="mb-3">
                                            <li className="font-semibold">{t.testName}</li>
                                            <ul className="list-disc ml-5">
                                                {t.fields?.map((f, fi) => (
                                                    <li key={fi} className="text-sm">
                                                        {f.fieldName}:{" "}
                                                        <span className="font-semibold">
                                                            {f.defaultValue || "—"} {f.unit || ""}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm">No tests found</p>
                                )}
                            </div>


                        </div>
                    )}
                </DialogContent>
            </Dialog>






        </Card>
    );
}



