import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react";
import { useContext, useState, useMemo } from "react";
import { TestContext } from "../context/TestContext";

const TestList = () => {
  const { tests, deleteTest, updateTest, loading } = useContext(TestContext);

  const [search, setSearch] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [editForm, setEditForm] = useState({ testName: "",testPrice: "", fields: [] });

  const filteredTests = useMemo(() => {
    return tests.filter((test) =>
      test.testName.toLowerCase().includes(search.toLowerCase())
    );
  }, [tests, search]);

  const handleEditClick = (test) => {
    setCurrentTest(test);
    setEditForm({
      testName: test.testName,
      testPrice: test.testPrice,
      fields: [...test.fields],
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
    await updateTest(currentTest._id, editForm);
    setEditDialogOpen(false);
  };

  const confirmDelete = async () => {
    await deleteTest(currentTest._id);
    setDeleteDialogOpen(false);
  };

  if (loading) return <p className="p-4">Loading tests...</p>;

  return (
    <div className="p-4 space-y-4 border bg-white rounded-3xl shadow-2xl mt-7">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Test Templates</h2>
        <div className="w-1/3 relative flex items-center">
          <Input
           className='border-gray-500 rounded-3xl'
            placeholder="Search tests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={18} className="absolute right-3 text-gray-500"/>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto bg-white shadow-sm border-none">
  <Table className=''>
    <TableHeader>
      <TableRow className="bg-gray-100 font-bold">
        <TableHead className="whitespace-nowrap font-bold text-gray-800">Test Name</TableHead>
        <TableHead className=" font-bold text-gray-800">Price</TableHead>
        <TableHead className="text-right  font-bold text-gray-800">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {filteredTests.length === 0 ? (
        <TableRow>
          <TableCell colSpan={3} className="text-center py-4 bg-white text-gray-600">
            No tests found
          </TableCell>
        </TableRow>
      ) : (
        filteredTests.map((test) => (
          <TableRow key={test._id} className="bg-white hover:bg-gray-50">
            <TableCell className=" text-gray-800">{test.testName}</TableCell>
            <TableCell className="text-gray-700">{test.testPrice}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="bg-gray-50 h-8 w-8 p-0 hover:bg-gray-100">
                    <MoreHorizontal className="h-4 w-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border shadow-md rounded-md">
                  <DropdownMenuItem
                    onClick={() => handleEditClick(test)}
                    className="hover:bg-gray-100 text-gray-700"
                  >
                    <Pencil className="mr-2 h-4 w-4 text-gray-500" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(test)}
                    className="hover:bg-gray-100 text-red-500"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
</div>

{/* Edit Dialog */}
<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
  {currentTest && (
    <DialogContent className="sm:max-w-2xl bg-white p-6 rounded-lg shadow-lg">
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold text-gray-800">
          Edit Test Template
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Test Name</label>
          <Input
            className="bg-white border-gray-300"
            value={editForm.testName}
            onChange={(e) =>
              setEditForm({ ...editForm, testName: e.target.value })
            }
            required
          />
          <label className="block text-sm font-medium text-gray-700 mt-2">Test Price</label>
          <Input
            className="bg-white border-gray-300"
            value={editForm.testPrice}
            onChange={(e) =>
              setEditForm({ ...editForm, testPrice: e.target.value })
            }
            required
          />
        </div>

        {/* Editable Fields */}
        <div className="space-y-4">
          {editForm.fields.map((field, index) => (
            <div
              key={index}
              className="grid grid-cols-4 gap-4 border border-gray-300 p-4 rounded-lg bg-gray-50"
            >
              <Input
                className="bg-white border-gray-300"
                value={field.fieldName}
                placeholder="Field Name"
                onChange={(e) =>
                  handleFieldChange(index, "fieldName", e.target.value)
                }
                required
              />
              
              <Input
                className="bg-white border-gray-300"
                value={field.defaultValue}
                placeholder="Default"
                onChange={(e) =>
                  handleFieldChange(index, "defaultValue", e.target.value)
                }
              />
              <Input
                className="bg-white border-gray-300"
                value={field.unit}
                placeholder="Unit"
                onChange={(e) =>
                  handleFieldChange(index, "unit", e.target.value)
                }
              />
              <Input
                className="bg-white border-gray-300"
                value={field.range}
                placeholder="Range"
                onChange={(e) =>
                  handleFieldChange(index, "range", e.target.value)
                }
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => setEditDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            Save
          </Button>
        </div>
      </form>
    </DialogContent>
  )}
</Dialog>

{/* Delete Confirmation */}
<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
  {currentTest && (
    <DialogContent className="sm:max-w-md bg-white p-6 rounded-lg shadow-lg">
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold text-gray-800">
          Confirm Deletion
        </DialogTitle>
      </DialogHeader>
      <p className="text-gray-700">
        Are you sure you want to delete{" "}
        <span className="font-semibold">{currentTest.testName}</span>?
      </p>
      <div className="flex justify-end gap-2 mt-4">
        <Button
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-100"
          onClick={() => setDeleteDialogOpen(false)}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={confirmDelete}
        >
          Delete
        </Button>
      </div>
    </DialogContent>
  )}
</Dialog>
    </div>
  );
};

export default TestList;
