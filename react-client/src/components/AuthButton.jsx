import { useState, useEffect } from 'react';
import './AuthButton.css';

// determine API base URL from environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL || 'http://localhost:3000';

// component to handle user authentication
function AuthButton() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // check authentication status on start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // function to check if user is authenticated
  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: 'include'
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  // function to handle user login
  
  const handleLogin = () => {
    const returnTo = encodeURIComponent(window.location.pathname);
    window.location.href = `${API_BASE_URL}/auth/google?returnTo=${returnTo}`;
  };

  // function to handle user logout
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="auth-button-container">
      {user ? (
        <div className="user-info">
          <span className="user-name">{user.displayName || user.displayname || user.email}</span>
          <button onClick={handleLogout} className="auth-button logout-button">
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
