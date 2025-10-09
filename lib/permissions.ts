/**
 * Frontend Permission Helper Functions
 * Implements the same 3-tier permission system as the backend
 */

// Import User type from AuthContext to avoid type conflicts
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  employeeNumber?: string;
}

export interface UserBrand {
  role: 'owner' | 'manager' | 'member' | 'client' | 'guest';
  permissions?: any;
}

/**
 * Check if user can delete tasks
 * Implements the same logic as backend task deletion permissions
 */
export const canDeleteTask = (user: User | null, userBrand: UserBrand | null): boolean => {
  // Rule 1: Global admin - always can delete
  if (user?.role === 'admin') {
    return true;
  }
  
  // Rule 2: Brand admin with owner/manager brand role
  if (user?.role === 'brand_admin') {
    if (!userBrand) return false;
    return ['owner', 'manager'].includes(userBrand.role);
  }
  
  // Rule 3: Regular user - never can delete
  return false;
};

/**
 * Check if user can create subtasks
 * Similar permission logic for subtask creation
 */
export const canCreateSubtask = (user: User | null, userBrand: UserBrand | null): boolean => {
  // Rule 1: Global admin - always can create
  if (user?.role === 'admin') {
    return true;
  }
  
  // Rule 2: Brand admin with owner/manager brand role
  if (user?.role === 'brand_admin') {
    if (!userBrand) return false;
    return ['owner', 'manager'].includes(userBrand.role);
  }
  
  // Rule 3: Regular user - can create subtasks in brands where they're members
  if (user?.role === 'user') {
    return userBrand?.role === 'member' || userBrand?.role === 'manager' || userBrand?.role === 'owner';
  }
  
  return false;
};

/**
 * Check if user can edit tasks
 * Similar permission logic for task editing
 */
export const canEditTask = (user: User | null, userBrand: UserBrand | null): boolean => {
  // Rule 1: Global admin - always can edit
  if (user?.role === 'admin') {
    return true;
  }
  
  // Rule 2: Brand admin with owner/manager brand role
  if (user?.role === 'brand_admin') {
    if (!userBrand) return false;
    return ['owner', 'manager'].includes(userBrand.role);
  }
  
  // Rule 3: Regular user - can edit tasks in brands where they're members
  if (user?.role === 'user') {
    return userBrand?.role === 'member' || userBrand?.role === 'manager' || userBrand?.role === 'owner';
  }
  
  return false;
};

/**
 * Get user's permission level for display purposes
 */
export const getUserPermissionLevel = (user: User | null, userBrand: UserBrand | null): string => {
  if (user?.role === 'admin') {
    return 'Global Admin';
  }
  
  if (user?.role === 'brand_admin') {
    if (userBrand?.role === 'owner') {
      return 'Brand Owner';
    }
    if (userBrand?.role === 'manager') {
      return 'Brand Manager';
    }
    return 'Brand Admin (Limited)';
  }
  
  if (user?.role === 'user') {
    if (userBrand?.role === 'owner') {
      return 'Brand Owner';
    }
    if (userBrand?.role === 'manager') {
      return 'Brand Manager';
    }
    if (userBrand?.role === 'member') {
      return 'Brand Member';
    }
    return 'Brand Member (Limited)';
  }
  
  return 'No Access';
};
