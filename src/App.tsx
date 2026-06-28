import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

import { Layout } from '@/components/Layout';
import { SplashScreen } from '@/components/SplashScreen';
import { CompareBar } from '@/components/CompareBar';
import { CompareProvider } from '@/contexts/CompareContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Compare from '@/pages/Compare';
import About from '@/pages/About';
import Quality from '@/pages/Quality';
import Wholesale from '@/pages/Wholesale';
import ExportPage from '@/pages/Export';
import Knowledge from '@/pages/Knowledge';
import Contact from '@/pages/Contact';
import Trademarks from '@/pages/Trademarks';
import Uses from '@/pages/Uses';
import Articles from '@/pages/Articles';
import Studio from '@/pages/Studio';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CompareProvider>
            <SplashScreen />
            <Toaster />
            <Sonner />
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:slug" element={<ProductDetail />} />
                <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
                <Route path="/about" element={<About />} />
                <Route path="/quality" element={<Quality />} />
                <Route path="/wholesale" element={<ProtectedRoute requireRole="wholesale"><Wholesale /></ProtectedRoute>} />
                <Route path="/export" element={<ExportPage />} />
                <Route path="/knowledge" element={<Knowledge />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/trademarks" element={<Trademarks />} />
                <Route path="/uses" element={<Uses />} />
                <Route path="/articles" element={<Articles />} />
                <Route path="/studio" element={<ProtectedRoute><Studio /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            <CompareBar />
          </CompareProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
