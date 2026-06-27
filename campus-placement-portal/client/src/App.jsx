import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Topbar from "./components/Topbar.jsx";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

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
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
