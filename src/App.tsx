import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useState, useEffect } from "react";
import AuthDebug from "./components/debug/AuthDebug";
import DatabaseCheck from "./components/debug/DatabaseCheck";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./components/ui/dialog";
import PasswordResetDebug from "./components/debug/PasswordResetDebug";

import { OnboardingGuard } from "./components/auth/OnboardingGuard";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// NEW: Multi-step registration
import MultiStepRegistration from "./pages/auth/MultiStepRegistration";

// Patient pages
import PatientDashboard from "./pages/PatientDashboard";
import PatientOnboarding from "./pages/patient/PatientOnboarding";
import SymptomTracker from "./pages/patient/SymptomTracker";
import PatientInsights from "./pages/patient/PatientInsights";
import AIChat from "./pages/patient/AIChat";
import FoodDiary from "./pages/patient/FoodDiary";
import NutritionAnalysis from "./pages/patient/NutritionAnalysis";
import NutritionPlan from "./pages/patient/NutritionPlan";
import NutritionTracker from "./pages/patient/NutritionTracker";
import CycleTracker from "./pages/patient/CycleTracker";
import WearableDevices from "./pages/patient/WearableDevices";
import LabTests from "./pages/patient/LabTests";
import DoctorBooking from "./pages/patient/DoctorBooking";
import Community from "./pages/patient/Community";
import Settings from "./pages/patient/Settings";
import Documents from "./pages/patient/Documents";
import DocumentPlatform from "./pages/patient/DocumentPlatform";
import DataDiagnostics from "./pages/patient/DataDiagnostics";

// Doctor pages
import DoctorDashboard from "./pages/DoctorDashboard";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";

// Landing and other pages
import Home from "./pages/Home";
import AboutPlatform from "./pages/AboutPlatform";
import HowWeHelp from "./pages/HowWeHelp";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Dev pages for testing
import DataFlowTestPage from "./pages/dev/DataFlowTestPage";
import EmergencyAccess from "./pages/EmergencyAccess";

// Providers
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { FoodDiaryProvider } from "./contexts/FoodDiaryContext";
import { BasicNotificationProvider } from "./contexts/BasicNotificationContext";

const queryClient = new QueryClient();

function App() {
  const [showDebug, setShowDebug] = useState(false);
  const [showDatabaseCheck, setShowDatabaseCheck] = useState(false);
  const [showPasswordDebug, setShowPasswordDebug] = useState(false);

  // Добавляем обработчик для комбинации клавиш
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        setShowDebug(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
        setShowDatabaseCheck(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        setShowPasswordDebug(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
                    <Route path="/about" element={<AboutPlatform />} />
                    <Route path="/how-we-help" element={<HowWeHelp />} />
                    <Route path="/contact" element={<Contact />} />
                    
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
                    
                    <Route
                      path="/reset-password"
                      element={
                        <ProtectedRoute requireGuest={true}>
                          <ResetPassword />
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
    
    <Route path="/patient/ai-chat" element={
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
    
    <Route path="/patient/doctors" element={
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
    
    <Route path="/patient/nutrition-analysis" element={
      <ProtectedRoute allowedRoles={['patient']}>
        <OnboardingGuard>
          <NutritionAnalysis />
        </OnboardingGuard>
      </ProtectedRoute>
    } />
    
    <Route path="/patient/nutrition-plan" element={
      <ProtectedRoute allowedRoles={['patient']}>
        <OnboardingGuard>
          <NutritionPlan />
        </OnboardingGuard>
      </ProtectedRoute>
    } />
    
    <Route path="/patient/nutrition-tracker" element={
      <ProtectedRoute allowedRoles={['patient']}>
        <OnboardingGuard>
          <NutritionTracker />
        </OnboardingGuard>
      </ProtectedRoute>
    } />
    
    <Route path="/patient/cycle" element={
      <ProtectedRoute allowedRoles={['patient']}>
        <OnboardingGuard>
          <CycleTracker />
        </OnboardingGuard>
      </ProtectedRoute>
    } />
    
    <Route path="/patient/wearables" element={
      <ProtectedRoute allowedRoles={['patient']}>
        <OnboardingGuard>
          <WearableDevices />
        </OnboardingGuard>
      </ProtectedRoute>
    } />
    
    <Route path="/patient/lab-tests" element={
      <ProtectedRoute allowedRoles={['patient']}>
        <OnboardingGuard>
          <LabTests />
        </OnboardingGuard>
      </ProtectedRoute>
    } />
    
    <Route path="/patient/settings" element={
      <ProtectedRoute allowedRoles={['patient']}>
        <OnboardingGuard>
          <Settings />
        </OnboardingGuard>
      </ProtectedRoute>
    } />
    
    <Route path="/patient/documents" element={
      <ProtectedRoute allowedRoles={['patient']}>
        <OnboardingGuard>
          <Documents />
        </OnboardingGuard>
      </ProtectedRoute>
    } />
    
    <Route path="/patient/document-platform" element={
      <ProtectedRoute allowedRoles={['patient']}>
        <OnboardingGuard>
          <DocumentPlatform />
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
    
    <Route path="/patient/diagnostics" element={
      <ProtectedRoute allowedRoles={['patient']}>
        <OnboardingGuard>
          <DataDiagnostics />
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

                    {/* EMERGENCY ACCESS - всегда доступен */}
                    <Route path="/emergency-access" element={<EmergencyAccess />} />

                    {/* DEV ROUTES - для тестирования */}
                    <Route path="/dev/data-flow-test" element={<DataFlowTestPage />} />

                    {/* FALLBACK */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  
                  {/* ОТЛАДОЧНЫЙ КОМПОНЕНТ */}
                  {showDebug && <AuthDebug />}
                  
                  {/* МОДАЛЬНОЕ ОКНО ПРОВЕРКИ БАЗЫ ДАННЫХ */}
                  <Dialog open={showDatabaseCheck} onOpenChange={setShowDatabaseCheck}>
                    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Проверка базы данных</DialogTitle>
                      </DialogHeader>
                      <DatabaseCheck />
                    </DialogContent>
                  </Dialog>
                  
                  {/* ДИАГНОСТИКА СБРОСА ПАРОЛЯ */}
                  {showPasswordDebug && (
                    <PasswordResetDebug onClose={() => setShowPasswordDebug(false)} />
                  )}
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