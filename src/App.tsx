import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import MyGames from "@/pages/MyGames";
import Friends from "@/pages/Friends";
import Pricing from "@/pages/Pricing";
import Publishing from "@/pages/Publishing";
import NotFound from "@/pages/NotFound";
import { GameRoom } from "@/components/game/GameRoom";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/games" element={<MyGames />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/publishing" element={<Publishing />} />
              <Route path="/room/:roomId" element={<GameRoom />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
