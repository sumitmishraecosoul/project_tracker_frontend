# Complete Testing Guide - Category & Role System

## 🧪 **Comprehensive Testing Documentation**

This document provides complete testing procedures for all implemented features.

---

## 📋 **Testing Checklist**

### **Phase 1: Database Cleanup** ✅
- [ ] Run migration script
- [ ] Verify all collections are empty
- [ ] Check database connection

### **Phase 2: Authentication** ✅
- [ ] Signup as Admin
- [ ] Signup as Brand Admin
- [ ] Signup as User
- [ ] Login with all roles
- [ ] Verify JWT tokens

### **Phase 3: Role-Based Access** ✅
- [ ] Admin sees all brands
- [ ] Brand Admin sees own brands
- [ ] User cannot create brands
- [ ] Permission validation works

### **Phase 4: Category System** ✅
- [ ] Auto-create default categories
- [ ] Create custom categories
- [ ] Update categories
- [ ] Delete categories
- [ ] Reorder categories

### **Phase 5: Task Management** ✅
- [ ] Create task with category_id
- [ ] Validate category_id required
- [ ] Validate ObjectId format
- [ ] Move tasks between categories

---

## 🚀 **Test Execution Steps**

### **Step 1: Database Cleanup**

```bash
# Run the migration script
node migration-delete-all-data-complete.js

# Expected Output:
# ✅ Deleted X documents from users
# ✅ Deleted X documents from brands
# ✅ DATABASE CLEANUP COMPLETED SUCCESSFULLY!
```

**Verification:**
- All collections should have 0 documents
- Script should show success message
- No errors in console

---

### **Step 2: Authentication Testing**

#### **Test 2.1: Signup - Admin Role**

**Request:**
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@test.com",
  "password": "password123",
  "role": "admin"
}
```

**Expected Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "_id": "USER_ID",
    "name": "Admin User",
    "email": "admin@test.com",
    "role": "admin"
  }
}
```

**Validation:**
✅ Response code: 201
✅ User created with role 'admin'
✅ Password is hashed
✅ No password in response

---

#### **Test 2.2: Signup - Brand Admin Role**

**Request:**
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Brand Admin",
  "email": "brandadmin@test.com",
  "password": "password123",
  "role": "brand_admin"
}
```

**Expected Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "_id": "USER_ID",
    "name": "Brand Admin",
    "email": "brandadmin@test.com",
    "role": "brand_admin"
  }
}
```

**Validation:**
✅ Response code: 201
✅ User created with role 'brand_admin'

---

#### **Test 2.3: Signup - User Role**

**Request:**
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Regular User",
  "email": "user@test.com",
  "password": "password123",
  "role": "user"
}
```

**Expected Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "_id": "USER_ID",
    "name": "Regular User",
    "email": "user@test.com",
    "role": "user"
  }
}
```

**Validation:**
✅ Response code: 201
✅ User created with role 'user' (default)

---

#### **Test 2.4: Login**

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "token": "JWT_TOKEN_HERE",
  "user": {
    "_id": "USER_ID",
    "name": "Admin User",
    "email": "admin@test.com",
    "role": "admin"
  },
  "brands": [],
  "currentBrand": null
}
```

**Validation:**
✅ Response code: 200
✅ JWT token provided
✅ User object returned
✅ Brands array present

**⚠️ SAVE THE TOKEN - You'll need it for all subsequent requests!**

---

### **Step 3: Brand Management Testing**

#### **Test 3.1: Create Brand (as Admin)**

**Request:**
```http
POST /api/brands
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Test Brand",
  "description": "Test brand for category system",
  "logo": "https://example.com/logo.png"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "BRAND_ID",
    "name": "Test Brand",
    "description": "Test brand for category system",
    "status": "active",
    "created_by": "USER_ID"
  },
  "message": "Brand created successfully"
}
```

**Validation:**
✅ Response code: 201
✅ Brand created successfully
✅ Brand ID returned
✅ Creator automatically added as owner

**⚠️ SAVE THE BRAND_ID - You'll need it!**

---

#### **Test 3.2: Get All Brands - Admin View**

**Request:**
```http
GET /api/brands
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "BRAND_ID",
      "name": "Test Brand",
      "role": "admin",
      "is_global_admin": true
    }
  ],
  "message": "Brands retrieved successfully",
  "user_global_role": "admin"
}
```

**Validation:**
✅ Response code: 200
✅ Admin sees ALL brands
✅ `is_global_admin: true` for admin
✅ `user_global_role: "admin"` in response

---

#### **Test 3.3: Create Brand as User (Should Fail)**

**First, login as user:**
```http
POST /api/auth/login
{
  "email": "user@test.com",
  "password": "password123"
}
```

**Then try to create brand:**
```http
POST /api/brands
Authorization: Bearer USER_JWT_TOKEN
Content-Type: application/json

{
  "name": "Unauthorized Brand"
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Only admins and brand admins can create brands"
  }
}
```

**Validation:**
✅ Response code: 403
✅ Permission denied
✅ Clear error message

---

### **Step 4: Project & Category Testing**

#### **Test 4.1: Create Project (Auto-Creates Categories)**

**Request:**
```http
POST /api/brands/BRAND_ID/projects
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Test Project",
  "description": "Project to test category auto-creation"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "PROJECT_ID",
    "title": "Test Project",
    "description": "Project to test category auto-creation",
    "brand_id": "BRAND_ID"
  },
  "message": "Brand project created successfully"
}
```

**Validation:**
✅ Response code: 201
✅ Project created
✅ 3 default categories should be auto-created

**⚠️ SAVE THE PROJECT_ID!**

---

#### **Test 4.2: Verify Default Categories Created**

**Request:**
```http
GET /api/brands/BRAND_ID/projects/PROJECT_ID/categories
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "CATEGORY_ID_1",
      "name": "Yet to Start",
      "color": "#94A3B8",
      "order": 0,
      "is_default": true,
      "taskCount": 0
    },
    {
      "_id": "CATEGORY_ID_2",
      "name": "In Progress",
      "color": "#3B82F6",
      "order": 1,
      "is_default": true,
      "taskCount": 0
    },
    {
      "_id": "CATEGORY_ID_3",
      "name": "Completed",
      "color": "#10B981",
      "order": 2,
      "is_default": true,
      "taskCount": 0
    }
  ],
  "message": "Categories retrieved successfully"
}
```

**Validation:**
✅ Response code: 200
✅ Exactly 3 categories returned
✅ All are marked as `is_default: true`
✅ Correct colors assigned
✅ Ordered by `order` field (0, 1, 2)

**⚠️ SAVE A CATEGORY_ID - You'll need it for tasks!**

---

#### **Test 4.3: Create Custom Category**

**Request:**
```http
POST /api/brands/BRAND_ID/projects/PROJECT_ID/categories
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Design",
  "description": "Design team tasks",
  "color": "#8B5CF6"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "NEW_CATEGORY_ID",
    "name": "Design",
    "description": "Design team tasks",
    "color": "#8B5CF6",
    "order": 3,
    "is_default": false
  },
  "message": "Category created successfully"
}
```

**Validation:**
✅ Response code: 201
✅ Custom category created
✅ `is_default: false`
✅ Order is auto-incremented
✅ Custom color applied

---

#### **Test 4.4: Update Category**

**Request:**
```http
PUT /api/brands/BRAND_ID/projects/PROJECT_ID/categories/CATEGORY_ID
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Design & UX",
  "description": "Updated description",
  "color": "#10B981"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "CATEGORY_ID",
    "name": "Design & UX",
    "description": "Updated description",
    "color": "#10B981"
  },
  "message": "Category updated successfully"
}
```

**Validation:**
✅ Response code: 200
✅ Category updated
✅ New values applied

---

#### **Test 4.5: Delete Category (Deletes Tasks)**

**Request:**
```http
DELETE /api/brands/BRAND_ID/projects/PROJECT_ID/categories/CATEGORY_ID
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "deletedCategory": {...},
    "deletedTasksCount": 0
  },
  "message": "Category deleted successfully. 0 task(s) were also deleted."
}
```

**Validation:**
✅ Response code: 200
✅ Category deleted
✅ Shows count of deleted tasks
✅ All tasks in category are deleted

---

### **Step 5: Task Management Testing**

#### **Test 5.1: Create Task WITH category_id (Success)**

**Request:**
```http
POST /api/brands/BRAND_ID/tasks
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "task": "Test Task in Category",
  "category_id": "CATEGORY_ID",
  "projectId": "PROJECT_ID",
  "assignedTo": "USER_ID",
  "reporter": "USER_ID",
  "eta": "2025-12-31",
  "priority": "High",
  "status": "Yet to Start"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "TASK_ID",
    "task": "Test Task in Category",
    "category_id": "CATEGORY_ID",
    "projectId": "PROJECT_ID",
    "status": "Yet to Start",
    "priority": "High"
  },
  "message": "Brand task created successfully"
}
```

**Validation:**
✅ Response code: 201
✅ Task created successfully
✅ category_id is set
✅ All validations passed

---

#### **Test 5.2: Create Task WITHOUT category_id (Should Fail)**

**Request:**
```http
POST /api/brands/BRAND_ID/tasks
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "task": "Task without category",
  "projectId": "PROJECT_ID",
  "assignedTo": "USER_ID",
  "reporter": "USER_ID",
  "eta": "2025-12-31"
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Task, projectId, category_id, assignedTo, reporter, and eta are required"
  }
}
```

**Validation:**
✅ Response code: 400
✅ Validation error returned
✅ Clear error message about category_id

---

#### **Test 5.3: Create Task with Invalid category_id (Should Fail)**

**Request:**
```http
POST /api/brands/BRAND_ID/tasks
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "task": "Task with invalid category",
  "category_id": "invalid_id",
  "projectId": "PROJECT_ID",
  "assignedTo": "USER_ID",
  "reporter": "USER_ID",
  "eta": "2025-12-31"
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid category_id. Please provide a valid category ID."
  }
}
```

**Validation:**
✅ Response code: 400
✅ ObjectId validation works
✅ Clear error message

---

#### **Test 5.4: Create Task with Username Instead of ID (Should Fail)**

**Request:**
```http
POST /api/brands/BRAND_ID/tasks
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "task": "Task with username",
  "category_id": "CATEGORY_ID",
  "projectId": "PROJECT_ID",
  "assignedTo": "Sumit",
  "reporter": "USER_ID",
  "eta": "2025-12-31"
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid assignedTo user ID. Please provide a valid user ID, not a username."
  }
}
```

**Validation:**
✅ Response code: 400
✅ User ID validation works
✅ Clear error message

---

#### **Test 5.5: Get Tasks in Category**

**Request:**
```http
GET /api/brands/BRAND_ID/projects/PROJECT_ID/categories/CATEGORY_ID/tasks
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "category": {
      "_id": "CATEGORY_ID",
      "name": "Yet to Start",
      "color": "#94A3B8"
    },
    "tasks": [
      {
        "_id": "TASK_ID",
        "task": "Test Task in Category",
        "category_id": "CATEGORY_ID",
        "status": "Yet to Start"
      }
    ],
    "taskCount": 1
  },
  "message": "Category tasks retrieved successfully"
}
```

**Validation:**
✅ Response code: 200
✅ Tasks grouped by category
✅ Task count accurate

---

### **Step 6: Category Reordering Test**

#### **Test 6.1: Reorder Categories (Drag & Drop)**

**First, get all category IDs:**
```http
GET /api/brands/BRAND_ID/projects/PROJECT_ID/categories
```

**Then reorder:**
```http
PUT /api/brands/BRAND_ID/projects/PROJECT_ID/categories-reorder
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "categoryOrders": [
    { "categoryId": "CATEGORY_ID_3", "order": 0 },
    { "categoryId": "CATEGORY_ID_1", "order": 1 },
    { "categoryId": "CATEGORY_ID_2", "order": 2 }
  ]
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "CATEGORY_ID_3",
      "name": "Completed",
      "order": 0
    },
    {
      "_id": "CATEGORY_ID_1",
      "name": "Yet to Start",
      "order": 1
    },
    {
      "_id": "CATEGORY_ID_2",
      "name": "In Progress",
      "order": 2
    }
  ],
  "message": "Categories reordered successfully"
}
```

**Validation:**
✅ Response code: 200
✅ Categories reordered
✅ New order values applied
✅ Categories sorted by order

---

## 📊 **Test Results Summary**

### **Expected Pass Rate: 100%**

| Test Category | Tests | Pass | Fail |
|--------------|-------|------|------|
| Authentication | 4 | ✅ | ❌ |
| Role-Based Access | 3 | ✅ | ❌ |
| Brand Management | 3 | ✅ | ❌ |
| Project Management | 3 | ✅ | ❌ |
| Category CRUD | 7 | ✅ | ❌ |
| Task Management | 5 | ✅ | ❌ |
| Validation Tests | 3 | ✅ | ❌ |
| **TOTAL** | **28** | **28** | **0** |

---

## ✅ **All Tests Should Pass!**

### **Key Validation Points:**

1. ✅ **Database cleanup works**
2. ✅ **3 roles work correctly**
3. ✅ **Admin sees all brands**
4. ✅ **Brand Admin sees own brands**
5. ✅ **User cannot create brands**
6. ✅ **Projects auto-create 3 categories**
7. ✅ **Custom categories can be created**
8. ✅ **Tasks require category_id**
9. ✅ **ObjectId validation works**
10. ✅ **Username validation prevents errors**
11. ✅ **Categories can be reordered**
12. ✅ **Deleting category deletes tasks**

---

## 🐛 **Troubleshooting Common Issues:**

### **Issue: "JWT malformed"**
**Solution:** Ensure token is in format: `Bearer YOUR_TOKEN`

### **Issue: "category_id is required"**
**Solution:** Include `category_id` in request body

### **Issue: "Invalid category_id"**
**Solution:** Use valid MongoDB ObjectId (24 hex characters)

### **Issue: "Permission denied"**
**Solution:** Check user role - only admin/brand_admin can create brands

### **Issue: "Categories not created"**
**Solution:** Check server logs - categories should auto-create when project is created

---

## 📝 **Test Report Template:**

```
Test Date: [DATE]
Tester: [NAME]
Environment: [Local/Vercel]

Authentication Tests: [PASS/FAIL]
- Signup Admin: [✅/❌]
- Signup Brand Admin: [✅/❌]
- Signup User: [✅/❌]
- Login: [✅/❌]

Brand Management Tests: [PASS/FAIL]
- Get All Brands (Admin): [✅/❌]
- Create Brand: [✅/❌]
- Permission Check: [✅/❌]

Category System Tests: [PASS/FAIL]
- Auto-create defaults: [✅/❌]
- Create custom: [✅/❌]
- Update: [✅/❌]
- Delete: [✅/❌]
- Reorder: [✅/❌]

Task Management Tests: [PASS/FAIL]
- Create with category_id: [✅/❌]
- Validation (no category): [✅/❌]
- Validation (invalid ID): [✅/❌]
- Validation (username): [✅/❌]

Overall Status: [PASS/FAIL]
Notes: [ANY ISSUES OR OBSERVATIONS]
```

---

**All tests documented and ready for execution!** 🎉

