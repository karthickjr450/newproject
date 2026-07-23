import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email format';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setIsSubmitting(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${API_URL}/api/register`, {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      if (response.data) {
        toast.success(response.data.message || 'Registration successful!');
        setFormData({ username: '', email: '', phone: '', password: '', confirmPassword: '' });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to register. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="form-wrapper">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit} noValidate>
          
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
              placeholder="Enter your username"
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          
          <div className="input-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'error' : ''}
              placeholder="Enter your phone number"
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Create a password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
