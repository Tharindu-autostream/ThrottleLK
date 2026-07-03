import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from 'motion/react';
import logo from '../../imports/Gemini_Generated_Image_s1qapns1qapns1qa-removebg-preview.png';
import { apiUrl } from '../../lib/api';
import {
  DEFAULT_ABOUT_FEATURED_IMAGE,
  DEFAULT_GALLERY_IMAGES,
  parseSiteContent,
  type SiteGalleryImage,
} from '../../lib/siteContent';

function FloatingImage({ image, index }: { image: SiteGalleryImage; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Advanced spring configurations
  const springConfig = { damping: 15, stiffness: 300, mass: 0.5 };
  const smoothSpring = { damping: 25, stiffness: 100 };
  
  // 3D rotation effects
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig);
  
  // Magnetic pull effect
  const magnetX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), smoothSpring);
  const magnetY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-12, 12]), smoothSpring);

  // Scroll-linked animations
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ['start end', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const imageRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-5, 0, 5]);

  // Gradient animation based on mouse position
  const gradientX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const gradientY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);
  const gradientBg = useMotionTemplate`radial-gradient(circle at ${gradientX}% ${gradientY}%, rgba(192, 57, 43, 0.4) 0%, transparent 50%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!itemRef.current) return;
    
    const rect = itemRef.current.getBoundingClientRect();
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    
    const xPct = (mouseXPos / rect.width - 0.5);
    const yPct = (mouseYPos / rect.height - 0.5);
    
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={itemRef}
      className="relative group"
      style={{ 
        perspective: 1200,
        x: magnetX,
        y: magnetY,
      }}
      initial={{ opacity: 0, scale: 0.7, rotateY: -45 }}
      whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ 
        duration: 1,
        delay: index * 0.12,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Outer glow effect */}
      <motion.div
        className="absolute -inset-1 bg-gradient-to-br from-[#C0392B]/50 via-[#C0392B]/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100"
        animate={{
          scale: isHovered ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: isHovered ? Infinity : 0,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        ref={imageRef}
        className="relative overflow-hidden rounded-2xl"
        style={{ 
          rotateX, 
          rotateY,
          transformStyle: 'preserve-3d',
          y: imageY,
          scale: imageScale,
          rotate: imageRotate,
        }}
      >
        {/* Animated border frame */}
        <motion.div
          className="absolute inset-0 z-20 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#C0392B]"
            animate={{
              scale: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.4, ease: 'backOut' }}
          />
          <motion.div
            className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#C0392B]"
            animate={{
              scale: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.4, delay: 0.05, ease: 'backOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#C0392B]"
            animate={{
              scale: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'backOut' }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#C0392B]"
            animate={{
              scale: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.4, delay: 0.15, ease: 'backOut' }}
          />
        </motion.div>

        {/* Image with parallax */}
        <motion.div
          className="relative h-64 md:h-80 lg:h-96 overflow-hidden"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <motion.img
            src={image.url}
            alt={`${image.title} — Throttle LK streetwear, Sri Lanka`}
            className="w-full h-full object-cover"
            style={{
              scale: useTransform(mouseX, [-0.5, 0.5], [1, 1.1]),
            }}
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          
          {/* Dynamic gradient overlay */}
          <motion.div
            className="absolute inset-0"
            style={{ background: gradientBg }}
          />

          {/* Multi-layered overlays */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: isHovered ? 0.8 : 0.6 }}
          />
          
          {/* Scan line effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(0deg, transparent 0%, rgba(192, 57, 43, 0.1) 50%, transparent 100%)',
            }}
            animate={{
              y: isHovered ? ['0%', '200%'] : '0%',
            }}
            transition={{
              duration: 1.5,
              repeat: isHovered ? Infinity : 0,
              ease: 'linear',
            }}
          />

          {/* Glitch effect on hover */}
          <motion.div
            className="absolute inset-0 bg-[#C0392B]/20 mix-blend-screen"
            animate={{
              x: isHovered ? [0, -3, 3, -3, 0] : 0,
              opacity: isHovered ? [0, 0.3, 0.3, 0.3, 0] : 0,
            }}
            transition={{
              duration: 0.3,
              times: [0, 0.25, 0.5, 0.75, 1],
              repeat: isHovered ? Infinity : 0,
              repeatDelay: 2,
            }}
          />
        </motion.div>

        {/* Title reveal */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0A0A0A] to-transparent"
          initial={{ y: '100%' }}
          animate={{ y: isHovered ? 0 : '100%' }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.h4
            className="text-[#F0EDE8] tracking-wider"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 10,
            }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {image.title}
          </motion.h4>
        </motion.div>
        
        {/* Bottom accent bar with animated fill */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-[#2C2C2C]"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-[#C0392B] via-red-600 to-[#C0392B]"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </motion.div>

        {/* Floating particles on hover */}
        {isHovered && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[#C0392B] rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  top: '50%',
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  y: [0, -40 - Math.random() * 20],
                  x: [(Math.random() - 0.5) * 30],
                }}
                transition={{
                  duration: 1.5 + Math.random(),
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* 3D depth shadow */}
      <motion.div
        className="absolute inset-0 bg-[#C0392B]/20 rounded-2xl -z-10 blur-md"
        style={{
          x: useTransform(rotateY, [-15, 15], [-8, 8]),
          y: useTransform(rotateX, [-15, 15], [8, -8]),
        }}
        animate={{
          opacity: isHovered ? 0.6 : 0.3,
        }}
      />
    </motion.div>
  );
}

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [aboutFeaturedImage, setAboutFeaturedImage] = useState(
    DEFAULT_ABOUT_FEATURED_IMAGE,
  );
  const [galleryImages, setGalleryImages] = useState<SiteGalleryImage[]>(
    DEFAULT_GALLERY_IMAGES,
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl('/site/content'));
        if (!res.ok) return;
        const parsed = parseSiteContent(await res.json());
        if (cancelled || !parsed) return;
        setAboutFeaturedImage(parsed.aboutFeaturedImage);
        setGalleryImages(parsed.galleryImages);
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section id="about" ref={sectionRef} className="relative bg-[#0A0A0A] py-24 px-6 overflow-hidden" style={{ position: 'relative' }}>
      {/* Animated background elements */}
      <motion.div
        className="absolute top-1/4 left-10 w-96 h-96 bg-[#C0392B]/10 rounded-full blur-[100px]"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 50, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-10 w-96 h-96 bg-[#2C2C2C]/20 rounded-full blur-[100px]"
        animate={{
          scale: [1.3, 1, 1.3],
          x: [0, -50, 0],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-20"
          style={{ opacity }}
        >
          <motion.h2
            className="text-6xl md:text-7xl lg:text-8xl text-[#F0EDE8] mb-6 tracking-wider"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.8 }}
          >
            Built for the Streets
          </motion.h2>

          <motion.div
            className="h-1 bg-[#C0392B] mb-8 mx-auto"
            initial={{ width: 0 }}
            whileInView={{ width: '150px' }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />

          <motion.p
            className="text-[#F0EDE8]/80 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Where urban culture meets uncompromising style. Every piece tells a story of the streets.
          </motion.p>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-20">
          {/* Left: Logo, story & stats */}
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.img
              src={logo}
              alt="Throttle LK"
              className="mb-6 block h-66 w-86 mx-auto shrink-0 brightness-0 invert sm:h-66 md:h-66"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.6 }}
            />

            <motion.div className="space-y-6">
              <motion.p
                className="text-[#F0EDE8] text-lg leading-relaxed"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ delay: 0.3 }}
              >
                Throttle LK was born in the heart of Colombo's urban landscape —
                where raw energy meets refined design. We don't follow trends; we
                create them.
              </motion.p>

              <motion.p
                className="text-[#F0EDE8] text-lg leading-relaxed"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ delay: 0.4 }}
              >
                Every hoodie is a statement. Every stitch is intentional. This isn't
                just clothing — it's armor for those who refuse to be invisible.
              </motion.p>

              <motion.p
                className="text-[#F0EDE8]/70 text-lg leading-relaxed italic"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ delay: 0.5 }}
              >
                "Built by the streets, for the streets. Premium quality that speaks louder than words."
              </motion.p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="mt-10 grid grid-cols-3 gap-4 sm:gap-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
                <motion.div
                  className="relative p-6 bg-[#2C2C2C]/30 backdrop-blur-md rounded-2xl border border-[#C0392B]/20 text-center group overflow-hidden"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(192, 57, 43, 0.5)' }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-[#C0392B]/10"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                  <p
                    className="relative text-5xl text-[#C0392B] mb-2"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    1000+
                  </p>
                  <p
                    className="relative text-[#F0EDE8] text-sm tracking-wide"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Rebels Equipped
                  </p>
                </motion.div>

                <motion.div
                  className="relative p-6 bg-[#2C2C2C]/30 backdrop-blur-md rounded-2xl border border-[#C0392B]/20 text-center group overflow-hidden"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(192, 57, 43, 0.5)' }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-[#C0392B]/10"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                  <p
                    className="relative text-5xl text-[#C0392B] mb-2"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    Premium
                  </p>
                  <p
                    className="relative text-[#F0EDE8] text-sm tracking-wide"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Quality Fabric
                  </p>
                </motion.div>

                <motion.div
                  className="relative p-6 bg-[#2C2C2C]/30 backdrop-blur-md rounded-2xl border border-[#C0392B]/20 text-center group overflow-hidden"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(192, 57, 43, 0.5)' }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-[#C0392B]/10"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                  <p
                    className="relative text-5xl text-[#C0392B] mb-2"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    LK
                  </p>
                  <p
                    className="relative text-[#F0EDE8] text-sm tracking-wide"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Made in Sri Lanka
                  </p>
                </motion.div>
            </motion.div>
          </motion.div>

          {/* Right: Featured Image with floating effect */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.div
              className="relative"
              style={{ y: useTransform(scrollYProgress, [0.2, 0.8], [-30, 30]) }}
            >
              {/* Main Image */}
              <motion.div 
                className="relative overflow-hidden rounded-3xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.5 }}
              >
                <motion.img
                  src={aboutFeaturedImage}
                  alt="Throttle LK streetwear brand story — premium hoodies made in Colombo, Sri Lanka"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 to-transparent" />
              </motion.div>

              {/* Accent Border */}
              <motion.div 
                className="absolute inset-0 border-4 border-[#C0392B] rounded-3xl -translate-x-6 -translate-y-6 -z-10"
                animate={{
                  translateX: [-24, -20, -24],
                  translateY: [-24, -20, -24],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Floating corner accent */}
              <motion.div
                className="absolute -top-4 -right-4 w-24 h-24 bg-[#C0392B] rounded-full blur-2xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h3
            className="text-4xl md:text-5xl text-[#F0EDE8] mb-8 text-center tracking-wider"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ delay: 0.3 }}
          >
            Street Culture Gallery
          </motion.h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {galleryImages.map((image, index) => (
              <FloatingImage key={image.id} image={image} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}