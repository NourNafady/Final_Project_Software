import {
  FaStethoscope,
  FaHeart,
  FaBrain,
  FaBaby,
  FaRunning,
  FaUser,
  FaSmile,
  FaShieldAlt,
} from 'react-icons/fa';


const ClinicsList = [
    {
      id: 1,
      name: "General Medicine",
      description: "Primary healthcare services",
      icon: FaStethoscope // These will be mapped to appropriate icons
    },
    {
      id: 2,
      name: "Cardiology",
      description: "Heart & vascular care",
      icon: FaHeart
    },
    {
      id: 3,
      name: "Neurology",
      description: "Brain & nerves specialists",
      icon: FaBrain
    },
    {
      id: 4,
      name: "Pediatrics",
      description: "Children's health services",
      icon: FaBaby
    },
    {
      id: 5,
      name: "Physical Therapy",
      description: "Rehabilitation services",
      icon: FaRunning
    },
    {
      id: 6,
      name: "Mental Health",
      description: "Psychological support",
      icon: FaUser
    },
    {
      id: 7,
      name: "General Dentistry",
      description: "Dental care services",
      icon: FaSmile
    },
    {
      id: 8,
      name: "Insurance",
      description: "Coverage information",
      icon: FaShieldAlt
    }
  ];
  
  export default ClinicsList;