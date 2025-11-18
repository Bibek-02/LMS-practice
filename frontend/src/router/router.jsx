import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "../pages/auth/Login";
import MemberDashboard from "../pages/member/MemberDashboard";
import StaffDashboard from "../pages/staff/StaffDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ allowedRoles }) => {
  const { token, user } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Member-only */}
        <Route element={<PrivateRoute allowedRoles={["member"]} />}>
          <Route path="/member/dashboard" element={<MemberDashboard />} />
        </Route>

        {/* Staff or Admin */}
        <Route element={<PrivateRoute allowedRoles={["staff", "admin"]} />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
        </Route>

        {/* Admin-only */}
        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
