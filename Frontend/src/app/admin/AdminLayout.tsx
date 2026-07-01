import React from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router';
import { FolderOpen, Image, LogOut, Package } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ADMIN_OUTLINE_BUTTON_CLASS } from './adminButtonStyles';
import { useAdminAuth } from './AdminAuthContext';

const navItems = [
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { to: '/admin/site-images', label: 'Site images', icon: Image },
] as const;

export default function AdminLayout() {
  const { token, logout } = useAdminAuth();
  const location = useLocation();

  if (!token) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-[#0A0A0A] text-[#F0EDE8]"
      style={{ fontFamily: "'DM Sans', sans-serif", cursor: 'auto' }}
    >
      <header className="border-b border-[#C0392B]/30 bg-[#0A0A0A]/90 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-[#C0392B]" />
            <div>
              <p
                className="text-xl tracking-wider leading-none"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                Throttle LK Admin
              </p>
              <p className="text-xs text-[#F0EDE8]/60">Dashboard</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname.startsWith(to);
              return (
                <Button
                  key={to}
                  variant={active ? 'default' : 'outline'}
                  asChild
                  className={
                    active
                      ? 'bg-[#C0392B] hover:bg-[#C0392B]/90 text-[#F0EDE8] border-[#C0392B]'
                      : ADMIN_OUTLINE_BUTTON_CLASS
                  }
                >
                  <Link to={to}>
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                </Button>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 sm:ml-auto">
            <Button
              variant="outline"
              asChild
              className={ADMIN_OUTLINE_BUTTON_CLASS}
            >
              <Link to="/">View storefront</Link>
            </Button>
            <Button
              variant="ghost"
              className="text-[#F0EDE8] hover:bg-[#C0392B]/20"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4" />
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
