import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAppStore } from "@/store";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ClientLogin from "./pages/auth/client/Login";
import ClientSignup from "./pages/auth/client/Signup";
import InternalLogin from "./pages/auth/internal/Login";
import ClientDashboard from "./pages/dashboards/ClientDashboard";
import ClientProjects from "./pages/client/Projects";
import NewProject from "./pages/client/NewProject";
import PRDEditor from "./pages/client/PRDEditor";
import InternalProjects from "./pages/internal/Projects";
import InternalProjectDetail from "./pages/internal/ProjectDetail";
import ClientReview from "./pages/client/Review";

const queryClient = new QueryClient();

const App = () => {
  // Initialize Zustand store on app start
  const initializeStore = useAppStore((state) => state);
  
  useEffect(() => {
    // This will trigger Zustand persist hydration
    console.log('App initialized, store hydrated');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Client Auth Routes */}
          <Route path="/client/auth/login" element={<ClientLogin />} />
          <Route path="/client/auth/signup" element={<ClientSignup />} />
          
          {/* Internal Auth Routes */}
          <Route path="/internal/auth/login" element={<InternalLogin />} />
          
          {/* Client Dashboard */}
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          
          {/* Client Projects */}
          <Route path="/client/projects" element={<ClientProjects />} />
          <Route path="/client/projects/new" element={<NewProject />} />
          <Route path="/client/projects/:projectId/prd" element={<PRDEditor />} />
          
          {/* Internal Projects */}
          <Route path="/internal/projects" element={<InternalProjects />} />
          <Route path="/internal/projects/:projectId" element={<InternalProjectDetail />} />
          
          {/* Client Review */}
          <Route path="/client/review/:token" element={<ClientReview />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
