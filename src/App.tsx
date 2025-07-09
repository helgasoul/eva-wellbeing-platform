import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

import { OnboardingGuard } from "./components/auth/OnboardingGuard";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// NEW: Multi-step registration
import MultiStepRegistration from "./pages/auth/MultiStepRegistration";

// Patient pages
import PatientDashboard from "./pages/PatientDashboard";
import PatientOnboarding from "./pages/patient/PatientOnboarding";
import SymptomTracker from "./pages/patient/SymptomTracker";
import PatientInsights from "./pages/patient/PatientInsights";
import AIChat from "./pages/patient/AIChat";
import FoodDiary from "./pages/patient/FoodDiary";
import DoctorBooking from "./pages/patient/DoctorBooking";
import Community from "./pages/patient/Community";

// Doctor pages
import DoctorDashboard from "./pages/DoctorDashboard";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";

// Landing and other pages
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Providers
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { FoodDiaryProvider } from "./contexts/FoodDiaryContext";
import { BasicNotificationProvider } from "./contexts/BasicNotificationContext";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <SubscriptionProvider>
              <FoodDiaryProvider>
                <BasicNotificationProvider>
                  <Routes>
                    {/* PUBLIC ROUTES */}
                    <Route path="/" element={<Home />} />
                    
                    {/* LEGAL ROUTES */}
                    <Route path="/privacy" element={
                      <div className="min-h-screen bloom-gradient flex items-center justify-center">
                        <div className="bloom-card p-8 text-center">
                          <h1 className="text-2xl font-playfair font-bold mb-4">Политика конфиденциальности</h1>
                          <p className="text-muted-foreground">Эта страница в разработке</p>
                        </div>
                      </div>
                    } />
                    <Route path="/terms" element={
                      <div className="min-h-screen bloom-gradient flex items-center justify-center">
                        <div className="bloom-card p-8 text-center">
                          <h1 className="text-2xl font-playfair font-bold mb-4">Условия использования</h1>
                          <p className="text-muted-foreground">Эта страница в разработке</p>
                        </div>
                      </div>
                    } />

                    {/* GUEST-ONLY ROUTES (для незарегистрированных) */}
                    <Route
                      path="/login"
                      element={
                        <ProtectedRoute requireGuest={true}>
                          <Login />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/register"
                      element={
                        <ProtectedRoute requireGuest={true}>
                          <Register />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* NEW: Multi-step registration */}
                    <Route
                      path="/registration/*"
                      element={
                        <ProtectedRoute requireGuest={true}>
                          <MultiStepRegistration />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/forgot-password"
                      element={
                        <ProtectedRoute requireGuest={true}>
                          <ForgotPassword />
                        </ProtectedRoute>
                      }
                    />

                    {/* Legacy dashboard route - redirect to role-specific dashboard */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Navigate to="/patient/dashboard" replace />
                      </ProtectedRoute>
                    } />

                    {/* PATIENT ROUTES - с OnboardingGuard */}
                    <Route path="/patient/dashboard" element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <OnboardingGuard>
                          <PatientDashboard />
                        </OnboardingGuard>
                      </ProtectedRoute>
                    } />
                    
                    {/* Онбординг БЕЗ OnboardingGuard */}
                    <Route path="/patient/onboarding" element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <PatientOnboarding />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/patient/symptoms" element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <OnboardingGuard>
                          <SymptomTracker />
                        </OnboardingGuard>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/patient/insights" element={
      <ProtectedRoute allowedRoles={['patient']}>
        <OnboardingGuard>
          <PatientInsights />
        </OnboardingGuard>
      </ProtectedRoute>
    } />
    
    <Route path="/patient/chat" element={
      <ProtectedRoute allowedRoles={['patient']}>
        <OnboardingGuard>
          <AIChat />
        </OnboardingGuard>
      </ProtectedRoute>
    } />
    
    <Route path="/patient/nutrition" element={
      <ProtectedRoute allowedRoles={['patient']}>
        <OnboardingGuard>
          <FoodDiary />
        </OnboardingGuard>
      </ProtectedRoute>
    } />
    
    <Route path="/patient/doctor-booking" element={
      <ProtectedRoute allowedRoles={['patient']}>
        <OnboardingGuard>
          <DoctorBooking />
        </OnboardingGuard>
      </ProtectedRoute>
    } />
    
    <Route path="/patient/community" element={
      <ProtectedRoute allowedRoles={['patient']}>
        <OnboardingGuard>
          <Community />
        </OnboardingGuard>
      </ProtectedRoute>
    } />
    
    <Route path="/patient/sleep-dashboard" element={
      <ProtectedRoute allowedRoles={['patient']}>
        <OnboardingGuard>
          <div className="p-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold">Анализ сна</h1>
            </div>
            <div>Компонент SleepDashboard будет загружен здесь</div>
          </div>
        </OnboardingGuard>
      </ProtectedRoute>
    } />
    
    <Route path="/patient/data-sources" element={
      <ProtectedRoute allowedRoles={['patient']}>
        <OnboardingGuard>
          <div className="p-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold">Источники данных</h1>
            </div>
            <div>Компонент DataSourcesDashboard будет загружен здесь</div>
          </div>
        </OnboardingGuard>
      </ProtectedRoute>
    } />

                    {/* DOCTOR ROUTES */}
                    <Route path="/doctor/dashboard" element={
                      <ProtectedRoute allowedRoles={['doctor']}>
                        <DoctorDashboard />
                      </ProtectedRoute>
                    } />

                    {/* ADMIN ROUTES */}
                    <Route path="/admin/dashboard" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />

                    {/* FALLBACK */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BasicNotificationProvider>
              </FoodDiaryProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;