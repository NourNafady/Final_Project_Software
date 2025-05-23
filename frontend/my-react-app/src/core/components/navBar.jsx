import { NavLink } from 'react-router-dom';
import "./styles/navBar.css";

export default function Navbar() {
  const isDoctor = () => {
    return (
      localStorage.getItem("userType") === "doctor" ||
      localStorage.getItem("rememberDoctor") === "true"
    );
  };

  const isPatient = () => {
    return localStorage.getItem("userType") === "patient";
  };
  
  return (
    <div className="navbar-container">
      <nav className="navbar">
        <div className="left-section">
          <div className="logo">
          </div>
          <ul className="nav-links">
            {isPatient() ? (
              <>
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="/signup">Sign Up</NavLink></li>
                <li><NavLink to="/signin">Sign In</NavLink></li>
                <li><NavLink to="/my-appointments">My Appointments</NavLink></li>
              </>
            ) : isDoctor() ? (
              <>
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="/signup">Sign Up</NavLink></li>
                <li><NavLink to="/signin">Sign In</NavLink></li>
                <li><NavLink to="/doctorApp">Doctors</NavLink></li>
              </>
            ) : null}
          </ul>
        </div>
        <div className="user-email">
          {localStorage.getItem("userEmail") && (
            <span>{localStorage.getItem("userEmail")}</span>
          )}
        </div>
      </nav>
    </div>
  );
}