import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import IssueDetailPage from './pages/IssueDetailPage';
import ProfilePage from './pages/ProfilePage';
import JobsPage from './pages/JobsPage';
import LoginPage from './pages/LoginPage';

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 text-xl font-bold text-white shadow-lg">
            TF
          </div>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-red-600" />
          <p className="text-sm font-medium text-slate-600">Cargando TaskFlow…</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/trabajos" replace /> : <LoginPage />}
      />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/trabajos" replace />} />
        <Route path="/trabajos" element={<JobsPage />} />
        <Route
          path="/proyectos"
          element={
            <ProtectedRoute adminOnly>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/projects/:projectId/issues/:issueId" element={<IssueDetailPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/perfil" element={<ProfileRedirect />} />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? '/trabajos' : '/login'} replace />} />
    </Routes>
  );
}

function ProfileRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/profile/${user.id}`} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;