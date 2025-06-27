import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/Logo.svg';
import { FaEdit, FaPlus, FaCog, FaChevronDown, FaCheck, FaExclamationCircle } from 'react-icons/fa';

// Styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    padding: '1rem',
    gap: '1rem',
    backgroundColor: '#FAF9F6',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.5rem',
    borderBottom: '1px solid #E8E6E1',
    marginBottom: '0.5rem',
  },
  logo: {
    width: '32px',
    height: '32px',
    objectFit: 'contain',
    padding: '4px',
    backgroundColor: '#D1E9D7',
    borderRadius: '12px',
  },
  petSelectorContainer: {
    flex: 1,
    position: 'relative',
  },
  petSelector: {
    width: '100%',
    padding: '0.75rem',
    paddingRight: '2.5rem',
    borderRadius: '12px',
    border: '1px solid #E8E6E1',
    backgroundColor: '#FFFFFF',
    fontSize: '1rem',
    color: '#2D3F2D',
    appearance: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: '#4A654A',
    },
    '&:focus': {
      outline: 'none',
      borderColor: '#4A654A',
      boxShadow: '0 0 0 3px rgba(74,101,74,0.1)',
    },
  },
  selectorIcon: {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#4A654A',
    pointerEvents: 'none',
    fontSize: '0.875rem',
  },
  graphSection: {
    padding: '1.25rem',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E8E6E1',
  },
  graphTypeSelector: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '12px',
    border: '1px solid #E8E6E1',
    backgroundColor: '#FFFFFF',
    fontSize: '0.9rem',
    marginBottom: '1rem',
    color: '#2D3F2D',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: '#4A654A',
    },
    '&:focus': {
      outline: 'none',
      borderColor: '#4A654A',
      boxShadow: '0 0 0 3px rgba(74,101,74,0.1)',
    },
  },
  dataLog: {
    flex: 1,
    overflowY: 'auto',
  },
  dataLogTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#2D3F2D',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #E8E6E1',
  },
  logEntry: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem',
    borderBottom: '1px solid #E8E6E1',
    gap: '1rem',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#FAF9F6',
    },
  },
  logDate: {
    width: '90px',
    fontSize: '0.875rem',
    color: '#6B7D6B',
    fontWeight: '500',
  },
  logType: {
    flex: 1,
    fontSize: '0.9375rem',
    color: '#2D3F2D',
    fontWeight: '500',
  },
  logValue: {
    fontSize: '0.9375rem',
    color: '#2D3F2D',
    fontWeight: '600',
    padding: '0.25rem 0.75rem',
    backgroundColor: '#F3F7F3',
    borderRadius: '8px',
    minWidth: '60px',
    textAlign: 'center',
  },
  logIcon: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '0.75rem 1.25rem',
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #E8E6E1',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
  },
  navButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    color: '#6B7D6B',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#F3F7F3',
      color: '#2D4A2D',
    },
  },
  navButtonLabel: {
    fontSize: '0.75rem',
    marginTop: '0.25rem',
    fontWeight: '500',
  },
  navButtonActive: {
    color: '#2D4A2D',
    backgroundColor: '#F3F7F3',
  },
};

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
          <div style={{ ...styles.logIcon, backgroundColor: '#E7F2E7' }}>
            <FaCheck style={{ color: '#3D7A3D' }} />
          </div>
        );
      case 'warning':
        return (
          <div style={{ ...styles.logIcon, backgroundColor: '#FFF3E6' }}>
            <FaExclamationCircle style={{ color: '#CC7A00' }} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <img src={Logo} alt="Pet Health Tracker" style={styles.logo} />
          <div style={styles.petSelectorContainer}>
            <select 
              style={styles.petSelector}
              value={selectedPet}
              onChange={(e) => setSelectedPet(e.target.value)}
            >
              <option value="whiskers">Whiskers</option>
            </select>
            <FaChevronDown style={styles.selectorIcon} />
          </div>
        </div>

        <div style={styles.graphSection}>
          <select
            style={styles.graphTypeSelector}
            value="activity"
            onChange={(e) => {}}
          >
            <option value="activity">Activity vs. Time</option>
            <option value="weight">Weight vs. Time</option>
          </select>
          <div style={{ height: '200px', backgroundColor: '#F5F5F5', borderRadius: '8px' }}>
            {/* Graph placeholder */}
          </div>
        </div>

        <div style={styles.dataLog}>
          <div style={styles.dataLogTitle}>Data Log</div>
          {recentLogs.map((log, index) => (
            <div key={index} style={styles.logEntry}>
              <span style={styles.logDate}>{log.date}</span>
              <span style={styles.logType}>{log.type}</span>
              <span style={styles.logValue}>{log.value}</span>
              <span style={styles.logIcon}>
                {getLogIcon(log.icon)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.navbar}>
        <button 
          style={{
            ...styles.navButton,
            ...(activeTab === 'log' ? styles.navButtonActive : {})
          }}
          onClick={() => {
            setActiveTab('log');
            navigate('/pet-data-log');
          }}
        >
          <FaEdit />
          <span style={styles.navButtonLabel}>Log</span>
        </button>
        <button 
          style={{
            ...styles.navButton,
            ...(activeTab === 'add' ? styles.navButtonActive : {})
          }}
          onClick={() => {
            setActiveTab('add');
            navigate('/add-entry');
          }}
        >
          <FaPlus />
          <span style={styles.navButtonLabel}>Add</span>
        </button>
        <button 
          style={{
            ...styles.navButton,
            ...(activeTab === 'settings' ? styles.navButtonActive : {})
          }}
          onClick={() => {
            setActiveTab('settings');
            navigate('/settings');
          }}
        >
          <FaCog />
          <span style={styles.navButtonLabel}>Settings</span>
        </button>
      </div>
    </div>
  );
}

export default Home;