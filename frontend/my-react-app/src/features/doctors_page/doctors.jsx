import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DoctorCard from './components/DoctorCard';
import "./styles/doctors.css";

export default function Doctors() {
  const [searchParams] = useSearchParams();
  const clinicId = searchParams.get('clinic'); 
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch doctors data from backend based on department ID
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!clinicId) { 
        setDoctors([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        // Fetch doctors by clinic_id
        const response = await fetch(`http://localhost:4000/doctors?clinic_id=${clinicId}`); 
        
        if (!response.ok) {
          throw new Error(`Failed to fetch doctors: ${response.status} ${response.statusText}`);
        }
        
        const doctorsData = await response.json();
        
        // For each doctor, fetch their available time slots
        const doctorsWithSlots = await Promise.all(
          doctorsData.map(async (doctor) => {
            try {
              const slotsResponse = await fetch(`http://localhost:4000/doctor/${doctor.id}/time-slots`);
              if (!slotsResponse.ok) {
                throw new Error(`Failed to fetch time slots`);
              }
              
              const slots = await slotsResponse.json();
              return {
                ...doctor,
                availableSlots: slots.map(slot => ({
                  id: slot.id,
                  date: slot.date,
                  startTime: slot.start_time,
                  endTime: slot.end_time,
                  available: true // Assuming all returned slots are available
                }))
              };
            } catch (err) {
              console.error(`Error fetching slots for doctor ${doctor.id}:`, err);
              return {
                ...doctor,
                availableSlots: []
              };
            }
          })
        );
        
        setDoctors(doctorsWithSlots);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError(err.message || 'Error loading doctors');
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [clinicId]); 

  const handleAppointmentSelect = async (doctorId, timeSlotId) => {
      try
      {
          //! Check if user is logged in
          //? must get userId from authentication !! Nour ==> replace localStorage.getItem('userId');
      const patientId = localStorage.getItem('userId');
      
      if (!patientId) {
        alert('Please log in to book an appointment');
        // Redirect to login page or show login modal
        return;
      }
      
      // Make API request to book appointment
      const response = await fetch('http://localhost:4000/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctor_clinic_time_id: timeSlotId,
          patient_id: patientId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to book appointment');
      }

      const data = await response.json();
      console.log('Appointment booked:', data);
      alert('Appointment booked successfully!');
      
      // Update local state to reflect the booked appointment
      const updatedDoctors = doctors.map(doctor => {
        if (doctor.id === doctorId) {
          return {
            ...doctor,
            availableSlots: doctor.availableSlots.filter(slot => slot.id !== timeSlotId)
          };
        }
        return doctor;
      });
      
      setDoctors(updatedDoctors);
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert(`Failed to book appointment: ${error.message}`);
    }
  };

  if (loading) return <div className="doctors-loading">Loading doctors...</div>;
  if (error) return <div className="doctors-error">Error: {error}</div>;
  if (doctors.length === 0) return <div className="no-doctors">No doctors found for this specialty.</div>;

  return (
    <div className="doctors-page">
      <header className="doctors-header">
        <h1>Available Doctors</h1>
        {clinicId && <p>Showing doctors for clinic #{clinicId}</p>} {/* changed */}
      </header>
      
      <div className="doctors-list">
        {doctors.map(doctor => (
          <DoctorCard 
            key={doctor.id}
            doctor={{
              id: doctor.id,
              name: doctor.full_name,
              specialty: doctor.specialty_name || "Specialist",
              image: doctor.image || (doctor.gender === "female" ? "/FemaleDoctor.png" : "/MaleDoctor.png"),
              availableSlots: doctor.availableSlots
            }}
            onSelectAppointment={(timeSlotId) => handleAppointmentSelect(doctor.id, timeSlotId)}
          />
        ))}
      </div>
    </div>
  );
}
