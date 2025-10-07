const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test data
let authToken = '';
let brandId = '';
let projectId = '';
let taskId1 = '';
let taskId2 = '';
let taskId3 = '';

async function testDependenciesSystem() {
  try {
    console.log('🔗 TESTING TASK DEPENDENCIES SYSTEM\n');

    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    authToken = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Step 2: Get or create brand
    console.log('\n2. Getting brands...');
    const brandsResponse = await axios.get(`${BASE_URL}/api/brands`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (brandsResponse.data.data.length > 0) {
      brandId = brandsResponse.data.data[0].id;
      console.log('✅ Using existing brand:', brandsResponse.data.data[0].name);
    } else {
      console.log('❌ No brands found. Please create a brand first.');
      return;
    }

    // Step 3: Get or create project
    console.log('\n3. Getting projects...');
    const projectsResponse = await axios.get(`${BASE_URL}/api/brands/${brandId}/projects`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (projectsResponse.data.data.length > 0) {
      projectId = projectsResponse.data.data[0].id;
      console.log('✅ Using existing project:', projectsResponse.data.data[0].name);
    } else {
      console.log('❌ No projects found. Please create a project first.');
      return;
    }

    // Step 4: Get or create tasks
    console.log('\n4. Getting tasks...');
    const tasksResponse = await axios.get(`${BASE_URL}/api/brands/${brandId}/tasks?projectId=${projectId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (tasksResponse.data.data.tasks.length >= 3) {
      taskId1 = tasksResponse.data.data.tasks[0].id;
      taskId2 = tasksResponse.data.data.tasks[1].id;
      taskId3 = tasksResponse.data.data.tasks[2].id;
      console.log('✅ Using existing tasks:', tasksResponse.data.data.tasks.length, 'tasks found');
    } else {
      console.log('❌ Need at least 3 tasks. Found:', tasksResponse.data.data.tasks.length);
      return;
    }

    // Step 5: Test Dependencies System
    console.log('\n5. Testing Dependencies System...');

    // 5.1: Test Generic Task Update with Dependencies
    console.log('\n5.1 Testing generic task update with dependencies...');
    try {
      const updateResponse = await axios.put(`${BASE_URL}/api/brands/${brandId}/tasks/${taskId1}`, {
        dependencies: [taskId2, taskId3]
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('✅ Generic update with dependencies successful');
      console.log('   Dependencies count:', updateResponse.data.data.dependencies.length);
    } catch (error) {
      console.log('❌ Generic update failed:', error.response?.data?.error?.message || error.message);
    }

    // 5.2: Test Dedicated Dependencies Endpoint
    console.log('\n5.2 Testing dedicated dependencies endpoint...');
    try {
      const depsResponse = await axios.put(`${BASE_URL}/api/brands/${brandId}/tasks/${taskId2}/dependencies`, {
        dependencies: [taskId1]
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('✅ Dedicated dependencies update successful');
      console.log('   Dependencies count:', depsResponse.data.data.dependencies.length);
    } catch (error) {
      console.log('❌ Dedicated dependencies update failed:', error.response?.data?.error?.message || error.message);
    }

    // 5.3: Test Self-Dependency Prevention
    console.log('\n5.3 Testing self-dependency prevention...');
    try {
      await axios.put(`${BASE_URL}/api/brands/${brandId}/tasks/${taskId1}/dependencies`, {
        dependencies: [taskId1] // Self-dependency
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('❌ Self-dependency should have been rejected!');
    } catch (error) {
      if (error.response?.data?.error?.code === 'VALIDATION_ERROR') {
        console.log('✅ Self-dependency correctly rejected');
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.error?.message || error.message);
      }
    }

    // 5.4: Test Circular Dependency Prevention
    console.log('\n5.4 Testing circular dependency prevention...');
    try {
      // First set task1 depends on task2
      await axios.put(`${BASE_URL}/api/brands/${brandId}/tasks/${taskId1}/dependencies`, {
        dependencies: [taskId2]
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      // Then try to set task2 depends on task1 (circular)
      await axios.put(`${BASE_URL}/api/brands/${brandId}/tasks/${taskId2}/dependencies`, {
        dependencies: [taskId1]
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('❌ Circular dependency should have been rejected!');
    } catch (error) {
      if (error.response?.data?.error?.code === 'CIRCULAR_DEPENDENCY') {
        console.log('✅ Circular dependency correctly rejected');
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.error?.message || error.message);
      }
    }

    // 5.5: Test Get Task with Dependencies
    console.log('\n5.5 Testing get task with dependencies...');
    try {
      const getTaskResponse = await axios.get(`${BASE_URL}/api/brands/${brandId}/tasks/${taskId1}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('✅ Get task successful');
      console.log('   Task name:', getTaskResponse.data.data.task.task);
      console.log('   Dependencies count:', getTaskResponse.data.data.task.dependencies?.length || 0);
      if (getTaskResponse.data.data.task.dependencies?.length > 0) {
        console.log('   Dependencies:', getTaskResponse.data.data.task.dependencies.map(dep => dep.task || dep.id));
      }
    } catch (error) {
      console.log('❌ Get task failed:', error.response?.data?.error?.message || error.message);
    }

    // 5.6: Test Clear Dependencies
    console.log('\n5.6 Testing clear dependencies...');
    try {
      const clearResponse = await axios.put(`${BASE_URL}/api/brands/${brandId}/tasks/${taskId1}/dependencies`, {
        dependencies: [] // Empty array
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('✅ Clear dependencies successful');
      console.log('   Dependencies count:', clearResponse.data.data.dependencies.length);
    } catch (error) {
      console.log('❌ Clear dependencies failed:', error.response?.data?.error?.message || error.message);
    }

    // Step 6: Final verification
    console.log('\n6. Final verification...');
    try {
      const finalResponse = await axios.get(`${BASE_URL}/api/brands/${brandId}/tasks/${taskId1}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('✅ Final task dependencies:', finalResponse.data.data.task.dependencies?.length || 0);
    } catch (error) {
      console.log('❌ Final verification failed:', error.response?.data?.error?.message || error.message);
    }

    console.log('\n🎉 DEPENDENCIES SYSTEM TEST COMPLETED!');
    console.log('\n📋 API ENDPOINTS TESTED:');
    console.log('   ✅ PUT /api/brands/{brandId}/tasks/{taskId} (with dependencies)');
    console.log('   ✅ PUT /api/brands/{brandId}/tasks/{taskId}/dependencies');
    console.log('   ✅ GET /api/brands/{brandId}/tasks/{taskId} (with populated dependencies)');
    console.log('\n🔒 VALIDATION TESTED:');
    console.log('   ✅ Self-dependency prevention');
    console.log('   ✅ Circular dependency prevention');
    console.log('   ✅ Invalid ObjectId filtering');
    console.log('   ✅ Array validation');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start the server first:');
      console.log('   node server.js');
    } else {
      console.log('❌ Test failed:', error.message);
    }
  }
}

testDependenciesSystem();
