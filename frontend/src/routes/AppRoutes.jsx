import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import EmployeeDashboard from "../pages/EmployeeDashboard/EmployeeDashboard";
import ManagerDashboard from "../pages/ManagerDashboard/ManagerDashboard";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/employee"
          element={
            <ProtectedRoute role="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <ProtectedRoute role="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;