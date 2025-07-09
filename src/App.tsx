import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { DashboardRedirect } from "./components/DashboardRedirect";
import { UserRole } from "./types/roles";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import PatientDashboard from "./pages/PatientDashboard";
import PatientOnboarding from "./pages/patient/PatientOnboarding";
import SymptomTracker from "./pages/patient/SymptomTracker";
import AIChat from "./pages/patient/AIChat";
import PatientInsights from "./pages/patient/PatientInsights";
import WearableDevices from "./pages/patient/WearableDevices";

import NutritionTracker from "./pages/patient/NutritionTracker";
import NutritionPlan from "./pages/patient/NutritionPlan";
import NutritionAnalysis from "./pages/patient/NutritionAnalysis";
import FoodDiary from "./pages/patient/FoodDiary";
import CycleTracker from "./pages/patient/CycleTracker";
import Community from "./pages/patient/Community";
import DoctorDashboard from "./pages/DoctorDashboard";
import EmbeddedCalculators from "./pages/doctor/EmbeddedCalculators";
import AdminDashboard from "./pages/AdminDashboard";
import { RecommendationsDemo } from "./pages/patient/RecommendationsDemo";
import { AdvancedRecommendationsDemo } from "./pages/patient/AdvancedRecommendationsDemo";
import NotFound from "./pages/NotFound";
import AboutPlatform from "./pages/AboutPlatform";
import HowWeHelp from "./pages/HowWeHelp";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { FoodDiaryProvider } from "./contexts/FoodDiaryContext";
import { BasicNotificationProvider } from "./contexts/BasicNotificationContext";

const queryClient = new QueryClient();

const App = () => (
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
            {/* Auth routes without layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Legacy dashboard route - redirect to role-specific dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            } />
            
            {/* Patient onboarding route */}
            <Route path="/patient/onboarding" element={
              <ProtectedRoute requiredRole={UserRole.PATIENT}>
                <PatientOnboarding />
              </ProtectedRoute>
            } />
            
            {/* Patient symptom tracker route */}
            <Route path="/patient/symptoms" element={
              <ProtectedRoute requiredRole={UserRole.PATIENT}>
                <SymptomTracker />
              </ProtectedRoute>
            } />
            
            {/* Patient AI chat route */}
            <Route path="/patient/ai-chat" element={
              <ProtectedRoute requiredRole={UserRole.PATIENT}>
                <AIChat />
              </ProtectedRoute>
            } />
            
            {/* Patient insights route */}
            <Route path="/patient/insights" element={
              <ProtectedRoute requiredRole={UserRole.PATIENT}>
                <PatientInsights />
              </ProtectedRoute>
            } />
            
            {/* Patient wearable devices route */}
            <Route path="/patient/wearables" element={
              <ProtectedRoute requiredRole={UserRole.PATIENT}>
                <WearableDevices />
              </ProtectedRoute>
            } />
            
            {/* Patient doctors route - placeholder */}
            <Route path="/patient/doctors" element={
              <ProtectedRoute requiredRole={UserRole.PATIENT}>
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center p-8">
                    <h1 className="text-2xl font-bold mb-4">Врачи</h1>
                    <p className="text-muted-foreground">Этот раздел будет доступен в следующих версиях</p>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            
            {/* Patient lab tests route - placeholder */}
            <Route path="/patient/lab-tests" element={
              <ProtectedRoute requiredRole={UserRole.PATIENT}>
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center p-8">
                    <h1 className="text-2xl font-bold mb-4">Лабораторные анализы</h1>
                    <p className="text-muted-foreground">Этот раздел будет доступен в следующих версиях</p>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            
            {/* Patient nutrition tracker route */}
            <Route path="/patient/nutrition" element={
              <ProtectedRoute requiredRole={UserRole.PATIENT}>
                <NutritionTracker />
              </ProtectedRoute>
            } />
            
            {/* Patient nutrition plan route */}
            <Route path="/patient/nutrition-plan" element={
              <ProtectedRoute requiredRole={UserRole.PATIENT}>
                <NutritionPlan />
              </ProtectedRoute>
            } />
            
            {/* Patient nutrition analysis route */}
            <Route path="/patient/nutrition-analysis" element={
              <ProtectedRoute requiredRole={UserRole.PATIENT}>
                <NutritionAnalysis />
              </ProtectedRoute>
            } />
            
            {/* Patient food diary route */}
            <Route path="/patient/food-diary" element={
              <ProtectedRoute requiredRole={UserRole.PATIENT}>
                <FoodDiary />
              </ProtectedRoute>
            } />
            
            {/* Patient cycle tracker route */}
            <Route path="/patient/cycle" element={
              <ProtectedRoute requiredRole={UserRole.PATIENT}>
                <CycleTracker />
              </ProtectedRoute>
            } />
            
            {/* Patient community route */}
            <Route path="/patient/community" element={
              <ProtectedRoute requiredRole={UserRole.PATIENT}>
                <Community />
              </ProtectedRoute>
            } />
            
            {/* Patient recommendations demo route */}
            <Route path="/patient/recommendations" element={
              <ProtectedRoute requiredRole={UserRole.PATIENT}>
                <RecommendationsDemo />
              </ProtectedRoute>
            } />
            
            {/* Advanced recommendations demo route */}
            <Route path="/patient/advanced-recommendations" element={
              <ProtectedRoute requiredRole={UserRole.PATIENT}>
                <AdvancedRecommendationsDemo />
              </ProtectedRoute>
            } />
            
            {/* Role-specific protected dashboards */}
            <Route path="/patient/dashboard" element={
              <ProtectedRoute requiredRole={UserRole.PATIENT}>
                <PatientDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/doctor/dashboard" element={
              <ProtectedRoute requiredRole={UserRole.DOCTOR}>
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/doctor/embedded-calculators" element={
              <ProtectedRoute requiredRole={UserRole.DOCTOR}>
                <EmbeddedCalculators />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* Main routes with layout */}
            <Route path="/" element={
              <Layout>
                <Home />
              </Layout>
            } />
            
            {/* Add placeholder routes for footer links */}
            <Route path="/about" element={<AboutPlatform />} />
            <Route path="/how-we-help" element={<HowWeHelp />} />
            <Route path="/pricing" element={<HowWeHelp />} />
            
            <Route path="/services" element={
              <Layout>
                <div className="min-h-screen bloom-gradient flex items-center justify-center">
                  <div className="bloom-card p-8 text-center">
                    <h1 className="text-2xl font-playfair font-bold mb-4">Услуги</h1>
                    <p className="text-muted-foreground">Эта страница в разработке</p>
                  </div>
                </div>
              </Layout>
            } />
            
            <Route path="/contact" element={
              <Layout>
                <div className="min-h-screen bloom-gradient flex items-center justify-center">
                  <div className="bloom-card p-8 text-center">
                    <h1 className="text-2xl font-playfair font-bold mb-4">Контакты</h1>
                    <p className="text-muted-foreground">Эта страница в разработке</p>
                  </div>
                </div>
              </Layout>
            } />
            
            <Route path="/privacy" element={
              <Layout>
                <div className="min-h-screen bloom-gradient flex items-center justify-center">
                  <div className="bloom-card p-8 text-center">
                    <h1 className="text-2xl font-playfair font-bold mb-4">Политика конфиденциальности</h1>
                    <p className="text-muted-foreground">Эта страница в разработке</p>
                  </div>
                </div>
              </Layout>
            } />
            
            <Route path="/terms" element={
              <Layout>
                <div className="min-h-screen bloom-gradient flex items-center justify-center">
                  <div className="bloom-card p-8 text-center">
                    <h1 className="text-2xl font-playfair font-bold mb-4">Условия использования</h1>
                    <p className="text-muted-foreground">Эта страница в разработке</p>
                  </div>
                </div>
              </Layout>
            } />
            
            {/* Catch-all route */}
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

export default App;
