import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PreviewPage from './components/PreviewPage';
import LandingPage from './components/LandingPage';
import PublicFeedPage from './components/PublicFeedPage';

function MainLayout({ children, user, handleLogout }) {
  return (
    <div className="min-h-screen bg-background text-textMain font-sans flex flex-col selection:bg-primary/10">
      <main className="flex-1 w-full z-10 flex flex-col h-screen">
        {children}
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      // Set default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  if (loading) return null;

  return (
    <Router>
      <Routes>
        <Route
          path="/preview"
          element={<PreviewPage />}
        />
        <Route
          path="/login"
          element={
            <MainLayout user={user} handleLogout={handleLogout}>
              {!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />}
            </MainLayout>
          }
        />
        <Route
          path="/"
          element={
            user ? (
              <MainLayout user={user} handleLogout={handleLogout}>
                <Dashboard user={user} onLogout={handleLogout} />
              </MainLayout>
            ) : (
              <LandingPage />
            )
          }
        />
        <Route
          path="/feed"
          element={<PublicFeedPage />}
        />
      </Routes>
    </Router>
  );
}

export default App;
