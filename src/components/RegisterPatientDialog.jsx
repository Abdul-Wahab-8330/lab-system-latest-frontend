
import React, { useEffect, useState, useContext, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from "../api/axiosInstance";
import { PatientsContext } from "@/context/PatientsContext";
import ConfirmDialog from "./ConfirmDialog";
import { Trash2, Search, User } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AuthContext } from "@/context/AuthProvider";
import { Separator } from "./ui/separator";
import toast from "react-hot-toast";

export default function RegisterPatient() {
    const { createPatient, setPatients, patients, fetchPatients } = useContext(PatientsContext);
    const { user } = useContext(AuthContext);
    const [isFocused, setIsFocused] = useState(false);

    const [open, setOpen] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [tests, setTests] = useState([]);

    // Patient search functionality
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef(null);

    const [form, setForm] = useState({
        name: "",
        age: "",
        gender: "Male",
        phone: "",
        referencedBy: "Self",
        paymentStatus: 'Not Paid',
        resultStatus: 'Pending',
        paymentStatusUpdatedBy: user?.name || "System",
        patientRegisteredBy: user?.name || "System",
    });

    const [selectedTests, setSelectedTests] = useState([]);

    useEffect(() => {
        fetchDoctors();
        fetchTests();
    }, []);

    // Search patients with debounce
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (searchQuery.trim().length >= 2) {
            setIsSearching(true);
            searchTimeoutRef.current = setTimeout(() => {
                searchPatients(searchQuery);
            }, 300);
        } else {
            setSearchResults([]);
            setShowSearchResults(false);
            setIsSearching(false);
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    const searchPatients = async (query) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/patients/search?q=${encodeURIComponent(query)}`);
            setSearchResults(response.data || []);
            setShowSearchResults(true);
            setIsSearching(false);
        } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
            setShowSearchResults(false);
            setIsSearching(false);
        }
    };

    const handlePatientSelect = (patient) => {
        setForm(prev => ({
            ...prev,
            name: patient.name || "",
            age: patient.age?.toString() || "",
            gender: patient.gender || "Male",
            phone: patient.phone || "",
            referencedBy: patient.referencedBy || "Self"
        }));

        setSearchQuery(patient.name || "");
        setShowSearchResults(false);
        setSearchResults([]);
    };

    const handleNameInputChange = (e) => {
        const value = e.target.value;
        setForm({ ...form, name: value });
        setSearchQuery(value);
    };

    const clearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
        setShowSearchResults(false);
        setForm(prev => ({ ...prev, name: "" }));
    };

    const fetchDoctors = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctors`);
            setDoctors(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTests = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/tests/all`);
            console.log('tests', res.data);
            setTests(res.data.tests || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleTest = (test) => {
        const exists = selectedTests.find(t => String(t.testId) === String(test._id));
        if (exists) {
            setSelectedTests(prev => prev.filter(t => String(t.testId) !== String(test._id)));
        } else {
            setSelectedTests(prev => [...prev, { testId: test._id, testName: test.testName, price: test.testPrice }]);
        }
    };

    const handleDeleteRow = (testId) => {
        setSelectedTests(prev => prev.filter(t => String(t.testId) !== String(testId)));
    };

    const total = selectedTests.reduce((s, t) => s + (t.price || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.age || !form.gender || !form.phone) {
            toast.error("Please fill required fields");
            return;
        }
        if (selectedTests.length === 0) {
            toast.error("Please select at least one test");
            return;
        }

        try {
            const payload = {
                name: form.name,
                age: Number(form.age),
                gender: form.gender,
                phone: form.phone,
                referencedBy: form.referencedBy,
                paymentStatus: form.paymentStatus,
                paymentStatusUpdatedBy: user?.name || "System",
                patientRegisteredBy: user?.name || "System",
                resultStatus: form.resultStatus,
                selectedTests: selectedTests.map(t => ({ testId: t.testId }))
            };

            const newPatient = await createPatient(payload);

            // Reset form
            setForm({
                name: "",
                age: "",
                gender: "Male",
                phone: "",
                referencedBy: "Self",
                paymentStatus: 'Not Paid',
                resultStatus: 'Pending',
                paymentStatusUpdatedBy: user?.name || "System",
                patientRegisteredBy: user?.name || "System",
            });
            setSelectedTests([]);
            setSearchQuery("");
            setSearchResults([]);
            setShowSearchResults(false);
            setOpen(false);
            await fetchPatients();
            console.log("Patient created:", newPatient);
        } catch (err) {
            console.error("submit err:", err);
            toast.error("Failed to create patient");
        }
    };

    return (
        <div className="p-4">
            <Card className="bg-white shadow-lg rounded-xl border border-gray-200">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Register Patient</CardTitle>
                </CardHeader>
                <CardContent>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-purple-700 text-white">New Patient</Button>
                        </DialogTrigger>

                        <DialogContent className="bg-white border-none overflow-auto h-[95vh]">
                            <DialogHeader className=''>
                                <DialogTitle>Patient Registration</DialogTitle>
                            </DialogHeader>
                            <Separator/>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* Enhanced Name Input with Search */}
                                    <div className="relative">
                                        <div className="relative">
                                            <Input
                                                placeholder="Patient Name (type to search existing)"
                                                value={form.name}
                                                onChange={handleNameInputChange}
                                                onFocus={() => setIsFocused(true)}
                                                onBlur={() => {
                                                    setTimeout(() => setIsFocused(false), 200);
                                                }}
                                                required
                                                className="pr-7"
                                            />
                                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                                                {isSearching && (
                                                    <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-purple-600 rounded-full" />
                                                )}
                                                {searchQuery && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 hover:bg-gray-100"
                                                        onClick={clearSearch}
                                                    >
                                                        ×
                                                    </Button>
                                                )}
                                                <Search className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>

                                        {/* Search Results Dropdown */}
                                        {isFocused && showSearchResults && searchResults.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                                                <div className="p-2 text-xs text-gray-500 border-b bg-gray-50">
                                                    Found {searchResults.length} existing patient(s)
                                                </div>
                                                {searchResults.map((patient) => (
                                                    <div
                                                        key={patient._id}
                                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                                                        onClick={() => handlePatientSelect(patient)}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-gray-400" />
                                                            <div>
                                                                <div className="font-medium text-gray-900">{patient.name}</div>
                                                                <div className="text-sm text-gray-500">
                                                                    Age: {patient.age} • Phone: {patient.phone} • Gender: {patient.gender}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {isFocused && showSearchResults && searchResults.length === 0 && searchQuery.trim().length >= 2 && !isSearching && (
                                            <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg mt-1">
                                                <div className="p-3 text-sm text-gray-500 text-center">
                                                    No existing patients found for "{searchQuery}"
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Input
                                        placeholder="Age"
                                        type="number"
                                        value={form.age}
                                        onChange={(e) => setForm({ ...form, age: e.target.value })}
                                        required
                                    />

                                    <Select
                                        value={form.gender}
                                        onValueChange={(value) => setForm({ ...form, gender: value })}
                                    >
                                        <SelectTrigger className="w-full border p-2 rounded">
                                            <SelectValue placeholder="Select Gender" />
                                        </SelectTrigger>
                                        <SelectContent className='bg-white'>
                                            <SelectItem className='hover:bg-gray-100 rounded-sm' value="Male">Male</SelectItem>
                                            <SelectItem className='hover:bg-gray-100 rounded-sm' value="Female">Female</SelectItem>
                                            <SelectItem className='hover:bg-gray-100 rounded-sm' value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Input
                                        placeholder="Phone"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1">Referenced By</label>
                                    <Select
                                        value={form.referencedBy}
                                        onValueChange={(value) => setForm({ ...form, referencedBy: value })}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Self" />
                                        </SelectTrigger>
                                        <SelectContent className='bg-white'>
                                            <SelectItem className='hover:bg-gray-100 rounded-sm' value='Self'>Self</SelectItem>
                                            {doctors?.map((d) => (
                                                <SelectItem className='hover:bg-gray-100 rounded-sm' key={d._id} value={d.name}>
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block mb-1">Payment Status</label>
                                    <Select
                                        value={form.paymentStatus}
                                        onValueChange={(value) => setForm({ ...form, paymentStatus: value })}
                                    >
                                        <SelectTrigger className="w-full border p-2 rounded">
                                            <SelectValue placeholder="Payment Status" />
                                        </SelectTrigger>
                                        <SelectContent className='bg-white'>
                                            <SelectItem className='hover:bg-gray-100 rounded-sm' value="Not Paid">Not Paid</SelectItem>
                                            <SelectItem className='hover:bg-gray-100 rounded-sm' value="Paid">Paid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-700">Select Tests</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-auto p-2 rounded-xl bg-fuchsia-50 shadow-fuchsia-50 border border-gray-50">
                                        {tests.map(test => {
                                            const checked = !!selectedTests.find(t => String(t.testId) === String(test._id));
                                            return (
                                                <label key={test._id} className={`flex items-center justify-between p-2 rounded border border-gray-300 ${checked ? "bg-gray-100" : "bg-white"}`}>
                                                    <div className="">
                                                        <div className="font-medium">{test.testName}</div>
                                                        <div className="text-sm text-muted-foreground">Price: {test.testPrice}</div>
                                                    </div>
                                                    <input type="checkbox" checked={checked} onChange={() => handleToggleTest(test)} />
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-700">Selected Tests</h4>
                                    <div className="overflow-auto max-h-40 border border-gray-300 rounded">
                                        <table className="min-w-full">
                                            <thead className="bg-gray-100 border-none text-left">
                                                <tr>
                                                    <th className="px-2 py-1">Test</th>
                                                    <th className="px-2 py-1">Price</th>
                                                    <th className="px-2 py-1">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedTests.map(s => (
                                                    <tr key={s.testId} className="border-t">
                                                        <td className="px-2 py-1">{s.testName}</td>
                                                        <td className="px-2 py-1">{s.price}</td>
                                                        <td className="px-2 py-1">
                                                            <ConfirmDialog
                                                                title="Remove Test?"
                                                                description={`Remove "${s.testName}" from temporary selection?`}
                                                                confirmText="Remove"
                                                                cancelText="Cancel"
                                                                onConfirm={() => handleDeleteRow(s.testId)}
                                                                trigger={<Button size="sm" className="text-red-700"><Trash2 /> Delete</Button>}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-2 text-right font-semibold">Total: {total}</div>
                                </div>

                                <div className="flex gap-2 justify-end">
                                    <Button variant="outline" onClick={() => { setOpen(false); }}>Cancel</Button>
                                    <Button type="submit" className="bg-green-600 text-white">Save Patient</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    );
}