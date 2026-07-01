import { useState, useEffect } from 'react';
import CustomCursor from './components/CustomCursor';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedProducts from './components/FeaturedProducts';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

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
      <About />
      <Testimonials />
      <Newsletter />
      <Footer />
      <CartDrawer />
    </div>
  );
}