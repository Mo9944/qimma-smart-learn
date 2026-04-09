import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import Subjects from "./pages/Subjects";
import AITools from "./pages/AITools";
import Quizzes from "./pages/Quizzes";
import Analytics from "./pages/Analytics";
import Achievements from "./pages/Achievements";
import TimeManagement from "./pages/TimeManagement";
import RiasecTest from "./pages/RiasecTest";
import Habits from "./pages/Habits";
import LearningPlan from "./pages/LearningPlan";
import SmartSearch from "./pages/SmartSearch";
import InstallApp from "./pages/InstallApp";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const Page = ({ children }: { children: React.ReactNode }) => (
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
          <Route path="/dashboard" element={<Page><DashboardHome /></Page>} />
          <Route path="/dashboard/subjects" element={<Page><Subjects /></Page>} />
          <Route path="/dashboard/ai" element={<Page><AITools /></Page>} />
          <Route path="/dashboard/quizzes" element={<Page><Quizzes /></Page>} />
          <Route path="/dashboard/analytics" element={<Page><Analytics /></Page>} />
          <Route path="/dashboard/achievements" element={<Page><Achievements /></Page>} />
          <Route path="/dashboard/time" element={<Page><TimeManagement /></Page>} />
          <Route path="/dashboard/riasec" element={<Page><RiasecTest /></Page>} />
          <Route path="/dashboard/habits" element={<Page><Habits /></Page>} />
          <Route path="/dashboard/learning-plan" element={<Page><LearningPlan /></Page>} />
          <Route path="/dashboard/smart-search" element={<Page><SmartSearch /></Page>} />
          <Route path="/install" element={<InstallApp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
