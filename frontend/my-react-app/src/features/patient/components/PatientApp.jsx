import "../styles/patient_card.css";

export default function PatientAppointment({ 
  id,
  date,
  doctor_name,
  doctor_email,
  doctor_phone,
  weekdays=[],
  startTime,
  endTime
}) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short', 
    day: 'numeric'
  });

  // Format weekdays array as comma-separated string
  const formattedWeekdays = Array.isArray(weekdays) ? weekdays.join(', ') : weekdays;

  return (
    <div className="appointment-card">
      <div className="appointment-status">
        <span className="status-indicator available"></span>
        <span className="status-text">Slot</span>
      </div>
      <div className="appointment-time">
        <div className="date">{formattedDate}</div>
        {/* <div className="weekdays">Days: {formattedWeekdays}</div> */}
        <div className="time">{startTime} - {endTime}</div>
      </div>
      <div className="patient-details">
        <h4>Doctor Information:</h4>
        {doctor_name && <p><strong>Name:</strong> {doctor_name}</p>}
        {doctor_email && <p><strong>Email:</strong> {doctor_email}</p>}
        {doctor_phone && <p><strong>Phone:</strong> {doctor_phone}</p>}
        {!doctor_name && !doctor_email && !doctor_phone && (
          <p>No patient details for this slot yet.</p>
        )}
      </div>
      <div className="slot-id">Slot ID: {id}</div>
    </div>
  );
}
