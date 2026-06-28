import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

import { Layout } from '@/components/Layout';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import About from '@/pages/About';
import Quality from '@/pages/Quality';
import Wholesale from '@/pages/Wholesale';
import ExportPage from '@/pages/Export';
import Knowledge from '@/pages/Knowledge';
import Contact from '@/pages/Contact';
import Studio from '@/pages/Studio';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/about" element={<About />} />
            <Route path="/quality" element={<Quality />} />
            <Route path="/wholesale" element={<Wholesale />} />
            <Route path="/export" element={<ExportPage />} />
            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
