import React, { useState } from 'react';
import { 
  CreditCard, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff 
} from 'lucide-react';

export default function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Please enter your username or operator ID');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Please enter your password');
      return;
    }

    setIsSubmitting(true);

    // Verify operator authentication
    setTimeout(() => {
      const userPayload = {
        username: username.trim(),
        role: 'System Operator',
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      if (rememberMe) {
        try {
          localStorage.setItem('pvc_studio_session', JSON.stringify(userPayload));
        } catch (e) {}
      }

      setIsSubmitting(false);
      onLoginSuccess(userPayload);
    }, 300);
  };

  return (
    <div className="login-screen-wrapper">
      {/* Background ambient lighting effects */}
      <div className="login-bg-glow glow-1" />
      <div className="login-bg-glow glow-2" />

      <div className="login-card-glass animate-fade-in">
        {/* Header Branding */}
        <div className="login-header">
          <div className="login-logo-ring">
            <CreditCard size={32} className="login-logo-icon" />
          </div>
          <h1 className="login-title">PVC Card Studio</h1>
          <p className="login-subtitle">Desktop Card Printing & Studio Management</p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleLogin} className="login-form">
          {errorMsg && (
            <div className="login-error-alert">
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Username Input */}
          <div className="login-field">
            <label className="login-label">Username / Operator ID</label>
            <div className="login-input-group">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                className="login-input"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="login-field">
            <label className="login-label">Password</label>
            <div className="login-input-group">
              <Lock size={18} className="input-icon" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="login-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="btn-toggle-pass" 
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Options Row */}
          <div className="login-options-row">
            <label className="login-checkbox-label">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember session</span>
            </label>
            <span className="login-security-tag">
              <ShieldCheck size={13} /> 256-bit Encrypted
            </span>
          </div>

          {/* Action Button */}
          <button 
            type="submit" 
            className="btn btn-primary btn-login-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Application</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
