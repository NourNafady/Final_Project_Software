import { NavLink } from 'react-router-dom';
import "./styles/navBar.css";

export default function Navbar() {
    return (
      <div className="navbar-container">
        <nav className="navbar">
          <div className="left-section">
            <div className="logo">
            </div>
            <ul className="nav-links">
              <li><NavLink to="/signup">signup</NavLink></li>
              <li><NavLink to="/signin">signin</NavLink></li>
              <li><NavLink to="/">home</NavLink></li>
  
            </ul>
          </div>
          {/* <div className="user-email"> */}
            {/* <span>lhyee@gmail.com</span> */}
          {/* </div> */}
        </nav>
      </div>
    );
  }