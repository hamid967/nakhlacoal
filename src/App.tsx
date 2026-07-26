import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { RouteNoIndex } from '@/components/RouteNoIndex';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initAnalytics, trackPageView } from '@/lib/analytics';

import { Layout } from '@/components/Layout';
const HomeIntro = lazy(() =>
  import('@/components/HomeIntro').then((m) => ({ default: m.HomeIntro })),
);
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
const Faq = lazy(() => import('@/pages/Faq'));
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
const Quote = lazy(() => import('@/pages/Quote'));
const QuoteTrack = lazy(() => import('@/pages/QuoteTrack'));
const Quotes = lazy(() => import('@/pages/Quotes'));
const AdminOrders = lazy(() => import('@/pages/AdminOrders'));
const AdminInventory = lazy(() => import('@/pages/AdminInventory'));
const AdminAnalytics = lazy(() => import('@/pages/AdminAnalytics'));
const NewOrder = lazy(() => import('@/pages/NewOrder'));
const OrderTracking = lazy(() => import('@/pages/OrderTracking'));
const Catalog = lazy(() => import('@/pages/Catalog'));
const CampaignLanding = lazy(() => import('@/pages/CampaignLanding'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const CheckoutSuccess = lazy(() => import('@/pages/CheckoutSuccess'));
const CheckoutFailed = lazy(() => import('@/pages/CheckoutFailed'));
const Privacy = lazy(() => import('@/pages/legal/Privacy'));
const Terms = lazy(() => import('@/pages/legal/Terms'));
const RefundPolicy = lazy(() => import('@/pages/legal/RefundPolicy'));
const ShippingPolicy = lazy(() => import('@/pages/legal/ShippingPolicy'));
const Unsubscribe = lazy(() => import('@/pages/Unsubscribe'));


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
const AdminWebVitals = lazy(() => import('@/admin/pages/WebVitals'));
const AdminChatAnalytics = lazy(() => import('@/admin/pages/ChatAnalytics'));
const AdminCoupons = lazy(() => import('@/admin/pages/Coupons'));
const AdminAuditLog = lazy(() => import('@/admin/pages/AuditLog'));
const AdminQuotes = lazy(() => import('@/admin/pages/Quotes'));
const AdminEmails = lazy(() => import('@/admin/pages/Emails'));
const AdminLinkPreviews = lazy(() => import('@/admin/pages/LinkPreviews'));

const PortalQuotes = lazy(() => import('@/portal/pages/Quotes'));
const WholesaleDashboard = lazy(() => import('@/portal/pages/wholesale/Dashboard'));
const WholesaleCatalog = lazy(() => import('@/portal/pages/wholesale/Catalog'));
const WholesaleBulkOrder = lazy(() => import('@/portal/pages/wholesale/BulkOrder'));
const WholesaleStatement = lazy(() => import('@/portal/pages/wholesale/Statement'));
const AdminWholesaleLeads = lazy(() => import('@/admin/pages/wholesale/Leads'));
const AdminWholesaleAccounts = lazy(() => import('@/admin/pages/wholesale/Accounts'));
const AdminPriceTiers = lazy(() => import('@/admin/pages/wholesale/PriceTiers'));
const AdminZatca = lazy(() => import('@/admin/pages/Zatca'));
const AdminFulfillment = lazy(() => import('@/admin/pages/Fulfillment'));
const AdminPayments = lazy(() => import('@/admin/pages/Payments'));
const AdminReviews = lazy(() => import('@/admin/pages/Reviews'));
const AdminMarketplace = lazy(() => import('@/admin/pages/Marketplace'));
const PortalLoyalty = lazy(() => import('@/portal/pages/Loyalty'));
const PortalReferrals = lazy(() => import('@/portal/pages/Referrals'));

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
const PortalLogin = lazy(() => import('@/portal/pages/Login'));

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
            <CartProvider>
              <CartDrawer />
            <SmoothScroll />
            <Suspense fallback={null}>
              <HomeIntro />
            </Suspense>
            <AnalyticsTracker />
            <TrackingLoader />

            <Toaster />
            <Sonner />
            <RouteNoIndex />
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
                  <Route path="/wholesale" element={<Wholesale />} />
                  <Route path="/export" element={<ExportPage />} />
                  <Route path="/export/guide" element={<ExportGuide />} />
                  <Route path="/knowledge" element={<Knowledge />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<Faq />} />
                  <Route path="/quote" element={<Quote />} />
                  <Route path="/quote/track" element={<QuoteTrack />} />
                  <Route path="/quotes" element={<Quotes />} />
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
                  <Route path="web-vitals" element={<AdminWebVitals />} />
                  <Route path="chats" element={<AdminChatAnalytics />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="tracking" element={<AdminTracking />} />
                  <Route path="trademarks" element={<AdminTrademarks />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="marketing" element={<AdminCoupons />} />
                  <Route path="logs" element={<AdminAuditLog />} />
                  <Route path="quotes" element={<AdminQuotes />} />

                  <Route path="emails" element={<AdminEmails />} />
                  <Route path="link-previews" element={<AdminLinkPreviews />} />
                  <Route path="wholesale/leads" element={<AdminWholesaleLeads />} />
                  <Route path="wholesale/accounts" element={<AdminWholesaleAccounts />} />
                  <Route path="wholesale/price-tiers" element={<AdminPriceTiers />} />
                  <Route path="zatca" element={<AdminZatca />} />
                  <Route path="fulfillment" element={<AdminFulfillment />} />
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="*" element={<AdminPlaceholder />} />


                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="marketplace" element={<AdminMarketplace />} />
                  <Route path="*" element={<AdminPlaceholder />} />
                </Route>
                <Route path="/portal/login" element={<PortalLogin />} />
                <Route path="/unsubscribe" element={<Unsubscribe />} />
                <Route path="/portal" element={<ProtectedRoute requireAnyRole={['customer','user','wholesale','distributor']}><PortalLayout /></ProtectedRoute>}>
                  <Route index element={<PortalDashboard />} />
                  <Route path="orders" element={<PortalOrders />} />
                  <Route path="orders/new" element={<PortalNewOrder />} />
                  <Route path="orders/:id" element={<OrderTracking />} />
                  <Route path="tracking" element={<PortalShipments />} />
                  <Route path="shipments" element={<PortalShipments />} />
                  <Route path="shipments/:id" element={<PortalShipmentDetail />} />
                  <Route path="quotes" element={<PortalQuotes />} />
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
                  <Route path="wholesale" element={<WholesaleDashboard />} />
                  <Route path="wholesale/catalog" element={<WholesaleCatalog />} />
                  <Route path="wholesale/bulk-order" element={<WholesaleBulkOrder />} />
                  <Route path="wholesale/statement" element={<WholesaleStatement />} />
                  <Route path="*" element={<PortalPlaceholder />} />
                </Route>

                <Route element={<Layout />}>
                  {/* legacy admin routes preserved */}
                  <Route path="/admin/legacy/orders" element={<ProtectedRoute requireRole="admin"><AdminOrders /></ProtectedRoute>} />
                  <Route path="/admin/legacy/analytics" element={<ProtectedRoute requireRole="admin"><AdminAnalytics /></ProtectedRoute>} />

                  <Route path="/orders/new" element={<ProtectedRoute><NewOrder /></ProtectedRoute>} />
                  <Route path="/orders/:id" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/checkout/success" element={<CheckoutSuccess />} />
                  <Route path="/checkout/failed" element={<CheckoutFailed />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  <Route path="/shipping-policy" element={<ShippingPolicy />} />
                  <Route path="/track/:id" element={<OrderTracking />} />


                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
            <CompareBar />
            </CartProvider>
          </CompareProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
