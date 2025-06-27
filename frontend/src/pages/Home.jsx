//default is line graph
//routes: GET /activities/activityId, GET /symptoms/symptomId, GET /istatId
//Pet data log will show most recent entries, last 7 days. This will be displayed in a Pet Data Log table.
//Navbar at the bottom will have three buttons, left button to access pet data log. Middle button is to add specific data entry. Right button will be to access settings.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/Logo.svg';
import PetLogoName from '../assets/PetLogoName.svg';
import { FaEdit, FaPlus, FaCog } from 'react-icons/fa';

// Styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    padding: '1rem',
    gap: '1rem',
    paddingBottom: '4rem', // Add space for fixed navbar
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  petSelector: {
    flex: 1,
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  graphSection: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    padding: '1rem',
  },
  dataLog: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    padding: '1rem',
    overflowY: 'auto',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e0e0e0',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
  },
  navButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    color: '#666',
    padding: '0.5rem 1rem',
    transition: 'color 0.2s ease',
    gap: '0.25rem',
  },
  navButtonLabel: {
    fontSize: '0.75rem',
    marginTop: '0.25rem',
    fontWeight: '500',
  },
  navButtonActive: {
    color: '#007AFF',
  },
};

function Home() {
  const navigate = useNavigate();
  const [selectedPet, setSelectedPet] = useState('');
  const [graphType, setGraphType] = useState('Walking vs. Time');
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <img src={Logo} alt="Logo" style={{ width: '40px', height: '40px' }} />
        <select 
          style={styles.petSelector}
          value={selectedPet}
          onChange={(e) => setSelectedPet(e.target.value)}
        >
          <option value="">Select Pet</option>
          {/* We'll populate this with actual pet data later */}
          <option value="pet1">Pet 1</option>
        </select>
      </div>

      {/* Graph Section */}
      <div style={styles.graphSection}>
        <select
          value={graphType}
          onChange={(e) => setGraphType(e.target.value)}
          style={styles.petSelector}
        >
          <option value="Walking vs. Time">Walking vs. Time</option>
          {/* Add more graph types as needed */}
        </select>
        <div>
          {/* Graph component */}
        </div>
      </div>

      {/* Pet Data Log Section */}
      <div style={styles.dataLog}>
        <h3>Pet Data Log</h3>
        {/* data log table here */}
      </div>

      {/* Navigation Bar */}
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
          title="View Pet Data Log"
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
          title="Add New Entry"
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
          title="Settings"
        >
          <FaCog />
          <span style={styles.navButtonLabel}>Settings</span>
        </button>
      </div>
    </div>
  );
}

export default Home;