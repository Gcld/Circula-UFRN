import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import ObjectDetail from "./pages/ObjectDetail";
import CreateObject from "./pages/CreateObject";
import Profile from "./pages/Profile";
import ProposeTrade from "./pages/ProposeTrade";
import MyObjects from "./pages/MyObjects";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meus-objetos"
              element={
                <ProtectedRoute>
                  <MyObjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/objeto/:id"
              element={
                <ProtectedRoute>
                  <ObjectDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cadastrar-objeto"
              element={
                <ProtectedRoute>
                  <CreateObject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/propor-troca/:id"
              element={
                <ProtectedRoute>
                  <ProposeTrade />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;