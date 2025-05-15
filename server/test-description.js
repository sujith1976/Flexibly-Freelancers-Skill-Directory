// Importing fetch using require with CommonJS
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAddFreelancer() {
  try {
    const response = await fetch('http://localhost:5000/api/freelancers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test' + Date.now() + '@example.com', // Make email unique
        skills: ['javascript', 'react'],
        description: 'This is a test description for the freelancer. This person has over 5 years of experience working with React and JavaScript.'
      }),
    });

    const data = await response.json();
    console.log('Response from creating freelancer:', data);
    
    // Check if description was saved in the response
    if (data.description) {
      console.log('SUCCESS: Description exists in the response!');
    } else {
      console.log('ERROR: Description was not in the response.');
    }

    // If we got an ID, verify by fetching the freelancer again
    if (data._id) {
      console.log(`Verifying freelancer with ID: ${data._id}`);
      const getResponse = await fetch(`http://localhost:5000/api/freelancers/${data._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const freelancer = await getResponse.json();
      console.log('Fetched freelancer:', freelancer);
      
      if (freelancer.description) {
        console.log('SUCCESS: Description is correctly stored and retrieved!');
        console.log('Description:', freelancer.description);
      } else {
        console.log('ERROR: Description is missing when freelancer is retrieved.');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testAddFreelancer(); 