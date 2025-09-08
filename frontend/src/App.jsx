import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SpecificDataEntry from './pages/SpecificDataEntry';
import Login from './pages/Login';
import Register from './pages/Register';
import AccountProfile from './pages/AccountProfile';
import { ToastContainer } from 'react-toastify';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>  
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/account" element={<AccountProfile />} />
        <Route path="/pet-data-log" element={<Home />} /> {/* For now, reuse Home component */}
        <Route path="/add-entry" element={<SpecificDataEntry />} />
        <Route path="/settings" element={<div>Settings Page (Coming Soon)</div>} />
        <Route path="/about" element={<div>About Page (Coming Soon)</div>} />
        <Route path="/add-pet" element={<div>Add a Pet (Coming Soon)</div>} />
        <Route path="/edit-pet" element={<div>Edit a Pet (Coming Soon)</div>} />
        <Route path="/account-info" element={<div>Account Information (Coming Soon)</div>} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
