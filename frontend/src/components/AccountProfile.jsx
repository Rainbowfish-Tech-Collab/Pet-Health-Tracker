import { useEffect, useState } from 'react';


const Account = () => {

  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000/auth/status', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setIsAuthenticated(data.isAuthenticated);
      });
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }
  if (!isAuthenticated) {
    return <div>Please log in first to view your account profile.</div>;
  }
  return (
    <div>
      <h1>Account Profile</h1>
      <p>Name: {user.username}</p>
      <p>Email: {user.email}</p>
    </div>
  );
}

export default Account;