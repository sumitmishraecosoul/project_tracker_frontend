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
 * OPEN PERMISSION: Everyone in the brand can create subtasks
 */
export const canCreateSubtask = (user: User | null, userBrand: UserBrand | null): boolean => {
  // If user is part of the brand (has any brand role), they can create subtasks
  if (userBrand) {
    return true;
  }
  
  // Global admin can always create
  if (user?.role === 'admin') {
    return true;
  }
  
  return false;
};

/**
 * Check if user can edit tasks
 * OPEN PERMISSION: Everyone in the brand can edit tasks
 */
export const canEditTask = (user: User | null, userBrand: UserBrand | null): boolean => {
  // If user is part of the brand (has any brand role), they can edit tasks
  if (userBrand) {
    return true;
  }
  
  // Global admin can always edit
  if (user?.role === 'admin') {
    return true;
  }
  
  return false;
};

/**
 * Check if user can create tasks
 * OPEN PERMISSION: Everyone in the brand can create tasks
 */
export const canCreateTask = (user: User | null, userBrand: UserBrand | null): boolean => {
  // If user is part of the brand (has any brand role), they can create tasks
  if (userBrand) {
    return true;
  }
  
  // Global admin can always create
  if (user?.role === 'admin') {
    return true;
  }
  
  return false;
};

/**
 * Check if user can update task status
 * OPEN PERMISSION: Everyone in the brand can update task status
 */
export const canUpdateTaskStatus = (user: User | null, userBrand: UserBrand | null): boolean => {
  // If user is part of the brand (has any brand role), they can update status
  if (userBrand) {
    return true;
  }
  
  // Global admin can always update
  if (user?.role === 'admin') {
    return true;
  }
  
  return false;
};

/**
 * Check if user can update task priority
 * OPEN PERMISSION: Everyone in the brand can update task priority
 */
export const canUpdateTaskPriority = (user: User | null, userBrand: UserBrand | null): boolean => {
  // If user is part of the brand (has any brand role), they can update priority
  if (userBrand) {
    return true;
  }
  
  // Global admin can always update
  if (user?.role === 'admin') {
    return true;
  }
  
  return false;
};

/**
 * Check if user can assign tasks
 * OPEN PERMISSION: Everyone in the brand can assign tasks
 */
export const canAssignTask = (user: User | null, userBrand: UserBrand | null): boolean => {
  // If user is part of the brand (has any brand role), they can assign tasks
  if (userBrand) {
    return true;
  }
  
  // Global admin can always assign
  if (user?.role === 'admin') {
    return true;
  }
  
  return false;
};

/**
 * Check if user can update subtasks
 * OPEN PERMISSION: Everyone in the brand can update subtasks
 */
export const canUpdateSubtask = (user: User | null, userBrand: UserBrand | null): boolean => {
  // If user is part of the brand (has any brand role), they can update subtasks
  if (userBrand) {
    return true;
  }
  
  // Global admin can always update
  if (user?.role === 'admin') {
    return true;
  }
  
  return false;
};

/**
 * Check if user can manage task dependencies
 * OPEN PERMISSION: Everyone in the brand can manage dependencies
 */
export const canManageDependencies = (user: User | null, userBrand: UserBrand | null): boolean => {
  // If user is part of the brand (has any brand role), they can manage dependencies
  if (userBrand) {
    return true;
  }
  
  // Global admin can always manage
  if (user?.role === 'admin') {
    return true;
  }
  
  return false;
};

/**
 * Check if user can manage task links
 * OPEN PERMISSION: Everyone in the brand can manage task links
 */
export const canManageTaskLinks = (user: User | null, userBrand: UserBrand | null): boolean => {
  // If user is part of the brand (has any brand role), they can manage links
  if (userBrand) {
    return true;
  }
  
  // Global admin can always manage
  if (user?.role === 'admin') {
    return true;
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
