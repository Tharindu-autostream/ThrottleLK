import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'motion/react';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useCart } from './CartContext';
import logo from '../../imports/Gemini_Generated_Image_s1qapns1qapns1qa-removebg-preview.png';

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { state, dispatch } = useCart();
  const navigate = useNavigate();

  const goHome = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0;

    // Hide/show navbar
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }

    // Change navbar style on scroll
    setScrolled(latest > 50);
  });

  const navLinks = [
    { name: 'Collections', href: '#shop' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: '-100%' },
      }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-[#C0392B]/30 shadow-lg shadow-[#C0392B]/10'
          : 'bg-transparent'
      }`}
    >
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.a
            href="/"
            onClick={goHome}
            aria-label="Throttle LK — Home"
            className="relative z-10 cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <img
              src={logo}
              alt="Throttle LK"
              className={`w-auto brightness-0 invert transition-all duration-300 ${
                scrolled ? 'h-10' : 'h-12 md:h-14'
              }`}
            />
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link, i) => (
              <motion.a
                key={link.name}
                href={link.href}
                className="relative px-4 py-2 text-[#F0EDE8] group"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (i + 2) }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="relative z-10 transition-colors group-hover:text-[#C0392B]">
                  {link.name}
                </span>

                {/* Hover Background */}
                <motion.div
                  className="absolute inset-0 bg-[#C0392B]/10 backdrop-blur-sm rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Underline */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C0392B]"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <motion.button
              onClick={() => dispatch({ type: 'TOGGLE_CART' })}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#C0392B]/20 backdrop-blur-md border border-[#C0392B]/50 hover:bg-[#C0392B]/30 transition-all"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingBag className="w-4 h-4 text-[#F0EDE8]" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-[#C0392B] text-[#F0EDE8] text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#0A0A0A]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Mobile Menu Toggle */}
            <motion.button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-[#2C2C2C]/40 backdrop-blur-md border border-[#F0EDE8]/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5 text-[#F0EDE8]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5 text-[#F0EDE8]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-[#C0392B]/30 overflow-hidden"
          >
            <div className="px-6 py-6 space-y-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className="block px-4 py-3 text-[#F0EDE8] rounded-full hover:bg-[#C0392B]/10 hover:text-[#C0392B] transition-all"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setMobileMenuOpen(false)}
                  whileTap={{ scale: 0.98 }}
                >
                  {link.name}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}