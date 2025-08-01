import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/Logo.svg';
import { FaEdit, FaPlus, FaCog, FaChevronDown, FaCheck, FaExclamationCircle, FaTrash } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Chart options generator based on graph type
const getChartOptions = (graphType) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: false
    },
    tooltip: {
      backgroundColor: '#2D4A2D',
      titleColor: '#FFFFFF',
      bodyColor: '#FFFFFF',
      padding: 12,
      displayColors: false,
      callbacks: {
        label: (context) => {
          const value = context.parsed.y;
          if (graphType === 'activity') {
            return `${value} hours`;
          } else if (graphType === 'weight') {
            return `${value} lbs`;
          }
          return value;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#E8E6E1',
        drawBorder: false
      },
      ticks: {
        color: '#6B7D6B',
        padding: 8,
        callback: (value) => {
          if (graphType === 'activity') {
            return `${value}h`;
          } else if (graphType === 'weight') {
            return `${value}lb`;
          }
          return value;
        }
      }
    },
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        color: '#6B7D6B',
        padding: 8,
        maxRotation: 0
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index'
  },
  elements: {
    line: {
      tension: 0.4
    }
  }
});

function Home() {
  const navigate = useNavigate();
  // The currently selected pet's ID. Set to empty string initially.
  const [selectedPet, setSelectedPet] = useState('');
  const [pets, setPets] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [selectedGraphType, setSelectedGraphType] = useState('activity');
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

  // Fetch chart data when pet or graph type changes
  useEffect(() => {
    const fetchChartData = async () => {
      if (!selectedPet) return;
      setIsLoading(true);
      try {
        let endpoint = '';
        switch (selectedGraphType) {
          case 'activity':
            endpoint = `/pets/${selectedPet}/activities?graph=true`;
            break;
          case 'symptoms':
            endpoint = `/symptoms?petId=${selectedPet}&graph=true`;
            break;
          case 'bodily':
            endpoint = `/pets/${selectedPet}/bodilyFunctions?graph=true`;
            break;
          case 'weight':
            endpoint = `/pets/${selectedPet}/weights?graph=true`;
            break;
          default:
            throw new Error('Invalid graph type');
        }
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`Failed to fetch ${selectedGraphType} data`);
        const data = await response.json();

        // Transform and sort data by date
        const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Format dates and values
        const labels = sortedData.map(item => {
          const date = new Date(item.timestamp);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        const values = sortedData.map(item => {
          switch (selectedGraphType) {
            case 'activity':
              // Use duration_in_hours or value
              return Number(item.duration_in_hours ?? item.value ?? 0);
            case 'weight':
              return Number(item.value);
            case 'symptoms':
            case 'bodily':
              return Number(item.value ?? 1); // Each occurrence counts as 1
            default:
              return item.value;
          }
        });

        let chartLabel = '';
        switch (selectedGraphType) {
          case 'activity':
            chartLabel = 'Walking Time (hours)';
            break;
          case 'weight':
            chartLabel = 'Weight (lbs)';
            break;
          case 'symptoms':
            chartLabel = 'Symptom Occurrences';
            break;
          case 'bodily':
            chartLabel = 'Function Occurrences';
            break;
          default:
            chartLabel = 'Value';
        }
        setChartData({
          labels,
          datasets: [
            {
              label: chartLabel,
              data: values,
              borderColor: '#2D4A2D',
              backgroundColor: selectedGraphType === 'symptoms' || selectedGraphType === 'bodily' ?
                'rgba(45, 74, 45, 0.2)' : '#E7F2E7',
              fill: true,
              pointBackgroundColor: '#FFFFFF',
              pointBorderColor: '#2D4A2D',
              pointBorderWidth: 2,
              pointRadius: selectedGraphType === 'symptoms' || selectedGraphType === 'bodily' ? 6 : 4,
              pointHoverRadius: selectedGraphType === 'symptoms' || selectedGraphType === 'bodily' ? 8 : 6,
              borderWidth: 2,
              stepped: selectedGraphType === 'symptoms' || selectedGraphType === 'bodily'
            }
          ]
        });
      } catch (err) {
        setError(`Could not load ${selectedGraphType} data`);
        console.error(`Error fetching ${selectedGraphType} data:`, err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChartData();
  }, [selectedPet, selectedGraphType]);

  // Fetch pets list
  // Fetch pets list on mount
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch('/pets');
        if (!response.ok) throw new Error('Failed to fetch pets list');
        const data = await response.json();
        setPets(data);
      } catch (err) {
        console.error('Error fetching pets list:', err);
      }
    };
    fetchPets();
  }, []);

  // When pets are loaded and no pet is selected, select the first pet by default
  useEffect(() => {
    if (pets.length > 0 && !selectedPet) {
      setSelectedPet(pets[0].id);
    }
  }, [pets, selectedPet]);


  return (
    <div className="flex flex-col h-screen p-3 gap-4" style={{ backgroundColor: '#FCF9ED' }}>
      <div className="flex-1 bg-white rounded-[20px] p-5 flex flex-col gap-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4 p-2 border-b border-[#E8E6E1] mb-2 bg-transparent">
          <div className="rounded-2xl p-2" style={{ backgroundColor: 'rgba(202,228,197,1)' }}>
            <img 
              src={Logo} 
              alt="Pet Health Tracker" 
              className="w-20 h-16 object-contain" 
            />
          </div>
          <div className="flex-1 relative">
            <select 
              value={selectedPet}
              onChange={(e) => setSelectedPet(e.target.value)}
              className="w-full py-3 px-4 pr-10 rounded-xl border border-[#E8E6E1] bg-white text-[#2D3F2D] text-base appearance-none cursor-pointer hover:border-[#4A654A] focus:outline-none focus:border-[#4A654A] focus:ring-2 focus:ring-[#4A654A]/10"
            >
              {pets.map((pet, index) => (
                <option key={index} value={pet.id}>{pet.name}</option>
              ))}
            </select>
            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A654A] pointer-events-none text-sm" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E8E6E1]">
          <select
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #E8E6E1',
              backgroundColor: '#FFFFFF',
              color: '#2D3F2D',
              fontSize: '0.9rem',
              marginBottom: '16px',
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none',
            }}
            value={selectedGraphType}
            onChange={(e) => setSelectedGraphType(e.target.value)}
            disabled={isLoading || !selectedPet}
          >
            <option value="activity">Walking vs. Time</option>
            <option value="weight">Weight vs. Time</option>
            <option value="symptoms">Symptoms vs. Time</option>
            <option value="bodily">Bodily Functions vs. Time</option>
          </select>
          <div style={{ 
            height: '300px',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            padding: '1rem',
            position: 'relative'
          }}>
            {isLoading ? (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: '#6B7D6B'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #E7F2E7',
                  borderTop: '3px solid #2D4A2D',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 1rem'
                }} />
                Loading data...
              </div>
            ) : error ? (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: '#CC7A00',
                backgroundColor: '#FFF3E6',
                padding: '1rem',
                borderRadius: '8px',
                width: '80%'
              }}>
                <FaExclamationCircle style={{ fontSize: '24px', marginBottom: '0.5rem' }} />
                <div>{error}</div>
              </div>
            ) : !chartData?.datasets?.[0]?.data?.length ? (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: '#6B7D6B'
              }}>
                No data available for this time period
              </div>
            ) : (
              <Line 
                options={getChartOptions(selectedGraphType)} 
                data={chartData}
                style={{ maxHeight: '100%' }}
              />
            )}
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