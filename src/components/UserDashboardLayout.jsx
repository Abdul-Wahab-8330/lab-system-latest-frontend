import React, { useContext, useState, useEffect } from 'react';
import { ROLES, getRoleDisplayName, isAdmin, getMenuForRole } from '@/utils/permissions';
import {
  FlaskConical,
  ListChecks,
  Link2,
  Building2,
  UserCog,
  FileChartColumn,
  LineChart,
  LucideBoxes,
  CalculatorIcon,
  DollarSignIcon,
  PoundSterling,
  Printer,
  History,
  Star,
  Settings2
} from "lucide-react";

import {
  Menu,
  X,
  Home,
  FileText,
  Users,
  Settings,
  Calendar,
  BarChart3,
  Microscope,
  TestTube,
  ClipboardList,
  User,
  ChevronDown,
  AlertTriangle,
  Clock,
  CheckCircle,
  Filter,
  Download,
  Plus,
  LogOut,
  Crown,
  User2,
  LogIn,
  DollarSign,
  UserPlus,
  BarChart2,
  BarChart4,
  BarChartBig,
  FileBarChart2,
  ChartBarStackedIcon,
  ChartBarIncreasing,
  Key
} from 'lucide-react';
import lablogo from '../assets/lablogo.png'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { UserAvatar } from './UserAvatar';
import { AuthContext } from '@/context/AuthProvider';
import { LabInfoContext } from '@/context/LabnfoContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Separator } from './ui/separator';
import { GeneralSettingsContext } from '@/context/GeneralSettingsContext';
import { getUserPermissions, ALL_PERMISSIONS, CATEGORIES } from '@/utils/permissions';
import axiosInstance from '@/api/axiosInstance';

const UserDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterStatus, setFilterStatus] = useState('all');
  const { user, handleLogout } = useContext(AuthContext);
  const { info } = useContext(LabInfoContext);
  const [open, setOpen] = useState(false);
  const location = useLocation(); // Get current route
  const navigate = useNavigate();
  const { settings } = useContext(GeneralSettingsContext);
  const [userPermissions, setUserPermissions] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  const getActiveTabFromRoute = (pathname) => {
    const currentItem = menuItems.find(item => {
      if (item.type === 'header') return false;
      // Match exact path or check if current path starts with the menu item link
      return item.link === pathname || pathname.startsWith(item.link);
    });
    return currentItem ? currentItem.id : 'dashboard';
  };

  const labID = info?.labID;


  // ============================================
  // Build Grouped Menu (Most Used + Categories)
  // ============================================
  const buildGroupedMenu = (permissions) => {
    const mostUsed = permissions.filter(p => p.mostUsed);
    const others = permissions.filter(p => !p.mostUsed);

    // Group others by category
    const grouped = others.reduce((acc, perm) => {
      if (!acc[perm.category]) acc[perm.category] = [];
      acc[perm.category].push(perm);
      return acc;
    }, {});

    const result = [];

    // Add Most Used section
    if (mostUsed.length > 0) {
      result.push({ type: 'header', label: '⇒ Most Used' });
      result.push(...mostUsed);
    }

    // Add category sections
    Object.entries(grouped).forEach(([category, items]) => {
      if (items.length > 0) {
        result.push({ type: 'header', label: CATEGORIES[category] || category });
        result.push(...items);
      }
    });

    return result;
  };


  // Update active tab when route changes (including on refresh)
  useEffect(() => {
    if (menuItems.length > 0) {
      const currentActiveTab = getActiveTabFromRoute(location.pathname);
      setActiveTab(currentActiveTab);
    }
  }, [location.pathname, menuItems]);

  // ============================================
  // Fetch User's Permissions from Database
  // ============================================
  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        console.log('🔧 Settings object:', settings);
        console.log('📂 enableGroupedMenu value:', settings?.enableGroupedMenu);
        const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/api/users/all`);
        const currentUser = response.data.users.find(u => u._id === user.id);

        if (currentUser && currentUser.permissions) {
          const userPerms = getUserPermissions(currentUser.permissions);
          setUserPermissions(userPerms);

          // Build menu based on toggle
          if (settings?.enableGroupedMenu) {
            setMenuItems(buildGroupedMenu(userPerms));
          } else {
            setMenuItems(userPerms);
          }
        }
      } catch (error) {
        console.error('Error fetching user permissions:', error);
        // Fallback to role-based menu
        setMenuItems(getMenuForRole(user?.role));
      }
    };

    if (user?.id) {
      fetchUserPermissions();
    }
  }, [user?.id, settings?.enableGroupedMenu, location.pathname]);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true); // Open sidebar on desktop
      } else {
        setSidebarOpen(false); // Close sidebar on mobile
      }
    };

    // Add event listener
    window.addEventListener('resize', handleResize);
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);




  const getInitials = (fullName) => {
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getPageTitle = () => {
    const currentItem = menuItems.find(item => item.type !== 'header' && item.id === activeTab);
    return currentItem ? currentItem.label : 'Dashboard';
  };

  // Add this function after getPageTitle()
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-24'} md:relative fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} bg-white shadow-lg transition-transform duration-300 ease-in-out md:transition-all overflow-auto flex flex-col`}>
        {/* Logo/Header */}
        <div className="p-3 border-b border-gray-200 ">
          <div className="flex items-center justify-center">
            <Link
              onClick={() => setActiveTab('dashboard')}
              to={isAdmin(user?.role) ? '/admin/dashboard' : '/user/dashboard'}
              className="flex items-center space-x-2"
            >
              {labID === "demo_lab_system" ? (
                /* ===== LabSync Pro ===== */
                <>
                  <img src={info?.logoUrl} className="w-12" />
                  {sidebarOpen && (
                    <span className="cursor-pointer text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                      LabSync Pro
                      <span className="block text-xs px-1 text-gray-400 font-extralight">
                        v_1.0
                      </span>
                    </span>
                  )}
                </>

              ) : labID === "doctor_lab_sahiwal" ? (
                /* ===== Doctor Lab ===== */
                <>
                  <img src={info?.logoUrl} className="w-12" />
                  {sidebarOpen && (
                    <span className="cursor-pointer text-xl font-bold whitespace-nowrap">
                      D O C T O R &nbsp;L A B
                      <span className="block text-xs italic font-extralight">
                        & Imaging Center Sahiwal
                      </span>
                    </span>
                  )}
                </>

              ) : labID === "fatima_medical_lab_bhera" ? (
                /* ===== Fatima Lab ===== */
                <>
                  <img src={`${sidebarOpen ? info?.headerUrl : info?.logoUrl}`} className="w-60 h-[46px]" />
                  {/* {sidebarOpen && (
                    <span className="cursor-pointer text-xl font-bold whitespace-nowrap">
                      F A T I M A &nbsp;L A B
                      <span className="block text-xs italic font-extralight">
                        Fatima Medical Lab Bhera
                      </span>
                    </span>
                  )} */}
                </>

              ) : (
                /* ===== Default (LabSync) ===== */
                <>
                  <img src="/labsync-logo.png" className="w-12" />
                  {sidebarOpen && (
                    <span className="cursor-pointer text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                      LabSync Pro
                      <span className="block text-xs px-1 text-gray-400 font-extralight">
                        v_1.0
                      </span>
                    </span>
                  )}
                </>
              )}
            </Link>

          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 mb-1">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              // Render section header
              if (item.type === 'header') {
                return (
                  <li key={`header-${index}`} className="pt-3 pb-2">
                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider  ">
                      {item.label}
                    </h3>
                  </li>
                );
              }

              // Render menu item
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <Link to={item.link}
                    onClick={handleLinkClick}

                    style={isActive
                      ? {
                        backgroundColor: '#EFF6FF',
                        color: '#1D4ED8',
                        borderColor: '#BFDBFE',
                      }
                      : {
                        color: '#4B5563',
                        backgroundColor: '#F9FAFB',
                        borderColor: 'transparent',
                      }
                    }
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 border ${isActive
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 border-transparent'
                      }`}
                  >
                    <IconComponent className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <span className="text-sm font-medium truncate flex gap-2 items-center">
                        {item.label}
                        {item?.icon2 && <item.icon2 size={13} className='text-amber-300' />}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className={`p-4 border-t bg-white border-gray-200 ${sidebarOpen ? 'block' : 'hidden'}`}>
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <div
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors duration-200 w-full"
                style={{ backgroundColor: '#F9FAFB', color: '#111827' }} // fallback for legacy
              >
                <Avatar className="cursor-pointer">
                  <AvatarFallback
                    className="bg-gray-900 text-sm text-white"
                    style={{ backgroundColor: '#111827', color: '#FFFFFF' }} // legacy fallback
                  >
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#1F2937' }}>Dr. {user?.name}</p>
                  <p className="text-xs truncate" style={{ color: '#6B7280' }}>
                    {getRoleDisplayName(user?.role)}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#6B7280' }} />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="cursor-pointer w-56 bg-gray-50 border border-gray-300 shadow-lg"
              style={{ backgroundColor: '#F9FAFB', color: '#111827' }} // fallback for content
            >
              <DropdownMenuLabel className="flex gap-2 flex-wrap" style={{ color: '#111827' }}>
                <User size={20} /> Logged in as <span className="font-semibold px-3 pl-6">{user.name}</span>
              </DropdownMenuLabel>

              <Separator />
              <DropdownMenuSeparator />
              <Separator className="bg-gray-300 my-1" style={{ backgroundColor: '#D1D5DB' }} />

              {/* Change Password */}
              <DropdownMenuItem
                className="cursor-pointer text-indigo-600 hover:bg-gray-100"
                style={{ color: '#4F46E5' }} // legacy fallback for text
                onClick={() => {
                  setOpen(false);
                  navigate('/user/change-password');
                }}
              >
                <Key size={16} /> Change My Password
              </DropdownMenuItem>
              <Separator className='bg-gray-300 my-1' style={{ backgroundColor: '#D1D5DB' }} />


              {/* only for admin */}
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

              {/* Logout */}
              <DropdownMenuItem
                className="cursor-pointer  hover:bg-gray-100"
                style={{ color: '#EF4444' }} // legacy fallback for text
                onClick={handleLogout}
              >
                <LogOut /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 capitalize">{getPageTitle()}</h1>
                <p className="text-sm text-gray-500">Welcome back, Dr. {user?.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Export Button */}
              {isAdmin(user?.role) && <Link style={{ backgroundColor: '#F9FAFB', color: '#374151' }} to='/user/patients' className="lg:flex hidden items-center space-x-2 px-4 py-2 border border-gray-100 bg-gray-50 hover:bg-gray-100 hover:shadow-xs rounded-xl transition-colors duration-200">
                <Printer style={{ color: '#4B5563' }} className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700 flex gap-2 items-center">Reports </span>
              </Link>}

              {/* Add New Button */}
              {isAdmin(user?.role) ?
                <Link style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}

                  to='/admin/create-test' className="lg:flex hidden  items-center space-x-2 px-4 border border-blue-400 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 shadow-sm">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium flex gap-2 items-center">Register Patient</span>
                </Link>
                :
                <Link style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                  to='/user/register-patient' className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 shadow-sm">
                  <UserPlus className="w-4 h-4" />
                  <span className="text-sm font-medium"> Register Patient</span>
                </Link>
              }

              <div className=' lg:flex hidden text-gray-600 gap-2'>
                <div className='rounded-xl py-2 px-2 text-sm'>
                  <span className='flex gap-2 items-center'>
                    {isAdmin(user?.role) ? (
                      <><Crown className='text-amber-400' size={17} /> Admin</>
                    ) : (
                      <><User size={17} /> {getRoleDisplayName(user?.role)}</>
                    )}
                  </span>
                </div>
                <UserAvatar />
              </div>
            </div>
          </div>
        </header>

        <div className=' overflow-auto'>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default UserDashboardLayout;