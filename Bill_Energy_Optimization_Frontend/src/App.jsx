import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Navbar from "./pages/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UploadBill from "./pages/UploadBill";
import Dashboard from "./pages/DashBoard";

// ── Protected: redirect to /login if not authenticated ──
const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  const stored = sessionStorage.getItem("energy_token");
  const isAuth = token || stored;
  if (!isAuth) return <Navigate to="/login" replace />;
  return children;
};

// ── Public: redirect to /dashboard if already logged in ──
const PublicRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  const stored = sessionStorage.getItem("energy_token");
  const isAuth = token || stored;
  if (isAuth) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Home — always accessible */}
        <Route path="/" element={<Home />} />

        {/* Public — redirect to dashboard if already logged in */}
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected — redirect to login if not authenticated */}
        <Route path="/upload"    element={<ProtectedRoute><UploadBill /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;