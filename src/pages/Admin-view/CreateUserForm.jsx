import { useContext, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/context/AuthProvider";

function CreateUserForm() {
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const {fetchUsers} = useContext(AuthContext)

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/register",
        {
          name,
          userName,
          password,
          role,
        }
      );
      if (response.data.success) {
        console.log("Created successfully");
        fetchUsers()

      }
    } catch (error) {
      console.log("Error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-16 bg-white p-8 rounded-2xl shadow-md border border-gray-200">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Create New User
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Full Name
          </Label>
          <Input
            id="name"
            placeholder="Enter full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded-md"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium text-gray-700">
            Username
          </Label>
          <Input
            id="username"
            placeholder="Enter username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            className="rounded-md"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-md"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-medium text-gray-700">
            Role
          </Label>
          <Select value={role} onValueChange={(value) => setRole(value)}>
            <SelectTrigger id="role" className="rounded-md w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent className='bg-gray-50'>
              <SelectItem className='hover:border' value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 rounded-md transition"
        >
          {loading ? "Creating..." : "Create User"}
        </Button>
      </form>
    </div>
  );
}

export default CreateUserForm;
