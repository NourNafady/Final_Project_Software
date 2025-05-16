import { useState } from 'react';
import { FaEnvelope, FaKey } from 'react-icons/fa';
import "./styles/signin.css";
import { Link } from 'react-router-dom';

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
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
      const response = await fetch('/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      console.log('Login successful:', data);
      
      // Store token if received
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      
      // Redirect to dashboard or home page
      window.location.href = '/';
      
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
            <div className="remember-me">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label htmlFor="remember">Remember me</label>
            </div>
            <div className="forgot-password">
              <a href="/forgot-password">Forgot Password?</a>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'SIGNING IN...' : 'LOG IN'}
          </button>
          
          <div className="login-link">
            Already have an account? <Link to="/signup">Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
