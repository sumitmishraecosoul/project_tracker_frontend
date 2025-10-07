const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test data
let authToken = '';
let brandId = '';
let projectId = '';
let taskId = '';
let linkId = '';

async function testTaskLinksSystem() {
  try {
    console.log('🔗 TESTING TASK LINKS SYSTEM\n');

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

    // Step 4: Get or create task
    console.log('\n4. Getting tasks...');
    const tasksResponse = await axios.get(`${BASE_URL}/api/brands/${brandId}/tasks?projectId=${projectId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (tasksResponse.data.data.tasks.length > 0) {
      taskId = tasksResponse.data.data.tasks[0].id;
      console.log('✅ Using existing task:', tasksResponse.data.data.tasks[0].task);
    } else {
      console.log('❌ No tasks found. Please create a task first.');
      return;
    }

    // Step 5: Test Task Links CRUD Operations
    console.log('\n5. Testing Task Links CRUD Operations...');

    // 5.1: Get existing links
    console.log('\n5.1 Getting existing task links...');
    try {
      const getLinksResponse = await axios.get(`${BASE_URL}/api/brands/${brandId}/tasks/${taskId}/links`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Get links successful:', getLinksResponse.data.data.length, 'links found');
    } catch (error) {
      console.log('❌ Get links failed:', error.response?.data?.error?.message || error.message);
    }

    // 5.2: Create a new link
    console.log('\n5.2 Creating a new task link...');
    try {
      const createLinkResponse = await axios.post(`${BASE_URL}/api/brands/${brandId}/tasks/${taskId}/links`, {
        name: 'Project Requirements Sheet',
        url: 'https://docs.google.com/spreadsheets/d/example123',
        description: 'Main requirements document for this task'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      linkId = createLinkResponse.data.data.id;
      console.log('✅ Create link successful:', createLinkResponse.data.data.name);
    } catch (error) {
      console.log('❌ Create link failed:', error.response?.data?.error?.message || error.message);
      return;
    }

    // 5.3: Create another link
    console.log('\n5.3 Creating another task link...');
    try {
      const createLink2Response = await axios.post(`${BASE_URL}/api/brands/${brandId}/tasks/${taskId}/links`, {
        name: 'Design Mockups',
        url: 'https://figma.com/file/example456',
        description: 'UI/UX mockups for the task'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('✅ Create second link successful:', createLink2Response.data.data.name);
    } catch (error) {
      console.log('❌ Create second link failed:', error.response?.data?.error?.message || error.message);
    }

    // 5.4: Get all links
    console.log('\n5.4 Getting all task links...');
    try {
      const getAllLinksResponse = await axios.get(`${BASE_URL}/api/brands/${brandId}/tasks/${taskId}/links`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('✅ Get all links successful:', getAllLinksResponse.data.data.length, 'links found');
      getAllLinksResponse.data.data.forEach((link, index) => {
        console.log(`   ${index + 1}. ${link.name} - ${link.url}`);
      });
    } catch (error) {
      console.log('❌ Get all links failed:', error.response?.data?.error?.message || error.message);
    }

    // 5.5: Update a link
    console.log('\n5.5 Updating task link...');
    try {
      const updateLinkResponse = await axios.put(`${BASE_URL}/api/brands/${brandId}/tasks/${taskId}/links/${linkId}`, {
        name: 'Updated Requirements Sheet',
        description: 'Updated requirements document'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('✅ Update link successful:', updateLinkResponse.data.data.name);
    } catch (error) {
      console.log('❌ Update link failed:', error.response?.data?.error?.message || error.message);
    }

    // 5.6: Test reordering links
    console.log('\n5.6 Testing link reordering...');
    try {
      const getAllLinksForReorder = await axios.get(`${BASE_URL}/api/brands/${brandId}/tasks/${taskId}/links`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (getAllLinksForReorder.data.data.length >= 2) {
        const linkOrders = getAllLinksForReorder.data.data.map((link, index) => ({
          linkId: link.id,
          order: getAllLinksForReorder.data.data.length - index - 1 // Reverse order
        }));
        
        const reorderResponse = await axios.put(`${BASE_URL}/api/brands/${brandId}/tasks/${taskId}/links-reorder`, {
          linkOrders
        }, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        console.log('✅ Reorder links successful');
      } else {
        console.log('⚠️  Not enough links to test reordering');
      }
    } catch (error) {
      console.log('❌ Reorder links failed:', error.response?.data?.error?.message || error.message);
    }

    // 5.7: Delete a link
    console.log('\n5.7 Deleting task link...');
    try {
      const deleteLinkResponse = await axios.delete(`${BASE_URL}/api/brands/${brandId}/tasks/${taskId}/links/${linkId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('✅ Delete link successful');
    } catch (error) {
      console.log('❌ Delete link failed:', error.response?.data?.error?.message || error.message);
    }

    // Step 6: Final verification
    console.log('\n6. Final verification...');
    try {
      const finalLinksResponse = await axios.get(`${BASE_URL}/api/brands/${brandId}/tasks/${taskId}/links`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('✅ Final links count:', finalLinksResponse.data.data.length);
    } catch (error) {
      console.log('❌ Final verification failed:', error.response?.data?.error?.message || error.message);
    }

    console.log('\n🎉 TASK LINKS SYSTEM TEST COMPLETED!');
    console.log('\n📋 API ENDPOINTS TESTED:');
    console.log('   ✅ GET    /api/brands/{brandId}/tasks/{taskId}/links');
    console.log('   ✅ POST   /api/brands/{brandId}/tasks/{taskId}/links');
    console.log('   ✅ PUT    /api/brands/{brandId}/tasks/{taskId}/links/{linkId}');
    console.log('   ✅ DELETE /api/brands/{brandId}/tasks/{taskId}/links/{linkId}');
    console.log('   ✅ PUT    /api/brands/{brandId}/tasks/{taskId}/links-reorder');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start the server first:');
      console.log('   node server.js');
    } else {
      console.log('❌ Test failed:', error.message);
    }
  }
}

testTaskLinksSystem();
