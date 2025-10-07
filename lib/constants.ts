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
  'Digital Marketing',
  'Thrive'
] as const;

// Default department as per backend
export const DEFAULT_DEPARTMENT = 'India E-commerce';

// Role system - Updated for Category & Role System
export const ROLES = ['admin', 'brand_admin', 'user'] as const;

// Default role as per backend
export const DEFAULT_ROLE = 'user';

// User-friendly role labels
export const ROLE_LABELS = {
  admin: 'System Administrator',
  brand_admin: 'Brand Administrator', 
  user: 'User'
} as const;

// Role descriptions for signup form
export const ROLE_DESCRIPTIONS = {
  admin: 'Full system access - can see all brands and manage everything',
  brand_admin: 'Can create and manage brands, invite users to brands',
  user: 'Can only access brands you are invited to'
} as const;
