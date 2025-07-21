
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@/utils/productionDebugger";
import { AuthProvider } from "./context/AuthContext";
import { RegistrationProvider } from "./context/RegistrationContext";
import { useState } from "react";
import AuthDebug from "./components/debug/AuthDebug";
import DatabaseCheck from "./components/debug/DatabaseCheck";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./components/ui/dialog";
import PasswordResetDebug from "./components/debug/PasswordResetDebug";

// Auth pages (redirecting to dashboard for m4p)
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { AuthError } from "./pages/AuthError";

// Patient pages (now public)
import PatientDashboard from "./pages/PatientDashboard";
import SymptomTracker from "./pages/patient/SymptomTracker";
import PatientInsights from "./pages/patient/PatientInsights";
import AIChat from "./pages/patient/AIChat";
import FoodDiary from "./pages/patient/FoodDiary";
import NutritionAnalysis from "./pages/patient/NutritionAnalysis";
import NutritionPlan from "./pages/patient/NutritionPlan";
import NutritionTracker from "./pages/patient/NutritionTracker";
import Recipes from "./pages/patient/Recipes";
import CycleTracker from "./pages/patient/CycleTracker";
import LabTests from "./pages/patient/LabTests";
import DoctorBooking from "./pages/patient/DoctorBooking";
import Community from "./pages/patient/Community";
import Settings from "./pages/patient/Settings";
import Documents from "./pages/patient/Documents";
import DocumentPlatform from "./pages/patient/DocumentPlatform";
import DataDiagnostics from "./pages/patient/DataDiagnostics";
import PatientRecommendations from "./pages/patient/PatientRecommendations";
import Calendar from "./pages/patient/Calendar";
import AdvancedRecommendations from "./pages/patient/AdvancedRecommendations";
import HealthDataIntegrations from "./pages/patient/HealthDataIntegrations";
import MedicalDigitalTwin from './pages/patient/MedicalDigitalTwin';
import Academy from './pages/patient/Academy';

// Landing and other pages
import Home from "./pages/Home";
import AboutPlatform from "./pages/AboutPlatform";
import HowWeHelp from "./pages/HowWeHelp";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Legal pages
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";

// Components
import { SleepDashboard } from "./components/sleep/SleepDashboard";
import { DataSourcesDashboard } from "./components/data/DataSourcesDashboard";

// Demo site map
import DemoSiteMap from "./pages/DemoSiteMap";

// Providers
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { FoodDiaryProvider } from "./contexts/FoodDiaryContext";
import { BasicNotificationProvider } from "./contexts/BasicNotificationContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const [showDebug, setShowDebug] = useState(false);
  const [showDatabaseCheck, setShowDatabaseCheck] = useState(false);
  const [showPasswordDebug, setShowPasswordDebug] = useState(false);

  // Handle keyboard shortcuts for debugging
  useState(() => {
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
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <RegistrationProvider>
              <SubscriptionProvider>
                <FoodDiaryProvider>
                  <BasicNotificationProvider>
                    <Routes>
                      {/* PUBLIC ROUTES */}
                      <Route path="/" element={<DemoSiteMap />} />
                      <Route path="/about" element={<AboutPlatform />} />
                      <Route path="/how-we-help" element={<HowWeHelp />} />
                      <Route path="/contact" element={<Contact />} />
                      
                      {/* LEGAL ROUTES */}
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/terms" element={<TermsOfService />} />

                      {/* AUTH ROUTES (redirect to dashboard for m4p) */}
                      <Route path="/login" element={<Navigate to="/patient/dashboard" replace />} />
                      <Route path="/register" element={<Navigate to="/patient/dashboard" replace />} />
                      <Route path="/forgot-password" element={<Navigate to="/patient/dashboard" replace />} />
                      <Route path="/reset-password" element={<Navigate to="/patient/dashboard" replace />} />
                      <Route path="/auth-error" element={<AuthError />} />

                      {/* DEMO ACCESS - All patient routes are now public */}
                      <Route path="/patient/dashboard" element={<PatientDashboard />} />
                      <Route path="/patient/symptoms" element={<SymptomTracker />} />
                      <Route path="/patient/insights" element={<PatientInsights />} />
                      <Route path="/patient/ai-chat" element={<AIChat />} />
                      <Route path="/patient/nutrition" element={<FoodDiary />} />
                      <Route path="/patient/doctor-booking" element={<DoctorBooking />} />
                      <Route path="/patient/community" element={<Community />} />
                      <Route path="/patient/nutrition-analysis" element={<NutritionAnalysis />} />
                      <Route path="/patient/recipes" element={<Recipes />} />
                      <Route path="/patient/nutrition-plan" element={<NutritionPlan />} />
                      <Route path="/patient/nutrition-tracker" element={<NutritionTracker />} />
                      <Route path="/patient/cycle" element={<CycleTracker />} />
                      <Route path="/patient/lab-tests" element={<LabTests />} />
                      <Route path="/patient/settings" element={<Settings />} />
                      <Route path="/patient/recommendations" element={<PatientRecommendations />} />
                      <Route path="/patient/documents" element={<Documents />} />
                      <Route path="/patient/document-platform" element={<DocumentPlatform />} />
                      <Route path="/patient/sleep-dashboard" element={<SleepDashboard />} />
                      <Route path="/patient/data-sources" element={<DataSourcesDashboard />} />
                      <Route path="/patient/diagnostics" element={<DataDiagnostics />} />
                      <Route path="/patient/calendar" element={<Calendar />} />
                      <Route path="/patient/advanced-recommendations" element={<AdvancedRecommendations />} />
                      <Route path="/patient/health-data-integrations" element={<HealthDataIntegrations />} />
                      <Route path="/patient/medical-digital-twin" element={<MedicalDigitalTwin />} />
                      <Route path="/patient/academy" element={<Academy />} />

                      {/* Legacy redirects */}
                      <Route path="/dashboard" element={<Navigate to="/patient/dashboard" replace />} />

                      {/* FALLBACK */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    
                    {/* DEBUG COMPONENTS */}
                    {showDebug && <AuthDebug />}
                    
                    <Dialog open={showDatabaseCheck} onOpenChange={setShowDatabaseCheck}>
                      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Проверка базы данных</DialogTitle>
                        </DialogHeader>
                        <DatabaseCheck />
                      </DialogContent>
                    </Dialog>
                    
                    {showPasswordDebug && (
                      <PasswordResetDebug onClose={() => setShowPasswordDebug(false)} />
                    )}
                  </BasicNotificationProvider>
                </FoodDiaryProvider>
              </SubscriptionProvider>
            </RegistrationProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
