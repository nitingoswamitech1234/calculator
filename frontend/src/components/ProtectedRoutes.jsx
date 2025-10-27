// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    // Agar token nahi hai, login page pe redirect
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default ProtectedRoute;
