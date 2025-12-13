// ============================================
// ROLE DEFINITIONS
// ============================================
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  RECEPTIONIST: 'receptionist',
  LAB_TECH: 'lab_technologist'
};

// ============================================
// HELPER FUNCTION: Get User-Friendly Role Name
// ============================================
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.USER]: 'Lab User',
    [ROLES.RECEPTIONIST]: 'Receptionist',
    [ROLES.LAB_TECH]: 'Lab Technologist'
  };
  return roleNames[role] || 'User';
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
  PoundSterling, Users, UserPlus, BarChart2, Crown
} from 'lucide-react';

// ADMIN: Gets everything
const adminMenuItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard', link: '/admin/dashboard' },
  // Admin-only features
  { id: 'create test', icon: FlaskConical, label: 'Create New Test', link: '/admin/create-test', icon2: Crown },
  { id: 'all tests', icon: ListChecks, label: 'Manage Tests', link: '/admin/all-tests', icon2: Crown },
  { id: 'create user', icon: UserPlus, label: 'Create New User', link: '/admin/create-user', icon2: Crown },
  { id: 'all users', icon: Users, label: 'Manage Users', link: '/admin/all-users', icon2: Crown },
  { id: 'references', icon: Link2, label: 'Add Reference', link: '/admin/add-reference', icon2: Crown },
  { id: 'edit lab info', icon: Building2, label: 'Edit Lab Info', link: '/admin/edit-labinfo', icon2: Crown },
  { id: 'finance analytics', icon: BarChart2, label: 'Finance Analytics', link: '/admin/finance-analytics', icon2: Crown },
  { id: 'user analytics', icon: UserCog, label: 'User Analytics', link: '/admin/user-analytics', icon2: Crown },
  { id: 'test analytics', icon: FileChartColumn, label: 'Test Analytics', link: '/admin/test-analytics', icon2: Crown },
  { id: 'analytics', icon: BarChart3, label: 'Patient Analytics', link: '/admin/patient-analytics', icon2: Crown },
  { id: 'inventory', icon: LucideBoxes, label: 'Inventory Mngmnt', link: '/admin/inventory', icon2: Crown },
  { id: 'expenses', icon: CalculatorIcon, label: 'Expense Mngmnt', link: '/admin/expenses', icon2: Crown },
  { id: 'revenue-summary', icon: PoundSterling, label: 'Revenue Summary', link: '/admin/revenue-summary', icon2: Crown },
  // Plus all user features
  { id: 'register patients', icon: Plus, label: 'Register Patients', link: '/user/register-patient' },
  { id: 'reg reports', icon: FileText, label: 'Reg. Reports', link: '/user/patients' },
  { id: 'payments', icon: DollarSign, label: 'Payments', link: '/user/payments' },
  { id: 'results', icon: Microscope, label: 'Manage Results', link: '/user/results' },
  { id: 'final reports', icon: LineChart, label: 'Final Reports', link: '/user/result-print' },
];

// RECEPTIONIST: Front desk duties
const receptionistMenuItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard', link: '/user/dashboard' },
  { id: 'register patients', icon: Plus, label: 'Register Patients', link: '/user/register-patient' },
  { id: 'reg reports', icon: FileText, label: 'Reg. Reports', link: '/user/patients' },
  { id: 'payments', icon: DollarSign, label: 'Payments', link: '/user/payments' },
  { id: 'final reports', icon: LineChart, label: 'Final Reports', link: '/user/result-print' },
];

// LAB TECHNOLOGIST: Testing and results
const labTechMenuItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard', link: '/user/dashboard' },
  { id: 'reg reports', icon: FileText, label: 'Reg. Reports', link: '/user/patients' },
  { id: 'results', icon: Microscope, label: 'Manage Results', link: '/user/results' },
  { id: 'final reports', icon: LineChart, label: 'Final Reports', link: '/user/result-print' },
];

// USER: Full non-admin access (legacy/fallback)
const userMenuItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard', link: '/user/dashboard' },
  { id: 'register patients', icon: Plus, label: 'Register Patients', link: '/user/register-patient' },
  { id: 'reg reports', icon: FileText, label: 'Reg. Reports', link: '/user/patients' },
  { id: 'payments', icon: DollarSign, label: 'Payments', link: '/user/payments' },
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
    case ROLES.RECEPTIONIST:
      return receptionistMenuItems;
    case ROLES.LAB_TECH:
      return labTechMenuItems;
    case ROLES.USER:
    default:
      return userMenuItems; // Fallback for any unknown role
  }
};