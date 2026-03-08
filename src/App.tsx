import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AuthGuard from "@/components/AuthGuard";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import Subjects from "./pages/Subjects";
import AITools from "./pages/AITools";
import Quizzes from "./pages/Quizzes";
import Analytics from "./pages/Analytics";
import Achievements from "./pages/Achievements";
import TimeManagement from "./pages/TimeManagement";
import RiasecTest from "./pages/RiasecTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedPage = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard>
    <DashboardLayout>{children}</DashboardLayout>
  </AuthGuard>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedPage><DashboardHome /></ProtectedPage>} />
            <Route path="/dashboard/subjects" element={<ProtectedPage><Subjects /></ProtectedPage>} />
            <Route path="/dashboard/ai" element={<ProtectedPage><AITools /></ProtectedPage>} />
            <Route path="/dashboard/quizzes" element={<ProtectedPage><Quizzes /></ProtectedPage>} />
            <Route path="/dashboard/analytics" element={<ProtectedPage><Analytics /></ProtectedPage>} />
            <Route path="/dashboard/achievements" element={<ProtectedPage><Achievements /></ProtectedPage>} />
            <Route path="/dashboard/time" element={<ProtectedPage><TimeManagement /></ProtectedPage>} />
            <Route path="/dashboard/riasec" element={<ProtectedPage><RiasecTest /></ProtectedPage>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
