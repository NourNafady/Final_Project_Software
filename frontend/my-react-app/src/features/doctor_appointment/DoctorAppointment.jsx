import { useEffect, useState } from 'react';
import AppointmentCard from './components/AppointmentCard';
import './styles/doctor_appointment.css';

export default function DoctorAppointment() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchDoctorSlots = async () => {
      try {
        // Get the doctor's ID from localStorage (should be set at login)
        //! userEmail is the doctorID
        const doctorEmail = localStorage.getItem('userEmail');
        if (!doctorEmail ) {
          setError('Doctor not logged in.');
          setLoading(false);
          return;
        }
       
        const response = await fetch(`http://localhost:4000/doctor/${doctorEmail}/my-appointment-slots`);
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
    fetchDoctorSlots();
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
            <AppointmentCard
              id={slot.id}
              startTime={slot.start_time}
              endTime={slot.end_time}
              patient_name={slot.patient_name}
              patient_email={slot.patient_email}
              patient_phone={slot.patient_phone} 
              date={slot.date}

            />
          ))}
        </div>
      )}
    </div>
  );
}
