import { useState } from 'react';
import { FaBirthdayCake, FaEnvelope, FaKey, FaPhone, FaUser, FaUserMd } from 'react-icons/fa';
import "./styles/signup.css";
import { Link } from 'react-router-dom';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    phone: '',
    gender: '',
    role: '',
    specialization: '' 
  });

  // const [errors, setErrors] = useState({});
  const [errors, setErrors] = useState({
  /* … your other error keys … */
  specialization: null   // ← optional
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
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

    // Always required fields
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.role) newErrors.role = "Role is required";

    // Only required if NOT admin
    if (formData.role !== "admin") {
      if (!formData.age) newErrors.age = "Age is required";
      if (!formData.phone) newErrors.phone = "Phone is required";
      if (!formData.gender) newErrors.gender = "Gender is required";
    }

    // Only required if doctor
    if (formData.role === "doctor" && !formData.specialization.trim()) {
      newErrors.specialization = "Specialization is required for doctors";
    }

    // Email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password strength
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Phone format (only if not admin)
    const phoneRegex = /^\d{10,15}$/;
    if (
      formData.role !== "admin" &&
      formData.phone &&
      !phoneRegex.test(formData.phone.replace(/[-()\s]/g, ""))
    ) {
      newErrors.phone = "Please enter a valid phone number";
    }

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
      const response = await fetch('http://localhost:4000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }
      
      const data = await response.json();
      console.log('Signup successful:', data);
      
      // Redirect to login page or dashboard
      window.location.href = '/signin';
      
    } catch (error) {
      console.error('Error during signup:', error);
      setErrors({
        form: error.message || 'Failed to sign up. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2 className="signup-title">Create Account</h2>
        
        {errors.form && (
          <div className="error-message form-error">
            {errors.form}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="icon-container">
              <FaUser />
            </div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          {errors.name && <div className="error-message">{errors.name}</div>}

          <div className="input-group">
            <div className="icon-container">
              <FaEnvelope />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
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
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {errors.password && <div className="error-message">{errors.password}</div>}

          {/* Only show the rest if NOT admin */}
          {formData.role !== 'admin' && (
            <>
              <div className="input-group">
                <div className="icon-container">
                  <FaBirthdayCake />
                </div>
                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={formData.age}
                  onChange={handleChange}
                  min="1"
                  max="120"
                  required
                />
              </div>
              {errors.age && <div className="error-message">{errors.age}</div>}

              <div className="input-group">
                <div className="icon-container">
                  <FaPhone />
                </div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.phone && <div className="error-message">{errors.phone}</div>}

              <div className="select-group">
                <label htmlFor="gender">Gender:</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              {errors.gender && <div className="error-message">{errors.gender}</div>}
            </>
          )}

          <div className="select-group">
            <label htmlFor="role">Role:</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select Role</option>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {errors.role && <div className="error-message">{errors.role}</div>}

          {/* Only show specialization if doctor */}
          {formData.role === 'doctor' && (
            <div className="input-group">
              <div className="icon-container">
                <FaUserMd />
              </div>
              <input
                type="text"
                id="specialization"
                name="specialization"
                placeholder="Enter your medical specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
              />
            </div>
          )}
          {errors.specialization && (
            <div className="error-message">{errors.specialization}</div>
          )}

          <button 
            type="submit" 
            className="signup-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'SIGNING UP...' : 'SIGN UP'}
          </button>
          
          <div className="login-link">
            Already have an account? <Link to="/signin">Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
