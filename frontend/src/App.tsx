import React, { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import { Loader2 } from 'lucide-react';

// Lazy-load all role-based pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const ParentPortal = lazy(() => import('./pages/ParentPortal'));
const CountyDashboard = lazy(() => import('./pages/CountyDashboard'));
const NationalDashboard = lazy(() => import('./pages/NationalDashboard'));

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
        <span className="text-white text-2xl font-black">E</span>
      </div>
      <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
      <p className="text-sm text-slate-500 font-medium">Loading EduMesh...</p>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Login />;

  const role = user?.role;

  return (
    <Suspense fallback={<LoadingScreen />}>
      {role === 'national_admin' && <NationalDashboard />}
      {role === 'county_admin' && <CountyDashboard />}
      {(role === 'admin') && <AdminPanel />}
      {role === 'teacher' && <TeacherDashboard />}
      {role === 'student' && <Dashboard />}
      {role === 'parent' && <ParentPortal />}
    </Suspense>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
