import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, UserPlus } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const tempErrors = {};
    if (!email) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Invalid email format';
    }
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters long';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setErrors({});
    
    if (!validate()) return;

    setSubmitting(true);
    const result = await register(email, password, role);
    setSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      if (result.validationErrors) {
        setErrors(result.validationErrors);
      }
      setApiError(result.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h1>InventoryHub</h1>
          <p>Create your developer account</p>
        </div>

        {apiError && (
          <div className="form-error-alert animate-slide-in">
            <AlertCircle size={20} />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="input-control"
              placeholder="e.g. manager@inventoryhub.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input-control"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="role">Assign Role</label>
            <select
              id="role"
              className="input-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ background: 'var(--bg-main)', cursor: 'pointer' }}
            >
              <option value="USER">Standard User (Read-Only Products)</option>
              <option value="ADMIN">Administrator (Full CRUD Products)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '10px' }}>
            <UserPlus size={18} />
            <span>{submitting ? 'Creating Account...' : 'Sign Up'}</span>
          </button>
        </form>

        <div className="auth-footer-link">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
