import React, { useContext, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TestContext } from "@/context/TestContext";

const CreateTestForm = () => {
    const [testName, setTestName] = useState("");
    const [testPrice, setTestPrice] = useState("");
    const {fetchTests} = useContext(TestContext)
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

        try {
            const payload = {
                testName,
                testPrice,
                fields,
            };

            console.log('payload', payload)
            const res = await axios.post("http://localhost:5000/api/tests/create-test", payload);
            if (res.data.success) {
                alert("Test Created Successfully!");
                fetchTests()
                setTestName("");
                setTestPrice("");
                setFields([{ fieldName: "", defaultValue: '', unit: '', range: '' }]);
            }
        } catch (error) {
            console.log(error);
            alert("Something went wrong");
        }
    };

    return (
        <div className="max-w-4xl mx-auto border border-gray-200  p-6 mt-4 bg-white rounded-3xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">Create New Lab Test</h2>
            <form onSubmit={handleSubmit}>
                {/* Test Name */}
                <div className="mb-4">
                    <Label className="block font-medium mb-1">Test Name:</Label>
                    <Input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={testName}
                        onChange={(e) => setTestName(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <Label className="block font-medium mb-1">Test Price:</Label>
                    <Input
                        type="number"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={testPrice}
                        onChange={(e) => setTestPrice(e.target.value)}
                        required
                    />
                </div>

                {/* Dynamic Fields */}
                <div className="mb-4">
                    <label className="block font-medium mb-2">Fields:</label>
                    {fields.map((field, index) => (
                        <div key={index} className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-2 items-center">
                            <Input
                                type="text"
                                className="flex-1 border border-gray-300 rounded px-2 py-1"
                                placeholder="Field Name"
                                value={field.fieldName}
                                onChange={(e) =>
                                    handleFieldChange(index, "fieldName", e.target.value)
                                }
                                required
                            />
                            <Input
                                type="text"
                                className="flex-1 border border-gray-300 rounded px-2 py-1"
                                placeholder="Default Value (optional)"
                                value={field.defaultValue}
                                onChange={(e) =>
                                    handleFieldChange(index, "defaultValue", e.target.value)
                                }
                            />

                            <Input
                                type="text"
                                className="flex-1 border border-gray-300 rounded px-2 py-1"
                                placeholder="Unit (optional)"
                                value={field.unit}
                                onChange={(e) => handleFieldChange(index, 'unit', e.target.value)}
                            />
                            <Input
                                type="text"
                                name="range"
                                className="flex-1 border border-gray-300 rounded px-2 py-1"
                                placeholder="Enter normal range (e.g. 70–110 mg/dL)"
                                value={field.range}
                                onChange={(e) => handleFieldChange(index, 'range', e.target.value)}
                            />
                            <Select
                                value={fields.fieldType}
                                onValueChange={(value) => handleFieldChange(index, "fieldType", value)}
                                defaultValue="string"
                            >
                                <SelectTrigger className="w-[180px] border border-gray-300 rounded px-2 py-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className='bg-white border-none shadow-2xl'>
                                    <SelectItem className=' hover:border hover:bg-gray-100' value="string">String</SelectItem>
                                    <SelectItem className='hover:border hover:bg-gray-100' value="number">Number</SelectItem>
                                    <SelectItem className='hover:border hover:bg-gray-100' value="date">Date</SelectItem>
                                    <SelectItem className='hover:border hover:bg-gray-100' value="boolean">Boolean</SelectItem>
                                </SelectContent>
                            </Select>
                            {fields.length > 1 && (
                                <button
                                    type="button"
                                    className="text-red-600 font-bold text-end "
                                    onClick={() => removeField(index)}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addField}
                        className="text-sm text-blue-600 underline"
                    >
                        + Add Field
                    </button>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                    Create Test
                </button>
            </form>
        </div>
    );
};

export default CreateTestForm;
