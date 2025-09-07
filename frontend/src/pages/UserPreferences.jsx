import MobileContainer from "../components/MobileContainer";
import TopElement from "../components/TopElement";
import MobileContent from "../components/MobileContent";
const UserPreferences = () => {
  return (
    <MobileContainer>
      <TopElement title="User Preferences" />
      <MobileContent>
        <input type = "checkbox" className="toggle toggle-primary" checked /> Include Time Stamp in Logs
      </MobileContent>
      
    </MobileContainer>
  )
}


export default UserPreferences;