import React, { useState, useEffect, useRef } from 'react';
import Logo from '../assets/Logo.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';

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
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0, left: null });
  const [menuType, setMenuType] = useState(null); // 'user' | 'pet'
  const dropdownRef = useRef(null); // right (user) anchor
  const petAnchorRef = useRef(null); // left (pet) anchor

  // Use an inline SVG data URI so we don't rely on any external network request
  const PET_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="100%" height="100%" fill="%23E7F2E7"/><g fill="%234A654A"><circle cx="24" cy="28" r="7"/><circle cx="56" cy="28" r="7"/><circle cx="40" cy="22" r="6"/><path d="M40 38c-10 0-18 8-18 18 0 4 3 7 7 7h22c4 0 7-3 7-7 0-10-8-18-18-18z"/></g></svg>';

  const handleNavigate = (path) => {
    navigate(path);
    setDropdownOpen(false);
  };

  // Prevent dropdown from instantly closing due to overlay/document handlers
  const toggleUserMenu = (e) => {
    e?.stopPropagation?.();
    setMenuType('user');
    setDropdownOpen(prev => menuType === 'user' ? !prev : true);
  };

  const togglePetMenu = (e) => {
    e?.stopPropagation?.();
    setMenuType('pet');
    setDropdownOpen(prev => menuType === 'pet' ? !prev : true);
  };

  // Position the dropdown portal relative to the trigger
  useEffect(() => {
    const compute = () => {
      // Prefer pet anchor for pet menu if it's visible (not display:none)
      const petRect = petAnchorRef.current?.getBoundingClientRect?.();
      const hasPetAnchor = menuType === 'pet' && petRect && petRect.width > 0 && petRect.height > 0;
      const anchor = hasPetAnchor ? petAnchorRef.current : dropdownRef.current;
      if (!dropdownOpen || !anchor) return;
      const rect = anchor.getBoundingClientRect();
      if (hasPetAnchor) {
        // Align from the left of the pet avatar; clamp to 8px from viewport edge
        setMenuPos({ top: rect.bottom + 8, left: Math.max(8, rect.left), right: null });
      } else {
        // Align to the right of the user cluster; clamp to 8px from viewport edge
        setMenuPos({ top: rect.bottom + 8, right: Math.max(8, window.innerWidth - rect.right), left: null });
      }
    };
    compute();
    if (dropdownOpen) {
      window.addEventListener('resize', compute);
      window.addEventListener('scroll', compute, true);
    }
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [dropdownOpen, menuType]);

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
    <nav className="relative z-30 w-full flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 bg-[#294B29] overflow-x-hidden">
      {/* Left: Logo and Pet Dropdown */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <img src={Logo} alt="Logo" className="w-10 h-10 sm:w-14 sm:h-14 object-contain rounded-lg" style={{ backgroundColor: '#CFE0CE' }} />
        <div className="flex items-center gap-2 min-w-0">
          {/* Pet profile picture placeholder */}
          <div className="hidden md:flex w-10 h-10 rounded-full bg-[#E7F2E7] items-center justify-center overflow-hidden flex-shrink-0 cursor-default" ref={petAnchorRef} aria-hidden="true">
            {(() => {
              const selected = pets.find(p => String(p.id) === String(selectedPet));
              const petName = selected?.name || 'Pet';
              const petPhoto = selected?.photoUrl || profilePicUrl || PET_PLACEHOLDER;
              return (
                <img
                  src={petPhoto}
                  alt={petName}
                  title={petName}
                  className="hidden md:block w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = PET_PLACEHOLDER;
                  }}
                />
              );
            })()}
          </div>
          {/* Pet selector */}
          <select
            value={selectedPet}
            onChange={e => setSelectedPet(e.target.value)}
            className="py-1.5 px-2 rounded-xl border border-[#E8E6E1] bg-white text-[#294B29] text-sm sm:text-base appearance-none cursor-pointer hover:border-[#4A654A] focus:outline-none focus:border-[#4A654A] max-w-[120px] sm:max-w-none truncate"
          >
            {pets.map((pet, idx) => (
              <option key={idx} value={pet.id}>{pet.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: Navigation Buttons (hidden on xs to avoid duplication with quick action) */}
      <div className="hidden sm:flex gap-4">
        <button onClick={() => handleNavigate('/')} className={`flex items-center gap-1 sm:gap-2 font-semibold hover:text-[#FFD700] ${location.pathname === '/' ? 'text-[#FFD700]' : 'text-white'} text-sm sm:text-base`} aria-current={location.pathname === '/' ? 'page' : undefined}>
          <span className="material-symbols-outlined leading-none align-middle text-[20px] sm:text-[24px]">home</span>
          <span className="hidden sm:inline">Home</span>
        </button>
        <button onClick={() => handleNavigate('/pet-data-log')} className={`hidden md:flex items-center gap-2 font-semibold hover:text-[#FFD700] ${location.pathname === '/pet-data-log' ? 'text-[#FFD700]' : 'text-white'}`} aria-current={location.pathname === '/pet-data-log' ? 'page' : undefined}>
          <span className="material-symbols-outlined leading-none align-middle text-[20px] sm:text-[24px]">list</span>
          <span className="hidden sm:inline">Full Data Log</span>
        </button>
        <button onClick={() => handleNavigate('/add-entry')} className={`flex items-center gap-1 sm:gap-2 font-semibold hover:text-[#FFD700] ${location.pathname === '/add-entry' ? 'text-[#FFD700]' : 'text-white'} text-sm sm:text-base`} aria-current={location.pathname === '/add-entry' ? 'page' : undefined}>
          <span className="material-symbols-outlined leading-none align-middle text-[20px] sm:text-[24px]">add</span>
          <span className="hidden sm:inline">New Entry</span>
        </button>
        <button onClick={() => handleNavigate('/about')} className={`hidden md:flex items-center gap-2 font-semibold hover:text-[#FFD700] ${location.pathname === '/about' ? 'text-[#FFD700]' : 'text-white'}`} aria-current={location.pathname === '/about' ? 'page' : undefined}>
          <span className="material-symbols-outlined leading-none align-middle text-[20px] sm:text-[24px]">info</span>
          <span className="hidden sm:inline">About</span>
        </button>
      </div>

      {/* Right: Username and Dropdown */}
      <div className="relative flex items-center gap-1 sm:gap-2" ref={dropdownRef}>
        {/* Mobile: right-side quick icons */}
        <div className="flex sm:hidden items-center gap-1 mr-1">
          <button
            onClick={() => handleNavigate('/add-entry')}
            className={`p-2 rounded-full hover:bg-[#3A5A3A] ${location.pathname === '/add-entry' ? 'text-[#FFD700]' : 'text-white'}`}
            aria-label="New Entry"
            title="New Entry"
          >
            <span className="material-symbols-outlined leading-none align-middle text-[22px]">add</span>
          </button>
          <button
            onClick={() => handleNavigate('/pet-data-log')}
            className={`p-2 rounded-full hover:bg-[#3A5A3A] ${location.pathname === '/pet-data-log' ? 'text-[#FFD700]' : 'text-white'}`}
            aria-label="Full Data Log"
            title="Full Data Log"
          >
            <span className="material-symbols-outlined leading-none align-middle text-[22px]">list</span>
          </button>
        </div>
        {userAvatar ? (
          <img
            src={userAvatar}
            alt="User"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-white/20"
            referrerPolicy="no-referrer"
            title={userEmail || displayName}
            onClick={toggleUserMenu}
            onLoad={() => {
              if (import.meta?.env?.MODE !== 'production') {
                // eslint-disable-next-line no-console
                console.log('[NavBar] avatar loaded OK');
              }
            }}
            onError={() => setUserAvatar(null)}
          />
        ) : (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 text-white flex items-center justify-center font-semibold cursor-pointer" title={userEmail || displayName} onClick={toggleUserMenu}>
            {userInitial}
          </div>
        )}
        <span className="hidden sm:inline text-white font-medium" title={userEmail || displayName} aria-label={userEmail || displayName}>{displayName}</span>
        <button
          onClick={toggleUserMenu}
          className="hidden sm:flex items-center p-2 rounded-full hover:bg-[#3A5A3A]"
          aria-haspopup="menu"
          aria-expanded={dropdownOpen}
          aria-label="User menu"
        >
          <span className="material-symbols-outlined leading-none align-middle text-white text-[20px] sm:text-[24px]">expand_more</span>
        </button>
        {dropdownOpen && createPortal(
          <>
            <div className="fixed inset-0 z-[998]" onMouseDown={() => setDropdownOpen(false)} aria-hidden="true" />
            <div
              className="fixed z-[999] bg-white border border-[#E8E6E1] rounded-lg shadow-lg min-w-[220px] max-w-[92vw] flex flex-col gap-2 p-3"
              style={{ top: `${menuPos.top}px`, ...(menuPos.left != null ? { left: `${menuPos.left}px` } : { right: `${menuPos.right}px` }) }}
              role="menu"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Toggle header: User | Pets */}
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setMenuType('user')} className={`px-3 py-1 rounded-full text-sm font-medium ${menuType==='user' ? 'bg-[#E7F2E7] text-[#294B29]' : 'text-[#294B29]/70 hover:bg-[#F3F7F3]'}`}>User</button>
                <button onClick={() => setMenuType('pet')} className={`sm:hidden sm:hidden sm:hidden sm:hidden sm:hidden sm:hidden sm:hidden sm:hidden sm:hidden sm:hidden sm:hidden sm:hidden sm:hidden sm:hidden sm:hidden px-3 py-1 rounded-full text-sm font-medium ${menuType==='pet' ? 'bg-[#E7F2E7] text-[#294B29]' : 'text-[#294B29]/70 hover:bg-[#F3F7F3]'}`}>Pets</button>
              </div>

              {menuType === 'pet' ? (
                <div className="max-h-[50vh] overflow-y-auto pr-1">
                  {pets?.length ? pets.map((pet, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setSelectedPet(pet.id); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#F3F7F3] text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#E7F2E7] flex items-center justify-center overflow-hidden">
                        <img
                          src={pet.photoUrl || 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\' viewBox=\'0 0 80 80\'><rect width=\'100%\' height=\'100%\' fill=\'%23E7F2E7\'/><g fill=\'%234A654A\'><circle cx=\'24\' cy=\'28\' r=\'7\'/><circle cx=\'56\' cy=\'28\' r=\'7\'/><circle cx=\'40\' cy=\'22\' r=\'6\'/><path d=\'M40 38c-10 0-18 8-18 18 0 4 3 7 7 7h22c4 0 7-3 7-7 0-10-8-18-18-18z\'/></g></svg>'}
                          alt={pet.name}
                          className="hidden sm:block w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-[#294B29] font-medium">{pet.name}</span>
                    </button>
                  )) : (
                    <div className="px-4 py-2 text-sm text-[#6B7D6B]">No pets yet</div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {/* Mobile-only quick links hidden from top bar on xs */}
                  <button
                    onClick={() => handleNavigate('/pet-data-log')}
                    className="sm:hidden w-full text-left px-4 py-2 rounded-lg hover:bg-[#F3F7F3] text-[#294B29] flex justify-between items-center"
                    role="menuitem"
                  >
                    Full Data Log <span className='ml-2'>&#8250;</span>
                  </button>
                  <button
                    onClick={() => handleNavigate('/about')}
                    className="sm:hidden w-full text-left px-4 py-2 rounded-lg hover:bg-[#F3F7F3] text-[#294B29] flex justify-between items-center"
                    role="menuitem"
                  >
                    About <span className='ml-2'>&#8250;</span>
                  </button>
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
                    onClick={() => handleNavigate('/settings')}
                    className="w-full text-left px-4 py-2 bg-[#4A654A] text-white rounded-lg hover:bg-[#3D7A3D] transition-colors flex justify-between items-center"
                    role="menuitem"
                  >
                    User Preferences <span className='ml-2'>&#8250;</span>
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
          </>,
          document.body
        )}
      </div>
    </nav>
  );
};

export default NavBar;