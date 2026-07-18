import type { ReactNode } from 'react';
import CustomCursor from './CustomCursor';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';

type Props = {
  children: ReactNode;
};

/** Shared chrome for content / legal pages (matches storefront look). */
export default function ContentPageShell({ children }: Props) {
  return (
    <div
      className="min-h-screen bg-[#0A0A0A] text-[#F0EDE8]"
      style={{ fontFamily: "'DM Sans', sans-serif", cursor: 'none' }}
    >
      <CustomCursor />
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pb-20 pt-28 md:pt-32">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
