
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/layout/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth routes without layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Main routes with layout */}
            <Route path="/" element={
              <Layout>
                <Home />
              </Layout>
            } />
            
            {/* Add placeholder routes for footer links */}
            <Route path="/about" element={
              <Layout>
                <div className="min-h-screen eva-gradient flex items-center justify-center">
                  <div className="eva-card p-8 text-center">
                    <h1 className="text-2xl font-playfair font-bold mb-4">О платформе</h1>
                    <p className="text-muted-foreground">Эта страница в разработке</p>
                  </div>
                </div>
              </Layout>
            } />
            
            <Route path="/services" element={
              <Layout>
                <div className="min-h-screen eva-gradient flex items-center justify-center">
                  <div className="eva-card p-8 text-center">
                    <h1 className="text-2xl font-playfair font-bold mb-4">Услуги</h1>
                    <p className="text-muted-foreground">Эта страница в разработке</p>
                  </div>
                </div>
              </Layout>
            } />
            
            <Route path="/contact" element={
              <Layout>
                <div className="min-h-screen eva-gradient flex items-center justify-center">
                  <div className="eva-card p-8 text-center">
                    <h1 className="text-2xl font-playfair font-bold mb-4">Контакты</h1>
                    <p className="text-muted-foreground">Эта страница в разработке</p>
                  </div>
                </div>
              </Layout>
            } />
            
            <Route path="/privacy" element={
              <Layout>
                <div className="min-h-screen eva-gradient flex items-center justify-center">
                  <div className="eva-card p-8 text-center">
                    <h1 className="text-2xl font-playfair font-bold mb-4">Политика конфиденциальности</h1>
                    <p className="text-muted-foreground">Эта страница в разработке</p>
                  </div>
                </div>
              </Layout>
            } />
            
            <Route path="/terms" element={
              <Layout>
                <div className="min-h-screen eva-gradient flex items-center justify-center">
                  <div className="eva-card p-8 text-center">
                    <h1 className="text-2xl font-playfair font-bold mb-4">Условия использования</h1>
                    <p className="text-muted-foreground">Эта страница в разработке</p>
                  </div>
                </div>
              </Layout>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
