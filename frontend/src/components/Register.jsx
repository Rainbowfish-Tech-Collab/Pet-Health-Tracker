import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/fetched-logo.svg';

const Register = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: emailOrUsername, username: emailOrUsername, password }),
      });

      const data = await response.json();
      if (response.ok) {
        navigate('/');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Error during registration');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#222]">
      <div className="bg-[#fcfaec] rounded-2xl shadow-lg p-6 sm:p-10 w-[350px] flex flex-col items-center border-8 border-[#222]">
        <div className="w-full flex flex-col items-center mb-6">
          <div>
            <img
              src={logo}
              alt="Fetched logo"
              className="w-65 h-32 object-contain"
            />
          </div>
        </div>
        {error && <div className="text-red-600 text-center mb-2 text-sm font-medium">{error}</div>}
        <form onSubmit={handleRegister} className="w-full flex flex-col gap-4 mb-2">
          <input
            type="text"
            placeholder="Email/Username"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full border border-[#444] rounded px-3 py-2 bg-transparent text-lg focus:outline-none focus:border-[#355233]"
          />
          <button
            type="submit"
            className="w-full bg-[#355233] text-white text-2xl font-semibold rounded py-2 mt-2 hover:bg-[#22351d] transition-colors"
          >
            Register
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
        {/* Login link */}
        <div className="w-full text-center mt-2">
          <span className="text-[#888] text-base">Already have an account?{' '}
            <Link to="/login" className="underline text-[#444] hover:text-[#355233]">Login here</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;
