// pages/protected/dashboard.tsx

import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { userId, email } = router.query; // Assuming you're using useRouter to access query parameters

  useEffect(() => {
    // Example of using userId and email in useEffect for fetching data or other logic
    if (userId && email) {
      // Fetch data or perform actions based on userId and email
    }
  }, [userId, email]);

  return (
    <div>
      {/* Content of your dashboard  */}
      <h1>Dashboard</h1>
      {/* Example: Display userId and email */}
      <p>User ID: {userId}</p>
      <p>Email: {email}</p>
    </div>
  );
};

export default Dashboard;
