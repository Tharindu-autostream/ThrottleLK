
  import { createRoot } from "react-dom/client";
  import { BrowserRouter, Navigate, Route, Routes } from "react-router";
  import { CartProvider } from "./app/components/CartContext";
  import { Toaster } from "./app/components/ui/sonner";
  import App from "./app/App.tsx";
  import CheckoutPage from "./app/components/CheckoutPage";
  import { AdminAuthProvider } from "./app/admin/AdminAuthContext";
  import AdminLoginPage from "./app/admin/AdminLoginPage";
  import AdminLayout from "./app/admin/AdminLayout";
  import AdminProductsPage from "./app/admin/AdminProductsPage";
  import AdminCategoriesPage from "./app/admin/AdminCategoriesPage";
  import AdminOrdersPage from "./app/admin/AdminOrdersPage";
  import AdminSiteContentPage from "./app/admin/AdminSiteContentPage";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <AdminAuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/products" replace />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="site-images" element={<AdminSiteContentPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster theme="dark" />
        </CartProvider>
      </AdminAuthProvider>
    </BrowserRouter>,
  );
