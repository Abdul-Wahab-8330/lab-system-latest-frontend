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