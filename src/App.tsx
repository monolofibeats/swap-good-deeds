import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import QuestDetail from "./pages/QuestDetail";
import CreateListing from "./pages/CreateListing";
import ListingDetail from "./pages/ListingDetail";
import Rewards from "./pages/Rewards";
import MyCodes from "./pages/MyCodes";
import Saved from "./pages/Saved";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import PointsHistory from "./pages/PointsHistory";
import BuyPoints from "./pages/BuyPoints";
import Messages from "./pages/Messages";
import SupporterApplication from "./pages/SupporterApplication";
import SupporterDashboard from "./pages/SupporterDashboard";
import SupporterCreateListing from "./pages/SupporterCreateListing";
import VerifyCode from "./pages/VerifyCode";
import MyActivity from "./pages/MyActivity";
import EventDetail from "./pages/EventDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public landing page */}
            <Route path="/" element={<Landing />} />
            
            {/* Auth routes */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes */}
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/supporter-application" element={<ProtectedRoute><SupporterApplication /></ProtectedRoute>} />
            <Route path="/supporter" element={<ProtectedRoute requireSupporter><SupporterDashboard /></ProtectedRoute>} />
            <Route path="/supporter/create-listing" element={<ProtectedRoute requireSupporter><SupporterCreateListing /></ProtectedRoute>} />
            <Route path="/verify-code" element={<ProtectedRoute requireSupporter><VerifyCode /></ProtectedRoute>} />
            <Route path="/home" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/events/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
            <Route path="/quests/:id" element={<ProtectedRoute><QuestDetail /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
            <Route path="/listing/:id" element={<ProtectedRoute><ListingDetail /></ProtectedRoute>} />
            <Route path="/listings/:id" element={<ProtectedRoute><ListingDetail /></ProtectedRoute>} />
            <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
            <Route path="/my" element={<ProtectedRoute><MyActivity /></ProtectedRoute>} />
            <Route path="/my-codes" element={<ProtectedRoute><MyCodes /></ProtectedRoute>} />
            <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/points-history" element={<ProtectedRoute><PointsHistory /></ProtectedRoute>} />
            <Route path="/buy-points" element={<ProtectedRoute><BuyPoints /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
