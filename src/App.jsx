import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PreviewPage from './components/PreviewPage';
import LandingPage from './components/LandingPage';
import PublicFeedPage from './components/PublicFeedPage';
import CompleteProfile from './components/CompleteProfile';

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
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
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
              user.status === 'suspended' ? (
                <MainLayout user={user} handleLogout={handleLogout}>
                  <div className="flex-1 flex items-center justify-center p-8 text-center bg-gray-50 min-h-screen">
                    <div className="max-w-md bg-white p-8 rounded-2xl shadow-xl border border-red-100">
                      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">X</div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Account Suspended</h2>
                      <p className="text-gray-500 mb-8 font-medium">Your account has been suspended by an administrator. Please contact support.</p>
                      <button onClick={handleLogout} className="w-full py-3 bg-red-600 hover:bg-red-700 transition-colors text-white rounded-xl font-bold">Log Out</button>
                    </div>
                  </div>
                </MainLayout>
              ) : (
                <MainLayout user={user} handleLogout={handleLogout}>
                  <Dashboard user={user} setUser={setUser} onLogout={handleLogout} />
                </MainLayout>
              )
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
