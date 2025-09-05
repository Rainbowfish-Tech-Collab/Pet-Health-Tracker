import React, { useState } from 'react';
import Logo from '../assets/Logo.svg';
import { FaHome, FaPlus, FaInfoCircle, FaChevronDown, FaUserCircle, FaListAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const NavBar = ({
  pets = [],
  selectedPet,
  setSelectedPet,
  username = "Username",
  profilePicUrl = null,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 bg-white border-b border-[#E8E6E1] shadow-sm">
      {/* Left: Logo and Pet Dropdown */}
      <div className="flex items-center gap-4">
        <img src={Logo} alt="Logo" className="w-24 h-20 object-contain" />
        <div className="flex items-center gap-2">
          {/* Pet profile picture placeholder */}
          <div className="w-10 h-10 rounded-full bg-[#E7F2E7] flex items-center justify-center overflow-hidden">
            {profilePicUrl ? (
              <img src={profilePicUrl} alt="Pet" className="w-full h-full object-cover" />
            ) : (
              <FaUserCircle className="text-[#4A654A] text-2xl" />
            )}
          </div>
          {/* Pet selector */}
          <select
            value={selectedPet}
            onChange={e => setSelectedPet(e.target.value)}
            className="py-2 px-3 rounded-xl border border-[#E8E6E1] bg-white text-[#2D3F2D] text-base appearance-none cursor-pointer hover:border-[#4A654A] focus:outline-none focus:border-[#4A654A]"
          >
            {pets.map((pet, idx) => (
              <option key={idx} value={pet.id}>{pet.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: Navigation Buttons */}
      <div className="flex gap-6">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#2D4A2D] font-semibold hover:text-[#4A654A]">
          <FaHome /> Home
        </button>
        <button onClick={() => navigate('/pet-data-log')} className="flex items-center gap-2 text-[#2D4A2D] font-semibold hover:text-[#4A654A]">
          <FaListAlt /> Full Data Log
        </button>
        <button onClick={() => navigate('/add-entry')} className="flex items-center gap-2 text-[#2D4A2D] font-semibold hover:text-[#4A654A]">
          <FaPlus /> New Entry
        </button>
        <button onClick={() => navigate('/about')} className="flex items-center gap-2 text-[#2D4A2D] font-semibold hover:text-[#4A654A]">
          <FaInfoCircle /> About
        </button>
      </div>

      {/* Right: Username and Dropdown */}
      <div className="relative flex items-center gap-2">
        <span className="text-[#2D4A2D] font-medium">{username}</span>
        <button
          onClick={() => setDropdownOpen(v => !v)}
          className="flex items-center p-2 rounded-full hover:bg-[#F3F7F3]"
        >
          <FaChevronDown />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 bg-white border border-[#E8E6E1] rounded-lg shadow-lg z-10 min-w-[200px] flex flex-col gap-2 p-3">
            <button
              onClick={() => { setDropdownOpen(false); navigate('/add-pet'); }}
              className="w-full text-left px-4 py-2 bg-[#4A654A] text-white rounded-lg hover:bg-[#3D7A3D] transition-colors flex justify-between items-center"
            >
              Add a pet <span className='ml-2'>&#8250;</span>
            </button>
            <button
              onClick={() => { setDropdownOpen(false); navigate('/edit-pet'); }}
              className="w-full text-left px-4 py-2 bg-[#4A654A] text-white rounded-lg hover:bg-[#3D7A3D] transition-colors flex justify-between items-center"
            >
              Edit a pet <span className='ml-2'>&#8250;</span>
            </button>
            <button
              onClick={() => { setDropdownOpen(false); navigate('/account-info'); }}
              className="w-full text-left px-4 py-2 bg-[#4A654A] text-white rounded-lg hover:bg-[#3D7A3D] transition-colors flex justify-between items-center"
            >
              Account information <span className='ml-2'>&#8250;</span>
            </button>
            <button
              onClick={() => { setDropdownOpen(false); /* Add logout logic here */ }}
              className="w-full text-left px-4 py-2 bg-[#FFE4C2] text-[#2D4A2D] rounded-lg hover:bg-[#FFD6A0] transition-colors font-semibold"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;