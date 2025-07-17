import React from 'react';
import { UserRole } from '@/types/roles';

// Lazy load components
const PatientDashboard = React.lazy(() => import('@/pages/PatientDashboard'));
const SymptomTracker = React.lazy(() => import('@/pages/patient/SymptomTracker'));
const NutritionTracker = React.lazy(() => import('@/pages/patient/NutritionTracker'));
const Recipes = React.lazy(() => import('@/pages/patient/Recipes'));
const NutritionPlan = React.lazy(() => import('@/pages/patient/NutritionPlan'));
const NutritionAnalysis = React.lazy(() => import('@/pages/patient/NutritionAnalysis'));
const Academy = React.lazy(() => import('@/pages/patient/Academy'));
const CycleTracker = React.lazy(() => import('@/pages/patient/CycleTracker'));
const Calendar = React.lazy(() => import('@/pages/patient/Calendar'));
const SleepDashboard = React.lazy(() => import('@/pages/patient/SleepDashboard'));
const DataSourcesDashboard = React.lazy(() => import('@/pages/patient/DataSourcesDashboard'));
const DocumentPlatform = React.lazy(() => import('@/pages/patient/DocumentPlatform'));
const DataDiagnostics = React.lazy(() => import('@/pages/patient/DataDiagnostics'));
const HealthDataIntegrations = React.lazy(() => import('@/pages/patient/HealthDataIntegrations'));
const DoctorBooking = React.lazy(() => import('@/pages/patient/DoctorBooking'));
const LabTests = React.lazy(() => import('@/pages/patient/LabTests'));
const Insights = React.lazy(() => import('@/pages/patient/PatientInsights'));
const AiChat = React.lazy(() => import('@/pages/patient/AIChat'));
const Documents = React.lazy(() => import('@/pages/patient/Documents'));
const Recommendations = React.lazy(() => import('@/pages/patient/PatientRecommendations'));
const AdvancedRecommendations = React.lazy(() => import('@/pages/patient/AdvancedRecommendations'));
const Community = React.lazy(() => import('@/pages/patient/Community'));
const PatientSettings = React.lazy(() => import('@/pages/patient/Settings'));

// Doctor pages
const DoctorDashboard = React.lazy(() => import('@/pages/DoctorDashboard'));
const DoctorPatients = React.lazy(() => import('@/pages/doctor/DoctorPatients'));
const DoctorSearch = React.lazy(() => import('@/pages/doctor/DoctorSearch'));
const EmbeddedCalculators = React.lazy(() => import('@/pages/doctor/EmbeddedCalculators'));
const DoctorAnalytics = React.lazy(() => import('@/pages/doctor/DoctorAnalytics'));
const DoctorKnowledge = React.lazy(() => import('@/pages/doctor/DoctorKnowledge'));
const DoctorConsultations = React.lazy(() => import('@/pages/doctor/DoctorConsultations'));
const DoctorSettings = React.lazy(() => import('@/pages/doctor/DoctorSettings'));

// Expert pages
const ExpertBlog = React.lazy(() => import('@/pages/expert/ExpertBlog'));
const ExpertArticles = React.lazy(() => import('@/pages/expert/ExpertArticles'));
const ExpertSettings = React.lazy(() => import('@/pages/expert/ExpertSettings'));

// Admin pages
const AdminDashboard = React.lazy(() => import('@/pages/AdminDashboard'));
const AdminUsers = React.lazy(() => import('@/pages/admin/AdminUsers'));
const AdminAnalytics = React.lazy(() => import('@/pages/admin/AdminAnalytics'));
const AdminModeration = React.lazy(() => import('@/pages/admin/AdminModeration'));
const AdminSettings = React.lazy(() => import('@/pages/admin/AdminSettings'));
const AdminSecurity = React.lazy(() => import('@/pages/admin/AdminSecurity'));
const AdminReports = React.lazy(() => import('@/pages/admin/AdminReports'));
const AdminLogs = React.lazy(() => import('@/pages/admin/AdminLogs'));

export interface RouteConfig {
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  allowedRoles: UserRole[];
}

export const ROUTE_CONFIG: RouteConfig[] = [
  // Patient routes
  { path: '/patient/dashboard', component: PatientDashboard, allowedRoles: [UserRole.PATIENT] },
  { path: '/patient/symptoms', component: SymptomTracker, allowedRoles: [UserRole.PATIENT] },
  { path: '/patient/nutrition', component: NutritionTracker, allowedRoles: [UserRole.PATIENT] },
  { path: '/patient/recipes', component: Recipes, allowedRoles: [UserRole.PATIENT] },
  { path: '/patient/nutrition-plan', component: NutritionPlan, allowedRoles: [UserRole.PATIENT] },
  { path: '/patient/nutrition-analysis', component: NutritionAnalysis, allowedRoles: [UserRole.PATIENT] },
  { path: '/patient/academy', component: Academy, allowedRoles: [UserRole.PATIENT] },
  { path: '/patient/cycle', component: CycleTracker, allowedRoles: [UserRole.PATIENT] },
  { path: '/patient/calendar', component: Calendar, allowedRoles: [UserRole.PATIENT] },
  { path: '/patient/sleep-dashboard', component: SleepDashboard, allowedRoles: [UserRole.PATIENT] },
  { path: '/patient/data-sources', component: DataSourcesDashboard, allowedRoles: [UserRole.PATIENT] },
  { path: '/patient/document-platform', component: DocumentPlatform, allowedRoles: [UserRole.PATIENT] },
  { path: '/patient/diagnostics', component: DataDiagnostics, allowedRoles: [UserRole.PATIENT] },
  { path: '/patient/health-data-integrations', component: HealthDataIntegrations, allowedRoles: [UserRole.PATIENT] },
  { path: '/patient/doctor-booking', component: DoctorBooking, allowedRoles: [UserRole.PATIENT] },
  { path: '/patient/lab-tests', component: LabTests, allowedRoles: [UserRole.PATIENT] },
  { path: '/patient/insights', component: Insights, allowedRoles: [UserRole.PATIENT] },
  { path: '/patient/ai-chat', component: AiChat, allowedRoles: [UserRole.PATIENT] },
  { path: '/patient/documents', component: Documents, allowedRoles: [UserRole.PATIENT] },
  { path: '/patient/recommendations', component: Recommendations, allowedRoles: [UserRole.PATIENT] },
  { path: '/patient/advanced-recommendations', component: AdvancedRecommendations, allowedRoles: [UserRole.PATIENT] },
  { path: '/patient/community', component: Community, allowedRoles: [UserRole.PATIENT] },
  { path: '/patient/settings', component: PatientSettings, allowedRoles: [UserRole.PATIENT] },

  // Doctor routes
  { path: '/doctor/dashboard', component: DoctorDashboard, allowedRoles: [UserRole.DOCTOR] },
  { path: '/doctor/patients', component: DoctorPatients, allowedRoles: [UserRole.DOCTOR] },
  { path: '/doctor/search', component: DoctorSearch, allowedRoles: [UserRole.DOCTOR] },
  { path: '/doctor/embedded-calculators', component: EmbeddedCalculators, allowedRoles: [UserRole.DOCTOR] },
  { path: '/doctor/analytics', component: DoctorAnalytics, allowedRoles: [UserRole.DOCTOR] },
  { path: '/doctor/knowledge', component: DoctorKnowledge, allowedRoles: [UserRole.DOCTOR] },
  { path: '/doctor/consultations', component: DoctorConsultations, allowedRoles: [UserRole.DOCTOR] },
  { path: '/doctor/settings', component: DoctorSettings, allowedRoles: [UserRole.DOCTOR] },

  // Expert routes
  { path: '/expert/blog', component: ExpertBlog, allowedRoles: [UserRole.EXPERT] },
  { path: '/expert/articles', component: ExpertArticles, allowedRoles: [UserRole.EXPERT] },
  { path: '/expert/settings', component: ExpertSettings, allowedRoles: [UserRole.EXPERT] },

  // Admin routes
  { path: '/admin/dashboard', component: AdminDashboard, allowedRoles: [UserRole.ADMIN] },
  { path: '/admin/users', component: AdminUsers, allowedRoles: [UserRole.ADMIN] },
  { path: '/admin/analytics', component: AdminAnalytics, allowedRoles: [UserRole.ADMIN] },
  { path: '/admin/moderation', component: AdminModeration, allowedRoles: [UserRole.ADMIN] },
  { path: '/admin/settings', component: AdminSettings, allowedRoles: [UserRole.ADMIN] },
  { path: '/admin/security', component: AdminSecurity, allowedRoles: [UserRole.ADMIN] },
  { path: '/admin/reports', component: AdminReports, allowedRoles: [UserRole.ADMIN] },
  { path: '/admin/logs', component: AdminLogs, allowedRoles: [UserRole.ADMIN] },
];

// Функция для извлечения всех путей из роутов
export const extractAllRoutes = (): string[] => {
  return ROUTE_CONFIG.map(route => route.path);
};