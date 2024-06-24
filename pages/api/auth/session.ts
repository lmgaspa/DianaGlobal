fetch('/api/auth/session')
  .then(response => {
    if (response.ok) {
      return response.json(); // Parse JSON response
    } else {
      throw new Error('Failed to fetch session data');
    }
  })
  .then(data => {
    console.log('Session data:', data);
    // Process data as needed
  })
  .catch(error => {
    console.error('Error fetching session data:', error);
    // Handle the error, e.g., display an error message to the user
  });
