import { useState, useEffect } from 'react';
import './AuthButton.css';

// determine API base URL from environment variable or default to localhost
const API_BASE_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_BACKEND_API_BASE_URL || 'http://localhost:3000');

// component to handle user authentication
function AuthButton({ user, onLogout }) {
  
  const handleLogin = () => {
    const returnTo = encodeURIComponent(window.location.pathname);
    window.location.href = `${API_BASE_URL}/auth/google?returnTo=${returnTo}`;
  };

  return (
    <div className="auth-button-container">
      {user ? (
        <div className="user-info">
          <span className="user-name">{user.displayName || user.displayname || user.email}</span>
          <button onClick={onLogout} className="auth-button logout-button">
            Logout
          </button>
        </div>
      ) : (
        <button onClick={handleLogin} className="auth-button login-button">
          Sign in with Google
        </button>
      )}
    </div>
  );
}

export default AuthButton;
