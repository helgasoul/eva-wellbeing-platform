
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

// Simplified Register page for m4p version - always redirect to dashboard
const Register = () => {
  const { user } = useAuth();
  
  // Since user is always logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/patient/dashboard" replace />;
  }

  return null;
};

export default Register;
