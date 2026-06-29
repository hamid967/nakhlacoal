import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initAnalytics, trackPageView } from '@/lib/analytics';


import { Layout } from '@/components/Layout';
import { HomeIntro } from '@/components/HomeIntro';


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
import ArticleDetail from '@/pages/ArticleDetail';
import Studio from '@/pages/Studio';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import Assistant from '@/pages/Assistant';
import AdminOrders from '@/pages/AdminOrders';
import AdminInventory from '@/pages/AdminInventory';
import AdminAnalytics from '@/pages/AdminAnalytics';
import AdminLayout from '@/admin/AdminLayout';
import AdminDashboard from '@/admin/pages/Dashboard';
import AdminOrdersNew from '@/admin/pages/Orders';
import AdminProductsNew from '@/admin/pages/Products';
import AdminCustomers from '@/admin/pages/Customers';
import AdminReports from '@/admin/pages/Reports';
import AdminSettings from '@/admin/pages/Settings';
import AdminPlaceholder from '@/admin/pages/Placeholder';
import PortalLayout from '@/portal/PortalLayout';
import PortalDashboard from '@/portal/pages/Dashboard';
import PortalOrders from '@/portal/pages/Orders';
import PortalCatalog from '@/portal/pages/Catalog';
import PortalFavorites from '@/portal/pages/Favorites';
import PortalTrademarks from '@/portal/pages/Trademarks';
import PortalSupport from '@/portal/pages/Support';
import PortalProfile from '@/portal/pages/Profile';
import PortalSettings from '@/portal/pages/Settings';
import PortalPlaceholder from '@/portal/pages/Placeholder';


import NewOrder from '@/pages/NewOrder';
import OrderTracking from '@/pages/OrderTracking';

import Catalog from '@/pages/Catalog';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function AnalyticsTracker() {
  const location = useLocation();
  useEffect(() => { initAnalytics(); }, []);
  useEffect(() => { trackPageView(location.pathname + location.search); }, [location]);
  return null;
}

export default function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CompareProvider>
            <HomeIntro />
            <AnalyticsTracker />

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
                <Route path="/articles/:slug" element={<ArticleDetail />} />
                <Route path="/studio" element={<ProtectedRoute><Studio /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/assistant" element={<Assistant />} />
                <Route path="/assistant/:threadId" element={<Assistant />} />
                <Route path="/admin/inventory" element={<ProtectedRoute requireRole="admin"><AdminInventory /></ProtectedRoute>} />
              </Route>
              <Route path="/admin" element={<ProtectedRoute requireRole="admin"><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrdersNew />} />
                <Route path="products" element={<AdminProductsNew />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="analytics" element={<AdminReports />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="*" element={<AdminPlaceholder />} />
              </Route>
              <Route path="/portal" element={<ProtectedRoute><PortalLayout /></ProtectedRoute>}>
                <Route index element={<PortalDashboard />} />
                <Route path="orders" element={<PortalOrders />} />
                <Route path="orders/new" element={<NewOrder />} />
                <Route path="orders/:id" element={<OrderTracking />} />
                <Route path="tracking" element={<PortalPlaceholder title="تتبع الطلبات" />} />
                <Route path="quotes" element={<PortalPlaceholder title="العروض السعرية" />} />
                <Route path="invoices" element={<PortalPlaceholder title="الفواتير" />} />
                <Route path="payments" element={<PortalPlaceholder title="المدفوعات" />} />
                <Route path="catalog" element={<PortalCatalog />} />
                <Route path="products" element={<PortalCatalog />} />
                <Route path="trademarks" element={<PortalTrademarks />} />
                <Route path="certificates" element={<PortalPlaceholder title="الشهادات" />} />
                <Route path="favorites" element={<PortalFavorites />} />
                <Route path="notifications" element={<PortalPlaceholder title="الإشعارات" />} />
                <Route path="messages" element={<PortalPlaceholder title="الرسائل" />} />
                <Route path="support" element={<PortalSupport />} />
                <Route path="addresses" element={<PortalPlaceholder title="العناوين" />} />
                <Route path="profile" element={<PortalProfile />} />
                <Route path="settings" element={<PortalSettings />} />
                <Route path="*" element={<PortalPlaceholder />} />
              </Route>

              <Route element={<Layout />}>
                {/* legacy admin routes preserved */}
                <Route path="/admin/legacy/orders" element={<ProtectedRoute requireRole="admin"><AdminOrders /></ProtectedRoute>} />
                <Route path="/admin/legacy/analytics" element={<ProtectedRoute requireRole="admin"><AdminAnalytics /></ProtectedRoute>} />

               <Route path="/orders/new" element={<ProtectedRoute><NewOrder /></ProtectedRoute>} />
               <Route path="/orders/:id" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
               <Route path="/catalog" element={<Catalog />} />

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
