import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/fetched-logo.svg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordWarning, setPasswordWarning] = useState('');
  const [emailWarning, setEmailWarning] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
      fetch("http://localhost:3000/auth/status", {
        credentials: "include", //send cookies with the request
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data.user);
          if (data.isAuthenticated) {
            navigate('/'); // Redirect to home if already logged in
          }
        });
    }, []);
  
  const validateEmail = (email) => {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    // At least 6 characters and at least one special character
    return password.length >= 6 && /[!@#$%^&*()_+\[\]{}|;:',.<>/?`~\-]/.test(password);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setPasswordWarning('');
    setEmailWarning('');
    if (!validateEmail(email)) {
      setEmailWarning('Please enter a valid email address.');
      return;
    }
    if (!validatePassword(password)) {
      setPasswordWarning('Password must be at least 6 characters and include a special character.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username: email, password }),
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
          <div className="bg-[#AAD1A1] w-full flex flex-col items-center py-6 mb-6 rounded-2xl">
            <img
              src={logo}
              alt="Fetched logo"
              className="w-48 h-32 object-contain"
            />
          </div>
        </div>
        {error && <div className="text-red-600 text-center mb-2 text-sm font-medium">{error}</div>}
        {emailWarning && <div className="text-yellow-600 text-center mb-2 text-sm font-medium">{emailWarning}</div>}
        {passwordWarning && <div className="text-yellow-600 text-center mb-2 text-sm font-medium">{passwordWarning}</div>}
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4 mb-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-[#444] rounded px-3 py-2 bg-transparent text-lg focus:outline-none focus:border-[#355233]"
          />
          <input
            type="password"
            placeholder="Password"
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
        {/* Divider with OR */}
        <div className="flex items-center w-full my-4">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-3 text-gray-500 text-sm font-medium">OR</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>
        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 bg-white hover:bg-gray-100 transition-colors focus:outline-none"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_17_40)">
              <path d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24.5V29.1H37.4C36.8 32.1 34.7 34.5 31.7 36.1V42.1H39.2C43.6 38.1 47.5 32.1 47.5 24.5Z" fill="#4285F4"/>
              <path d="M24.5 48C31.1 48 36.6 45.8 39.2 42.1L31.7 36.1C30.3 37 28.5 37.6 26.5 37.6C20.2 37.6 14.9 33.4 13.1 27.7H5.3V33.9C8.9 41.1 16.1 48 24.5 48Z" fill="#34A853"/>
              <path d="M13.1 27.7C12.6 26.8 12.3 25.8 12.3 24.7C12.3 23.6 12.6 22.6 13.1 21.7V15.5H5.3C3.7 18.5 2.7 21.9 2.7 24.7C2.7 27.5 3.7 30.9 5.3 33.9L13.1 27.7Z" fill="#FBBC05"/>
              <path d="M24.5 11.8C27.1 11.8 29.3 12.7 31 14.3L38.1 7.2C36.6 5.8 31.1 0.7 24.5 0.7C16.1 0.7 8.9 7.6 5.3 15.5L13.1 21.7C14.9 15.9 20.2 11.8 24.5 11.8Z" fill="#EA4335"/>
            </g>
            <defs>
              <clipPath id="clip0_17_40">
                <rect width="48" height="48" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          <span className="text-gray-700 font-medium text-base">Continue with Google</span>
        </button>
        {/* Signup link */}
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
