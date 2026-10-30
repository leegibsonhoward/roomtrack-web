import { Routes, Route, Navigate } from "react-router";

import ProtectedRoute from "./auth/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import MePage from "./pages/MePage";
import RoomPage from "./pages/RoomPage";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* These pages require an authenticated session. */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/rooms/:roomId" element={<RoomPage />} />
        <Route path="/me" element={<MePage />} />
      </Route>
    </Routes>
  );
}

export default App;