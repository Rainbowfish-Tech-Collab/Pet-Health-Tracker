import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/Logo.svg';
import { FaCheck, FaExclamationCircle } from 'react-icons/fa';
import MobileContainer from '../components/MobileContainer.jsx';
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
import NavBar from '../components/NavBar';

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
    { date: '05/17/2025', type: 'Activity', value: '0.25 hr' },
    { date: '12/28/2025', type: 'Symptom', value: 'Fainting' },
    { date: '05/17/2025', type: 'Activity', value: '1.25 hr' },
    { date: '12/28/2025', type: 'Symptom', value: 'Sneezing' },
  ]);

  const concerningSymptoms = ['Fainting', 'Vomiting', 'Seizure', 'Collapse'];
  const activityGoalHours = 1.0;

  const getLogIcon = (log) => {
    if (log.type === 'Symptom' && concerningSymptoms.includes(log.value)) {
      // Show warning icon for concerning symptoms
      return (
        <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#FFF3E6]">
          <FaExclamationCircle className="text-[#CC7A00]" />
        </div>
      );
    }
    if (log.type === 'Activity') {
      // Parse hours from value string like "1.25 hr"
      const match = log.value.match(/^([\d.]+)\s*hr$/);
      if (match && parseFloat(match[1]) >= activityGoalHours) {
        // Show checkmark if activity meets/exceeds goal
        return (
          <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#E7F2E7]">
            <FaCheck className="text-[#3D7A3D]" />
          </div>
        );
      }
    }
    // No icon for other cases
    return null;
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
    <MobileContainer>
      <div className="w-full flex flex-col gap-4 overflow-x-hidden">
        <NavBar pets={pets} selectedPet={selectedPet} setSelectedPet={setSelectedPet} />
        <div className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <div className="p-4 bg-white rounded-2xl border border-[#E8E6E1]">
            <select
              className="w-full px-4 py-3 rounded-lg border border-[#E8E6E1] bg-white text-[#2D3F2D] text-sm mb-4 cursor-pointer appearance-none"
              value={selectedGraphType}
              onChange={(e) => setSelectedGraphType(e.target.value)}
              disabled={isLoading || !selectedPet}
            >
              <option value="activity">Walking vs. Time</option>
              <option value="weight">Weight vs. Time</option>
              <option value="symptoms">Symptoms vs. Time</option>
              <option value="bodily">Bodily Functions vs. Time</option>
            </select>
            <div className="relative h-[240px] sm:h-[300px] bg-white rounded-lg p-4">
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[#6B7D6B]">
                  <div className="w-10 h-10 border-4 border-[#E7F2E7] border-t-[#2D4A2D] rounded-full animate-spin mb-4" />
                  Loading data...
                </div>
              ) : error ? (
                <div className="absolute inset-0 m-auto text-center text-[#CC7A00] bg-[#FFF3E6] p-4 rounded-lg w-[80%]">
                  <FaExclamationCircle className="text-2xl mx-auto mb-2" />
                  <div>{error}</div>
                </div>
              ) : !chartData?.datasets?.[0]?.data?.length ? (
                <div className="absolute inset-0 flex items-center justify-center text-[#6B7D6B]">
                  No data available for this time period
                </div>
              ) : (
                <Line options={getChartOptions(selectedGraphType)} data={chartData} className="max-h-full" />
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
                {getLogIcon(log)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}

export default Home;