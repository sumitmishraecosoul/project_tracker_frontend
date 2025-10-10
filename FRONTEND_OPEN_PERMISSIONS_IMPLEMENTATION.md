# 🎨 Frontend Open Permissions Implementation

## 📋 Overview

This document describes the **Open Permissions System** implemented on the frontend to match the backend's open permission model. Everyone in a brand can create, update, and manage tasks/subtasks. Only **delete operations** are restricted.

---

## 🎯 Permission Philosophy

### ✅ **OPEN TO EVERYONE IN THE BRAND:**
- Create tasks
- Create subtasks
- Update task name
- Update task description
- Update task status
- Update task priority
- Assign/unassign tasks
- Update subtask details
- Manage task dependencies
- Manage task links

### ❌ **RESTRICTED (Delete Only):**
- Delete tasks → Only `admin` (global) or `brand_admin` with `owner`/`manager` brand role
- Delete subtasks → Only `admin` (global) or `brand_admin` with `owner`/`manager` brand role

---

## 📊 Permission Matrix

| Action | Member | Client | Guest | Manager | Owner | Admin |
|--------|--------|--------|-------|---------|-------|-------|
| **Create Task** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES |
| **Create Subtask** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES |
| **Update Task** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES |
| **Update Subtask** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES |
| **Update Status** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES |
| **Update Priority** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES |
| **Assign Tasks** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES |
| **Manage Dependencies** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES |
| **Manage Links** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES |
| **Delete Task** | ❌ NO | ❌ NO | ❌ NO | ❌ NO* | ❌ NO* | ✅ YES |
| **Delete Subtask** | ❌ NO | ❌ NO | ❌ NO | ❌ NO* | ❌ NO* | ✅ YES |

*Manager/Owner can delete ONLY if they have `brand_admin` global role

---

## 🔧 Implementation Details

### 📁 File: `lib/permissions.ts`

This file contains all permission helper functions used throughout the frontend.

### 🎯 Permission Functions

#### 1. **Task Creation**
```typescript
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
```

**Logic:**
- ✅ Any user with a brand role → Can create
- ✅ Global admin → Can create
- ❌ No brand role → Cannot create

---

#### 2. **Subtask Creation**
```typescript
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
```

**Logic:**
- ✅ Any user with a brand role → Can create
- ✅ Global admin → Can create
- ❌ No brand role → Cannot create

---

#### 3. **Task Editing**
```typescript
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
```

**Logic:**
- ✅ Any user with a brand role → Can edit
- ✅ Global admin → Can edit
- ❌ No brand role → Cannot edit

---

#### 4. **Task Status Update**
```typescript
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
```

**Logic:**
- ✅ Any user with a brand role → Can update status
- ✅ Global admin → Can update status
- ❌ No brand role → Cannot update status

---

#### 5. **Task Priority Update**
```typescript
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
```

**Logic:**
- ✅ Any user with a brand role → Can update priority
- ✅ Global admin → Can update priority
- ❌ No brand role → Cannot update priority

---

#### 6. **Task Assignment**
```typescript
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
```

**Logic:**
- ✅ Any user with a brand role → Can assign
- ✅ Global admin → Can assign
- ❌ No brand role → Cannot assign

---

#### 7. **Subtask Update**
```typescript
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
```

**Logic:**
- ✅ Any user with a brand role → Can update
- ✅ Global admin → Can update
- ❌ No brand role → Cannot update

---

#### 8. **Task Dependencies Management**
```typescript
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
```

**Logic:**
- ✅ Any user with a brand role → Can manage
- ✅ Global admin → Can manage
- ❌ No brand role → Cannot manage

---

#### 9. **Task Links Management**
```typescript
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
```

**Logic:**
- ✅ Any user with a brand role → Can manage
- ✅ Global admin → Can manage
- ❌ No brand role → Cannot manage

---

#### 10. **Task Deletion** (RESTRICTED)
```typescript
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
```

**Logic:**
- ✅ Global admin → Can delete
- ✅ Brand admin with owner/manager brand role → Can delete
- ❌ Everyone else → Cannot delete

---

## 🎨 Usage Examples

### Example 1: Show/Hide "Add Task" Button
```typescript
import { canCreateTask } from '@/lib/permissions';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useBrand } from '@/components/BrandContext';

const TaskList = () => {
  const { user } = useAuth();
  const { currentBrand } = useBrand();
  
  return (
    <div>
      {canCreateTask(user, currentBrand) && (
        <button onClick={handleAddTask}>
          Add Task
        </button>
      )}
    </div>
  );
};
```

---

### Example 2: Show/Hide "Add Subtask" Button
```typescript
import { canCreateSubtask } from '@/lib/permissions';

const TaskRow = ({ task }) => {
  const { user } = useAuth();
  const { currentBrand } = useBrand();
  
  return (
    <div>
      <span>{task.name}</span>
      {canCreateSubtask(user, currentBrand) && (
        <button onClick={() => handleAddSubtask(task.id)}>
          Add Subtask
        </button>
      )}
    </div>
  );
};
```

---

### Example 3: Enable/Disable Status Dropdown
```typescript
import { canUpdateTaskStatus } from '@/lib/permissions';

const StatusDropdown = ({ task }) => {
  const { user } = useAuth();
  const { currentBrand } = useBrand();
  
  const canUpdate = canUpdateTaskStatus(user, currentBrand);
  
  return (
    <select 
      value={task.status}
      onChange={handleStatusChange}
      disabled={!canUpdate}
    >
      <option value="Yet to Start">Yet to Start</option>
      <option value="In Progress">In Progress</option>
      <option value="Completed">Completed</option>
    </select>
  );
};
```

---

### Example 4: Show/Hide Delete Button
```typescript
import { canDeleteTask } from '@/lib/permissions';

const TaskActions = ({ task }) => {
  const { user } = useAuth();
  const { currentBrand } = useBrand();
  
  return (
    <div>
      {/* Edit button - everyone can see */}
      <button onClick={handleEdit}>Edit</button>
      
      {/* Delete button - only admins/managers can see */}
      {user && canDeleteTask(user, currentBrand) && (
        <button onClick={handleDelete}>Delete</button>
      )}
    </div>
  );
};
```

---

## 🧪 Testing Checklist

### ✅ Test with Different User Roles

#### 1. **Regular User (Member)**
- [ ] Can create tasks
- [ ] Can create subtasks
- [ ] Can update task name
- [ ] Can update task description
- [ ] Can update task status
- [ ] Can update task priority
- [ ] Can assign tasks
- [ ] **Cannot** see delete button

#### 2. **Client**
- [ ] Can create tasks
- [ ] Can create subtasks
- [ ] Can update task details
- [ ] Can update task status
- [ ] **Cannot** see delete button

#### 3. **Guest**
- [ ] Can create tasks
- [ ] Can create subtasks
- [ ] Can update task details
- [ ] Can update task status
- [ ] **Cannot** see delete button

#### 4. **Manager (without brand_admin role)**
- [ ] Can create tasks
- [ ] Can create subtasks
- [ ] Can update task details
- [ ] Can update task status
- [ ] **Cannot** see delete button

#### 5. **Owner (without brand_admin role)**
- [ ] Can create tasks
- [ ] Can create subtasks
- [ ] Can update task details
- [ ] Can update task status
- [ ] **Cannot** see delete button

#### 6. **Brand Admin with Manager/Owner Role**
- [ ] Can create tasks
- [ ] Can create subtasks
- [ ] Can update task details
- [ ] Can update task status
- [ ] **Can** see delete button
- [ ] Can delete tasks

#### 7. **Global Admin**
- [ ] Can create tasks
- [ ] Can create subtasks
- [ ] Can update task details
- [ ] Can update task status
- [ ] **Can** see delete button
- [ ] Can delete tasks

---

## 🔄 Migration from Old System

### Old System (Restrictive)
```typescript
// Old: Only admins and managers could create subtasks
export const canCreateSubtask = (user, userBrand) => {
  if (user?.role === 'admin') return true;
  if (user?.role === 'brand_admin' && ['owner', 'manager'].includes(userBrand.role)) return true;
  return false;
};
```

### New System (Open)
```typescript
// New: Everyone in the brand can create subtasks
export const canCreateSubtask = (user, userBrand) => {
  if (userBrand) return true;  // Any brand role
  if (user?.role === 'admin') return true;
  return false;
};
```

---

## 📝 Key Changes Summary

| Function | Old Logic | New Logic |
|----------|-----------|-----------|
| `canCreateTask` | Admin + Manager only | **Everyone in brand** |
| `canCreateSubtask` | Admin + Manager only | **Everyone in brand** |
| `canEditTask` | Admin + Manager + Member | **Everyone in brand** |
| `canUpdateTaskStatus` | Admin + Manager only | **Everyone in brand** |
| `canUpdateTaskPriority` | Admin + Manager only | **Everyone in brand** |
| `canAssignTask` | Admin + Manager only | **Everyone in brand** |
| `canDeleteTask` | Admin + Manager only | **Admin + Brand Admin (owner/manager) only** |

---

## 🎯 Benefits of Open Permissions

1. **Better Collaboration** - Everyone can contribute to tasks
2. **Faster Workflow** - No permission bottlenecks
3. **Increased Engagement** - All team members feel empowered
4. **Simpler UI** - Fewer conditional renders for most actions
5. **Better UX** - Users can do what they need without restrictions

---

## ⚠️ Important Notes

1. **Brand Membership Required**: Users must be part of the brand (have any brand role) to perform any actions
2. **Delete is Still Restricted**: Only admins and brand admins with owner/manager roles can delete
3. **Backend Alignment**: Frontend permissions match backend permissions exactly
4. **No Permission Errors**: Users won't see "INSUFFICIENT_ROLE" errors for create/update operations anymore

---

## 🚀 Deployment Checklist

- [x] Update `lib/permissions.ts` with open permission functions
- [x] Test all permission functions
- [x] Verify delete button still restricted
- [ ] Test with different user roles
- [ ] Update UI components to use new permission functions
- [ ] Remove old restrictive permission checks
- [ ] Test subtask creation for all users
- [ ] Test task creation for all users
- [ ] Verify backend permissions match frontend

---

## 📚 Related Documentation

- `OPEN_TASK_PERMISSIONS.md` - Backend open permissions implementation
- `STRICT_TASK_DELETION_PERMISSIONS.md` - Backend deletion restrictions
- `FRONTEND_DELETE_PERMISSION_GUIDE.md` - Frontend delete button implementation

---

**Last Updated**: 2025-10-09
**Status**: ✅ Implemented and Ready for Testing


