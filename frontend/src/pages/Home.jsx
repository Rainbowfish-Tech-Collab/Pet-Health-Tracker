import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/Logo.svg';
import { FaEdit, FaPlus, FaCog, FaChevronDown, FaCheck, FaExclamationCircle } from 'react-icons/fa';

function Home() {
  const navigate = useNavigate();
  const [selectedPet, setSelectedPet] = useState('');
  const [pets, setPets] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [recentLogs, setRecentLogs] = useState([
    { date: '05/17/2025', type: 'Activity', value: '0.25 hr', icon: 'check' },
    { date: '12/28/2025', type: 'Symptom', value: 'Fainting', icon: 'warning' },
    { date: '05/17/2025', type: 'Activity', value: '0.25 hr', icon: 'check' },
    { date: '12/28/2025', type: 'Symptom', value: 'Fainting', icon: 'warning' },
  ]);

  const getLogIcon = (icon) => {
    switch (icon) {
      case 'check':
        return (
          <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#E7F2E7]">
            <FaCheck className="text-[#3D7A3D]" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#FFF3E6]">
            <FaExclamationCircle className="text-[#CC7A00]" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 gap-4 bg-[#FAF9F6]">
      <div className="flex-1 bg-white rounded-[20px] p-5 flex flex-col gap-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4 p-2 border-b border-[#E8E6E1] mb-2">
          <img 
            src={Logo} 
            alt="Pet Health Tracker" 
            className="w-24 h-20 object-contain p-3 bg-[#D1E9D7] rounded-xl"
          />
          <div className="flex-1 relative">
            <select 
              value={selectedPet}
              onChange={(e) => setSelectedPet(e.target.value)}
              className="w-full py-3 px-4 pr-10 rounded-xl border border-[#E8E6E1] bg-white text-[#2D3F2D] text-base appearance-none cursor-pointer hover:border-[#4A654A] focus:outline-none focus:border-[#4A654A] focus:ring-2 focus:ring-[#4A654A]/10"
            >
              <option value="whiskers">Whiskers</option>
            </select>
            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A654A] pointer-events-none text-sm" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E8E6E1]">
          <select
            className="w-full py-3 px-4 rounded-xl border border-[#E8E6E1] bg-white text-[#2D3F2D] text-[0.9rem] mb-4 hover:border-[#4A654A] focus:outline-none focus:border-[#4A654A] focus:ring-2 focus:ring-[#4A654A]/10"
            value="activity"
            onChange={(e) => {}}
          >
            <option value="activity">Activity vs. Time</option>
            <option value="weight">Weight vs. Time</option>
          </select>
          <div className="h-[200px] bg-[#F5F5F5] rounded-lg">
            {/* Graph placeholder */}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="text-lg font-semibold text-[#2D3F2D] mb-4 pb-2 border-b border-[#E8E6E1]">
            Data Log
          </div>
          {recentLogs.map((log, index) => (
            <div key={index} className="flex items-center p-4 border-b border-[#E8E6E1] gap-4 hover:bg-[#FAF9F6] transition-colors">
              <span className="w-[90px] text-sm text-[#6B7D6B] font-medium">
                {log.date}
              </span>
              <span className="flex-1 text-[0.9375rem] text-[#2D3F2D] font-medium">
                {log.type}
              </span>
              <span className="text-[0.9375rem] text-[#2D3F2D] font-semibold px-3 py-1 bg-[#F3F7F3] rounded-lg min-w-[60px] text-center">
                {log.value}
              </span>
              {getLogIcon(log.icon)}
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 flex justify-around items-center py-3 px-5 bg-white border-t border-[#E8E6E1] shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => {
            setActiveTab('log');
            navigate('/pet-data-log');
          }}
          className={`flex flex-col items-center text-xl cursor-pointer px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'log' 
              ? 'text-[#2D4A2D] bg-[#F3F7F3]' 
              : 'text-[#6B7D6B] hover:bg-[#F3F7F3] hover:text-[#2D4A2D]'
          }`}
        >
          <FaEdit />
          <span className="text-xs mt-1 font-medium">Log</span>
        </button>
        <button 
          onClick={() => {
            setActiveTab('add');
            navigate('/add-entry');
          }}
          className={`flex flex-col items-center text-xl cursor-pointer px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'add' 
              ? 'text-[#2D4A2D] bg-[#F3F7F3]' 
              : 'text-[#6B7D6B] hover:bg-[#F3F7F3] hover:text-[#2D4A2D]'
          }`}
        >
          <FaPlus />
          <span className="text-xs mt-1 font-medium">Add</span>
        </button>
        <button 
          onClick={() => {
            setActiveTab('settings');
            navigate('/settings');
          }}
          className={`flex flex-col items-center text-xl cursor-pointer px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'settings' 
              ? 'text-[#2D4A2D] bg-[#F3F7F3]' 
              : 'text-[#6B7D6B] hover:bg-[#F3F7F3] hover:text-[#2D4A2D]'
          }`}
        >
          <FaCog />
          <span className="text-xs mt-1 font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
}

export default Home;