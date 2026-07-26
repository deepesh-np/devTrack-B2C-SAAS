import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DevConsole } from './components/DevConsole';
import { LandingPage } from './pages/LandingPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';
import './index.css';

function MainLayout() {
  const { activeView } = useAuth();

  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content">
        {activeView === 'landing' && <LandingPage />}
        {activeView === 'profile' && <ProfilePage />}
        {activeView === 'auth' && <AuthPage />}
        {activeView === 'console' && (
          <div className="container" style={{ marginTop: '2rem' }}>
            <DevConsole />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
