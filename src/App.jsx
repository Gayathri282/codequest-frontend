// frontend/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';

import LandingPage      from './pages/LandingPage';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import DashboardPage    from './pages/DashboardPage';
import CoursePage       from './pages/CoursePage';
import LessonPage       from './pages/LessonPage';
import QuizPage         from './pages/QuizPage';
import ProgressPage          from './pages/ProgressPage';
import StudentSettingsPage   from './pages/StudentSettingsPage';
import AdminPage        from './pages/AdminPage';
import PricingPage      from './pages/PricingPage';
import ParentDashboard  from './pages/ParentDashboard';
import NotFoundPage     from './pages/NotFoundPage';

function LoadingSpinner() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', fontSize:64, animation:'sway 1.2s ease-in-out infinite',
      background:'linear-gradient(160deg,#062213,#0D3B22)' }}>🐸</div>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user)              return <Navigate to="/login"     replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
}

function ParentRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'PARENT' && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <CourseProvider>
      <Routes>
        {/* Public */}
        <Route path="/"          element={<LandingPage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/register"  element={<RegisterPage />} />
        <Route path="/pricing"   element={<PricingPage />} />

        {/* Student */}
        <Route path="/dashboard"   element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/course/:id"  element={<PrivateRoute><CoursePage /></PrivateRoute>} />
        <Route path="/lesson/:id"  element={<PrivateRoute><LessonPage /></PrivateRoute>} />
        <Route path="/quiz/:id"    element={<PrivateRoute><QuizPage /></PrivateRoute>} />
        <Route path="/progress"    element={<PrivateRoute><ProgressPage /></PrivateRoute>} />
        <Route path="/settings"    element={<PrivateRoute><StudentSettingsPage /></PrivateRoute>} />

        {/* Parent */}
        <Route path="/parent"      element={<ParentRoute><ParentDashboard /></ParentRoute>} />

        {/* Admin */}
        <Route path="/admin/*"     element={<AdminRoute><AdminPage /></AdminRoute>} />

        {/* 404 */}
        <Route path="*"            element={<NotFoundPage />} />
      </Routes>
      </CourseProvider>
    </AuthProvider>
  );
}
