import '../styles/clinic_card.css';

function ClinicCard({ name, description, icon: IconComponent, onClick }) {
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
        </div>
      </div>
    </div>
  );
}

export default ClinicCard;