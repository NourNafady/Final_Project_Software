import { useState } from 'react';
import '../styles/doctor_card.css';

const DoctorCard = ({ doctor, onSelectAppointment }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleTimeSelect = (slotId) => {
    onSelectAppointment(slotId);
  };

  // Format date as "Day, Month Date"
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Format time from "HH:MM:SS" to "HH:MM AM/PM"
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Group available slots by date for better organization
  const slotsByDate = doctor.availableSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {});

  return (
    <div className="doctor-card">
      <div className="doctor-info" onClick={toggleExpand}>
        <div className="doctor-image">
          <img src={doctor.image} alt={doctor.name} />
        </div>
        <div className="doctor-details">
          <h3 className="doctor-name">{doctor.name}</h3>
          <p className="doctor-specialty">{doctor.specialty}</p>
          <div className="expand-indicator">
            {isExpanded ? '▲ Hide available times' : '▼ Show available times'}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="appointment-dropdown">
          {doctor.availableSlots.length === 0 ? (
            <p className="no-slots-message">No appointment slots available for this doctor.</p>
          ) : (
            Object.entries(slotsByDate).map(([date, slots]) => (
              <div key={date} className="date-group">
                <h4 className="date-header">{formatDate(date)}</h4>
                <ul className="time-slots">
                  {slots.map(slot => (
                    <li 
                      key={slot.id}
                      className="time-slot"
                      onClick={() => handleTimeSelect(slot.id)}
                    >
                      <span className="time-range">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </span>
                      <button className="select-button">Book</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorCard;