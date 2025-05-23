import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import NavBar from "./core/components/navBar.jsx";
import DoctorAppointment from "./features/doctor_appointment/DoctorAppointment.jsx";
import Doctors from "./features/doctors_page/doctors.jsx";
import Home from "./features/home/home.jsx";
import Signin from "./features/register/signin.jsx";
import Signup from "./features/register/signup.jsx";
import PatientAppointment from "./features/patient/Patient.jsx";

function App() {
  // Helper function to check if user is a doctor
  // const isDoctor = () => {
  //   return (
  //     localStorage.getItem("userType") === "doctor" ||
  //     localStorage.getItem("rememberDoctor") === "true"
  //   );
  // };

  return (
    <Router>
      <NavBar />
      <Routes>
        {/* Define all routes, not conditionally */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctorApp" element={<DoctorAppointment />} />
        <Route path="/" element={<Home />} />
        <Route path="/my-appointments" element={<PatientAppointment />} />

        {/* <Route
          path="/doctorApp"
          element={isDoctor() ? <DoctorAppointment /> : <Navigate to="/" />}
        /> */}
      </Routes>
    </Router>
  );
}

export default App;
