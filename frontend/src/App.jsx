import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';
import ThreeBackground from './components/ThreeBackground';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import CitizenPortal from './pages/CitizenPortal';
import OfficerDashboard from './pages/OfficerDashboard';
import AnalyticsPage from './pages/AnalyticsPage';
import DigitalTwinPage from './pages/DigitalTwinPage';
import LoginPage from './pages/LoginPage';
import TrackComplaint from './pages/TrackComplaint';
import ComplaintPage from './pages/ComplaintPage';
import SmsComplaintPage from './pages/SmsComplaintPage';
import CallComplaintPage from './pages/CallComplaintPage';
import TelegramComplaintPage from './pages/TelegramComplaintPage';

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RootRoute() {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={user.role === 'officer' || user.role === 'admin' ? '/officer' : '/citizen'} replace />;
}

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1081234567890-awaazai.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            {/* Continuous 3D Animated Background */}
            <ThreeBackground />

            <div className="min-h-screen flex flex-col justify-between relative z-10">
              <div>
                <Navbar />
                <ErrorBoundary>
                  <Routes>
                    {/* Default root redirects to /login if unauthenticated, or dashboard if logged in */}
                    <Route path="/" element={<RootRoute />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/overview" element={<ProtectedRoute><LandingPage /></ProtectedRoute>} />
                    <Route path="/citizen" element={<ProtectedRoute><CitizenPortal /></ProtectedRoute>} />
                    <Route path="/officer" element={<ProtectedRoute><OfficerDashboard /></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
                    <Route path="/digital-twin" element={<ProtectedRoute><DigitalTwinPage /></ProtectedRoute>} />
                    <Route path="/track" element={<ProtectedRoute><TrackComplaint /></ProtectedRoute>} />
                    <Route path="/complaint/:id" element={<ProtectedRoute><ComplaintPage /></ProtectedRoute>} />
                    <Route path="/sms-complaint" element={<ProtectedRoute><SmsComplaintPage /></ProtectedRoute>} />
                    <Route path="/call-complaint" element={<ProtectedRoute><CallComplaintPage /></ProtectedRoute>} />
                    <Route path="/telegram-complaint" element={<ProtectedRoute><TelegramComplaintPage /></ProtectedRoute>} />
                    {/* Catch-all fallback */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                  </Routes>
                </ErrorBoundary>
              </div>
              <Footer />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
