import Logo from '../assets/Logo.svg';
import PetLogoName from '../assets/PetLogoName.svg';

function Home() {
    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            <nav>
            </nav>
            <img src={Logo} alt="Logo" />
            <img src={PetLogoName} alt="Pet Logo Name" />
        </div>
    );
}

export default Home;

//default is line graph
//routes: GET /activities/activityId, GET /symptoms/symptomId, GET /istatId
//Pet data log will show most recent entries, last 7 days. This will be displayed in a Pet Data Log table.
//Navbar at the bottom will have three buttons, left button to access pet data log. Middle button is to add specific data entry. Right button will be to access settings.