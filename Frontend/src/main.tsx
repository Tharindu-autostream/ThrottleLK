import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";
import type { Location } from "react-router";
import { CartProvider } from "./app/components/CartContext";
import { Toaster } from "./app/components/ui/sonner";
import AdSenseLoader from "./app/components/AdSenseLoader";
import CookieNotice from "./app/components/CookieNotice";
import App from "./app/App.tsx";
import CheckoutPage from "./app/components/CheckoutPage";
import ProductPage from "./app/components/ProductPage";
import ProductQuickViewRoute from "./app/components/ProductQuickViewRoute";
import AboutPage from "./app/components/AboutPage";
import ContactPage from "./app/components/ContactPage";
import PrivacyPage from "./app/components/PrivacyPage";
import TermsPage from "./app/components/TermsPage";
import BlogIndexPage from "./app/components/BlogIndexPage";
import BlogArticlePage from "./app/components/BlogArticlePage";
import { AdminAuthProvider } from "./app/admin/AdminAuthContext";
import AdminLoginPage from "./app/admin/AdminLoginPage";
import AdminLayout from "./app/admin/AdminLayout";
import AdminProductsPage from "./app/admin/AdminProductsPage";
import AdminCategoriesPage from "./app/admin/AdminCategoriesPage";
import AdminOrdersPage from "./app/admin/AdminOrdersPage";
import AdminSiteContentPage from "./app/admin/AdminSiteContentPage";
import AdminArticlesPage from "./app/admin/AdminArticlesPage";
import "./styles/index.css";

interface LocationState {
  backgroundLocation?: Location;
}

/**
 * Renders the real route for the current URL, unless we navigated here from
 * another page with a `backgroundLocation` in history state (see ProductCard
 * clicks in FeaturedProducts.tsx) — in which case the previous page keeps
 * rendering underneath and the product quick-view opens as a modal on top.
 * This keeps `/product/:slug` a real, directly-loadable, crawlable page while
 * still allowing a fast in-page "quick view" UX from the product grid.
 */
function AppRoutes() {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const backgroundLocation = state?.backgroundLocation;

  return (
    <>
      <AdSenseLoader />
      <CookieNotice />
      <Routes location={backgroundLocation ?? location}>
        <Route path="/" element={<App />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/blog" element={<BlogIndexPage />} />
        <Route path="/blog/:slug" element={<BlogArticlePage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/products" replace />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="articles" element={<AdminArticlesPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="site-images" element={<AdminSiteContentPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route path="/product/:slug" element={<ProductQuickViewRoute />} />
        </Routes>
      )}
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AdminAuthProvider>
      <CartProvider>
        <AppRoutes />
        <Toaster theme="dark" />
      </CartProvider>
    </AdminAuthProvider>
  </BrowserRouter>,
);
