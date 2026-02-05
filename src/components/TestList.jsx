import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReactToPrint } from 'react-to-print';
import { LabInfoContext } from '@/context/LabnfoContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Search, Trash2, TestTube2, DollarSign, FileText, Settings, Loader2, Info, Printer, Download, ArrowUpDown } from "lucide-react";
import { useContext, useState, useMemo, useRef } from "react";
import { TestContext } from "../context/TestContext";
import toast from "react-hot-toast";

import { Categories } from "@/utils/testCategories";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TestList = () => {
  const { tests, deleteTest, updateTest, loading } = useContext(TestContext);
  const { info, loading: infoLoading } = useContext(LabInfoContext);


  const [search, setSearch] = useState("");
  const [searchTestCode, setSearchTestCode] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [sortBy, setSortBy] = useState("code-asc");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [editForm, setEditForm] = useState({
    testCode: "",
    testName: "",
    testPrice: "",
    testType: "routine",
    category: "",
    specimen: "",
    performed: "",
    reported: "",
    fields: [],
    isDiagnosticTest: false,
    isNarrativeFormat: false
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [simpleReportOpen, setSimpleReportOpen] = useState(false);
  const [detailedReportOpen, setDetailedReportOpen] = useState(false);

  const simpleReportRef = useRef();
  const detailedReportRef = useRef();
  const labID = info?.labID;


  const handlePrintSimple = useReactToPrint({
    contentRef: simpleReportRef,
    documentTitle: `Test_List_Simple_${new Date().toISOString().split('T')[0]}`,
  });

  const handlePrintDetailed = useReactToPrint({
    contentRef: detailedReportRef,
    documentTitle: `Test_List_Detailed_${new Date().toISOString().split('T')[0]}`,
  });


  const filteredTests = useMemo(() => {
    if (!tests || !Array.isArray(tests)) return []; // ✅ Safety check

    // ============================================
    // STEP 1: FILTER TESTS
    // ============================================
    const filtered = tests.filter((test) => {
      const matchesName = test.testName.toLowerCase().includes(search.toLowerCase());
      const matchesCode = searchTestCode === "" || test.testCode.toString().includes(searchTestCode);
      const matchesCategory = searchCategory === "" || searchCategory === "all" || test.category === searchCategory;
      return matchesName && matchesCode && matchesCategory;
    });

    // ============================================
    // STEP 2: SORT TESTS BASED ON SELECTED OPTION
    // ============================================
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          // Sort alphabetically A to Z
          return a.testName.localeCompare(b.testName);

        case "name-desc":
          // Sort alphabetically Z to A
          return b.testName.localeCompare(a.testName);

        case "price-asc":
          // Sort by price: Low to High
          return a.testPrice - b.testPrice;

        case "price-desc":
          // Sort by price: High to Low
          return b.testPrice - a.testPrice;

        case "category":
          // Sort by category alphabetically
          return a.category.localeCompare(b.category);

        case "code-asc":
          // Sort by test code: Low to High
          return a.testCode - b.testCode;

        case "code-desc":
          // Sort by test code: High to Low
          return b.testCode - a.testCode;

        case "default":
        default:
          // Default order (no sorting)
          return 0;
      }
    });

    return sorted;
  }, [tests, search, searchTestCode, searchCategory, sortBy]);

  const handleEditClick = (test) => {
    setCurrentTest(test);
    setEditForm({
      testCode: test.testCode,
      testName: test.testName,
      testPrice: test.testPrice,
      category: test.category,
      specimen: test.specimen,
      performed: test.performed,
      reported: test.reported,
      testType: test.testType || "routine",
      fields: [...test.fields],
      isDiagnosticTest: test.isDiagnosticTest || false,
      isNarrativeFormat: test.isNarrativeFormat || false
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (test) => {
    setCurrentTest(test);
    setDeleteDialogOpen(true);
  };

  const handleFieldChange = (index, field, value) => {
    const updatedFields = [...editForm.fields];
    updatedFields[index] = {
      ...updatedFields[index],
      [field]: value,
    };
    setEditForm({ ...editForm, fields: updatedFields });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      await updateTest(currentTest._id, editForm);
      setEditDialogOpen(false);
      toast.success('Test Updated successfully!')
    } catch (error) {
      toast.error('Failed to Update Test')
    } finally {
      setUpdateLoading(false);
    }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteTest(currentTest._id);
      setDeleteDialogOpen(false);
      toast.success('Test Deleted successfully!')
    } catch (error) {
      toast.error('Failed to Delete Test')
    } finally {
      setDeleteLoading(false);
    }
  };

  // ✅ Check combined loading state
  const isLoading = loading || infoLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl animate-pulse"></div>
                <div className="h-6 bg-white/20 rounded-lg w-48 animate-pulse"></div>
              </div>
            </div>
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-xl w-80 animate-pulse"></div>
              </div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="h-5 bg-gray-200 rounded w-48 animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <TestTube2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Test Templates</h1>
          <p className="text-gray-600 text-lg">Manage your laboratory test configurations</p>
        </div> */}

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FileText className="w-6 h-6" />
                  Test Management
                </h2>
                <p className="text-blue-100 mt-1">Configure and manage test templates</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                <span className="text-white font-semibold">{filteredTests.length} Tests</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Search Bar & Filters */}
            <div className="mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
                {/* Search by Name */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    className="pl-12 h-12 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Search by Test Code */}
                <div className="relative">
                  <TestTube2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="number"
                    className="pl-12 h-12 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                    placeholder="Search by code..."
                    value={searchTestCode}
                    onChange={(e) => setSearchTestCode(e.target.value)}
                  />
                </div>

                {/* Filter by Category */}
                <div>
                  <Select
                    value={searchCategory}
                    onValueChange={(value) => setSearchCategory(value)}
                  >
                    <SelectTrigger className="h-12 w-full border-2 border-gray-200 rounded-xl px-4 text-gray-700 bg-gray-50 focus:bg-white focus:border-blue-500 transition-all duration-200">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent className='bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden'>
                      <SelectItem className='hover:bg-blue-50 px-4 py-2 cursor-pointer transition-colors duration-150' value="all">All Categories</SelectItem>
                      {Categories.map((cat) => (
                        <SelectItem key={cat} className='hover:bg-blue-50 px-4 py-2 cursor-pointer transition-colors duration-150' value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* ✅ NEW - Sort Dropdown */}
                <div>
                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value)}
                  >
                    <SelectTrigger className="h-12 w-full border-2 border-gray-200 rounded-xl px-4 text-gray-700 bg-gray-50 focus:bg-white focus:border-purple-500 transition-all duration-200">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="w-4 h-4 text-gray-500" />
                        <SelectValue placeholder="Sort by..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent className='bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden'>
                      <SelectItem className='hover:bg-purple-50 px-4 py-2 cursor-pointer transition-colors duration-150' value="default">
                        Default Order
                      </SelectItem>
                      <SelectItem className='hover:bg-purple-50 px-4 py-2 cursor-pointer transition-colors duration-150' value="name-asc">
                        Name: A → Z
                      </SelectItem>
                      <SelectItem className='hover:bg-purple-50 px-4 py-2 cursor-pointer transition-colors duration-150' value="name-desc">
                        Name: Z → A
                      </SelectItem>
                      <SelectItem className='hover:bg-purple-50 px-4 py-2 cursor-pointer transition-colors duration-150' value="price-asc">
                        Price: Low → High
                      </SelectItem>
                      <SelectItem className='hover:bg-purple-50 px-4 py-2 cursor-pointer transition-colors duration-150' value="price-desc">
                        Price: High → Low
                      </SelectItem>
                      <SelectItem className='hover:bg-purple-50 px-4 py-2 cursor-pointer transition-colors duration-150' value="category">
                        Category (A → Z)
                      </SelectItem>
                      <SelectItem className='hover:bg-purple-50 px-4 py-2 cursor-pointer transition-colors duration-150' value="code-asc">
                        Test Code: Low → High
                      </SelectItem>
                      <SelectItem className='hover:bg-purple-50 px-4 py-2 cursor-pointer transition-colors duration-150' value="code-desc">
                        Test Code: High → Low
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Report Buttons */}
            <div className="mb-6 flex gap-4">
              <Button style={{ flex: 1, height: '2.75rem', backgroundColor: '#16a34a', color: '#ffffff', borderRadius: '0.75rem', border: '1px solid #16a34a', fontWeight: 700, fontSize: '0.875rem', padding: '0 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
                onClick={() => setSimpleReportOpen(true)}
                className="flex-1 h-11 bg-green-600 text-white hover:from-green-700 hover:to-emerald-700 rounded-xl font-bold border border-green-500 shadow-lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Print/Download Test List
              </Button>
              <Button style={{ flex: 1, height: '2.75rem', backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '0.75rem', border: '1px solid #2563eb', fontWeight: 700, fontSize: '0.875rem', padding: '0 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
                onClick={() => setDetailedReportOpen(true)}
                className="flex-1 h-11 bg-blue-600 text-white hover:from-blue-700 hover:to-indigo-700 rounded-xl border border-blue-500 font-bold shadow-lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Print/Download Detailed Test List
              </Button>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                      <th className="font-bold text-gray-800 py-4 px-6 text-left">
                        <div className="flex items-center gap-2">
                          <TestTube2 className="w-4 h-4 text-blue-500" />
                          Test Name
                        </div>
                      </th>
                      <th className="font-bold text-gray-800 py-4 px-6">
                        <div className="flex items-center gap-2">
                          Test Code
                        </div>
                      </th>
                      <th className="font-bold text-gray-800 py-4 px-6">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          Price (Rs.)
                        </div>
                      </th>
                      <th className="font-bold text-gray-800 py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Settings className="w-4 h-4 text-gray-500" />
                          Actions
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTests.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-12">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                              <TestTube2 className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">No test templates found</p>
                            <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredTests.map((test, index) => (
                        <tr
                          key={test._id}
                          className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                        >
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{index + 1}</span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{test.testName}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-gray-500 text-sm">{test.fields?.length || 0} fields</p>
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${test.testType === "special" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                                    {test.testType === "special" ? "Special" : "Routine"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-gray-600 text-md">{test.testCode}</span>
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-green-600 text-lg">Rs. {test.testPrice}</span>
                            </div>
                          </td>
                          <td className="py-5 px-6 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-10 w-10 p-0 rounded-xl hover:bg-gray-100 border border-gray-200 shadow-sm"
                                >
                                  <MoreHorizontal className="h-4 w-4 text-gray-600" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-xl rounded-xl p-2 min-w-48">
                                <DropdownMenuItem
                                  onClick={() => handleEditClick(test)}
                                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                                >
                                  <Pencil className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium text-gray-700">Edit Template</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(test)}
                                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 cursor-pointer transition-colors duration-150"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                  <span className="font-medium text-red-600">Delete Template</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          {currentTest && (
            <DialogContent className="sm:max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-700 overflow-auto max-h-[95vh]">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 -m-6 mb-6 px-8 py-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    <Pencil className="w-6 h-6" />
                    Edit Test Template
                  </DialogTitle>
                </DialogHeader>
              </div>

              <div className="px-6 pb-6">
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Test Code */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <TestTube2 className="w-4 h-4 text-blue-500" />
                        Test Code
                      </label>
                      <Input
                        type="number"
                        className="h-12 border-2 border-gray-200 rounded-xl px-4 bg-gray-50 focus:bg-white focus:border-blue-500 transition-all duration-200"
                        value={editForm.testCode}
                        onChange={(e) =>
                          setEditForm({ ...editForm, testCode: e.target.value })
                        }
                        required
                      />
                    </div>

                    {/* Test Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <TestTube2 className="w-4 h-4 text-blue-500" />
                        Test Name
                      </label>
                      <Input
                        className="h-12 border-2 border-gray-200 rounded-xl px-4 bg-gray-50 focus:bg-white focus:border-blue-500 transition-all duration-200"
                        value={editForm.testName}
                        onChange={(e) =>
                          setEditForm({ ...editForm, testName: e.target.value })
                        }
                        required
                      />
                    </div>

                    {/* Test Price */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        Test Price (Rs.)
                      </label>
                      <Input
                        type="number"
                        className="h-12 border-2 border-gray-200 rounded-xl px-4 bg-gray-50 focus:bg-white focus:border-blue-500 transition-all duration-200"
                        value={editForm.testPrice}
                        onChange={(e) =>
                          setEditForm({ ...editForm, testPrice: e.target.value })
                        }
                        required
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-purple-500" />
                        Category
                      </label>
                      <Select
                        value={editForm.category}
                        onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                        required
                      >
                        <SelectTrigger className="h-12 w-full border-2 border-gray-200 rounded-xl px-4 text-gray-700 bg-gray-50 focus:bg-white focus:border-blue-500 transition-all duration-200">
                          <SelectValue placeholder="Select test category" />
                        </SelectTrigger>
                        <SelectContent className='bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden'>
                          {Categories.map((cat) => (
                            <SelectItem key={cat} className='hover:bg-blue-50 px-4 py-2 cursor-pointer transition-colors duration-150' value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Specimen */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <TestTube2 className="w-4 h-4 text-orange-500" />
                        Specimen Type
                      </label>
                      <Input
                        className="h-12 border-2 border-gray-200 rounded-xl px-4 bg-gray-50 focus:bg-white focus:border-blue-500 transition-all duration-200"
                        value={editForm.specimen}
                        onChange={(e) =>
                          setEditForm({ ...editForm, specimen: e.target.value })
                        }
                        required
                      />
                    </div>

                    {/* Performed */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-indigo-500" />
                        Test Performed
                      </label>
                      <Input
                        className="h-12 border-2 border-gray-200 rounded-xl px-4 bg-gray-50 focus:bg-white focus:border-blue-500 transition-all duration-200"
                        value={editForm.performed}
                        onChange={(e) =>
                          setEditForm({ ...editForm, performed: e.target.value })
                        }
                        required
                      />
                    </div>

                    {/* Reported */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-teal-500" />
                        Report Time
                      </label>
                      <Input
                        className="h-12 border-2 border-gray-200 rounded-xl px-4 bg-gray-50 focus:bg-white focus:border-blue-500 transition-all duration-200"
                        value={editForm.reported}
                        onChange={(e) =>
                          setEditForm({ ...editForm, reported: e.target.value })
                        }
                        required
                      />
                    </div>

                    {/* Test Type - Routine or Special */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-red-500" />
                        Test Type
                      </label>
                      <Select
                        value={editForm.testType}
                        onValueChange={(value) => setEditForm({ ...editForm, testType: value })}
                      >
                        <SelectTrigger className="h-12 w-full border-2 border-gray-200 rounded-xl px-4 text-gray-700 bg-gray-50 focus:bg-white focus:border-blue-500 transition-all duration-200">
                          <SelectValue placeholder="Select test type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden">
                          <SelectItem className="hover:bg-blue-50 px-4 py-2 cursor-pointer transition-colors duration-150" value="routine">Routine</SelectItem>
                          <SelectItem className="hover:bg-blue-50 px-4 py-2 cursor-pointer transition-colors duration-150" value="special">Special</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* ✅ Diagnostic Test & Narrative Format Checkboxes */}
                    <div className="space-y-3 md:col-span-2">
                      {/* Diagnostic Test Checkbox */}
                      <div title="Checked tests will not appear in result entry and final report sections" className="flex cursor-pointer items-center space-x-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <input
                          type="checkbox"
                          id="isDiagnosticTest"
                          checked={editForm.isDiagnosticTest || false}
                          onChange={(e) =>
                            setEditForm({ ...editForm, isDiagnosticTest: e.target.checked })
                          }
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor="isDiagnosticTest"
                            className="text-sm font-semibold text-gray-800 cursor-pointer flex items-center gap-2"
                          >
                            Is it a Diagnostic Test? <Info size={13} className="inline-block" />
                          </label>
                        </div>
                      </div>

                      {/* Narrative Format Checkbox */}
                      <div title="Checked tests will use narrative/descriptive format instead of table format in reports" className="flex cursor-pointer items-center space-x-3 bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <input
                          type="checkbox"
                          id="isNarrativeFormat"
                          checked={editForm.isNarrativeFormat || false}
                          onChange={(e) =>
                            setEditForm({ ...editForm, isNarrativeFormat: e.target.checked })
                          }
                          className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor="isNarrativeFormat"
                            className="text-sm font-semibold text-gray-800 cursor-pointer flex items-center gap-2"
                          >
                            Use Narrative/Descriptive Format? <Info size={13} className="inline-block" />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Editable Fields */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-500" />
                      Test Fields ({editForm.fields.length})
                    </h3>
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6">
                      <div className="space-y-4">
                        {editForm.fields.map((field, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-xl p-5 shadow-md border border-gray-100"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-700">Field #{index + 1}</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Field Name</label>
                                <Input
                                  className="h-10 border border-gray-200 rounded-lg px-3 bg-gray-50 focus:bg-white focus:border-blue-400 transition-all duration-200"
                                  value={field.fieldName}
                                  placeholder="Field Name"
                                  onChange={(e) =>
                                    handleFieldChange(index, "fieldName", e.target.value)
                                  }
                                  required
                                />
                              </div>

                              <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Default Value</label>
                                <Input
                                  className="h-10 border border-gray-200 rounded-lg px-3 bg-gray-50 focus:bg-white focus:border-blue-400 transition-all duration-200"
                                  value={field.defaultValue}
                                  placeholder="Default"
                                  onChange={(e) =>
                                    handleFieldChange(index, "defaultValue", e.target.value)
                                  }
                                />
                              </div>

                              <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Unit</label>
                                <Input
                                  className="h-10 border border-gray-200 rounded-lg px-3 bg-gray-50 focus:bg-white focus:border-blue-400 transition-all duration-200"
                                  value={field.unit}
                                  placeholder="Unit"
                                  onChange={(e) =>
                                    handleFieldChange(index, "unit", e.target.value)
                                  }
                                />
                              </div>

                              <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Normal Range</label>
                                <Input
                                  className="h-10 border border-gray-200 rounded-lg px-3 bg-gray-50 focus:bg-white focus:border-blue-400 transition-all duration-200"
                                  value={field.range}
                                  placeholder="Range"
                                  onChange={(e) =>
                                    handleFieldChange(index, "range", e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <Button style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: '2px solid #d1d5db', backgroundColor: '#ffffff', color: '#374151', fontWeight: 500, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      type="button"
                      variant="outline"
                      className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                      onClick={() => setEditDialogOpen(false)}
                      disabled={updateLoading}
                    >
                      Cancel
                    </Button>
                    <Button style={{ padding: '0.75rem 2rem', borderRadius: '0.75rem', backgroundColor: '#3b82f6', color: '#ffffff', border: '1px solid #3b82f6', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
                      type="button"
                      onClick={handleSubmit}
                      disabled={updateLoading}
                      className="px-8 py-3 bg-blue-500 border  text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                    >
                      {updateLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Pencil className="w-4 h-4" />
                          Update Template
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          {currentTest && (
            <DialogContent className="sm:max-w-md max-h-[95vh] overflow-auto bg-white rounded-3xl shadow-2xl border border-gray-700 ">
              <div className="bg-gradient-to-r from-red-500 to-pink-600 -m-6 mb-6 px-8 py-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    <Trash2 className="w-6 h-6" />
                    Confirm Deletion
                  </DialogTitle>
                  <p className="text-red-100 mt-1">This action cannot be undone</p>
                </DialogHeader>
              </div>

              <div className="px-6 pb-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TestTube2 className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-gray-700 text-lg">
                    Are you sure you want to delete{" "}
                    <span className="font-bold text-gray-900">"{currentTest.testName}"</span>?
                  </p>
                  <p className="text-gray-500 text-sm mt-2">This will permanently remove the test template and all its configurations.</p>
                </div>

                <div className="flex justify-center gap-4">
                  <Button style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: '2px solid #d1d5db', backgroundColor: '#ffffff', color: '#374151', fontWeight: 500, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    variant="outline"
                    className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                    onClick={() => setDeleteDialogOpen(false)}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </Button>
                  <Button style={{ padding: '0.75rem 2rem', borderRadius: '0.75rem', backgroundColor: '#ef4444', color: '#ffffff', border: '1px solid #ef4444', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
                    variant="destructive"
                    disabled={deleteLoading}
                    className="px-8 py-3 bg-red-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                    onClick={confirmDelete}
                  >
                    {deleteLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete Template
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>

        {/* Simple Report Dialog */}
        <Dialog open={simpleReportOpen} onOpenChange={setSimpleReportOpen}>
          <DialogContent className="min-w-[80vw] max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-gray-700">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 -m-6 mb-6 px-8 py-6">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                      <Download className="w-6 h-6" />
                      Test List Report
                    </DialogTitle>
                    <p className="text-green-100 mt-1">Simple overview of all tests</p>
                  </div>
                  <Button onClick={handlePrintSimple} className="bg-white/20 hover:bg-white/30 text-white border border-white/30">
                    <Printer className="h-4 w-4 mr-2" />
                    Print / Download PDF
                  </Button>
                </div>
              </DialogHeader>
            </div>

            <div ref={simpleReportRef} className="px-4 pb-4">
              {/* Header */}
              <div className="mb-3 mt-3">
                <div className="flex items-start justify-between">
                  {labID === "demo_lab_system" ? (
                    <div className="flex items-start">
                      {info?.logoUrl && (
                        <img
                          src={info?.logoUrl}
                          alt="Lab Logo"
                          className="h-20 w-20 mr-4 object-contain"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <div className="text-left">
                        <h1 className="text-2xl font-bold mb-0">LabSync Pro</h1>
                        <p className="text-sm mb-1 text-gray-500">v_1.0</p>
                        <p className="text-xs italic">Smart Lab Reporting System</p>
                      </div>
                    </div>

                  ) : labID === "doctor_lab_sahiwal" ? (
                    <div className="flex items-start">
                      {info?.logoUrl && (
                        <img
                          src={info?.logoUrl}
                          alt="Lab Logo"
                          className="h-20 w-20 mr-4 object-contain"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <div className="text-left">
                        <h1 className="text-2xl font-bold mb-0">
                          <span style={{ letterSpacing: '0.3em' }}>DOCTOR</span>{' '}
                          <span style={{ letterSpacing: '0.25em' }}>LAB</span>
                        </h1>
                        <p className="text-sm mb-1">
                          <span style={{ letterSpacing: '0.02em' }}>&</span>{' '}
                          <span style={{ letterSpacing: '0.08em' }}>Imaging Center Sahiwal</span>
                        </p>
                        <p className="text-xs italic" style={{ letterSpacing: '0.03em' }}>
                          Better Diagnosis - Better Treatment
                        </p>
                      </div>
                    </div>

                  ) : labID === "fatima_medical_lab_bhera" ? (
                    <div className="flex items-start">
                      {info?.logoUrl && (
                        <img
                          src={info?.headerUrl}
                          alt="Lab Logo"
                          className=""
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      {/* <div className="text-left">
                        <h1 className="text-2xl font-bold mb-0">
                          <span style={{ letterSpacing: '0.1em' }}>FATIMA</span>{' '}
                          <span style={{ letterSpacing: '0.1em' }}>MEDICAL LAB</span>
                        </h1>
                        <p className="text-xs italic">Fatima Medical Lab Bhera</p>
                      </div> */}
                    </div>

                  ) : (
                    <div className="flex items-start">
                      {info?.logoUrl && (
                        <img
                          src={info?.logoUrl}
                          alt="Lab Logo"
                          className="h-20 w-20 mr-4 object-contain"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <div className="text-left">
                        <h1 className="text-2xl font-bold mb-0">LabSync Pro</h1>
                        <p className="text-sm mb-1 text-gray-500">v_1.0</p>
                        <p className="text-xs italic">Smart Lab Reporting System</p>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              <div className="text-center mb-3 pb-2 border-b border-gray-800">
                <p className="text-gray-700 text-sm font-semibold">Test List Report</p>
                <p className="text-xs text-gray-600 mt-1">
                  Generated on: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>

              {/* Simple Table */}
              <table className="w-full text-xs border-collapse border-2 border-gray-800">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="px-3 py-2 text-left font-bold border-r border-gray-600">Sr. No</th>
                    <th className="px-3 py-2 text-left font-bold border-r border-gray-600">Test Name</th>
                    <th className="px-3 py-2 text-center font-bold">Test Price (Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTests.map((test, index) => (
                    <tr key={test._id} className={`border-b border-gray-300 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-3 py-2 text-gray-900 border-r border-gray-300">{index + 1}</td>
                      <td className="px-3 py-2 font-semibold text-gray-900 border-r border-gray-300">{test.testName}</td>
                      <td className="px-3 py-2 text-center font-bold text-green-700">Rs. {test.testPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary */}
              <div className="mt-4 pt-2 border-t-2 border-gray-800">
                <div className="flex justify-between items-center bg-gray-100 px-3 py-2">
                  <span className="text-base font-bold text-gray-900">Total Tests:</span>
                  <span className="text-xl font-bold text-gray-900">{filteredTests.length}</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Detailed Report Dialog */}
        <Dialog open={detailedReportOpen} onOpenChange={setDetailedReportOpen}>
          <DialogContent className="min-w-[80vw] max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-gray-700">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 -m-6 mb-6 px-8 py-6">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                      <Printer className="w-6 h-6" />
                      Detailed Test List Report
                    </DialogTitle>
                    <p className="text-blue-100 mt-1">Complete test information with all details</p>
                  </div>
                  <Button onClick={handlePrintDetailed} className="bg-white/20 hover:bg-white/30 text-white border border-white/30">
                    <Printer className="h-4 w-4 mr-2" />
                    Print / Download PDF
                  </Button>
                </div>
              </DialogHeader>
            </div>

            <div ref={detailedReportRef} className="px-4 pb-4">
              {/* Header */}
              <div className="mb-3 mt-3">
                <div className="flex items-start justify-between">
                  {labID === "demo_lab_system" ? (
                    <div className="flex items-start">
                      {info?.logoUrl && (
                        <img
                          src={info?.logoUrl}
                          alt="Lab Logo"
                          className="h-20 w-20 mr-4 object-contain"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <div className="text-left">
                        <h1 className="text-2xl font-bold mb-0">LabSync Pro</h1>
                        <p className="text-sm mb-1 text-gray-500">v_1.0</p>
                        <p className="text-xs italic">Smart Lab Reporting System</p>
                      </div>
                    </div>

                  ) : labID === "doctor_lab_sahiwal" ? (
                    <div className="flex items-start">
                      {info?.logoUrl && (
                        <img
                          src={info?.logoUrl}
                          alt="Lab Logo"
                          className="h-20 w-20 mr-4 object-contain"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <div className="text-left">
                        <h1 className="text-2xl font-bold mb-0">
                          <span style={{ letterSpacing: '0.3em' }}>DOCTOR</span>{' '}
                          <span style={{ letterSpacing: '0.25em' }}>LAB</span>
                        </h1>
                        <p className="text-sm mb-1">
                          <span style={{ letterSpacing: '0.02em' }}>&</span>{' '}
                          <span style={{ letterSpacing: '0.08em' }}>Imaging Center Sahiwal</span>
                        </p>
                        <p className="text-xs italic" style={{ letterSpacing: '0.03em' }}>
                          Better Diagnosis - Better Treatment
                        </p>
                      </div>
                    </div>

                  ) : labID === "fatima_medical_lab_bhera" ? (
                    <div className="flex items-start">
                      {info?.logoUrl && (
                        <img
                          src={info?.headerUrl}
                          alt="Lab Logo"
                          className=""
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      {/* <div className="text-left">
                        <h1 className="text-2xl font-bold mb-0">
                          <span style={{ letterSpacing: '0.1em' }}>FATIMA</span>{' '}
                          <span style={{ letterSpacing: '0.1em' }}>MEDICAL LAB</span>
                        </h1>
                        <p className="text-xs italic">Fatima Medical Lab Bhera</p>
                      </div> */}
                    </div>

                  ) : (
                    <div className="flex items-start">
                      {info?.logoUrl && (
                        <img
                          src={info?.logoUrl}
                          alt="Lab Logo"
                          className="h-20 w-20 mr-4 object-contain"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <div className="text-left">
                        <h1 className="text-2xl font-bold mb-0">LabSync Pro</h1>
                        <p className="text-sm mb-1 text-gray-500">v_1.0</p>
                        <p className="text-xs italic">Smart Lab Reporting System</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center mb-3 pb-2 border-b-2 border-gray-800">
                <p className="text-gray-900 text-base font-bold">Detailed Test List Report</p>
                <p className="text-xs text-gray-600 mt-1">
                  Generated on: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>

              {/* Detailed Table */}
              <table className="w-full text-xs border-collapse border-2 border-gray-800">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="px-2 py-2 text-left font-bold border-r border-gray-600">Sr. No</th>
                    <th className="px-2 py-2 text-left font-bold border-r border-gray-600">Test Name</th>
                    <th className="px-2 py-2 text-center font-bold border-r border-gray-600">Test Price</th>
                    <th className="px-2 py-2 text-center font-bold border-r border-gray-600">Category</th>
                    <th className="px-2 py-2 text-center font-bold border-r border-gray-600">Test Type</th>
                    <th className="px-2 py-2 text-left font-bold border-r border-gray-600">Specimen</th>
                    <th className="px-2 py-2 text-left font-bold border-r border-gray-600">Performing Time</th>
                    <th className="px-2 py-2 text-left font-bold">Reporting Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTests.map((test, index) => (
                    <tr key={test._id} className={`border-b border-gray-300 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-2 py-2 text-gray-900 border-r border-gray-300">{index + 1}</td>
                      <td className="px-2 py-2 font-semibold text-gray-900 border-r border-gray-300">{test.testName}</td>
                      <td className="px-2 py-2 text-center font-bold text-green-700 border-r border-gray-300">Rs. {test.testPrice}</td>
                      <td className="px-2 py-2 text-center text-gray-700 border-r border-gray-300">{test.category}</td>
                      <td className="px-2 py-2 text-center text-gray-700 border-r border-gray-300">{test.testType ? test.testType.charAt(0).toUpperCase() + test.testType.slice(1) : '-'}</td>
                      <td className="px-2 py-2 text-gray-700 border-r border-gray-300">{test.specimen || '-'}</td>
                      <td className="px-2 py-2 text-gray-700 border-r border-gray-300">{test.performed || '-'}</td>
                      <td className="px-2 py-2 text-gray-700">{test.reported || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary Stats */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="border border-gray-800 bg-gray-50 p-2">
                  <p className="text-xs font-semibold text-gray-600">Total Tests</p>
                  <p className="text-lg font-bold text-gray-900">{filteredTests.length}</p>
                </div>
                <div className="border border-gray-800 bg-green-50 p-2">
                  <p className="text-xs font-semibold text-gray-600">Total Categories</p>
                  <p className="text-lg font-bold text-green-900">
                    {new Set(filteredTests.map(t => t.category)).size}
                  </p>
                </div>
                {/* <div className="border border-gray-800 bg-blue-50 p-2">
                  <p className="text-xs font-semibold text-gray-600">Average Price</p>
                  <p className="text-lg font-bold text-blue-900">
                    Rs. {Math.round(filteredTests.reduce((sum, t) => sum + t.testPrice, 0) / filteredTests.length || 0)}
                  </p>
                </div> */}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TestList;