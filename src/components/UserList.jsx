import { useEffect, useState, useContext } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { AuthContext } from "@/context/AuthProvider";

const UserList = () => {
  const { users, fetchUsers, deleteUser } = useContext(AuthContext);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteUser(selectedUser._id);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="rounded-3xl border border-gray-200 overflow-x-auto mt-4 bg-white shadow-xl p-5">
      <h2 className="text-xl px-1 font-semibold mb-4 text-gray-800">User List</h2>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="text-gray-800">Name</TableHead>
            <TableHead className="text-gray-800">Username</TableHead>
            <TableHead className="text-gray-800">Role</TableHead>
            <TableHead className="text-right text-gray-800">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 bg-white text-gray-600">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((u) => (
              <TableRow key={u._id} className="bg-white hover:bg-gray-50">
                <TableCell className="text-gray-800">{u.name}</TableCell>
                <TableCell className="text-gray-800">{u.userName}</TableCell>
                <TableCell className="text-gray-800">{u.role}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    className="text-red-600 hover:bg-gray-100"
                    onClick={() => handleDeleteClick(u)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        {selectedUser && (
          <DialogContent className="sm:max-w-md bg-white p-6 rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-800">
                Confirm Deletion
              </DialogTitle>
            </DialogHeader>
            <p className="text-gray-700">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedUser.name}</span>?
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

export default UserList;
