import React, { useContext, createContext } from "react"
import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AuthContext } from "@/context/AuthProvider"
import { LogOut, Settings, User } from "lucide-react"
import { Separator } from "./ui/separator"


export function UserAvatar() {
    const { user, setIsAuthenticated, setUser } = useContext(AuthContext)

    const getInitials = (fullName) => {
        const parts = fullName.trim().split(" ")
        if (parts.length === 1) return parts[0][0].toUpperCase()
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    const handleLogout = () => {
            sessionStorage.removeItem('token')
            sessionStorage.removeItem('user')
            setIsAuthenticated(false)
            setUser({})
            console.log('logged out successfully')
        }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger title={user?.name} asChild className='bg-gray-900 text-white '>
                <Avatar className="cursor-pointer">
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="cursor-pointer w-56 bg-gray-50 border border-gray-300 shadow-lg">
                <DropdownMenuLabel className='flex gap-2 text-gray-600'>
                    <User size={16}/> Logged in as <span className="font-semibold">{user.name}</span>
                </DropdownMenuLabel>
                <Separator/>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem className='hover:bg-red-500 hover:text-white cursor-pointer text-red-500' onClick={handleLogout}>
                    <LogOut/> Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
