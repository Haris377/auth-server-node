// Using Node's built-in fetch (available in Node 18+)

// Test DELETE endpoint with provided token
async function testDeleteEndpoint() {
  const userId = 'c5e542c6-8f89-49d9-bc8d-c2dfd3d06eaa';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmZTkxYmY2Mi04MjQ4LTRmMzktYmYwOS0xOTRiZWY4YzgxMjYiLCJyb2xlcyI6WyJNYW5hZ2VyIl0sImlhdCI6MTc2MTczNTM3OSwiZXhwIjoxNzYyMzQwMTc5fQ.FO-LCcl-mUHVBoL3O-r_xSkuB0Q2yPtyGGD4NeYRGdM';

  console.log('Testing DELETE endpoint for user:', userId);
  console.log('='.repeat(60));
  
  // Test 1: WRONG URL (singular - this is what you're using)
  console.log('\n❌ TEST 1: WRONG URL (singular /api/user/...)');
  console.log('URL: http://localhost:3000/api/user/' + userId);
  try {
    const wrongResponse = await fetch(`http://localhost:3000/api/user/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`Status: ${wrongResponse.status} ${wrongResponse.statusText}`);
    const wrongData = await wrongResponse.json().catch(() => ({}));
    console.log('Response:', JSON.stringify(wrongData, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Test 2: CORRECT URL (plural - this is what you should use)
  console.log('\n✅ TEST 2: CORRECT URL (plural /api/users/...)');
  console.log('URL: http://localhost:3000/api/users/' + userId);
  try {
    const correctResponse = await fetch(`http://localhost:3000/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`Status: ${correctResponse.status} ${correctResponse.statusText}`);
    const correctData = await correctResponse.json().catch(() => ({}));
    console.log('Response:', JSON.stringify(correctData, null, 2));
    
    if (correctResponse.status === 200) {
      console.log('\n✓ SUCCESS! User deactivated.');
    } else if (correctResponse.status === 404) {
      console.log('\nℹ User not found (ID does not exist in database)');
    } else if (correctResponse.status === 401) {
      console.log('\n✗ Authentication failed - token might be invalid');
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nMake sure the server is running on http://localhost:3000');
  }
}

testDeleteEndpoint();

