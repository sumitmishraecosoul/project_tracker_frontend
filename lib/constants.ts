// Canonical department list as defined in the backend
export const DEPARTMENTS = [
  'Supply Chain-Operations',
  'Human Resources and Administration',
  'New Product Design',
  'India E-commerce',
  'Supply Chain',
  'Data Analytics',
  'E-commerce',
  'Retail E-commerce',
  'Finance & Accounts',
  'Zonal Sales (India)- HORECA',
  'Zonal Sales (India)',
  'Supply Chain & Operation',
  'Zonal Sales',
  'Digital Marketing'
] as const;

// Default department as per backend
export const DEFAULT_DEPARTMENT = 'India E-commerce';

// Role system
export const ROLES = ['admin', 'manager', 'employee'] as const;

// Default role as per backend
export const DEFAULT_ROLE = 'employee';

// User-friendly role labels
export const ROLE_LABELS = {
  admin: 'Administrator',
  manager: 'Manager',
  employee: 'Employee'
} as const;
