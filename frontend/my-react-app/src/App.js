import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import logo from "./logo.svg";
import Signup from "./features/register/signup.jsx";
import Signin from "./features/register/signin.jsx";
import NavBar from "./core/components/navBar.jsx";
import Home from "./features/home/home.jsx";

// Example Home component

// Example About component



function App() {
  return (
    <Router>
      {/* //! replace with our navbar */}
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        {/* <Route path="/about" element={<About />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
