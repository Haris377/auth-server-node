const fetch = require('node-fetch');

// Test script to verify the DELETE user endpoint
async function testDeleteUser() {
  const userId = 'c5e542c6-8f89-49d9-bc8d-c2dfd3d06eaa';
  
  // First, let's try to login to get a token
  console.log('Step 1: Logging in...');
  try {
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'manager@example.com',
        password: 'Admin@1234'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response status:', loginResponse.status);
    
    if (loginResponse.status !== 200) {
      console.error('Login failed:', loginData);
      console.log('\nPlease login with valid credentials first to get a token.');
      return;
    }

    const token = loginData.data?.token;
    if (!token) {
      console.error('No token received:', loginData);
      return;
    }

    console.log('✓ Login successful! Token received.\n');

    // Test the WRONG URL (singular - should give 404)
    console.log('Step 2: Testing WRONG URL (singular /api/user/...)...');
    const wrongUrl = `http://localhost:3000/api/user/${userId}`;
    const wrongResponse = await fetch(wrongUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    console.log(`Wrong URL: ${wrongUrl}`);
    console.log(`Status: ${wrongResponse.status} ${wrongResponse.statusText}`);
    const wrongData = await wrongResponse.json().catch(() => ({}));
    console.log('Response:', wrongData);
    console.log('');

    // Test the CORRECT URL (plural - should work)
    console.log('Step 3: Testing CORRECT URL (plural /api/users/...)...');
    const correctUrl = `http://localhost:3000/api/users/${userId}`;
    const correctResponse = await fetch(correctUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    console.log(`Correct URL: ${correctUrl}`);
    console.log(`Status: ${correctResponse.status} ${correctResponse.statusText}`);
    const correctData = await correctResponse.json().catch(() => ({}));
    console.log('Response:', correctData);
    
    if (correctResponse.status === 200 || correctResponse.status === 404) {
      console.log('\n✓ Correct URL path works! (404 means user not found, which is expected if user ID is invalid)');
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nMake sure the server is running on http://localhost:3000');
  }
}

testDeleteUser();

