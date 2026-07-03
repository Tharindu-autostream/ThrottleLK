import { useState, useEffect } from 'react';
import CustomCursor from './components/CustomCursor';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedProducts from './components/FeaturedProducts';
import MotorGarage from './components/MotorGarage';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import { useDocumentHead } from '../lib/useDocumentHead';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useDocumentHead({
    title: "Throttle LK | Streetwear & Rider Gear in Sri Lanka",
    description:
      "Throttle LK is Sri Lanka's streetwear and rider culture brand — bold, oversized hoodies and tees today, with modified motorbike parts and riders' accessories coming soon. Island-wide delivery.",
    canonicalPath: '/',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-[#0A0A0A] text-[#F0EDE8]" style={{ fontFamily: "'DM Sans', sans-serif", cursor: 'none' }}>
      <LoadingScreen isLoading={isLoading} />
      <CustomCursor />
      <Navbar />
      <Hero />
      <FeaturedProducts />
      <MotorGarage />
      <About />
      <Testimonials />
      <Newsletter />
      <Footer />
      <CartDrawer />
    </div>
  );
}