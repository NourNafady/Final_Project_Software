import "../styles/app_card.css";

export default function AppointmentCard({ 
  id,
  date,
  patient_name,
  patient_email,
  patient_phone,
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
        <h4>Patient Information:</h4>
        {patient_name && <p><strong>Name:</strong> {patient_name}</p>}
        {patient_email && <p><strong>Email:</strong> {patient_email}</p>}
        {patient_phone && <p><strong>Phone:</strong> {patient_phone}</p>}
        {!patient_name && !patient_email && !patient_phone && (
          <p>No patient details for this slot yet.</p>
        )}
      </div>
      <div className="slot-id">Slot ID: {id}</div>
    </div>
  );
}
