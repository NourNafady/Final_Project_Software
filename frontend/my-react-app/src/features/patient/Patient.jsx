import { useEffect, useState } from 'react';
import PatientAppointmentCard from './components/PatientApp';
import './styles/patient.css';

export default function PatientAppointment() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchPatientSlots = async () => {
      try {
        // Get the doctor's ID from localStorage (should be set at login)
        //! userEmail is the doctorID
        const patientEmail = localStorage.getItem('userEmail');
        if (!patientEmail ) {
          setError('Patient not logged in.');
          setLoading(false);
          return;
        }
       
        const response = await fetch(`http://localhost:4000/patient/${patientEmail}/my-appointment-slots`);
        if (!response.ok) {
          throw new Error('Failed to fetch appointment slots');
        }
        const data = await response.json();
        setSlots(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientSlots();
  }, []);

  if (loading) return <div className="loading">Loading appointment slots...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="doctor-appointments-container">
      <h2>My Appointment Slots</h2>
      {slots.length === 0 ? (
        <div className="no-appointments">
          <p>You don't have any appointment slots scheduled.</p>
        </div>
      ) : (
        <div className="appointments-grid">
          {slots.map(slot => (
            <PatientAppointmentCard
              id={slot.id}
              startTime={slot.start_time}
              endTime={slot.end_time}
              doctor_name={slot.doctor_name}
              doctor_email={slot.doctor_email}
              doctor_phone={slot.doctor_phone} 
              date={slot.date}

            />
          ))}
        </div>
      )}
    </div>
  );
}
