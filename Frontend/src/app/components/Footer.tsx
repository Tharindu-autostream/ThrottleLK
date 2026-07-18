import { useRef } from 'react';
import type { MouseEvent } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Instagram, Facebook, Send, MessageCircle, MapPin, Mail, Phone, ArrowRight, Heart } from 'lucide-react';
import { useNavigate } from 'react-router';
import logo from '../../imports/Gemini_Generated_Image_s1qapns1qapns1qa-removebg-preview.png';

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ['start end', 'end end'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1]);

  const socialLinks = [
    { icon: Instagram, label: 'Instagram', href: '#', color: 'from-purple-500 to-pink-500' },
    {
      icon: Facebook,
      label: 'Facebook',
      href: 'https://www.facebook.com/share/18qA9nBdVh/?mibextid=wwXIfr',
      color: 'from-blue-600 to-blue-500',
    },
    {
      icon: Send,
      label: 'TikTok',
      href: 'https://www.tiktok.com/@throttle_lk?_r=1&_t=ZS-97dpe38Ri6c',
      color: 'from-cyan-500 to-blue-500',
    },
    { icon: MessageCircle, label: 'WhatsApp', href: '#', color: 'from-green-500 to-emerald-500' },
  ];

  const quickLinks = [
    { name: 'Collections', href: '/#shop', route: false },
    { name: 'Journal', href: '/blog', route: true },
    { name: 'About Us', href: '/about', route: true },
    { name: 'Motor Garage', href: '/#motor-garage', route: false },
    { name: 'Newsletter', href: '/#newsletter', route: false },
  ];

  const support = [
    { name: 'Contact', href: '/contact', route: true },
    { name: 'Shipping & Delivery', href: '/#faq', route: false },
    { name: 'Privacy Policy', href: '/privacy', route: true },
    { name: 'Terms & Conditions', href: '/terms', route: true },
    { name: 'FAQ', href: '/#faq', route: false },
  ];

  const contact = [
    { icon: Mail, text: 'info@throttlelk.com', href: 'mailto:info@throttlelk.com' },
    { icon: Phone, text: '+94 72 770 7597', href: 'tel:+94727707597' },
    { icon: MapPin, text: 'Colombo, Sri Lanka', href: '/contact' },
  ];

  const handleFooterNav = (
    e: MouseEvent,
    link: { href: string; route?: boolean },
  ) => {
    if (link.route) {
      e.preventDefault();
      navigate(link.href);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (link.href.startsWith('/#')) {
      e.preventDefault();
      const hash = link.href.slice(1);
      navigate('/');
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <footer 
      id="contact" 
      ref={footerRef}
      className="relative bg-[#0A0A0A] overflow-hidden"
      style={{ position: 'relative' }}
    >
      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 bg-[#C0392B]/10 rounded-full blur-[120px]"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#2C2C2C]/20 rounded-full blur-[120px]"
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Top Edge Accent */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C0392B] to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />

      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-8">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-1"
          >
            {/* Logo with Animation */}
            <motion.button
              type="button"
              onClick={goHome}
              aria-label="Throttle LK — Home"
              className="mb-6 relative block cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src={logo} 
                alt="Throttle LK" 
                className="h-14 w-auto brightness-0 invert" 
              />
            </motion.button>

            <motion.p
              className="text-[#F0EDE8]/70 mb-6 leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ delay: 0.4 }}
            >
              Born in the streets of Colombo. Premium hoodies for those who refuse to blend in.
            </motion.p>

            {/* Social Links */}
            <motion.div 
              className="flex gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 0.5 }}
            >
              {socialLinks.map(({ icon: Icon, label, href, color }, index) => (
                <motion.a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="relative w-11 h-11 bg-[#2C2C2C]/50 backdrop-blur-sm border border-[#F0EDE8]/10 rounded-full flex items-center justify-center group overflow-hidden"
                  whileHover={{ scale: 1.1, borderColor: 'rgba(192, 57, 43, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  aria-label={label}
                >
                  {/* Gradient background on hover */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100`}
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <Icon className="relative w-5 h-5 text-[#F0EDE8] transition-transform group-hover:scale-110" />
                  
                  {/* Ripple effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-[#C0392B]"
                    initial={{ scale: 1, opacity: 0.5 }}
                    whileHover={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <h4
              className="text-2xl text-[#F0EDE8] mb-6 tracking-wider relative inline-block"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Quick Links
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-[#C0392B]"
                initial={{ width: 0 }}
                whileInView={{ width: '50%' }}
                viewport={{ once: false }}
                transition={{ delay: 0.3, duration: 0.6 }}
              />
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <motion.a
                    href={link.href}
                    onClick={(e) => handleFooterNav(e, link)}
                    className="text-[#F0EDE8]/60 hover:text-[#C0392B] transition-colors inline-flex items-center gap-2 group"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.span
                      className="w-1.5 h-1.5 bg-[#C0392B] rounded-full opacity-0 group-hover:opacity-100"
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                    />
                    {link.name}
                    <ArrowRight className="w-0 h-4 opacity-0 group-hover:w-4 group-hover:opacity-100 transition-all" />
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h4
              className="text-2xl text-[#F0EDE8] mb-6 tracking-wider relative inline-block"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Support
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-[#C0392B]"
                initial={{ width: 0 }}
                whileInView={{ width: '50%' }}
                viewport={{ once: false }}
                transition={{ delay: 0.4, duration: 0.6 }}
              />
            </h4>
            <ul className="space-y-3">
              {support.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <motion.a
                    href={link.href}
                    onClick={(e) => handleFooterNav(e, link)}
                    className="text-[#F0EDE8]/60 hover:text-[#C0392B] transition-colors inline-flex items-center gap-2 group"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.span
                      className="w-1.5 h-1.5 bg-[#C0392B] rounded-full opacity-0 group-hover:opacity-100"
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                    />
                    {link.name}
                    <ArrowRight className="w-0 h-4 opacity-0 group-hover:w-4 group-hover:opacity-100 transition-all" />
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h4
              className="text-2xl text-[#F0EDE8] mb-6 tracking-wider relative inline-block"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Get in Touch
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-[#C0392B]"
                initial={{ width: 0 }}
                whileInView={{ width: '70%' }}
                viewport={{ once: false }}
                transition={{ delay: 0.5, duration: 0.6 }}
              />
            </h4>
            <ul className="space-y-4">
              {contact.map(({ icon: Icon, text, href }, index) => (
                <motion.li
                  key={text}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <motion.a
                    href={href}
                    className="flex items-center gap-3 text-[#F0EDE8]/60 hover:text-[#C0392B] transition-colors group"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                    whileHover={{ x: 5 }}
                  >
                    <motion.div
                      className="w-9 h-9 bg-[#2C2C2C]/50 rounded-lg flex items-center justify-center group-hover:bg-[#C0392B]/20 transition-colors"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.div>
                    <span className="text-sm">{text}</span>
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          className="border-t border-[#2C2C2C]/50 pt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.div
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 0.9 }}
            >
              <p
                className="text-[#F0EDE8]/40 text-sm flex items-center gap-2"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                © 2026 Throttle LK. All rights reserved. Made with
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Heart className="w-4 h-4 text-[#C0392B] fill-[#C0392B]" />
                </motion.span>
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-[#F0EDE8]/40">
                <button
                  type="button"
                  className="hover:text-[#C0392B]"
                  onClick={() => {
                    navigate('/privacy');
                    window.scrollTo({ top: 0 });
                  }}
                >
                  Privacy
                </button>
                <button
                  type="button"
                  className="hover:text-[#C0392B]"
                  onClick={() => {
                    navigate('/terms');
                    window.scrollTo({ top: 0 });
                  }}
                >
                  Terms
                </button>
              </div>
            </motion.div>

            {/* Payment/Trust Badges */}
            <motion.div
              className="flex items-center gap-6"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 1 }}
            >
              {['Secure Payment', 'Free Shipping', 'Easy Returns'].map((badge, index) => (
                <motion.span
                  key={badge}
                  className="text-[#F0EDE8]/30 text-xs tracking-wide"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false }}
                  transition={{ delay: 1 + index * 0.1 }}
                  whileHover={{ color: 'rgba(192, 57, 43, 0.8)', scale: 1.05 }}
                >
                  {badge}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Animated Bottom Edge */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C0392B] to-transparent"
        animate={{
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </footer>
  );
}