import { useState } from 'react';
import LoginScreen from './components/LoginScreen.jsx';
import Dashboard from './components/Dashboard.jsx';

const USER_STORAGE_KEY = 'proxyai.userId';

function readStoredUser() {
  try {
    return localStorage.getItem(USER_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export default function App() {
  const [userId, setUserId] = useState(readStoredUser);

  const handleLogin = (id) => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, id);
    } catch {
      // Storage may be blocked (private mode); the session still works
    }
    setUserId(id);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // ignore
    }
    setUserId('');
  };

  if (!userId) {
    return <LoginScreen onLogin={handleLogin} />;
  }
  // key: a different user gets a completely fresh dashboard state
  return <Dashboard key={userId} userId={userId} onLogout={handleLogout} />;
}
