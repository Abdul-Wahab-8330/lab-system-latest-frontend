// ============================================
// ROLE DEFINITIONS
// ============================================
export const ROLES = {
  ADMIN: 'admin',
  SENIOR_RECEPTIONIST: 'senior_receptionist',
  JUNIOR_RECEPTIONIST: 'junior_receptionist',
  SENIOR_LAB_TECH: 'senior_lab_tech',
  JUNIOR_LAB_TECH: 'junior_lab_tech'
};

// ============================================
// HELPER FUNCTION: Get User-Friendly Role Name
// ============================================
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.SENIOR_RECEPTIONIST]: 'Senior Receptionist',
    [ROLES.JUNIOR_RECEPTIONIST]: 'Junior Receptionist',
    [ROLES.SENIOR_LAB_TECH]: 'Senior Lab Technologist',
    [ROLES.JUNIOR_LAB_TECH]: 'Junior Lab Technologist'
  };
  return roleNames[role] || 'User-';
};

// ============================================
// HELPER FUNCTION: Check if user is admin
// ============================================
export const isAdmin = (role) => role === ROLES.ADMIN;

// ============================================
// MENU ITEMS FOR EACH ROLE
// ============================================

import {
  Home, Plus, FileText, DollarSign, Microscope, LineChart,
  FlaskConical, ListChecks, Link2, Building2, UserCog,
  FileChartColumn, BarChart3, LucideBoxes, CalculatorIcon,
  PoundSterling, Users, UserPlus, BarChart2, Crown,
  NotebookTabsIcon
} from 'lucide-react';



// ============================================
// ALL PERMISSIONS - SINGLE SOURCE OF TRUTH
// ============================================
// This array contains ALL available permissions in the system
// Used for: sidebar rendering, permissions management, role tooltips
// When adding new feature: Add ONE entry here with all metadata
export const ALL_PERMISSIONS = [
  // GENERAL
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: Home, 
    link: '/user/dashboard', 
    category: 'general', 
    adminOnly: false, 
    mostUsed: true 
  },
  
  // OPERATIONS (Most Used)
  { 
    id: 'register-patients', 
    label: 'Register Patients', 
    icon: Plus, 
    link: '/user/register-patient', 
    category: 'operations', 
    adminOnly: false, 
    mostUsed: true 
  },
  { 
    id: 'reg-reports', 
    label: 'Reg. Reports', 
    icon: FileText, 
    link: '/user/patients', 
    category: 'reports', 
    adminOnly: false, 
    mostUsed: true 
  },
  { 
    id: 'results', 
    label: 'Manage Results', 
    icon: Microscope, 
    link: '/user/results', 
    category: 'operations', 
    adminOnly: false, 
    mostUsed: true 
  },
  { 
    id: 'final-reports', 
    label: 'Final Reports', 
    icon: LineChart, 
    link: '/user/result-print', 
    category: 'reports', 
    adminOnly: false, 
    mostUsed: true 
  },
  
  // FINANCIAL
  { 
    id: 'payments', 
    label: 'Payments', 
    icon: DollarSign, 
    link: '/user/payments', 
    category: 'financial', 
    adminOnly: false, 
    mostUsed: false 
  },
  { 
    id: 'revenue-summary', 
    label: 'Revenue Summary', 
    icon: PoundSterling, 
    link: '/user/revenue-summary', 
    category: 'financial', 
    adminOnly: false, 
    mostUsed: false 
  },
  { 
    id: 'expenses', 
    label: 'Expense Mngmnt', 
    icon: CalculatorIcon, 
    link: '/user/expenses', 
    category: 'financial', 
    adminOnly: false, 
    mostUsed: false 
  },
  { 
    id: 'inventory', 
    label: 'Inventory Mngmnt', 
    icon: LucideBoxes, 
    link: '/user/inventory', 
    category: 'operations', 
    adminOnly: false, 
    mostUsed: false 
  },
  
  // ADMIN ONLY
  { 
    id: 'create-test', 
    label: 'Create New Test', 
    icon: FlaskConical, 
    link: '/admin/create-test', 
    category: 'admin', 
    adminOnly: true, 
    mostUsed: false,
    icon2: Crown 
  },
  { 
    id: 'all-tests', 
    label: 'Manage Tests', 
    icon: ListChecks, 
    link: '/admin/all-tests', 
    category: 'admin', 
    adminOnly: true, 
    mostUsed: false,
    icon2: Crown 
  },
  { 
    id: 'create-user', 
    label: 'Create New User', 
    icon: UserPlus, 
    link: '/admin/create-user', 
    category: 'admin', 
    adminOnly: true, 
    mostUsed: false,
    icon2: Crown 
  },
  { 
    id: 'all-users', 
    label: 'Manage Users', 
    icon: Users, 
    link: '/admin/all-users', 
    category: 'admin', 
    adminOnly: true, 
    mostUsed: false,
    icon2: Crown 
  },
  { 
    id: 'references', 
    label: 'Doctor References', 
    icon: Link2, 
    link: '/admin/add-reference', 
    category: 'admin', 
    adminOnly: true, 
    mostUsed: false,
    icon2: Crown 
  },
  { 
    id: 'referral-reports', 
    label: 'Referral Reports', 
    icon: NotebookTabsIcon, 
    link: '/admin/doctor-share', 
    category: 'admin', 
    adminOnly: true, 
    mostUsed: false,
    icon2: Crown 
  },
  { 
    id: 'edit-lab-info', 
    label: 'Edit Lab Info', 
    icon: Building2, 
    link: '/admin/edit-labinfo', 
    category: 'admin', 
    adminOnly: true, 
    mostUsed: false,
    icon2: Crown 
  },
  
  // ANALYTICS
  { 
    id: 'finance-analytics', 
    label: 'Finance Analytics', 
    icon: BarChart2, 
    link: '/admin/finance-analytics', 
    category: 'analytics', 
    adminOnly: true, 
    mostUsed: false,
    icon2: Crown 
  },
  { 
    id: 'user-analytics', 
    label: 'User Analytics', 
    icon: UserCog, 
    link: '/admin/user-analytics', 
    category: 'analytics', 
    adminOnly: true, 
    mostUsed: false,
    icon2: Crown 
  },
  { 
    id: 'test-analytics', 
    label: 'Test Analytics', 
    icon: FileChartColumn, 
    link: '/admin/test-analytics', 
    category: 'analytics', 
    adminOnly: true, 
    mostUsed: false,
    icon2: Crown 
  },
  { 
    id: 'patient-analytics', 
    label: 'Patient Analytics', 
    icon: BarChart3, 
    link: '/admin/patient-analytics', 
    category: 'analytics', 
    adminOnly: true, 
    mostUsed: false,
    icon2: Crown 
  }
];

// ============================================
// CATEGORY LABELS
// ============================================
export const CATEGORIES = {
  general: '⇒ General',
  operations: '⇒ Lab Operations',
  reports: '⇒ Reports & Records',
  financial: '⇒ Financial Management',
  admin: '⇒ Admin Tools',
  analytics: '⇒ Analytics & Insights'
};

// ============================================
// HELPER: Get Permissions for User
// ============================================
// Filters ALL_PERMISSIONS by user's permission IDs from database
export const getUserPermissions = (userPermissionIds) => {
  return ALL_PERMISSIONS.filter(p => userPermissionIds.includes(p.id));
};

// ============================================
// HELPER: Get Default Permissions for Role (for tooltips)
// ============================================
export const getDefaultPermissionsForRole = (role) => {
  const defaults = {
    'admin': ALL_PERMISSIONS.map(p => p.id), // All permissions
    'senior_receptionist': [
      'dashboard', 'revenue-summary', 'expenses', 'inventory',
      'register-patients', 'reg-reports', 'payments', 'final-reports'
    ],
    'junior_receptionist': [
      'dashboard', 'register-patients', 'reg-reports', 'results', 'final-reports'
    ],
    'senior_lab_tech': [
      'dashboard', 'reg-reports', 'results', 'final-reports'
    ],
    'junior_lab_tech': [
      'dashboard', 'reg-reports', 'results', 'final-reports'
    ]
  };
  
  return ALL_PERMISSIONS.filter(p => defaults[role]?.includes(p.id));
};



// ============================================
// ADMIN: Gets everything
// ============================================
const adminMenuItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard', link: '/admin/dashboard' },
  // Admin-only features
  { id: 'create test', icon: FlaskConical, label: 'Create New Test', link: '/admin/create-test', icon2: Crown },
  { id: 'all tests', icon: ListChecks, label: 'Manage Tests', link: '/admin/all-tests', icon2: Crown },
  { id: 'create user', icon: UserPlus, label: 'Create New User', link: '/admin/create-user', icon2: Crown },
  { id: 'all users', icon: Users, label: 'Manage Users', link: '/admin/all-users', icon2: Crown },
  { id: 'references', icon: Link2, label: 'Doctor References', link: '/admin/add-reference', icon2: Crown },
  { id: 'referral reports', icon: NotebookTabsIcon, label: 'Referral Reports', link: '/admin/doctor-share', icon2: Crown },
  { id: 'edit lab info', icon: Building2, label: 'Edit Lab Info', link: '/admin/edit-labinfo', icon2: Crown },
  { id: 'finance analytics', icon: BarChart2, label: 'Finance Analytics', link: '/admin/finance-analytics', icon2: Crown },
  { id: 'user analytics', icon: UserCog, label: 'User Analytics', link: '/admin/user-analytics', icon2: Crown },
  { id: 'test analytics', icon: FileChartColumn, label: 'Test Analytics', link: '/admin/test-analytics', icon2: Crown },
  { id: 'analytics', icon: BarChart3, label: 'Patient Analytics', link: '/admin/patient-analytics', icon2: Crown },
  // Plus all user features
  { id: 'inventory', icon: LucideBoxes, label: 'Inventory Mngmnt', link: '/user/inventory' },
  { id: 'expenses', icon: CalculatorIcon, label: 'Expense Mngmnt', link: '/user/expenses'},
  { id: 'revenue-summary', icon: PoundSterling, label: 'Revenue Summary', link: '/user/revenue-summary' },
  { id: 'register patients', icon: Plus, label: 'Register Patients', link: '/user/register-patient' },
  { id: 'reg reports', icon: FileText, label: 'Reg. Reports', link: '/user/patients' },
  { id: 'payments', icon: DollarSign, label: 'Payments', link: '/user/payments' },
  { id: 'results', icon: Microscope, label: 'Manage Results', link: '/user/results' },
  { id: 'final reports', icon: LineChart, label: 'Final Reports', link: '/user/result-print' },
];

// ============================================
// SENIOR RECEPTIONIST
// ============================================
const seniorReceptionistMenuItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard', link: '/user/dashboard' },
  { id: 'revenue-summary', icon: PoundSterling, label: 'Revenue Summary', link: '/user/revenue-summary' },
  { id: 'expenses', icon: CalculatorIcon, label: 'Expense Mngmnt', link: '/user/expenses' },
  { id: 'inventory', icon: LucideBoxes, label: 'Inventory Mngmnt', link: '/user/inventory' },
  { id: 'register patients', icon: Plus, label: 'Register Patients', link: '/user/register-patient' },
  { id: 'reg reports', icon: FileText, label: 'Reg. Reports', link: '/user/patients' },
  { id: 'payments', icon: DollarSign, label: 'Payments', link: '/user/payments' },
  { id: 'final reports', icon: LineChart, label: 'Final Reports', link: '/user/result-print' },
];

// ============================================
// JUNIOR RECEPTIONIST
// ============================================
const juniorReceptionistMenuItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard', link: '/user/dashboard' },
  { id: 'register patients', icon: Plus, label: 'Register Patients', link: '/user/register-patient' },
  { id: 'reg reports', icon: FileText, label: 'Reg. Reports', link: '/user/patients' },
  { id: 'results', icon: Microscope, label: 'Manage Results', link: '/user/results' },
  { id: 'final reports', icon: LineChart, label: 'Final Reports', link: '/user/result-print' },
];

// ============================================
// SENIOR LAB TECHNOLOGIST
// ============================================
const seniorLabTechMenuItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard', link: '/user/dashboard' },
  { id: 'reg reports', icon: FileText, label: 'Reg. Reports', link: '/user/patients' },
  { id: 'results', icon: Microscope, label: 'Manage Results', link: '/user/results' },
  { id: 'final reports', icon: LineChart, label: 'Final Reports', link: '/user/result-print' },
];

// ============================================
// JUNIOR LAB TECHNOLOGIST
// ============================================
const juniorLabTechMenuItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard', link: '/user/dashboard' },
  { id: 'reg reports', icon: FileText, label: 'Reg. Reports', link: '/user/patients' },
  { id: 'results', icon: Microscope, label: 'Manage Results', link: '/user/results' },
  { id: 'final reports', icon: LineChart, label: 'Final Reports', link: '/user/result-print' },
];

// ============================================
// MAIN FUNCTION: Get Menu Items for a Role
// ============================================
export const getMenuForRole = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return adminMenuItems;
    case ROLES.SENIOR_RECEPTIONIST:
      return seniorReceptionistMenuItems;
    case ROLES.JUNIOR_RECEPTIONIST:
      return juniorReceptionistMenuItems;
    case ROLES.SENIOR_LAB_TECH:
      return seniorLabTechMenuItems;
    case ROLES.JUNIOR_LAB_TECH:
      return juniorLabTechMenuItems;
    default:
      // Safety fallback for any unknown role
      console.warn(`Unknown role: ${role}, defaulting to Junior Receptionist menu`);
      return juniorReceptionistMenuItems;
  }
};