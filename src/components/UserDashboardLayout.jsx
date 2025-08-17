// import React, { useContext, useState } from 'react';
// import {
//   FlaskConical,
//   ListChecks,
//   Link2,
//   Building2,
//   UserCog,
//   FileChartColumn,
//   LineChart
// } from "lucide-react";

// import {
//   Menu,
//   X,
//   Home,
//   FileText,
//   Users,
//   Settings,
//   Calendar,
//   BarChart3,
//   Microscope,
//   TestTube,
//   ClipboardList,
//   User,
//   ChevronDown,
//   AlertTriangle,
//   Clock,
//   CheckCircle,
//   Filter,
//   Download,
//   Plus,
//   LogOut,
//   Crown,
//   User2,
//   LogIn,
//   DollarSign,
//   UserPlus,
//   BarChart2,
//   BarChart4,
//   BarChartBig,
//   FileBarChart2,
//   ChartBarStackedIcon,
//   ChartBarIncreasing
// } from 'lucide-react';
// import lablogo from '../assets/lablogo.png'
// import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
// import { Link, Outlet } from 'react-router-dom';
// import { UserAvatar } from './UserAvatar';
// import { AuthContext } from '@/context/AuthProvider';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
// import { Separator } from './ui/separator';

// const UserDashboardLayout = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const { user, handleLogout } = useContext(AuthContext);
//   const [open, setOpen] = useState(false); // Fixed: properly declare state


//   const adminMenuItems = [
//     { id: 'dashboard', icon: Home, label: 'Dashboard', link: '/admin/dashboard' },
//     // admin options
//     { id: 'create test', icon: FlaskConical, label: 'Create New Test', link: '/admin/create-test', icon2: Crown },
//     { id: 'all tests', icon: ListChecks, label: 'Manage Tests', link: '/admin/all-tests', icon2: Crown },
//     { id: 'create user', icon: UserPlus, label: 'Create New User', link: '/admin/create-user', icon2: Crown },
//     { id: 'all users', icon: Users, label: 'Manage Users', link: '/admin/all-users', icon2: Crown },
//     { id: 'references', icon: Link2, label: 'Add Reference', link: '/admin/add-reference', icon2: Crown },
//     { id: 'edit lab info', icon: Building2, label: 'Edit Lab Info', link: '/admin/edit-labinfo', icon2: Crown },
//     { id: 'finance analytics', icon: BarChart2, label: 'Finance Analytics', link: '/admin/finance-analytics', icon2: Crown },
//     { id: 'user analytics', icon: UserCog, label: 'User Analytics', link: '/admin/user-analytics', icon2: Crown },
//     { id: 'test analytics', icon: FileChartColumn, label: 'Test Analytics', link: '/admin/test-analytics', icon2: Crown },

//     // + normal user options
//     { id: 'register patients', icon: Plus, label: 'Register Patients', link: '/user/register-patient' },
//     { id: 'all patients', icon: Users, label: 'Manage Patients', link: '/user/all-patients' },
//     { id: 'payments', icon: DollarSign, label: 'Payments', link: '/user/payments' },
//     { id: 'results', icon: Microscope, label: 'Manage Results', link: '/user/results' },
//     { id: 'reg reports', icon: FileText, label: 'Reg. Reports', link: '/user/patients' },
//     { id: 'final reports', icon: LineChart , label: 'Final Reports', link: '/user/result-print' },
//     { id: 'analytics', icon: BarChart3, label: 'Patient Analytics', link: '/user/patient-analytics' },

//   ];
//   const menuItems = [
//     //normal user options
//     { id: 'dashboard', icon: Home, label: 'Dashboard', link: '/user/dashboard' },
//     { id: 'register patients', icon: Plus, label: 'Register Patients', link: '/user/register-patient' },
//     { id: 'all patients', icon: Users, label: 'Manage Patients', link: '/user/all-patients' },
//     { id: 'payments', icon: DollarSign, label: 'Payments', link: '/user/payments' },
//     { id: 'results', icon: Microscope, label: 'Manage Results', link: '/user/results' },
//     { id: 'reg reports', icon: FileText, label: 'Reg. Reports', link: '/user/patients' },
//     { id: 'final reports', icon: LineChart , label: 'Final Reports', link: '/user/result-print' },
//     { id: 'analytics', icon: BarChart3, label: 'Patient Analytics', link: '/user/patient-analytics' },
//   ];

//   const getInitials = (fullName) => {
//     const parts = fullName.trim().split(" ");
//     if (parts.length === 1) return parts[0][0].toUpperCase();
//     return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
//   };

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Sidebar */}
//       <div className={`${sidebarOpen ? 'w-64' : 'w-23'} bg-white shadow-lg transition-all duration-300 overflow-auto ease-in-out flex flex-col`}>
//         {/* Logo/Header */}
//         <div className="p-4 border-b border-gray-200">
//           <div className="flex items-center justify-center">
//             <Link onClick={() => setActiveTab('Dashboard')} to={user?.role == 'admin' ? '/admin/dashboard' : '/user/dashboard'} className="flex items-center space-x-2">
//               {/* <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
//                 <Microscope className="w-5 h-5 text-white" />
//               </div> */}
//               <div>
//                 <img src={lablogo} alt="" className='w-14' />
//               </div>
//               {sidebarOpen && (
//                 <span className="cursor-pointer text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
//                   LabSync Pro
//                   <span className='block text-xs px-1 text-gray-400 font-extralight' >v_1.0</span>
//                 </span>
//               )}
//             </Link>
//           </div>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 p-4 mb-18">
//           <ul className="space-y-2">

//             {user?.role == 'admin' && adminMenuItems.map((item) => {
//               const IconComponent = item.icon;
//               return (
//                 <li key={item.id}>
//                   <Link to={item.link}
//                     onClick={() => setActiveTab(item.id)}
//                     className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 border ${activeTab === item.id
//                       ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 shadow-sm'
//                       : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 border-transparent'
//                       }`}
//                   >
//                     <IconComponent className="w-5 h-5 flex-shrink-0" />
//                     {sidebarOpen && <span className="text-sm font-medium truncate flex gap-2 items-center">{item.label}{item?.icon2 ? <item.icon2 size={15} className='text-amber-400' /> : ''}</span>}
//                   </Link>
//                 </li>
//               );
//             })}
//             {user?.role == 'user' && menuItems.map((item) => {
//               const IconComponent = item.icon;
//               return (
//                 <li key={item.id}>
//                   <Link to={item.link}
//                     onClick={() => setActiveTab(item.id)}
//                     className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 border ${activeTab === item.id
//                       ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 shadow-sm'
//                       : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 border-transparent'
//                       }`}
//                   >
//                     <IconComponent className="w-5 h-5 flex-shrink-0" />
//                     {sidebarOpen && <span className="text-sm font-medium truncate">{item.label}</span>}
//                   </Link>
//                 </li>
//               );
//             })}
//           </ul>
//         </nav>

//         {/* User Profile */}
//         <div className={`p-4 border-t absolute bottom-0 bg-white border-gray-200 ${sidebarOpen ? 'block' : 'hidden'}`}>
//           <DropdownMenu open={open} onOpenChange={setOpen}>
//             <DropdownMenuTrigger asChild>
//               <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors duration-200 w-full">
//                 <Avatar className="cursor-pointer">
//                   <AvatarFallback className='bg-gray-900 text-sm text-white'>{getInitials(user.name)}</AvatarFallback>
//                 </Avatar>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-semibold text-gray-800 truncate">Dr. {user?.name}</p>
//                   <p className="text-xs text-gray-500 truncate">{user?.role === 'user' ? 'Laboratory User' : 'Lab Administrator'}</p>
//                 </div>
//                 <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
//               </div>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent className="cursor-pointer w-56 bg-gray-50 border border-gray-300 shadow-lg">
//               <DropdownMenuLabel className='flex gap-2'>
//                 <User size={16} /> Logged in as <span className="font-semibold">{user.name}</span>
//               </DropdownMenuLabel>
//               <Separator />
//               <DropdownMenuSeparator />
              
//               <DropdownMenuItem className=' cursor-pointer text-red-500 hover:bg-red-500 hover:text-white' onClick={handleLogout}>
//                 <LogOut /> Logout
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Top Bar */}
//         <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <button
//                 onClick={() => setSidebarOpen(!sidebarOpen)}
//                 className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
//               >
//                 {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//               </button>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-800 capitalize">{activeTab}</h1>
//                 <p className="text-sm text-gray-500">Welcome back, Dr. {user?.name}</p>
//               </div>
//             </div>

//             <div className="flex items-center space-x-4">
//               {/* Quick Actions Dropdown */}


//               {/* Export Button */}
//               {user?.role == 'admin' && <Link to='/user/patients' className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200">
//                 <Download className="w-4 h-4 text-gray-600" />
//                 <span className="text-sm font-medium text-gray-700 flex gap-2 items-center">Export <Crown className='text-amber-400' size={16} /></span>
//               </Link>}

//               {/* Add New Button */}
//               {user?.role == 'admin' ?
//                 <Link to='/admin/create-test' className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 shadow-sm">
//                   <Plus className="w-4 h-4" />
//                   <span className="text-sm font-medium flex gap-2 items-center">Create New Test <Crown className='text-white' size={16} /></span>
//                 </Link>
//                 :
//                 <Link onClick={() => setActiveTab('Register Patient')}
//                   to='/user/register-patient' className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 shadow-sm">
//                   <UserPlus className="w-4 h-4" />
//                   <span className="text-sm font-medium"> New Patient</span>
//                 </Link>
//               }


//               <div className='flex text-gray-600 gap-2'>
//                 <div className='rounded-xl py-2 px-2 text-sm'>{user?.role == 'user' ? <span className='flex gap-2 '><User size={17} /> Lab User</span> : <span className='flex gap-2'><Crown className='text-amber-400' size={17} /> Admin</span>}</div>
//                 <UserAvatar />
//               </div>
//             </div>
//           </div>
//         </header>

//         <div className=' overflow-auto'>
//           <Outlet />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserDashboardLayout;
















import React, { useContext, useState, useEffect } from 'react';
import {
  FlaskConical,
  ListChecks,
  Link2,
  Building2,
  UserCog,
  FileChartColumn,
  LineChart
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
  ChartBarIncreasing
} from 'lucide-react';
import lablogo from '../assets/lablogo.png'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { UserAvatar } from './UserAvatar';
import { AuthContext } from '@/context/AuthProvider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Separator } from './ui/separator';

const UserDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterStatus, setFilterStatus] = useState('all');
  const { user, handleLogout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const location = useLocation(); // Get current route

  const adminMenuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', link: '/admin/dashboard' },
    // admin options
    { id: 'create test', icon: FlaskConical, label: 'Create New Test', link: '/admin/create-test', icon2: Crown },
    { id: 'all tests', icon: ListChecks, label: 'Manage Tests', link: '/admin/all-tests', icon2: Crown },
    { id: 'create user', icon: UserPlus, label: 'Create New User', link: '/admin/create-user', icon2: Crown },
    { id: 'all users', icon: Users, label: 'Manage Users', link: '/admin/all-users', icon2: Crown },
    { id: 'references', icon: Link2, label: 'Add Reference', link: '/admin/add-reference', icon2: Crown },
    { id: 'edit lab info', icon: Building2, label: 'Edit Lab Info', link: '/admin/edit-labinfo', icon2: Crown },
    { id: 'finance analytics', icon: BarChart2, label: 'Finance Analytics', link: '/admin/finance-analytics', icon2: Crown },
    { id: 'user analytics', icon: UserCog, label: 'User Analytics', link: '/admin/user-analytics', icon2: Crown },
    { id: 'test analytics', icon: FileChartColumn, label: 'Test Analytics', link: '/admin/test-analytics', icon2: Crown },

    // + normal user options
    { id: 'register patients', icon: Plus, label: 'Register Patients', link: '/user/register-patient' },
    { id: 'all patients', icon: Users, label: 'Manage Patients', link: '/user/all-patients' },
    { id: 'payments', icon: DollarSign, label: 'Payments', link: '/user/payments' },
    { id: 'results', icon: Microscope, label: 'Manage Results', link: '/user/results' },
    { id: 'reg reports', icon: FileText, label: 'Reg. Reports', link: '/user/patients' },
    { id: 'final reports', icon: LineChart , label: 'Final Reports', link: '/user/result-print' },
    { id: 'analytics', icon: BarChart3, label: 'Patient Analytics', link: '/user/patient-analytics' },
  ];

  const menuItems = [
    //normal user options
    { id: 'dashboard', icon: Home, label: 'Dashboard', link: '/user/dashboard' },
    { id: 'register patients', icon: Plus, label: 'Register Patients', link: '/user/register-patient' },
    { id: 'all patients', icon: Users, label: 'Manage Patients', link: '/user/all-patients' },
    { id: 'payments', icon: DollarSign, label: 'Payments', link: '/user/payments' },
    { id: 'results', icon: Microscope, label: 'Manage Results', link: '/user/results' },
    { id: 'reg reports', icon: FileText, label: 'Reg. Reports', link: '/user/patients' },
    { id: 'final reports', icon: LineChart , label: 'Final Reports', link: '/user/result-print' },
    { id: 'analytics', icon: BarChart3, label: 'Patient Analytics', link: '/user/patient-analytics' },
  ];

  // Function to determine active tab based on current route
  const getActiveTabFromRoute = (pathname) => {
    const allMenuItems = user?.role === 'admin' ? adminMenuItems : menuItems;
    const currentItem = allMenuItems.find(item => item.link === pathname);
    return currentItem ? currentItem.id : 'dashboard';
  };

  // Update active tab when route changes (including on refresh)
  useEffect(() => {
    const currentActiveTab = getActiveTabFromRoute(location.pathname);
    setActiveTab(currentActiveTab);
  }, [location.pathname, user?.role]);

  const getInitials = (fullName) => {
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Get page title based on active tab
  const getPageTitle = () => {
    const allMenuItems = user?.role === 'admin' ? adminMenuItems : menuItems;
    const currentItem = allMenuItems.find(item => item.id === activeTab);
    return currentItem ? currentItem.label : 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-23'} bg-white shadow-lg transition-all duration-300 overflow-auto ease-in-out flex flex-col`}>
        {/* Logo/Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-center">
            <Link onClick={() => setActiveTab('dashboard')} to={user?.role == 'admin' ? '/admin/dashboard' : '/user/dashboard'} className="flex items-center space-x-2">
              <div>
                <img src={lablogo} alt="" className='w-14' />
              </div>
              {sidebarOpen && (
                <span className="cursor-pointer text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                  LabSync Pro
                  <span className='block text-xs px-1 text-gray-400 font-extralight' >v_1.0</span>
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 mb-18">
          <ul className="space-y-2">
            {user?.role == 'admin' && adminMenuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <Link to={item.link}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 border ${isActive
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 border-transparent'
                      }`}
                  >
                    <IconComponent className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="text-sm font-medium truncate flex gap-2 items-center">{item.label}{item?.icon2 ? <item.icon2 size={15} className='text-amber-400' /> : ''}</span>}
                  </Link>
                </li>
              );
            })}
            {user?.role == 'user' && menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <Link to={item.link}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 border ${isActive
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 border-transparent'
                      }`}
                  >
                    <IconComponent className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="text-sm font-medium truncate">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className={`p-4 border-t absolute bottom-0 bg-white border-gray-200 ${sidebarOpen ? 'block' : 'hidden'}`}>
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors duration-200 w-full">
                <Avatar className="cursor-pointer">
                  <AvatarFallback className='bg-gray-900 text-sm text-white'>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">Dr. {user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.role === 'user' ? 'Laboratory User' : 'Lab Administrator'}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="cursor-pointer w-56 bg-gray-50 border border-gray-300 shadow-lg">
              <DropdownMenuLabel className='flex gap-2'>
                <User size={16} /> Logged in as <span className="font-semibold">{user.name}</span>
              </DropdownMenuLabel>
              <Separator />
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className=' cursor-pointer text-red-500 hover:bg-red-500 hover:text-white' onClick={handleLogout}>
                <LogOut /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
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
              {user?.role == 'admin' && <Link to='/user/patients' className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200">
                <Download className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700 flex gap-2 items-center">Export <Crown className='text-amber-400' size={16} /></span>
              </Link>}

              {/* Add New Button */}
              {user?.role == 'admin' ?
                <Link to='/admin/create-test' className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 shadow-sm">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium flex gap-2 items-center">Create New Test <Crown className='text-white' size={16} /></span>
                </Link>
                :
                <Link to='/user/register-patient' className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 shadow-sm">
                  <UserPlus className="w-4 h-4" />
                  <span className="text-sm font-medium"> New Patient</span>
                </Link>
              }

              <div className='flex text-gray-600 gap-2'>
                <div className='rounded-xl py-2 px-2 text-sm'>{user?.role == 'user' ? <span className='flex gap-2 '><User size={17} /> Lab User</span> : <span className='flex gap-2'><Crown className='text-amber-400' size={17} /> Admin</span>}</div>
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