import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'motion/react';
import { useRef, useEffect, useState } from 'react';
import { apiUrl } from '../../lib/api';
import { DEFAULT_HERO_IMAGE, parseSiteContent } from '../../lib/siteContent';

const FloatingShape = ({ delay = 0, duration = 20, x = 0, y = 0, size = 100 }) => {
  return (
    <motion.div
      className="absolute rounded-full mix-blend-screen"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        background: `radial-gradient(circle, rgba(192, 57, 43, 0.15) 0%, transparent 70%)`,
        willChange: 'transform',
      }}
      animate={{
        x: [0, 100, -50, 0],
        y: [0, -100, 50, 0],
        scale: [1, 1.2, 0.8, 1],
        rotate: [0, 90, 180, 270, 360],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
        delay,
      }}
    />
  );
};

export default function Hero() {
  const ref = useRef(null);
  const [heroImage, setHeroImage] = useState(DEFAULT_HERO_IMAGE);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl('/site/content'));
        if (!res.ok) return;
        const parsed = parseSiteContent(await res.json());
        if (!cancelled && parsed?.heroImage) {
          setHeroImage(parsed.heroImage);
        }
      } catch {
        /* keep default */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  useEffect(() => {
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        mouseX.set(((clientX - innerWidth / 2) / innerWidth) * 20);
        mouseY.set(((clientY - innerHeight / 2) / innerHeight) * 20);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [mouseX, mouseY]);

  const letterVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -90 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        delay: i * 0.05 + 0.5,
        duration: 0.5,
        ease: [0.6, 0.05, 0.01, 0.9],
      },
    }),
  };

  const title = "THROTTLE LK";
  const subtitle = "WEAR THE EDGE";

  return (
    <section ref={ref} className="relative h-screen overflow-hidden" style={{ position: 'relative' }}>
      {/* Animated Background */}
      <motion.div
        style={{ scale, opacity, willChange: 'transform, opacity' }}
        className="absolute inset-0"
      >
        {/* Base Image */}
        <motion.div
          className="absolute inset-0"
          style={{ x: mouseXSpring, y: mouseYSpring, willChange: 'transform' }}
        >
          <img
            src={heroImage}
            alt="Hero hoodie"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Static Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A]/90 via-[#0A0A0A]/70 to-[#2C2C2C]/80" />

        {/* Grain Texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating Shapes */}
        <FloatingShape delay={0} duration={25} x={10} y={20} size={150} />
        <FloatingShape delay={2} duration={30} x={80} y={10} size={200} />
        <FloatingShape delay={4} duration={20} x={60} y={70} size={120} />
        <FloatingShape delay={1} duration={35} x={30} y={50} size={180} />
        <FloatingShape delay={3} duration={28} x={75} y={85} size={100} />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
        style={{ y, willChange: 'transform' }}
      >
        {/* Main Title with Letter Animation */}
        <div className="mb-6 overflow-hidden">
          <motion.div className="flex justify-center gap-2 md:gap-4 flex-wrap">
            {title.split('').map((char, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={letterVariants}
                initial="hidden"
                animate="visible"
                className="text-6xl md:text-8xl lg:text-9xl text-[#F0EDE8] tracking-wider inline-block"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  transformStyle: 'preserve-3d',
                }}
                whileHover={{
                  scale: 1.2,
                  color: '#C0392B',
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.3 }
                }}
              >
                {char === ' ' ? ' ' : char}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Animated Divider */}
        <motion.div className="flex items-center gap-4 mb-8">
          <motion.div
            className="h-0.5 bg-gradient-to-r from-transparent via-[#C0392B] to-transparent"
            initial={{ width: 0 }}
            animate={{ width: '300px' }}
            transition={{ duration: 1, delay: 1.2 }}
          />
        </motion.div>

        {/* Subtitle with Stagger */}
        <motion.div className="mb-4 overflow-hidden">
          <div className="flex justify-center gap-2 md:gap-3">
            {subtitle.split('').map((char, i) => (
              <motion.span
                key={i}
                className="text-3xl md:text-5xl text-[#F0EDE8]/80"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 + i * 0.05 }}
              >
                {char === ' ' ? ' ' : char}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Description with Fade */}
        <motion.p
          className="text-[#F0EDE8]/70 text-base md:text-lg mb-12 max-w-2xl leading-relaxed"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
        >
          Premium streetwear hoodies crafted for those who refuse to blend in.
          <br />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.3 }}
            className="text-[#C0392B]"
          >
            Raw. Bold. Unapologetic.
          </motion.span>
        </motion.p>

        {/* CTA Button with Advanced Hover */}
        <motion.a
          href="#shop"
          className="group relative inline-flex items-center gap-3 bg-[#C0392B]/20 text-[#F0EDE8] px-12 py-4 tracking-wider border-2 border-[#C0392B]/50 backdrop-blur-md rounded-full overflow-hidden"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Animated Background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#C0392B]/0 via-[#C0392B]/40 to-[#C0392B]/0"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />

          <span className="relative z-10">Explore Collection</span>

          <motion.span
            className="relative z-10"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            →
          </motion.span>
        </motion.a>

        {/* Stats */}
        <motion.div
          className="absolute bottom-24 left-0 right-0 flex justify-center gap-8 md:gap-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8 }}
        >
          {[
            { value: '1000+', label: 'Happy Customers' },
            { value: 'Premium', label: 'Quality' },
            { value: 'LK', label: 'Made in Sri Lanka' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.8 + i * 0.1 }}
              whileHover={{ scale: 1.1 }}
            >
              <p
                className="text-2xl md:text-3xl text-[#C0392B] mb-1"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {stat.value}
              </p>
              <p
                className="text-xs md:text-sm text-[#F0EDE8]/60"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: 'easeInOut',
            }}
          >
            <div className="w-6 h-10 border-2 border-[#F0EDE8]/50 rounded-full flex items-start justify-center p-2">
              <motion.div
                className="w-1 h-2 bg-[#C0392B] rounded-full"
                animate={{ y: [0, 12, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
