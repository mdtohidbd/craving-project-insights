import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SmoothScroll } from "./components/SmoothScroll";
import { ScrollToTop } from "./components/ScrollToTop";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ModuleProvider } from "./context/ModuleContext";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import ModuleGuard from "./components/admin/ModuleGuard";
import { Loader2 } from "lucide-react";

// ─── Public pages (eager) ─────────────────────────────────────────────────────
import Index from "./pages/Index";
import About from "./pages/About";
import Menu from "./pages/Menu";
import MenuDetail from "./pages/MenuDetail";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Contact from "./pages/Contact";
import Checkout from "./pages/Checkout";
import BookTable from "./pages/BookTable";
import OrderTracking from "@/pages/OrderTracking";
import NotFound from "./pages/NotFound";

// ─── Admin pages (lazy — only loaded when the route is visited) ───────────────
const AdminLogin        = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard    = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOrders       = lazy(() => import('./pages/admin/AdminOrders'));
const AdminCustomers    = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminMenu         = lazy(() => import('./pages/admin/AdminMenu'));
const AdminCategories   = lazy(() => import('./pages/admin/AdminCategories'));
const AdminInventory    = lazy(() => import('./pages/admin/AdminInventory'));
const AdminMessages     = lazy(() => import('./pages/admin/AdminMessages'));
const AdminSettings     = lazy(() => import('./pages/admin/AdminSettings'));
const AdminReservations = lazy(() => import('./pages/admin/AdminReservations'));
const AdminPOS          = lazy(() => import('./pages/admin/AdminPOS'));
const AdminTables       = lazy(() => import('./pages/admin/AdminTables'));
const AdminDelivery     = lazy(() => import('./pages/admin/AdminDelivery'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));
const AdminUsers        = lazy(() => import('./pages/admin/AdminUsers'));
const AdminModules      = lazy(() => import('./pages/admin/AdminModules'));
const AdminStaff        = lazy(() => import('./pages/admin/AdminStaff'));
const AdminDeliverymen  = lazy(() => import('./pages/admin/AdminDeliverymen'));

const queryClient = new QueryClient();

// Fallback spinner shown while lazy chunks are loading
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-neutral-50">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

// Convenience wrapper: ProtectedRoute + ModuleGuard + Suspense in one
const AdminRoute = ({
  moduleId,
  children,
  requireSuperAdmin = false,
}: {
  moduleId: string;
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}) => (
  <ProtectedRoute requireSuperAdmin={requireSuperAdmin}>
    <Suspense fallback={<PageLoader />}>
      <ModuleGuard moduleId={moduleId}>{children}</ModuleGuard>
    </Suspense>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <AuthProvider>
          <ModuleProvider>
            <Toaster />
            <Sonner />
            <SmoothScroll />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ScrollToTop />
              <Routes>
                {/* ── Public Routes ─────────────────────────────────────── */}
                <Route path="/"            element={<Index />} />
                <Route path="/about"       element={<About />} />
                <Route path="/menu"        element={<Menu />} />
                <Route path="/menu/:slug"  element={<MenuDetail />} />
                <Route path="/blog"        element={<Blog />} />
                <Route path="/blog/:id"    element={<BlogDetail />} />
                <Route path="/contact"     element={<Contact />} />
                <Route path="/checkout"    element={<Checkout />} />
                <Route path="/book-table"  element={<BookTable />} />
                <Route path="/track-order" element={<OrderTracking />} />

                {/* ── Admin Auth (no guard) ──────────────────────────────── */}
                <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>} />

                {/* ── Protected + Module-Guarded Admin Routes ────────────── */}
                <Route path="/admin"                element={<AdminRoute moduleId="dashboard"><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/tables"         element={<AdminRoute moduleId="tables"><AdminTables /></AdminRoute>} />
                <Route path="/admin/orders"         element={<AdminRoute moduleId="orders"><AdminOrders /></AdminRoute>} />
                <Route path="/admin/customers"      element={<AdminRoute moduleId="customers"><AdminCustomers /></AdminRoute>} />
                <Route path="/admin/menu"           element={<AdminRoute moduleId="menu"><AdminMenu /></AdminRoute>} />
                <Route path="/admin/categories"     element={<AdminRoute moduleId="menu"><AdminCategories /></AdminRoute>} />
                <Route path="/admin/inventory"      element={<AdminRoute moduleId="inventory"><AdminInventory /></AdminRoute>} />
                <Route path="/admin/messages"       element={<AdminRoute moduleId="messages"><AdminMessages /></AdminRoute>} />
                <Route path="/admin/notifications"  element={<AdminRoute moduleId="notifications"><AdminNotifications /></AdminRoute>} />
                <Route path="/admin/settings"       element={<AdminRoute moduleId="settings"><AdminSettings /></AdminRoute>} />
                <Route path="/admin/reservations"   element={<AdminRoute moduleId="reservations"><AdminReservations /></AdminRoute>} />
                <Route path="/admin/delivery"       element={<AdminRoute moduleId="delivery"><AdminDelivery /></AdminRoute>} />
                <Route path="/admin/pos"            element={<AdminRoute moduleId="pos"><AdminPOS /></AdminRoute>} />

                {/* ── Superadmin-only Routes ─────────────────────────────── */}
                <Route path="/admin/users"       element={<AdminRoute moduleId="users"       requireSuperAdmin><AdminUsers /></AdminRoute>} />
                <Route path="/admin/modules"     element={<AdminRoute moduleId="modules"     requireSuperAdmin><AdminModules /></AdminRoute>} />
                <Route path="/admin/staff"       element={<AdminRoute moduleId="staff"       requireSuperAdmin><AdminStaff /></AdminRoute>} />
                <Route path="/admin/deliverymen" element={<AdminRoute moduleId="deliverymen" requireSuperAdmin><AdminDeliverymen /></AdminRoute>} />

                {/* ── 404 ────────────────────────────────────────────────── */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ModuleProvider>
        </AuthProvider>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
