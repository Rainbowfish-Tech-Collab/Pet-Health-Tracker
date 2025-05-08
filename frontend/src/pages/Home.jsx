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
    padding: '1rem',
    borderTop: '1px solid #eee',
  },
  navButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
};

function Home() {
  const navigate = useNavigate();
  const [selectedPet, setSelectedPet] = useState('');
  const [graphType, setGraphType] = useState('Walking vs. Time');

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
        {/* We'll add the data log table here */}
      </div>

      {/* Navigation Bar */}
      <div style={styles.navbar}>
        <button 
          style={styles.navButton} 
          onClick={() => navigate('/pet-data-log')}
          title="View Pet Data Log"
        >
          <FaEdit />
        </button>
        <button 
          style={styles.navButton} 
          onClick={() => navigate('/add-entry')}
          title="Add New Entry"
        >
          <FaPlus />
        </button>
        <button 
          style={styles.navButton} 
          onClick={() => navigate('/settings')}
          title="Settings"
        >
          <FaCog />
        </button>
      </div>
    </div>
  );
}

export default Home;

//default is line graph
//routes: GET /activities/activityId, GET /symptoms/symptomId, GET /istatId
//Pet data log will show most recent entries, last 7 days. This will be displayed in a Pet Data Log table.
//Navbar at the bottom will have three buttons, left button to access pet data log. Middle button is to add specific data entry. Right button will be to access settings.