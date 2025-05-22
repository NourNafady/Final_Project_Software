import "../styles/app_card.css";

export default function AppointmentCard({ 
  id,
  date,
  weekdays = [],
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
        <div className="weekdays">Days: {formattedWeekdays}</div>
        <div className="time">{startTime} - {endTime}</div>
      </div>
      <div className="slot-id">Slot ID: {id}</div>
    </div>
  );
}
