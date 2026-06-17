import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiHash, FiShield, FiKey, FiLayers } from 'react-icons/fi';
import { authService } from '../../services/authService';
import { logger } from '../../utils/logger';
import './Login.css';

/**
 * Login Page Component
 * Renders the login panels, utilizing intuitive tab headers:
 * - Admin Portal (Demo Mode with fallback mockup data)
 * - Student Portal (Live Mode using roll numbers and access codes)
 */
export function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if session is already active
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // Tab State: 'admin' (Demo) or 'student' (Live Evaluation)
  const [loginMode, setLoginMode] = useState('student');

  // Admin Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Student Form State
  const [evalName, setEvalName] = useState('yenduri raja sri');
  const [evalRollNo, setEvalRollNo] = useState('vtu26126');
  const [evalEmail, setEvalEmail] = useState('vtu26126@veltech.edu.in');
  const [evalStream, setEvalStream] = useState('e3caa552-3fef-4cbd-bc90-ebeabcd1b073'); // Maps to clientID (e.g. cse / uuid)
  const [evalAccessCode, setEvalAccessCode] = useState('juFphv');
  const [evalClientSecret, setEvalClientSecret] = useState('UGutHJVQkAmCcyYk');
  const [defaultCategory, setDefaultCategory] = useState(''); // Default dashboard view

  // Common Settings
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState(false);

  // Check for expired redirect session
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('expired') === 'true') {
      setSessionExpiredMsg(true);
    }
  }, [location]);

  const validateAdminForm = () => {
    const tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      tempErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(email)) {
      tempErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      tempErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateStudentForm = () => {
    const tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!evalName.trim()) tempErrors.evalName = 'Student Name is required.';
    
    if (!evalEmail.trim()) {
      tempErrors.evalEmail = 'Email Address is required.';
    } else if (!emailRegex.test(evalEmail)) {
      tempErrors.evalEmail = 'Please enter a valid email address.';
    }

    if (!evalRollNo.trim()) tempErrors.evalRollNo = 'Roll Number is required.';
    if (!evalAccessCode.trim()) tempErrors.evalAccessCode = 'Access Code is required.';
    if (!evalStream.trim()) tempErrors.evalStream = 'Stream Name / Client ID is required.';
    if (!evalClientSecret.trim()) tempErrors.evalClientSecret = 'Security Passcode is required.';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleModeSwitch = (mode) => {
    setLoginMode(mode);
    setErrors({});
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSessionExpiredMsg(false);

    if (loginMode === 'admin') {
      if (!validateAdminForm()) return;
      setLoading(true);
      try {
        await authService.login(email, password, rememberMe);
        logger.log('LoginComponent', 'Admin demo login successful.');
        navigate('/dashboard', { replace: true });
      } catch (err) {
        setApiError(err.message || 'Admin Login failed.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!validateStudentForm()) return;
      setLoading(true);
      try {
        const credentials = {
          name: evalName.trim(),
          email: evalEmail.trim(),
          rollNo: evalRollNo.trim(),
          accessCode: evalAccessCode.trim(),
          clientID: evalStream.trim(), // Maps Stream name / clientID
          clientSecret: evalClientSecret.trim()
        };
        await authService.loginWithEvaluation(credentials, rememberMe);
        
        // Save the chosen default notification category filter for the Dashboard
        if (defaultCategory) {
          localStorage.setItem('nms_default_filter_category', defaultCategory);
        } else {
          localStorage.removeItem('nms_default_filter_category');
        }

        logger.log('LoginComponent', 'Student Live login successful.', { defaultCategory });
        navigate('/dashboard', { replace: true });
      } catch (err) {
        setApiError(err.message || 'Student Authentication failed.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-bg-glow glow-1" />
      <div className="login-bg-glow glow-2" />

      <div className="login-card-wrapper animate-zoom">
        <div className="login-header">
          <div className="login-logo-circle">🔔</div>
          <h1>PulseNotify</h1>
          <p className="login-subtitle">Notification Management Command Center</p>
        </div>

        {/* Tab Controls */}
        <div className="login-mode-tabs" role="tablist">
          <button
            type="button"
            className={`tab-btn ${loginMode === 'admin' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('admin')}
            role="tab"
            aria-selected={loginMode === 'admin'}
          >
            Admin Portal
          </button>
          <button
            type="button"
            className={`tab-btn ${loginMode === 'student' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('student')}
            role="tab"
            aria-selected={loginMode === 'student'}
          >
            Student Portal
          </button>
        </div>

        {/* Warning Notices */}
        {sessionExpiredMsg && (
          <div className="login-notice-banner warning-banner">
            <span>Session expired. Please sign in again.</span>
          </div>
        )}
        
        {apiError && (
          <div className="login-notice-banner error-banner">
            <span>{apiError}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          
          {loginMode === 'admin' ? (
            /* ADMIN PORTAL INPUTS */
            <>
              {/* Email */}
              <div className="form-group">
                <label htmlFor="login-email">Admin Email</label>
                <div className={`input-container ${errors.email ? 'has-error' : ''}`}>
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    id="login-email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                {errors.email && <span className="input-error-msg">{errors.email}</span>}
                <span className="input-helper-text">Enter your admin email address</span>
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className={`input-container ${errors.password ? 'has-error' : ''}`}>
                  <FiLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="btn-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && <span className="input-error-msg">{errors.password}</span>}
                <span className="input-helper-text">Enter your admin password</span>
              </div>
            </>
          ) : (
            /* STUDENT PORTAL INPUTS */
            <>
              {/* Student Name */}
              <div className="form-group">
                <label htmlFor="eval-name">Student Name</label>
                <div className={`input-container ${errors.evalName ? 'has-error' : ''}`}>
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    id="eval-name"
                    placeholder="e.g. John Doe"
                    value={evalName}
                    onChange={(e) => setEvalName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                {errors.evalName && <span className="input-error-msg">{errors.evalName}</span>}
                <span className="input-helper-text">Your full name as registered for the test</span>
              </div>

              {/* Email Address */}
              <div className="form-group">
                <label htmlFor="eval-email">Email Address</label>
                <div className={`input-container ${errors.evalEmail ? 'has-error' : ''}`}>
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    id="eval-email"
                    placeholder="e.g. student@university.edu"
                    value={evalEmail}
                    onChange={(e) => setEvalEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                {errors.evalEmail && <span className="input-error-msg">{errors.evalEmail}</span>}
                <span className="input-helper-text">Your registered academic email address</span>
              </div>

              {/* Roll No */}
              <div className="form-group">
                <label htmlFor="eval-roll">Roll Number</label>
                <div className={`input-container ${errors.evalRollNo ? 'has-error' : ''}`}>
                  <FiHash className="input-icon" />
                  <input
                    type="text"
                    id="eval-roll"
                    placeholder="e.g. 102203045"
                    value={evalRollNo}
                    onChange={(e) => setEvalRollNo(e.target.value)}
                    disabled={loading}
                  />
                </div>
                {errors.evalRollNo && <span className="input-error-msg">{errors.evalRollNo}</span>}
                <span className="input-helper-text">Your university roll number / identification code</span>
              </div>

              {/* Stream / Client ID */}
              <div className="form-group">
                <label htmlFor="eval-stream">Stream / Client ID</label>
                <div className={`input-container ${errors.evalStream ? 'has-error' : ''}`}>
                  <FiShield className="input-icon" />
                  <input
                    type="text"
                    id="eval-stream"
                    placeholder="e.g. Computer Science Engineering"
                    value={evalStream}
                    onChange={(e) => setEvalStream(e.target.value)}
                    disabled={loading}
                  />
                </div>
                {errors.evalStream && <span className="input-error-msg">{errors.evalStream}</span>}
                <span className="input-helper-text">Your academic stream name (or Client ID UUID)</span>
              </div>

              {/* Access Code */}
              <div className="form-group">
                <label htmlFor="eval-code">Exam Access Code</label>
                <div className={`input-container ${errors.evalAccessCode ? 'has-error' : ''}`}>
                  <FiKey className="input-icon" />
                  <input
                    type="text"
                    id="eval-code"
                    placeholder="e.g. ACC-10294"
                    value={evalAccessCode}
                    onChange={(e) => setEvalAccessCode(e.target.value)}
                    disabled={loading}
                  />
                </div>
                {errors.evalAccessCode && <span className="input-error-msg">{errors.evalAccessCode}</span>}
                <span className="input-helper-text">The 6-character test access code from your dashboard</span>
              </div>

              {/* Client Secret */}
              <div className="form-group">
                <label htmlFor="eval-secret">Secret Passcode Key</label>
                <div className={`input-container ${errors.evalClientSecret ? 'has-error' : ''}`}>
                  <FiLock className="input-icon" />
                  <input
                    type="password"
                    id="eval-secret"
                    placeholder="••••••"
                    value={evalClientSecret}
                    onChange={(e) => setEvalClientSecret(e.target.value)}
                    disabled={loading}
                  />
                </div>
                {errors.evalClientSecret && <span className="input-error-msg">{errors.evalClientSecret}</span>}
                <span className="input-helper-text">The 16-character security passcode (client secret key)</span>
              </div>

              {/* Category Selector View */}
              <div className="form-group">
                <label htmlFor="eval-category">Default Dashboard View</label>
                <div className="input-container">
                  <FiLayers className="input-icon" />
                  <select
                    id="eval-category"
                    className="filters-select"
                    style={{ paddingLeft: '2.5rem' }}
                    value={defaultCategory}
                    onChange={(e) => setDefaultCategory(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">All Notifications</option>
                    <option value="Placement">Placement Drives Only</option>
                    <option value="Result">Academic Results Only</option>
                    <option value="Event">Campus Events Only</option>
                  </select>
                </div>
                <span className="input-helper-text">Choose which category to display first upon logging in</span>
              </div>
            </>
          )}

          {/* Remember Me */}
          <div className="form-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-custom" />
              <span className="checkbox-label">Remember me</span>
            </label>
            {loginMode === 'admin' && (
              <span className="login-credentials-tip" title="Use these credentials to login">
                admin@example.com / password123
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-login-submit" disabled={loading}>
            {loading ? (
              <span className="spinner-loader">
                <span className="spinner-dot" />
                Validating...
              </span>
            ) : (
              loginMode === 'admin' ? 'Sign In (Admin Demo)' : 'Authenticate (Student Live)'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
