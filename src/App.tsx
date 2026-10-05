import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";

// Auth Provider
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Layouts
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AppLayout } from "@/components/layout/AppLayout";

// Public Pages
import Landing from "@/pages/Landing";
import Pricing from "@/pages/Pricing";
import Webinar from "@/pages/Webinar";
import HelpCenter from "@/pages/HelpCenter";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

// App Pages
import Dashboard from "@/pages/app/Dashboard";
import Files from "@/pages/app/Files";
import RecentFiles from "@/pages/app/RecentFiles";
import StarredFiles from "@/pages/app/StarredFiles";
import Trash from "@/pages/app/Trash";
import SharedFiles from "@/pages/app/SharedFiles";
import Settings from "@/pages/app/Settings";
import AdminDashboard from "@/pages/app/AdminDashboard";
import PublicShare from "@/pages/PublicShare";

import NotFound from "@/pages/NotFound";
import { Navigate } from "react-router-dom";
import CrmAuth from "@/pages/crm/CrmAuth";
import CrmLayout from "@/components/crm/CrmLayout";
import Overview from "@/pages/crm/Overview";
import Bookings from "@/pages/crm/Bookings";
import Slots from "@/pages/crm/Slots";
import Ads from "@/pages/crm/Ads";
import Services from "@/pages/crm/Services";
import WhatsAppFlow from "@/pages/crm/WhatsAppFlow";
import ExportData from "@/pages/crm/ExportData";
import Customers from "@/pages/crm/Customers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<CrmAuth mode="login" />} />
              <Route path="/signup" element={<CrmAuth mode="signup" />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/app" element={<ProtectedRoute><CrmLayout /></ProtectedRoute>}>
                <Route index element={<Overview />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="customers" element={<Customers />} />
                <Route path="slots" element={<Slots />} />
                <Route path="ads" element={<Ads />} />
                <Route path="whatsapp" element={<WhatsAppFlow />} />
                <Route path="services" element={<Services />} />
                <Route path="export" element={<ExportData />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
