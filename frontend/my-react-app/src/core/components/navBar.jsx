import { NavLink } from 'react-router-dom';
import "./styles/navBar.css";

export default function Navbar() {
  const isDoctor = () => {
    return (
      localStorage.getItem("userType") === "doctor" ||
      localStorage.getItem("rememberDoctor") === "true"
    );
  };
  
  return (
    <div className="navbar-container">
      <nav className="navbar">
        <div className="left-section">
          <div className="logo">
          </div>
          <ul className="nav-links">
            <li><NavLink to="/signup">signup</NavLink></li>
            <li><NavLink to="/signin">signin</NavLink></li>
            {isDoctor() ? <li><NavLink to="/">home</NavLink></li> : null} 
            {!isDoctor() ? <li><NavLink to="/doctorApp">doctors</NavLink></li> : null} 
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