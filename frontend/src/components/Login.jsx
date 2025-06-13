import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/fetched-logo.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Login successful:', data);
        navigate('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Error during login');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#222]">
      <div className="bg-[#fcfaec] rounded-2xl shadow-lg p-6 sm:p-10 w-[350px] flex flex-col items-center border-8 border-[#222]">
        <div className="w-full flex flex-col items-center mb-6">
          <div className="bg-[#d6e8cb] rounded-2xl w-full flex flex-col items-center py-6 mb-6">
            <img
              src={logo}
              alt="Fetched logo"
              className="w-48 h-32 object-contain rounded-2xl shadow"
            />
          </div>
        </div>
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4 mb-2">
          <input
            type="text"
            placeholder="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full border border-[#444] rounded px-3 py-2 bg-transparent text-lg focus:outline-none focus:border-[#355233]"
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-[#444] rounded px-3 py-2 bg-transparent text-lg focus:outline-none focus:border-[#355233]"
          />
          <div className="text-left">
            <a href="#" className="text-[#6b6b6b] text-sm underline hover:text-[#355233]">Forgot Username or Password?</a>
          </div>
          <button
            type="submit"
            className="w-full bg-[#355233] text-white text-2xl font-semibold rounded py-2 mt-2 hover:bg-[#22351d] transition-colors"
          >
            Log in
          </button>
        </form>
        <div className="w-full text-center mt-2">
          <span className="text-[#888] text-base">Need an account?{' '}
            <Link to="/register" className="underline text-[#444] hover:text-[#355233]">Sign up</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
