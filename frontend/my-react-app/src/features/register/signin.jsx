import { use, useState } from 'react';
import { FaEnvelope, FaKey } from 'react-icons/fa';
import "./styles/signin.css";
import { Link } from 'react-router-dom';



export default function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [doctor, setDoctor] = useState(false);
  // const [admin, setAdmin] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const handleAdminChange = () => {
  //   const newValue = !admin;
  //   setAdmin(newValue);
  //   console.log(newValue);
  //   localStorage.setItem('rememberAdmin', newValue);
  // };

  // Handle doctor checkbox changeU
  const handleDoctorChange = () => {
    const newValue = !doctor;
    setDoctor(newValue);
    console.log(newValue);
    localStorage.setItem('rememberDoctor', newValue);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'email') {
      localStorage.setItem('userEmail', value);
    }
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Check for empty fields
    if (!formData.email) {
      newErrors.email = "Email is required";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    // if (doctor && admin) {
    //   newErrors.role = "choose only one role";
    // }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Make API request
      const response = await fetch('http://localhost:4000/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          // admin: admin,
          doctor: doctor
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      console.log('Login successful:', data);

      localStorage.setItem('userEmail', formData.email);
      
      // Store token if received
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      if (data.user.userType) {
        localStorage.setItem('userType', data.user.userType);
        
      }
      if (localStorage.getItem("userType") === "doctor" ||
      localStorage.getItem("rememberDoctor")  === true) {
      console.log('doctor');
      window.location.href = "/doctorsApp";

    } else  {
      console.log('patient');
      window.location.href = '/';
      // navigate('/');
    }
      
    } catch (error) {
      console.error('Error during login:', error);
      setErrors({
        form: error.message || 'Invalid email or password. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h2 className="signin-title">Login please</h2>
        
        {errors.form && (
          <div className="error-message form-error">
            {errors.form}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="icon-container">
              <FaEnvelope />
            </div>
            <input
              type="text"
              name="email"
              placeholder="Input your Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          {errors.email && <div className="error-message">{errors.email}</div>}
          
          <div className="input-group">
            <div className="icon-container">
              <FaKey />
            </div>
            <input
              type="password"
              name="password"
              placeholder="Input your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {errors.password && <div className="error-message">{errors.password}</div>}
          
          <div className="options-row">
            {/* {<div className="remember-me">
              <input
                type="checkbox"
                id="admin"
                checked={admin}
                onChange={handleAdminChange}
              /> }
              <label htmlFor="remember">admin ?</label>
            </div> */}
            <div className="remember-me">
              <input
                type="checkbox"
                id="doctor"
                checked={doctor}
                onChange={handleDoctorChange}
              />
              <label htmlFor="remember">doctor ?</label>
            </div>
            

            
          </div>
          {errors.role && <div className="error-message">{errors.role}</div>}
          <button 
            type="submit" 
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'SIGNING IN...' : 'LOG IN'}
          </button>
          
          <div className="login-link">
            don't have an account yet? <Link to="/signup">Sign Up</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
