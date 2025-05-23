import React, { useEffect, useState } from 'react';
import ClinicCard from "./components/clinic_card";
import { useNavigate } from 'react-router-dom';
import "./styles/home.css";
import {
  FaStethoscope, FaHeart, FaBrain, FaBaby, FaRunning, FaUser, FaSmile, FaShieldAlt
} from 'react-icons/fa';

const iconMap = {
  "General Medicine": FaStethoscope,
  "Cardiology": FaHeart,
  "Neurology": FaBrain,
  "Pediatrics": FaBaby,
  "Physical Therapy": FaRunning,
  "Mental Health": FaUser,
  "General Dentistry": FaSmile,
  "Insurance": FaShieldAlt
};

function HomeScreen() {
  const [clinics, setClinics] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:4000/clinics')
      .then(res => res.json())
      .then(data => setClinics(data))
      .catch(() => setClinics([]));
  }, []);

  const handleClinicClick = (clinicId) => {
    navigate(`/doctors?clinic=${clinicId}`);
  };

  return (
    <div className="home-screen">
      <header className="home-header">
        <h1>Medical Departments</h1>
        <p>Choose a medical department to explore services</p>
      </header>
      <div className="departments-grid">
        {clinics.map((clinic) => {
          const Icon = iconMap[clinic.name] || FaStethoscope;
          return (
            <div className="department-grid-item" key={clinic.id}>
              <ClinicCard
                name={clinic.name}
                description={clinic.description}
                address={clinic.address}
                phone={clinic.phone}
                 openTime={clinic.open_time}
                 closeTime={clinic.close_time}
                //  days={clinic.days} 
                icon={Icon}
                onClick={() => handleClinicClick(clinic.id)}
              />
            </div>
          );
        })}
      </div>
      <footer className="home-footer">
        <p>Need help finding the right department? <a href="/contact">Contact us</a></p>
      </footer>
    </div>
  );
}

export default HomeScreen;
