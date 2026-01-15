



import React, { useContext, useState } from "react";
import axios from "@/api/axiosInstance";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TestContext } from "@/context/TestContext";
import { Plus, X, TestTube2, DollarSign, Settings, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Categories } from "@/utils/testCategories";

const CreateTestForm = () => {
    const [testName, setTestName] = useState("");
    const [testPrice, setTestPrice] = useState("");
    const [category, setCategory] = useState("");
    const [testCode, setTestCode] = useState("");
    const [specimen, setSpecimen] = useState("");
    const [performed, setPerformed] = useState("");
    const [reported, setReported] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { fetchTests } = useContext(TestContext)
    const [fields, setFields] = useState([
        { fieldName: '', fieldType: 'String', defaultValue: '', unit: '', range: '' }
    ]);

    // Add new field input
    const addField = () => {
        setFields([
            ...fields,
            { fieldName: '', fieldType: 'String', defaultValue: '', unit: '', range: '' }
        ]);
    };

    // Remove a specific field
    const removeField = (index) => {
        const updated = [...fields];
        updated.splice(index, 1);
        setFields(updated);
    };

    // Handle field change
    const handleFieldChange = (index, key, value) => {
        const updated = [...fields];
        updated[index][key] = value;
        setFields(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                testCode,
                testName,
                testPrice,
                category,
                specimen,
                performed,
                reported,
                fields,
            };

            console.log('payload', payload)
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/tests/create-test`, payload);
            if (res.data.success) {
                toast.success("Test Created Successfully!");
                fetchTests()
                setTestName("");
                setTestPrice("");
                setCategory("");
                setTestCode("");
                setSpecimen("");
                setPerformed("");
                setReported("");
                setFields([{ fieldName: "", fieldType: "String", defaultValue: '', unit: '', range: '' }]);
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                {/* <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                        <TestTube2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Lab Test</h1>
                    <p className="text-gray-600 text-lg">Configure test parameters and field specifications</p>
                </div> */}

                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Settings className="w-6 h-6" />
                            Test Configuration
                        </h2>
                        <p className="text-blue-100 mt-1">Define your test details and measurement fields</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        {/* Basic Test Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Test Code */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <TestTube2 className="w-4 h-4 text-blue-500" />
                                    Test Code
                                </Label>
                                <Input
                                    type="number"
                                    className="h-12 border-2 border-gray-200 rounded-xl px-4 text-gray-700 bg-gray-50 focus:bg-white focus:border-blue-500 transition-all duration-200"
                                    placeholder="Enter unique test code (1001 - 9999)"
                                    value={testCode}
                                    onChange={(e) => setTestCode(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Test Name */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <TestTube2 className="w-4 h-4 text-blue-500" />
                                    Test Name
                                </Label>
                                <Input
                                    type="text"
                                    className="h-12 border-2 border-gray-200 rounded-xl px-4 text-gray-700 bg-gray-50 focus:bg-white focus:border-blue-500 transition-all duration-200"
                                    placeholder="Enter test name (e.g., Complete Blood Count)"
                                    value={testName}
                                    onChange={(e) => setTestName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Test Price */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-green-500" />
                                    Test Price (Rs.)
                                </Label>
                                <Input
                                    type="number"
                                    className="h-12 border-2 border-gray-200 rounded-xl px-4 text-gray-700 bg-gray-50 focus:bg-white focus:border-blue-500 transition-all duration-200"
                                    placeholder="Enter price in Rs."
                                    value={testPrice}
                                    onChange={(e) => setTestPrice(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Test Category */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-purple-500" />
                                    Test Category
                                </Label>
                                <Select
                                    value={category}
                                    onValueChange={(value) => setCategory(value)}
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
                                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <TestTube2 className="w-4 h-4 text-orange-500" />
                                    Specimen Type
                                </Label>
                                <Input
                                    type="text"
                                    className="h-12 border-2 border-gray-200 rounded-xl px-4 text-gray-700 bg-gray-50 focus:bg-white focus:border-blue-500 transition-all duration-200"
                                    placeholder="e.g., Blood, Urine, Serum"
                                    value={specimen}
                                    onChange={(e) => setSpecimen(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Performed */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-indigo-500" />
                                    Test Performed
                                </Label>
                                <Input
                                    type="text"
                                    className="h-12 border-2 border-gray-200 rounded-xl px-4 text-gray-700 bg-gray-50 focus:bg-white focus:border-blue-500 transition-all duration-200"
                                    placeholder="e.g., Daily, On demand"
                                    value={performed}
                                    onChange={(e) => setPerformed(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Reported */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-teal-500" />
                                    Report Time
                                </Label>
                                <Input
                                    type="text"
                                    className="h-12 border-2 border-gray-200 rounded-xl px-4 text-gray-700 bg-gray-50 focus:bg-white focus:border-blue-500 transition-all duration-200"
                                    placeholder="e.g., Same day, 24 hours"
                                    value={reported}
                                    onChange={(e) => setReported(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Dynamic Fields Section */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-blue-500" />
                                    Test Fields Configuration
                                </h3>
                                <button
                                    type="button"
                                    onClick={addField}
                                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Field
                                </button>
                            </div>

                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={index} className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-semibold text-gray-700 text-sm">Field #{index + 1}</h4>
                                            {fields.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="flex items-center justify-center w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 rounded-lg transition-colors duration-200"
                                                    onClick={() => removeField(index)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                            <div className="lg:col-span-1">
                                                <Label className="text-xs font-medium text-gray-600 mb-1 block">Field Name</Label>
                                                <Input
                                                    type="text"
                                                    className="h-10 border border-gray-200 rounded-lg px-3 text-sm bg-gray-50 focus:bg-white focus:border-blue-400 transition-all duration-200"
                                                    placeholder="e.g., Hemoglobin"
                                                    value={field.fieldName}
                                                    onChange={(e) =>
                                                        handleFieldChange(index, "fieldName", e.target.value)
                                                    }
                                                    required
                                                />
                                            </div>

                                            <div className="lg:col-span-1">
                                                <Label className="text-xs font-medium text-gray-600 mb-1 block">Default Value</Label>
                                                <Input
                                                    type="text"
                                                    className="h-10 border border-gray-200 rounded-lg px-3 text-sm bg-gray-50 focus:bg-white focus:border-blue-400 transition-all duration-200"
                                                    placeholder="Optional"
                                                    value={field.defaultValue}
                                                    onChange={(e) =>
                                                        handleFieldChange(index, "defaultValue", e.target.value)
                                                    }
                                                />
                                            </div>

                                            <div className="lg:col-span-1">
                                                <Label className="text-xs font-medium text-gray-600 mb-1 block">Unit</Label>
                                                <Input
                                                    type="text"
                                                    className="h-10 border border-gray-200 rounded-lg px-3 text-sm bg-gray-50 focus:bg-white focus:border-blue-400 transition-all duration-200"
                                                    placeholder="e.g., mg/dL"
                                                    value={field.unit}
                                                    onChange={(e) => handleFieldChange(index, 'unit', e.target.value)}
                                                />
                                            </div>

                                            <div className="lg:col-span-1">
                                                <Label className="text-xs font-medium text-gray-600 mb-1 block">Normal Range</Label>
                                                <Input
                                                    type="text"
                                                    className="h-10 border border-gray-200 rounded-lg px-3 text-sm bg-gray-50 focus:bg-white focus:border-blue-400 transition-all duration-200"
                                                    placeholder="e.g., 70–110 mg/dL"
                                                    value={field.range}
                                                    onChange={(e) => handleFieldChange(index, 'range', e.target.value)}
                                                />
                                            </div>

                                            <div className="lg:col-span-1">
                                                <Label className="text-xs font-medium text-gray-600 mb-1 block">Field Type</Label>
                                                <Select
                                                    defaultValue="String"
                                                    value={field.fieldType}
                                                    onValueChange={(value) => handleFieldChange(index, "fieldType", value)}
                                                >
                                                    <SelectTrigger className="h-10 border border-gray-200 rounded-lg px-3 text-sm bg-gray-50 hover:bg-white focus:border-blue-400 transition-all duration-200">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className='bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden'>
                                                        <SelectItem className='hover:bg-blue-50 px-4 py-2 cursor-pointer transition-colors duration-150' value="string">String</SelectItem>
                                                        <SelectItem className='hover:bg-blue-50 px-4 py-2 cursor-pointer transition-colors duration-150' value="number">Number</SelectItem>
                                                        <SelectItem className='hover:bg-blue-50 px-4 py-2 cursor-pointer transition-colors duration-150' value="date">Date</SelectItem>
                                                        <SelectItem className='hover:bg-blue-50 px-4 py-2 cursor-pointer transition-colors duration-150' value="boolean">Boolean</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center pt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:transform-none disabled:cursor-not-allowed min-w-48"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creating Test...
                                    </>
                                ) : (
                                    <>
                                        <TestTube2 className="w-5 h-5" />
                                        Create Test
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateTestForm;