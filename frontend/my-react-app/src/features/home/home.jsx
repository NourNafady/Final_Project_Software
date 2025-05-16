import React from 'react'
import ClinicList from "./components/clinicList";
import ClinicCard from "./components/clinic_card";
import "./styles/home.css";

function HomeScreen() {
    // Define the handler function
    const handleDepartmentClick = (departmentId) => {

      console.log("Department clicked:", departmentId);

    };

    return (
      <div className="home-screen">
        <header className="home-header">
          <h1 >Medical Departments</h1>
          <p>Choose a medical department to explore services</p>
        </header>
        
        <div className="departments-grid">
          {ClinicList.map((clinic) => (
            <div className="department-grid-item" key={clinic.id}>
              <ClinicCard 
                name={clinic.name} 
                description={clinic.description} 
                icon={clinic.icon}
                onClick={() => handleDepartmentClick(clinic.id)}
              />
            </div>
          ))}
        </div>
        
        <footer className="home-footer">
          <p>Need help finding the right department? <a href="/contact">Contact us</a></p>
        </footer>
      </div>
    );
  }
  
  export default HomeScreen;
