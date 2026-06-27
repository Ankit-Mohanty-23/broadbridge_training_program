import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicOnlyRoute from "./components/PublicOnlyRoute.jsx";
import Topbar from "./components/Topbar.jsx";
import Footer from "./components/Footer.jsx";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import NotFound from "./pages/NotFound.jsx";

import StudentJobs from "./pages/student/StudentJobs.jsx";
import StudentApplications from "./pages/student/StudentApplications.jsx";
import StudentProfile from "./pages/student/StudentProfile.jsx";

import RecruiterJobs from "./pages/recruiter/RecruiterJobs.jsx";
import RecruiterNewJob from "./pages/recruiter/RecruiterNewJob.jsx";
import RecruiterApplicants from "./pages/recruiter/RecruiterApplicants.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Topbar />
      <Routes>
        {/* Public-only routes — logged-in users are redirected to their dashboard */}
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <Landing />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        {/* Student routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute roles={["student"]}>
              <StudentJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/applications"
          element={
            <ProtectedRoute roles={["student"]}>
              <StudentApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute roles={["student"]}>
              <StudentProfile />
            </ProtectedRoute>
          }
        />

        {/* Recruiter routes */}
        <Route
          path="/recruiter"
          element={
            <ProtectedRoute roles={["recruiter"]}>
              <RecruiterJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/new"
          element={
            <ProtectedRoute roles={["recruiter"]}>
              <RecruiterNewJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/jobs/:jobId"
          element={
            <ProtectedRoute roles={["recruiter"]}>
              <RecruiterApplicants />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </AuthProvider>
  );
}
