
import React, { useEffect, useState, useContext, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { PatientsContext } from "@/context/PatientsContext";
import ConfirmDialog from "./ConfirmDialog";
import { Trash2, Search, User, UserPlus, FileText, CreditCard, TestTube, CheckCircle, Lightbulb } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Categories } from "@/utils/testCategories";
import { AuthContext } from "@/context/AuthProvider";
import { Separator } from "./ui/separator";
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';

export default function RegisterPatient() {
    const { createPatient, setPatients, patients, fetchPatients } = useContext(PatientsContext);
    const { user } = useContext(AuthContext);
    const [isFocused, setIsFocused] = useState(false);
    const [isLoadingTests, setIsLoadingTests] = useState(true);
    const [testsError, setTestsError] = useState(null);
    const [loading, SetLoading] = useState(false)
    const navigate = useNavigate();


    const [doctors, setDoctors] = useState([]);
    const [tests, setTests] = useState([]);

    // Patient search functionality
    const [searchQuery, setSearchQuery] = useState("");
    const [testSearchQuery, setTestSearchQuery] = useState("");
    // Quick test add functionality
    const [quickTestSearch, setQuickTestSearch] = useState("");
    const [quickTestResults, setQuickTestResults] = useState([]);
    const [showQuickTestResults, setShowQuickTestResults] = useState(false);
    const [isSearchingTests, setIsSearchingTests] = useState(false);
    const quickTestTimeoutRef = useRef(null);
    const [isQuickTestFocused, setIsQuickTestFocused] = useState(false);

    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState("All");
    const searchTimeoutRef = useRef(null);
    const [hideTests, setHideTests] = useState(() => {
        const saved = localStorage.getItem('hideTestsGrid');
        return saved ? JSON.parse(saved) : false;
    });

    const [form, setForm] = useState({
        name: "",
        age: "",
        gender: "Male",
        phone: "",
        referencedBy: "Self",
        paymentStatus: 'Paid',
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



    // Quick test search with debounce
    useEffect(() => {
        if (quickTestTimeoutRef.current) {
            clearTimeout(quickTestTimeoutRef.current);
        }

        if (quickTestSearch.trim().length >= 1) {
            setIsSearchingTests(true);
            quickTestTimeoutRef.current = setTimeout(() => {
                searchTestsQuick(quickTestSearch);
            }, 200);
        } else {
            setQuickTestResults([]);
            setShowQuickTestResults(false);
            setIsSearchingTests(false);
        }

        return () => {
            if (quickTestTimeoutRef.current) {
                clearTimeout(quickTestTimeoutRef.current);
            }
        };
    }, [quickTestSearch]);



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


    const searchTestsQuick = async (query) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tests/search?q=${encodeURIComponent(query)}`);
            const results = response.data || [];
            setQuickTestResults(results);
            setShowQuickTestResults(true);
            setIsSearchingTests(false);
            return results; // Return results for immediate use
        } catch (error) {
            console.error("Test search error:", error);
            setQuickTestResults([]);
            setShowQuickTestResults(false);
            setIsSearchingTests(false);
            return [];
        }
    };

    const handleQuickTestSelect = (test) => {
        const exists = selectedTests.find(t => String(t.testId) === String(test._id));
        if (!exists) {
            setSelectedTests(prev => [...prev, {
                testId: test._id,
                testName: test.testName,
                price: test.testPrice
            }]);
            toast.success(`Added: ${test.testName}`);
        } else {
            toast.info('Test already selected');
        }

        setQuickTestSearch("");
        setShowQuickTestResults(false);
        setQuickTestResults([]);
    };

    const handleQuickTestKeyDown = async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            // If we have results, select the first one
            if (quickTestResults.length > 0) {
                handleQuickTestSelect(quickTestResults[0]);
            }
            // If still searching or no results yet, trigger immediate search
            else if (quickTestSearch.trim().length >= 1) {
                // Cancel any pending search
                if (quickTestTimeoutRef.current) {
                    clearTimeout(quickTestTimeoutRef.current);
                }
                // Perform immediate search
                await searchTestsQuick(quickTestSearch);
            }
        }
    };

    const clearQuickTestSearch = () => {
        setQuickTestSearch("");
        setQuickTestResults([]);
        setShowQuickTestResults(false);
    };


    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter' && searchResults.length > 0) {
            e.preventDefault(); // Prevent form submission
            handlePatientSelect(searchResults[0]); // Select first result
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

            // Handle different possible response structures
            let testsData = [];
            if (res.data.tests) {
                testsData = res.data.tests;
            } else if (Array.isArray(res.data)) {
                testsData = res.data;
            } else if (res.data.data) {
                testsData = res.data.data;
            }
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
                paymentStatus: 'Paid',
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
            navigate('/user/patients');

        } catch (err) {
            console.error("submit err:", err);
            toast.error("Failed to create patient");
        } finally {
            SetLoading(false)
        }
    };

    const filteredTests = tests.filter(test => {
        const matchesSearch = test.testName?.toLowerCase().includes(testSearchQuery.toLowerCase()) ||
            test.category?.toLowerCase().includes(testSearchQuery.toLowerCase()) ||
            String(test.testCode)?.toLowerCase().includes(testSearchQuery.toLowerCase());

        const matchesCategory = categoryFilter === "All" || test.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    const handleSelectAllVisibleTests = () => {
        const visibleTestIds = filteredTests.map(test => test._id);
        const alreadySelectedIds = selectedTests.map(t => t.testId);

        // Check if ALL visible tests are already selected
        const allVisibleSelected = visibleTestIds.every(id => alreadySelectedIds.includes(id));

        if (allVisibleSelected) {
            // Deselect all visible tests
            setSelectedTests(prev => prev.filter(t => !visibleTestIds.includes(t.testId)));
            toast.success(`Deselected ${visibleTestIds.length} test(s)`);
        } else {
            // Select only the tests that aren't already selected
            const newSelections = filteredTests
                .filter(test => !alreadySelectedIds.includes(test._id))
                .map(test => ({
                    testId: test._id,
                    testName: test.testName,
                    price: test.testPrice
                }));

            setSelectedTests(prev => [...prev, ...newSelections]);
            toast.success(`Selected ${newSelections.length} test(s)`);
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="m-2">

                <Card className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-0 border-0 overflow-hidden pb-2">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-500 px-8 py-3">
                        <h2 className="text-2xl font-semibold text-white flex items-center">
                            <div className="px-2 py-2 flex justify-center items-center rounded-xl mr-2 bg-blue-500">
                                <FileText className="h-5 w-5" />
                            </div>
                            Patient Registration
                        </h2>
                    </div>

                    <CardContent className="px-8 py-1">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Patient Information Section */}
                            <div className="space-y-6">
                                <div className="flex items-center mb-6">
                                    <div className="flex items-center justify-center w-7 h-7 bg-blue-100 rounded-lg mr-3">
                                        <User className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">Patient Information</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {/* Enhanced Name Input with Search */}
                                    <div className="relative">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Patient Name <span className="text-red-500">*</span>
                                            {/* <span className="ml-2 text-xs font-normal text-gray-500 bg-blue-50 px-2 py-1 rounded-md">
                                                <Lightbulb size='16' className="inline" /> Search by name or phone
                                            </span> */}
                                        </label>
                                        <div className="relative">

                                            <Input
                                                placeholder="Search by name or phone number..."
                                                value={form.name}
                                                onChange={handleNameInputChange}
                                                onKeyDown={handleSearchKeyDown}  // 👈 Add this
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

                                                {searchResults.map((patient, index) => (
                                                    <div
                                                        key={patient._id}
                                                        className={`p-4 cursor-pointer border-b last:border-b-0 transition-all duration-200 ${index === 0
                                                            ? 'bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-150 hover:to-indigo-150'
                                                            : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'
                                                            }`}
                                                        onClick={() => handlePatientSelect(patient)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {index === 0 && (
                                                                <div className="text-xs text-blue-600 font-semibold">↵ Enter</div>
                                                            )}
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
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
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
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
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
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
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
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Referenced By</label>
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
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
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
                                                <SelectItem className='hover:bg-blue-50 rounded-lg m-1' value="Paid">Paid</SelectItem>
                                                <SelectItem className='hover:bg-blue-50 rounded-lg m-1' value="Not Paid">Not Paid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>


                            </div>

                            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>



                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center mb-3">
                                        <div className="flex items-center justify-center w-7 h-7 bg-green-100 rounded-lg mr-3">
                                            <TestTube className="h-4 w-4 text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-800">Test Selection</h3>
                                        {isLoadingTests && (
                                            <div className="ml-3 flex items-center text-sm text-gray-500">
                                                <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full mr-2"></div>
                                                Loading tests...
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Add Test Input */}
                                    {/* Search Inputs Row */}
                                    <div className="space-y-4 mb-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Quick Add Test Input */}
                                            <div className="relative">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    <TestTube className="inline h-4 w-4 mr-1" />
                                                    Quick Add Test
                                                </label>
                                                <div className="relative">
                                                    <Input
                                                        placeholder="Type code/name, press Enter..."
                                                        value={quickTestSearch}
                                                        onChange={(e) => setQuickTestSearch(e.target.value)}
                                                        onKeyDown={handleQuickTestKeyDown}
                                                        onFocus={() => setIsQuickTestFocused(true)}
                                                        onBlur={() => {
                                                            setTimeout(() => setIsQuickTestFocused(false), 200);
                                                        }}
                                                        className="h-12 pl-4 pr-12 border-2 border-green-300 focus:border-green-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70"
                                                    />
                                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
                                                        {isSearchingTests && (
                                                            <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-green-600 rounded-full" />
                                                        )}
                                                        {quickTestSearch && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
                                                                onClick={clearQuickTestSearch}
                                                            >
                                                                ×
                                                            </Button>
                                                        )}
                                                        <TestTube className="h-5 w-5 text-green-500" />
                                                    </div>
                                                </div>

                                                {/* Quick Test Results Dropdown */}
                                                {isQuickTestFocused && showQuickTestResults && quickTestResults.length > 0 && (
                                                    <div className="absolute top-full left-0 right-0 z-50 bg-white border-2 border-green-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto mt-2">
                                                        <div className="p-3 text-xs font-medium text-gray-500 border-b bg-gradient-to-r from-green-50 to-emerald-50">
                                                            Found {quickTestResults.length} test(s) - Press Enter to add first result
                                                        </div>

                                                        {quickTestResults.map((test, index) => {
                                                            const alreadySelected = selectedTests.find(t => String(t.testId) === String(test._id));
                                                            return (
                                                                <div
                                                                    key={test._id}
                                                                    className={`p-4 cursor-pointer border-b last:border-b-0 transition-all duration-200 ${alreadySelected
                                                                        ? 'bg-gray-100 opacity-60 cursor-not-allowed'
                                                                        : index === 0
                                                                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-150 hover:to-emerald-150'
                                                                            : 'hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50'
                                                                        }`}
                                                                    onClick={() => !alreadySelected && handleQuickTestSelect(test)}
                                                                >
                                                                    <div className="flex items-center justify-between gap-3">
                                                                        <div className="flex items-center gap-3 flex-1">
                                                                            {index === 0 && !alreadySelected && (
                                                                                <div className="text-xs text-green-600 font-semibold">↵ Enter</div>
                                                                            )}
                                                                            <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
                                                                                <TestTube className="h-4 w-4 text-green-600" />
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <div className="font-semibold text-sm text-gray-900">
                                                                                    {test.testName}
                                                                                    {alreadySelected && (
                                                                                        <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                                                                            Already Selected
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <div className="text-xs text-gray-500">
                                                                                    Code: <span className=" text-green-600">{test.testCode}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="text-base font-bold text-green-600">Rs.{test.testPrice}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {isQuickTestFocused && showQuickTestResults && quickTestResults.length === 0 && quickTestSearch.trim().length >= 1 && !isSearchingTests && (
                                                    <div className="absolute top-full left-0 right-0 z-50 bg-white border-2 border-green-200 rounded-xl shadow-2xl mt-2">
                                                        <div className="p-4 text-sm text-gray-500 text-center">
                                                            No tests found for "{quickTestSearch}"
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Search Input */}
                                            <div className="relative">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    <Search className="inline h-4 w-4 mr-1" />
                                                    Search Tests
                                                </label>
                                                <div className="relative">
                                                    <Input
                                                        placeholder="Search by name, code or category..."
                                                        value={testSearchQuery}
                                                        onChange={(e) => setTestSearchQuery(e.target.value)}
                                                        className="h-12 pl-12 pr-12 border-2 border-green-200 focus:border-green-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70"
                                                    />
                                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                                                    {testSearchQuery && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-green-100 rounded-full"
                                                            onClick={() => setTestSearchQuery("")}
                                                        >
                                                            ×
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Category Filter */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Filter by Category
                                                </label>
                                                <Select
                                                    value={categoryFilter}
                                                    onValueChange={(value) => setCategoryFilter(value)}
                                                >
                                                    <SelectTrigger className="h-12 w-full border-2 border-green-200 focus:border-green-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70">
                                                        <SelectValue placeholder="Filter by Category" />
                                                    </SelectTrigger>
                                                    <SelectContent className='bg-white border-0 shadow-xl rounded-xl max-h-72'>
                                                        <SelectItem className='hover:bg-green-50 rounded-lg m-1 font-semibold' value="All">
                                                            All Categories
                                                        </SelectItem>
                                                        {Categories.map((category) => (
                                                            <SelectItem
                                                                key={category}
                                                                className='hover:bg-green-50 rounded-lg m-1'
                                                                value={category}
                                                            >
                                                                {category}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Filter Results Info, Hide Tests Checkbox, and Select All Button */}
                                        <div className="flex items-center justify-between">
                                            {(testSearchQuery || categoryFilter !== "All") && (
                                                <div className="text-sm text-green-600 font-medium">
                                                    Found {filteredTests.length} test(s)
                                                    {testSearchQuery && ` matching "${testSearchQuery}"`}
                                                    {categoryFilter !== "All" && ` in category "${categoryFilter}"`}
                                                </div>
                                            )}

                                            <div className="flex w-full items-center justify-between gap-4 ml-auto">
                                                {/* Hide Tests Checkbox */}
                                                <div>
                                                    <label className="flex items-center gap-2 cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            checked={hideTests}
                                                            onChange={(e) => {
                                                                const newValue = e.target.checked;
                                                                setHideTests(newValue);
                                                                localStorage.setItem('hideTestsGrid', JSON.stringify(newValue));
                                                            }}
                                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                                            Hide Tests
                                                        </span>
                                                    </label>
                                                </div>

                                                {/* Select All Button */}
                                                <div>
                                                    {!hideTests && filteredTests.length > 0 && (
                                                        <Button
                                                            type="button"
                                                            onClick={handleSelectAllVisibleTests}
                                                            variant="outline"
                                                            className="border-2 border-green-500 text-green-700 hover:bg-green-50 hover:border-green-600 rounded-xl font-semibold transition-all duration-200"
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            {(() => {
                                                                const visibleTestIds = filteredTests.map(test => test._id);
                                                                const alreadySelectedIds = selectedTests.map(t => t.testId);
                                                                const allVisibleSelected = visibleTestIds.every(id => alreadySelectedIds.includes(id));
                                                                return allVisibleSelected ? 'Deselect All Visible Tests' : 'Select All Visible Tests';
                                                            })()}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
                                ) : filteredTests.length === 0 && testSearchQuery ? (
                                    <div className="p-12 rounded-2xl bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-200 text-center">
                                        <Search className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                                        <div className="text-yellow-700 font-medium mb-2">No Tests Found</div>
                                        <div className="text-yellow-600 text-sm mb-4">No tests match your search "{testSearchQuery}"</div>
                                        <Button
                                            type="button"
                                            onClick={() => setTestSearchQuery("")}
                                            variant="outline"
                                            className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                                        >
                                            Clear Search
                                        </Button>
                                    </div>
                                ) : !hideTests ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto p-6 rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-100">
                                        {filteredTests.map(test => {
                                            const checked = !!selectedTests.find(t => String(t.testId) === String(test._id));
                                            return (
                                                <label key={test._id} className={`group flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${checked ? "bg-white border-green-400 shadow-lg transform scale-[1.02]" : "bg-white/80 border-gray-200 hover:bg-white hover:border-green-300 hover:shadow-md"}`}>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold text-gray-900 truncate mb-1">{test.testName}</div>
                                                        <div className="text-xs text-gray-500 mb-1">{test.category}</div>
                                                        <div className="text-xs text-gray-600 mb-1">{test.testCode}</div>
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
                                ) : null}
                            </div>

                            {/* Selected Tests Section */}
                            {selectedTests.length > 0 && (
                                <>
                                    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex items-center justify-center w-7 h-7 bg-indigo-100 rounded-lg mr-3">
                                                    <FileText className="h-4 w-4 text-indigo-600" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-800">Selected Tests</h3>
                                            </div>
                                            <div className=" text-purple-600 bg-transparent px-6 py-0 rounded-xl border border-purple-500">
                                                <span className="text-sm font-medium">Total Tests: </span>
                                                <span className="text-sm font-bold">{selectedTests.length}</span>
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
                                            <div className="bg-transparent text-emerald-500 py-1 px-6 rounded-2xl border border-emerald-400">
                                                <div className="text-center flex">
                                                    <div className="text-sm font-medium opacity-90">Total: Rs.{total.toLocaleString()}</div>
                                                    <div className="text-xl font-bold"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

                            {/* Form Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full sm:w-auto py-1 px-8 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-semibold transition-all duration-200"
                                    onClick={() => {
                                        setForm({
                                            name: "",
                                            age: "",
                                            gender: "Male",
                                            phone: "",
                                            referencedBy: "Self",
                                            paymentStatus: 'Paid',
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
                                    className="w-full sm:w-auto py-1 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                >
                                    <UserPlus className="h-5 w-5 mr-2" />
                                    {loading ? 'Registering...' : 'Register Patient'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}