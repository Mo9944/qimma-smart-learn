import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const DashboardPage = ({ children }: { children: React.ReactNode }) => (
  <DashboardLayout>{children}</DashboardLayout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<DashboardPage><DashboardHome /></DashboardPage>} />
          <Route path="/dashboard/subjects" element={<DashboardPage><Subjects /></DashboardPage>} />
          <Route path="/dashboard/ai" element={<DashboardPage><AITools /></DashboardPage>} />
          <Route path="/dashboard/quizzes" element={<DashboardPage><Quizzes /></DashboardPage>} />
          <Route path="/dashboard/analytics" element={<DashboardPage><Analytics /></DashboardPage>} />
          <Route path="/dashboard/achievements" element={<DashboardPage><Achievements /></DashboardPage>} />
          <Route path="/dashboard/time" element={<DashboardPage><TimeManagement /></DashboardPage>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
