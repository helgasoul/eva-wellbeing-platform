
import React from 'react';
import { Navigate } from 'react-router-dom';

// Simplified MultiStepRegistration for m4p version - always redirect to dashboard
const MultiStepRegistration: React.FC = () => {
  return <Navigate to="/patient/dashboard" replace />;
};

export default MultiStepRegistration;
