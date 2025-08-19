
import React, { useEffect, useState, useContext, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { PatientsContext } from "@/context/PatientsContext";
import ConfirmDialog from "./ConfirmDialog";
import { Trash2, Search, User, UserPlus, FileText, CreditCard, TestTube, CheckCircle } from "lucide-react";
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
    const [isLoadingTests, setIsLoadingTests] = useState(true);
    const [testsError, setTestsError] = useState(null);
    const [loading, SetLoading] = useState(false)

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
            setIsLoadingTests(true);
            setTestsError(null);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/tests/all`);
            console.log('Full API response:', res.data);

            // Handle different possible response structures
            let testsData = [];
            if (res.data.tests) {
                testsData = res.data.tests;
            } else if (Array.isArray(res.data)) {
                testsData = res.data;
            } else if (res.data.data) {
                testsData = res.data.data;
            }

            console.log('Extracted tests:', testsData);
            setTests(testsData || []);
        } catch (err) {
            console.error('Error fetching tests:', err);
            setTestsError('Failed to load tests. Please refresh the page.');
            setTests([]);
        } finally {
            setIsLoadingTests(false);
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
        SetLoading(true)
        if (!form.name || !form.age || !form.gender || !form.phone) {
            alert("Please fill required fields");
            return;
        }
        if (selectedTests.length === 0) {
            alert("Please select at least one test");
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
            await fetchPatients();
            console.log("Patient created:", newPatient);
            toast.success('Registered Successfully!')
            
        } catch (err) {
            console.error("submit err:", err);
            toast.error("Failed to create patient");
        }finally{
            SetLoading(false)
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className=" m-2">
                {/* Header Section */}
                <div className="text-center mt-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
                        <UserPlus className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Registration</h1>
                    <p className="text-gray-600">Complete patient information and select required tests</p>
                </div>

                <Card className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-0 border-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-500 px-8 py-5">
                        <h2 className="text-2xl font-semibold text-white flex items-center">
                            <div className="px-3 py-3 flex justify-center items-center rounded-xl mr-2 bg-blue-500">
                                <FileText className="h-6 w-6" />
                            </div>
                            Patient Registration
                        </h2>
                    </div>

                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-10">
                            {/* Patient Information Section */}
                            <div className="space-y-6">
                                <div className="flex items-center mb-6">
                                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-3">
                                        <User className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800">Patient Information</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Enhanced Name Input with Search */}
                                    <div className="relative">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Patient Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter patient name or search existing"
                                                value={form.name}
                                                onChange={handleNameInputChange}
                                                onFocus={() => setIsFocused(true)}
                                                onBlur={() => {
                                                    setTimeout(() => setIsFocused(false), 200);
                                                }}
                                                required
                                                className="pr-12 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70"
                                            />
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
                                                {isSearching && (
                                                    <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full" />
                                                )}
                                                {searchQuery && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
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
                                            <div className="absolute top-full left-0 right-0 z-50 bg-white border-2 border-gray-100 rounded-xl shadow-2xl max-h-48 overflow-y-auto mt-2">
                                                <div className="p-3 text-xs font-medium text-gray-500 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                                                    Found {searchResults.length} existing patient(s)
                                                </div>
                                                {searchResults.map((patient) => (
                                                    <div
                                                        key={patient._id}
                                                        className="p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer border-b last:border-b-0 transition-all duration-200"
                                                        onClick={() => handlePatientSelect(patient)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                                <User className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-gray-900">{patient.name}</div>
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
                                            <div className="absolute top-full left-0 right-0 z-50 bg-white border-2 border-gray-100 rounded-xl shadow-2xl mt-2">
                                                <div className="p-4 text-sm text-gray-500 text-center">
                                                    No existing patients found for "{searchQuery}"
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Age <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            placeholder="Enter age"
                                            type="number"
                                            value={form.age}
                                            onChange={(e) => setForm({ ...form, age: e.target.value })}
                                            required
                                            className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Gender <span className="text-red-500">*</span>
                                        </label>
                                        <Select
                                            value={form.gender}
                                            onValueChange={(value) => setForm({ ...form, gender: value })}
                                        >
                                            <SelectTrigger className="h-12 w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70">
                                                <SelectValue placeholder="Select Gender" />
                                            </SelectTrigger>
                                            <SelectContent className='bg-white border-0 shadow-xl rounded-xl'>
                                                <SelectItem className='hover:bg-blue-50 rounded-lg m-1' value="Male">Male</SelectItem>
                                                <SelectItem className='hover:bg-blue-50 rounded-lg m-1' value="Female">Female</SelectItem>
                                                <SelectItem className='hover:bg-blue-50 rounded-lg m-1' value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Phone Number <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            placeholder="Enter phone number"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            required
                                            className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">Referenced By</label>
                                        <Select
                                            value={form.referencedBy}
                                            onValueChange={(value) => setForm({ ...form, referencedBy: value })}
                                        >
                                            <SelectTrigger className="h-12 w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70">
                                                <SelectValue placeholder="Self" />
                                            </SelectTrigger>
                                            <SelectContent className='bg-white border-0 shadow-xl rounded-xl'>
                                                <SelectItem className='hover:bg-blue-50 rounded-lg m-1' value='Self'>Self</SelectItem>
                                                {doctors?.map((d) => (
                                                    <SelectItem className='hover:bg-blue-50 rounded-lg m-1' key={d._id} value={d.name}>
                                                        {d.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            <CreditCard className="inline h-4 w-4 mr-1" />
                                            Payment Status
                                        </label>
                                        <Select
                                            value={form.paymentStatus}
                                            onValueChange={(value) => setForm({ ...form, paymentStatus: value })}
                                        >
                                            <SelectTrigger className="h-12 w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70">
                                                <SelectValue placeholder="Payment Status" />
                                            </SelectTrigger>
                                            <SelectContent className='bg-white border-0 shadow-xl rounded-xl'>
                                                <SelectItem className='hover:bg-blue-50 rounded-lg m-1' value="Not Paid">Not Paid</SelectItem>
                                                <SelectItem className='hover:bg-blue-50 rounded-lg m-1' value="Paid">Paid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

                            {/* Test Selection Section */}
                            {/* <div className="space-y-6">
                                <div className="flex items-center mb-6">
                                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mr-3">
                                        <TestTube className="h-5 w-5 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800">Test Selection</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto p-6 rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-100">
                                    {tests.map(test => {
                                        const checked = !!selectedTests.find(t => String(t.testId) === String(test._id));
                                        return (
                                            <label key={test._id} className={`group flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${checked ? "bg-white border-green-400 shadow-lg transform scale-[1.02]" : "bg-white/80 border-gray-200 hover:bg-white hover:border-green-300 hover:shadow-md"}`}>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-gray-900 truncate mb-1">{test.testName}</div>
                                                    <div className="text-sm text-green-600 font-medium">Rs.{test.testPrice}</div>
                                                </div>
                                                <div className="relative ml-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => handleToggleTest(test)}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${checked ? 'bg-green-500 border-green-500' : 'border-gray-300 group-hover:border-green-400'}`}>
                                                        {checked && <CheckCircle className="w-3 h-3 text-white" />}
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div> */}




                            {/* Test Selection Section */}
                            <div className="space-y-6">
                                <div className="flex items-center mb-6">
                                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mr-3">
                                        <TestTube className="h-5 w-5 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800">Test Selection</h3>
                                    {isLoadingTests && (
                                        <div className="ml-3 flex items-center text-sm text-gray-500">
                                            <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full mr-2"></div>
                                            Loading tests...
                                        </div>
                                    )}
                                </div>

                                {testsError ? (
                                    <div className="p-6 rounded-2xl bg-red-50 border-2 border-red-200 text-center">
                                        <div className="text-red-600 font-semibold mb-2">Error Loading Tests</div>
                                        <div className="text-red-500 text-sm mb-4">{testsError}</div>
                                        <Button
                                            type="button"
                                            onClick={fetchTests}
                                            variant="outline"
                                            className="border-red-300 text-red-600 hover:bg-red-50"
                                        >
                                            Retry Loading Tests
                                        </Button>
                                    </div>
                                ) : isLoadingTests ? (
                                    <div className="p-12 rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-100 text-center">
                                        <div className="animate-spin h-8 w-8 border-3 border-gray-300 border-t-green-600 rounded-full mx-auto mb-4"></div>
                                        <div className="text-gray-600 font-medium">Loading available tests...</div>
                                        <div className="text-gray-500 text-sm mt-2">Please wait while we fetch the test catalog</div>
                                    </div>
                                ) : tests.length === 0 ? (
                                    <div className="p-12 rounded-2xl bg-gradient-to-br from-gray-50 via-slate-50 to-gray-50 border-2 border-gray-200 text-center">
                                        <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <div className="text-gray-600 font-medium mb-2">No Tests Available</div>
                                        <div className="text-gray-500 text-sm mb-4">No tests found in the system</div>
                                        <Button
                                            type="button"
                                            onClick={fetchTests}
                                            variant="outline"
                                            className="border-gray-300"
                                        >
                                            Refresh Tests
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto p-6 rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-100">
                                        {tests.map(test => {
                                            const checked = !!selectedTests.find(t => String(t.testId) === String(test._id));
                                            return (
                                                <label key={test._id} className={`group flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${checked ? "bg-white border-green-400 shadow-lg transform scale-[1.02]" : "bg-white/80 border-gray-200 hover:bg-white hover:border-green-300 hover:shadow-md"}`}>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold text-gray-900 truncate mb-1">{test.testName}</div>
                                                        <div className="text-sm text-green-600 font-medium">Rs.{test.testPrice}</div>
                                                    </div>
                                                    <div className="relative ml-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => handleToggleTest(test)}
                                                            className="sr-only"
                                                        />
                                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${checked ? 'bg-green-500 border-green-500' : 'border-gray-300 group-hover:border-green-400'}`}>
                                                            {checked && <CheckCircle className="w-3 h-3 text-white" />}
                                                        </div>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>






                            {/* Selected Tests Section */}
                            {selectedTests.length > 0 && (
                                <>
                                    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg mr-3">
                                                    <FileText className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-800">Selected Tests</h3>
                                            </div>
                                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-xl shadow-lg">
                                                <span className="text-sm font-medium">Total Tests: </span>
                                                <span className="text-lg font-bold">{selectedTests.length}</span>
                                            </div>
                                        </div>

                                        <div className="overflow-hidden rounded-2xl border-2 border-gray-200 shadow-lg bg-white">
                                            <table className="min-w-full">
                                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Test Name</th>
                                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Price</th>
                                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-100">
                                                    {selectedTests.map((s, index) => (
                                                        <tr key={s.testId} className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{s.testName}</td>
                                                            <td className="px-6 py-4 text-sm font-bold text-green-600">Rs.{s.price}</td>
                                                            <td className="px-6 py-4 text-sm">
                                                                <ConfirmDialog
                                                                    title="Remove Test?"
                                                                    description={`Remove "${s.testName}" from selection?`}
                                                                    confirmText="Remove"
                                                                    cancelText="Cancel"
                                                                    onConfirm={() => handleDeleteRow(s.testId)}
                                                                    trigger={
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-400 rounded-lg transition-all duration-200"
                                                                        >
                                                                            <Trash2 className="h-4 w-4 mr-1" />
                                                                            Remove
                                                                        </Button>
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="flex justify-end">
                                            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl shadow-xl">
                                                <div className="text-center">
                                                    <div className="text-sm font-medium opacity-90">Grand Total</div>
                                                    <div className="text-2xl font-bold">Rs.{total.toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

                            {/* Form Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full sm:w-auto h-12 px-8 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-semibold transition-all duration-200"
                                    onClick={() => {
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
                                    }}
                                >
                                    Reset Form
                                </Button>
                                <Button disabled={loading}
                                    type="submit"
                                    className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                >
                                    <UserPlus className="h-5 w-5 mr-2" />
                                    { loading ? 'Registering...' : 'Register Patient'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}