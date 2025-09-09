import { useState, useEffect } from "react";
import MobileContainer from "../components/MobileContainer";
import TopElement from "../components/TopElement";
import MobileContent from "../components/MobileContent";

const UserPreferences = () => {
  const [showTimestamps, setShowTimestamps] = useState(true);
  // Load preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("showTimestamps");
    if (stored !== null) {
      setShowTimestamps(JSON.parse(stored));
    }
  }, []);

  // Update localStorage when toggled
  const handleToggle = (e) => {
    const checked = e.target.checked;
    setShowTimestamps(checked);
    localStorage.setItem("showTimestamps", JSON.stringify(checked));
  };

  return (
    <MobileContainer>
      <TopElement title="User Preferences" />
      <MobileContent>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={showTimestamps}
            onChange={handleToggle}
          />
          Include Time Stamp in Logs
        </label>
      </MobileContent>
      
    </MobileContainer>
  )
}


export default UserPreferences;