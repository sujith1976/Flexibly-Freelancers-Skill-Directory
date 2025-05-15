// Using axios to test the API
const axios = require('axios');

async function testAddFreelancer() {
  try {
    console.log('Starting the test...');
    
    const response = await axios.post('http://localhost:5000/api/freelancers', {
      name: 'Test User',
      email: `test${Date.now()}@example.com`, // Make email unique
      skills: ['javascript', 'react'],
      description: 'This is a test description for the freelancer. This person has over 5 years of experience working with React and JavaScript.'
    });

    console.log('API Response Status:', response.status);
    console.log('Response Data:', response.data);
    
    // Check if description was saved
    if (response.data.description) {
      console.log('SUCCESS: Description was successfully saved!');
      console.log('Description:', response.data.description);
    } else {
      console.log('ERROR: Description was not saved.');
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response Data:', error.response.data);
      console.error('Response Status:', error.response.status);
    }
  }
}

// Execute the test
console.log('Testing freelancer creation with description...');
testAddFreelancer(); 