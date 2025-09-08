import React, { useState, useEffect, useRef } from 'react';
import Logo from '../assets/Logo.svg';
import { FaHome, FaPlus, FaInfoCircle, FaChevronDown, FaUserCircle, FaListAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const NavBar = ({
  pets = [],
  selectedPet,
  setSelectedPet,
  username = "Username",
  profilePicUrl = null,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [displayName, setDisplayName] = useState(username);
  const [userAvatar, setUserAvatar] = useState(null);
  const [userInitial, setUserInitial] = useState((username?.[0] || 'U').toUpperCase());
  const [userEmail, setUserEmail] = useState('');
  const dropdownRef = useRef(null);

  const handleNavigate = (path) => {
    navigate(path);
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  // Fetch authenticated user to display username and avatar in the navbar
  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        const res = await fetch('http://localhost:3000/auth/status', {
          credentials: 'include',
        });
        const data = await res.json();
        if (data?.isAuthenticated && data?.user) {
          const user = data.user;
          const name = user.username || user.name || user.email || username;
          setDisplayName(name);
          const sourceForInitial = user.email || name || username;
          setUserInitial((sourceForInitial?.[0] || 'U').toUpperCase());
          setUserEmail(user.email || '');

          // Try multiple common fields/locations for a profile photo from Passport providers
          const candidates = [
            user.profile_picture,
            user.picture,
            user.photo,
            user.avatar,
            user.image,
            user.profilePhoto,
            user.pictureUrl,
            user.profile_image_url,
            user._json && user._json.picture,
            Array.isArray(user.photos) && user.photos[0] && user.photos[0].value,
          ].filter(Boolean);

          let photo = candidates.length ? String(candidates[0]) : null;

          // If it's a Google photo, ensure a reasonable size parameter
          if (photo && /googleusercontent\.com/.test(photo)) {
            // Some URLs use "=s96-c" or ",s96" styles; keep if present, else add size
            if (!/[?&]sz=/.test(photo) && !/=s\d+/.test(photo)) {
              photo += (photo.includes('?') ? '&' : '?') + 'sz=64';
            }
          }

          // Debug: surface which field we're using (dev only)
          if (import.meta?.env?.MODE !== 'production') {
            // eslint-disable-next-line no-console
            console.log('[NavBar] auth status user:', user);
            // eslint-disable-next-line no-console
            console.log('[NavBar] derived avatar url:', photo);
          }

          if (photo) setUserAvatar(photo);
        }
      } catch (e) {
        // silently ignore; keep defaults
      }
    };
    fetchAuthStatus();
  }, []);

  // Logs out the user via Passport backend and redirects to login page
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/auth/logout', {
        method: 'GET',
        credentials: 'include',
      });
      setDropdownOpen(false);
      navigate('/login');
    } catch (err) {
      alert('Logout failed. Please try again.');
    }
  };

  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 bg-[#294B29]">
      {/* Left: Logo and Pet Dropdown */}
      <div className="flex items-center gap-4">
        <img src={Logo} alt="Logo" className="w-14 h-14 object-contain rounded-lg" style={{ backgroundColor: '#CFE0CE' }} />
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
            className="py-2 px-3 rounded-xl border border-[#E8E6E1] bg-white text-[#294B29] text-base appearance-none cursor-pointer hover:border-[#4A654A] focus:outline-none focus:border-[#4A654A]"
          >
            {pets.map((pet, idx) => (
              <option key={idx} value={pet.id}>{pet.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: Navigation Buttons */}
      <div className="flex gap-6">
        <button onClick={() => handleNavigate('/')} className={`flex items-center gap-2 font-semibold hover:text-[#FFD700] ${location.pathname === '/' ? 'text-[#FFD700]' : 'text-white'}`} aria-current={location.pathname === '/' ? 'page' : undefined}>
          <FaHome className="text-white" /> Home
        </button>
        <button onClick={() => handleNavigate('/pet-data-log')} className={`flex items-center gap-2 font-semibold hover:text-[#FFD700] ${location.pathname === '/pet-data-log' ? 'text-[#FFD700]' : 'text-white'}`} aria-current={location.pathname === '/pet-data-log' ? 'page' : undefined}>
          <FaListAlt className="text-white" /> Full Data Log
        </button>
        <button onClick={() => handleNavigate('/add-entry')} className={`flex items-center gap-2 font-semibold hover:text-[#FFD700] ${location.pathname === '/add-entry' ? 'text-[#FFD700]' : 'text-white'}`} aria-current={location.pathname === '/add-entry' ? 'page' : undefined}>
          <FaPlus className="text-white" /> New Entry
        </button>
        <button onClick={() => handleNavigate('/about')} className={`flex items-center gap-2 font-semibold hover:text-[#FFD700] ${location.pathname === '/about' ? 'text-[#FFD700]' : 'text-white'}`} aria-current={location.pathname === '/about' ? 'page' : undefined}>
          <FaInfoCircle className="text-white" /> About
        </button>
      </div>

      {/* Right: Username and Dropdown */}
      <div className="relative flex items-center gap-2" ref={dropdownRef}>
        {userAvatar ? (
          <img
            src={userAvatar}
            alt="User"
            className="w-8 h-8 rounded-full object-cover border border-white/20"
            referrerPolicy="no-referrer"
            title={userEmail || displayName}
            onLoad={() => {
              if (import.meta?.env?.MODE !== 'production') {
                // eslint-disable-next-line no-console
                console.log('[NavBar] avatar loaded OK');
              }
            }}
            onError={() => setUserAvatar(null)}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center font-semibold" title={userEmail || displayName}>
            {userInitial}
          </div>
        )}
        <span className="text-white font-medium" title={userEmail || displayName} aria-label={userEmail || displayName}>{displayName}</span>
        <button
          onClick={() => setDropdownOpen(v => !v)}
          className="flex items-center p-2 rounded-full hover:bg-[#3A5A3A]"
          aria-haspopup="menu"
          aria-expanded={dropdownOpen}
          aria-label="User menu"
        >
          <FaChevronDown className="text-white" />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 bg-white border border-[#E8E6E1] rounded-lg shadow-lg z-10 min-w-[200px] flex flex-col gap-2 p-3" role="menu">
            <button
              onClick={() => handleNavigate('/add-pet')}
              className="w-full text-left px-4 py-2 bg-[#4A654A] text-white rounded-lg hover:bg-[#3D7A3D] transition-colors flex justify-between items-center"
              role="menuitem"
            >
              Add a pet <span className='ml-2'>&#8250;</span>
            </button>
            <button
              onClick={() => handleNavigate('/edit-pet')}
              className="w-full text-left px-4 py-2 bg-[#4A654A] text-white rounded-lg hover:bg-[#3D7A3D] transition-colors flex justify-between items-center"
              role="menuitem"
            >
              Edit a pet <span className='ml-2'>&#8250;</span>
            </button>
            <button
              onClick={() => handleNavigate('/account-info')}
              className="w-full text-left px-4 py-2 bg-[#4A654A] text-white rounded-lg hover:bg-[#3D7A3D] transition-colors flex justify-between items-center"
              role="menuitem"
            >
              Account information <span className='ml-2'>&#8250;</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 bg-[#D97706] text-white rounded-lg hover:bg-[#B45309] transition-colors font-semibold"
              role="menuitem"
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