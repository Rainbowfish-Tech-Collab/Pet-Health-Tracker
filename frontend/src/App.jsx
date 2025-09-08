import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import SpecificDataEntry from './pages/SpecificDataEntry';
import Login from './pages/Login';
import Register from './pages/Register';
import AccountProfile from './pages/AccountProfile';
import { ToastContainer } from 'react-toastify';
import './App.css';

/**
 * ProtectedRoute
 * Guard component used to protect routes behind Passport authentication.
 *
 * How it works:
 * - Calls GET http://localhost:3000/auth/status with credentials so the server can read the session cookie.
 * - While the request is in-flight we render nothing (you can swap this for a spinner).
 * - If not authenticated, we redirect to /login using <Navigate replace /> to avoid polluting history.
 * - If authenticated, we render the protected children.
 */
function ProtectedRoute({ children }) {
  // Track loading and whether the user is authenticated
  const [status, setStatus] = useState({ loading: true, isAuthenticated: false });

  useEffect(() => {
    // mounted flag prevents setting state after unmount (avoids React warnings)
    let mounted = true;

    // Passport session check; credentials:'include' ensures cookies are sent
    fetch('http://localhost:3000/auth/status', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (!mounted) return;
        // Convert any truthy isAuthenticated value to boolean
        setStatus({ loading: false, isAuthenticated: !!data?.isAuthenticated });
      })
      .catch(() => {
        if (!mounted) return;
        // On error, treat as unauthenticated
        setStatus({ loading: false, isAuthenticated: false });
      });

    // Cleanup: mark as unmounted to avoid setState after unmount
    return () => { mounted = false; };
  }, []);

  // Optionally render a spinner or skeleton while verifying auth
  if (status.loading) return null;

  // Not authenticated -> redirect to login
  if (!status.isAuthenticated) return <Navigate to="/login" replace />;

  // Authenticated -> render the protected route content
  return children;
}

function App() {
  return (
    <Router>
      <Routes>  
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><AccountProfile /></ProtectedRoute>} />
        <Route path="/pet-data-log" element={<ProtectedRoute><Home /></ProtectedRoute>} /> {/* For now, reuse Home component */}
        <Route path="/add-entry" element={<ProtectedRoute><SpecificDataEntry /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><div>Settings Page (Coming Soon)</div></ProtectedRoute>} />
        <Route path="/about" element={<div>About Page (Coming Soon)</div>} />
        <Route path="/add-pet" element={<ProtectedRoute><div>Add a Pet (Coming Soon)</div></ProtectedRoute>} />
        <Route path="/edit-pet" element={<ProtectedRoute><div>Edit a Pet (Coming Soon)</div></ProtectedRoute>} />
        <Route path="/account-info" element={<ProtectedRoute><div>Account Information (Coming Soon)</div></ProtectedRoute>} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
