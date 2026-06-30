import { useEffect, lazy, Suspense } from 'react';
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
import { CartProvider } from '@/contexts/CartContext';
import { CartDrawer } from '@/components/CartDrawer';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import TrackingLoader from '@/components/TrackingLoader';
import { SmoothScroll } from '@/components/SmoothScroll';

// Home is loaded eagerly because it's the LCP route.
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';

// Lazy-load everything else for a smaller initial bundle.
const Products = lazy(() => import('@/pages/Products'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Compare = lazy(() => import('@/pages/Compare'));
const About = lazy(() => import('@/pages/About'));
const Quality = lazy(() => import('@/pages/Quality'));
const Wholesale = lazy(() => import('@/pages/Wholesale'));
const ExportPage = lazy(() => import('@/pages/Export'));
const ExportGuide = lazy(() => import('@/pages/ExportGuide'));
const Knowledge = lazy(() => import('@/pages/Knowledge'));
const Contact = lazy(() => import('@/pages/Contact'));
const Location = lazy(() => import('@/pages/Location'));
const Trademarks = lazy(() => import('@/pages/Trademarks'));
const Uses = lazy(() => import('@/pages/Uses'));
const Articles = lazy(() => import('@/pages/Articles'));
const ArticleDetail = lazy(() => import('@/pages/ArticleDetail'));
const AudienceLanding = lazy(() => import('@/pages/AudienceLanding'));
const Studio = lazy(() => import('@/pages/Studio'));
const Auth = lazy(() => import('@/pages/Auth'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Profile = lazy(() => import('@/pages/Profile'));
const Assistant = lazy(() => import('@/pages/Assistant'));
const AdminOrders = lazy(() => import('@/pages/AdminOrders'));
const AdminInventory = lazy(() => import('@/pages/AdminInventory'));
const AdminAnalytics = lazy(() => import('@/pages/AdminAnalytics'));
const NewOrder = lazy(() => import('@/pages/NewOrder'));
const OrderTracking = lazy(() => import('@/pages/OrderTracking'));
const Catalog = lazy(() => import('@/pages/Catalog'));
const CampaignLanding = lazy(() => import('@/pages/CampaignLanding'));
const Checkout = lazy(() => import('@/pages/Checkout'));

const AdminLayout = lazy(() => import('@/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('@/admin/pages/Dashboard'));
const AdminOrdersNew = lazy(() => import('@/admin/pages/Orders'));
const AdminProductsNew = lazy(() => import('@/admin/pages/Products'));
const AdminCustomers = lazy(() => import('@/admin/pages/Customers'));
const AdminReports = lazy(() => import('@/admin/pages/Reports'));
const AdminSettings = lazy(() => import('@/admin/pages/Settings'));
const AdminPlaceholder = lazy(() => import('@/admin/pages/Placeholder'));
const AdminTrademarks = lazy(() => import('@/admin/pages/Trademarks'));
const AdminTracking = lazy(() => import('@/admin/pages/Tracking'));
const AdminInvoices = lazy(() => import('@/admin/pages/Invoices'));
const AdminShipments = lazy(() => import('@/admin/pages/Shipments'));

const PortalLayout = lazy(() => import('@/portal/PortalLayout'));
const PortalDashboard = lazy(() => import('@/portal/pages/Dashboard'));
const PortalOrders = lazy(() => import('@/portal/pages/Orders'));
const PortalCatalog = lazy(() => import('@/portal/pages/Catalog'));
const PortalFavorites = lazy(() => import('@/portal/pages/Favorites'));
const PortalTrademarks = lazy(() => import('@/portal/pages/Trademarks'));
const PortalSupport = lazy(() => import('@/portal/pages/Support'));
const PortalProfile = lazy(() => import('@/portal/pages/Profile'));
const PortalSettings = lazy(() => import('@/portal/pages/Settings'));
const PortalPlaceholder = lazy(() => import('@/portal/pages/Placeholder'));
const PortalNewOrder = lazy(() => import('@/portal/pages/NewOrder'));
const PortalShipments = lazy(() => import('@/portal/pages/Shipments'));
const PortalShipmentDetail = lazy(() => import('@/portal/pages/ShipmentDetail'));

const queryClient = new QueryClient();

function AnalyticsTracker() {
  const location = useLocation();
  useEffect(() => { initAnalytics(); }, []);
  useEffect(() => { trackPageView(location.pathname + location.search); }, [location]);
  return null;
}

function RouteFallback() {
  return <div className="min-h-[50vh]" aria-hidden />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CompareProvider>
            <SmoothScroll />
            <HomeIntro />
            <AnalyticsTracker />
            <TrackingLoader />

            <Toaster />
            <Sonner />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/reset" element={<ResetPassword />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:slug" element={<ProductDetail />} />
                  <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
                  <Route path="/about" element={<About />} />
                  <Route path="/quality" element={<Quality />} />
                  <Route path="/wholesale" element={<ProtectedRoute requireRole="wholesale"><Wholesale /></ProtectedRoute>} />
                  <Route path="/export" element={<ExportPage />} />
                  <Route path="/export/guide" element={<ExportGuide />} />
                  <Route path="/knowledge" element={<Knowledge />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/location" element={<Location />} />
                  <Route path="/trademarks" element={<Trademarks />} />
                  <Route path="/uses" element={<Uses />} />
                  <Route path="/articles" element={<Articles />} />
                  <Route path="/articles/:slug" element={<ArticleDetail />} />
                  <Route path="/blog" element={<Articles />} />
                  <Route path="/blog/:slug" element={<ArticleDetail />} />
                  <Route path="/for/:slug" element={<AudienceLanding />} />
                  <Route path="/lp/:slug" element={<CampaignLanding />} />
                  <Route path="/studio" element={<ProtectedRoute><Studio /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/assistant" element={<Assistant />} />
                  <Route path="/assistant/:threadId" element={<Assistant />} />
                </Route>
                <Route path="/admin" element={<ProtectedRoute requireRole="admin"><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="orders" element={<AdminOrdersNew />} />
                  <Route path="products" element={<AdminProductsNew />} />
                  <Route path="inventory" element={<AdminInventory />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="invoices" element={<AdminInvoices />} />
                  <Route path="shipments" element={<AdminShipments />} />
                  <Route path="analytics" element={<AdminReports />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="tracking" element={<AdminTracking />} />
                  <Route path="trademarks" element={<AdminTrademarks />} />
                  <Route path="*" element={<AdminPlaceholder />} />
                </Route>
                <Route path="/portal" element={<ProtectedRoute><PortalLayout /></ProtectedRoute>}>
                  <Route index element={<PortalDashboard />} />
                  <Route path="orders" element={<PortalOrders />} />
                  <Route path="orders/new" element={<PortalNewOrder />} />
                  <Route path="orders/:id" element={<OrderTracking />} />
                  <Route path="tracking" element={<PortalShipments />} />
                  <Route path="shipments" element={<PortalShipments />} />
                  <Route path="shipments/:id" element={<PortalShipmentDetail />} />
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
            </Suspense>
            <CompareBar />
          </CompareProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
