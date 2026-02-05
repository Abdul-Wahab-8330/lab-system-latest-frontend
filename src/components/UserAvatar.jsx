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
import { Separator } from "./ui/separator"

import { LogOut, Settings, User, Key, History, Star, Settings2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function UserAvatar() {
    const { user, setIsAuthenticated, setUser } = useContext(AuthContext)
    const navigate = useNavigate();

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
            <DropdownMenuTrigger title={user?.name} asChild className='bg-gray-900 text-white ' style={{ backgroundColor: '#111827', color: '#FFFFFF' }}>
                <Avatar className="cursor-pointer">
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent style={{ backgroundColor: '#F9FAFB', color: '#000000' }} className="cursor-pointer w-56 bg-gray-50 border border-gray-300 shadow-lg">
                <DropdownMenuLabel style={{ color: '#4B5563' }} className='flex gap-2 text-gray-600 flex-wrap'>
                    <User size={20} /> Logged in as <span className="font-semibold text-sm px-3 pl-6">{user.name}</span>
                </DropdownMenuLabel>
                <Separator />
                <DropdownMenuSeparator />
                <Separator className='bg-gray-300 my-1' style={{ backgroundColor: '#D1D5DB' }} />

                {/* ✅ NEW - Change Password Option */}
                <DropdownMenuItem style={{ color: '#4F46E5' }}
                    className=' cursor-pointer text-indigo-600 hover:bg-gray-200'
                    onClick={() => navigate('/user/change-password')}
                >
                    <Key size={16} /> Change My Password
                </DropdownMenuItem>
                <Separator className='bg-gray-300 my-1' style={{ backgroundColor: '#D1D5DB' }} />


                {/* ✅ NEW - History Settings (Admin Only) */}
                {user?.role === 'admin' && (
                    <>
                        <DropdownMenuItem
                            style={{ color: '#2563EB' }}
                            className='cursor-pointer text-blue-600 hover:bg-gray-200'
                            onClick={() => navigate('/user/history-results')}
                        >
                            <History size={16} /> History Settings
                        </DropdownMenuItem>
                        <Separator className='bg-gray-300 my-1' style={{ backgroundColor: '#D1D5DB' }} />
                    </>
                )}

                {/* ✅ Review On Online Results (Admin Only) */}
                {user?.role === 'admin' && (
                    <>
                        <DropdownMenuItem
                            style={{ color: '#2563EB' }}
                            className='cursor-pointer text-blue-600 hover:bg-gray-200'
                            onClick={() => navigate('/admin/reviews')}
                        >
                            <Star size={16} /> Review Settings
                        </DropdownMenuItem>
                        <Separator className='bg-gray-300 my-1' style={{ backgroundColor: '#D1D5DB' }} />
                    </>
                )}
                {/* ✅ Print Settings(visible header footer or not) */}
                {user?.role === 'admin' && (
                    <>
                        <DropdownMenuItem
                            style={{ color: '#2563EB' }}
                            className='cursor-pointer text-blue-600 hover:bg-gray-200'
                            onClick={() => navigate('/admin/general-settings')}
                        >
                            <Settings2 size={16} /> General Settings
                        </DropdownMenuItem>
                        <Separator className='bg-gray-300 my-1' style={{ backgroundColor: '#D1D5DB' }} />
                    </>
                )}

                <DropdownMenuItem style={{ color: '#EF4444' }} className='hover:bg-gray-200 cursor-pointer text-red-500' onClick={handleLogout}>
                    <LogOut /> Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
