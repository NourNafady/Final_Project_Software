import '../styles/clinic_card.css';

function ClinicCard({ name, description, address, phone, openTime, closeTime, icon: IconComponent, onClick, days }) {
  // Get current time in HH:mm format
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  // Get current day of the week
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = daysOfWeek[now.getDay()];

  // Check if today is an open day
  const isTodayOpen = days ? days.includes(currentDay) : true;
  // Compare times (assume openTime/closeTime are "HH:mm" strings)
  const isOpen = isTodayOpen && openTime <= currentTime && currentTime < closeTime;

  return (
    <div className="clinics">
      <div 
        className="department-card" 
        onClick={onClick}
        role="button"
        tabIndex={0}
      >
        <div className="card-icon-container">
          <IconComponent size={24} className="icon" />
        </div>
        <div className="card-content">
          <h3>{name}</h3>
          <p>{description}</p>
          <p><strong>Address:</strong> {address}</p>
          <p><strong>Phone:</strong> {phone}</p>
          <p>
            <strong>Hours:</strong> {openTime} - {closeTime}
            <span style={{ marginLeft: 10, color: isOpen ? 'green' : 'red', fontWeight: 'bold' }}>
              {isOpen ? 'Open' : 'Closed'}
            </span>
          </p>
          <p>
            <strong>Today:</strong> {currentDay}
            {days && (
              <span>
                | <strong>Open Days:</strong> {(Array.isArray(days) ? days : String(days).split(',')).join(', ')}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ClinicCard;