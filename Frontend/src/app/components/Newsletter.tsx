import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Send, Mail, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail('');
    }, 3000);
  };

  return (
    <section 
      id="newsletter"
      ref={sectionRef}
      className="relative bg-gradient-to-b from-[#0A0A0A] via-[#2C2C2C] to-[#0A0A0A] py-20 px-4 sm:py-24 sm:px-6 md:py-32 overflow-hidden"
    >
      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C0392B]/5 rounded-full blur-[100px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[#C0392B]/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(240, 237, 232, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(240, 237, 232, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative max-w-5xl mx-auto">
        {/* Decorative Elements */}
        <motion.div
          className="absolute -top-6 -left-6 w-16 h-16 sm:-top-12 sm:-left-12 sm:w-24 sm:h-24 border-2 border-[#C0392B]/20 rounded-full"
          initial={{ scale: 0, rotate: 0 }}
          whileInView={{ scale: 1, rotate: 180 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute -bottom-6 -right-6 w-20 h-20 sm:-bottom-12 sm:-right-12 sm:w-32 sm:h-32 border-2 border-[#C0392B]/20 rounded-full"
          initial={{ scale: 0, rotate: 0 }}
          whileInView={{ scale: 1, rotate: -180 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
        />

        {/* Content Container */}
        <motion.div
          className="relative bg-[#0A0A0A]/40 backdrop-blur-xl border border-[#F0EDE8]/10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-16 shadow-[0_20px_80px_rgba(192,57,43,0.15)]"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          {/* Sparkles Icon */}
          <motion.div
            className="flex justify-center mb-5 sm:mb-6"
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.5 }}
          >
            <motion.div
              className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#C0392B]/20 to-[#C0392B]/5 rounded-2xl flex items-center justify-center"
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-[#C0392B]" />
              
              {/* Pulse rings */}
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-[#C0392B]/50"
                animate={{
                  scale: [1, 1.3, 1.3],
                  opacity: [0.5, 0, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-[#C0392B]/50"
                animate={{
                  scale: [1, 1.3, 1.3],
                  opacity: [0.5, 0, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: 1,
                }}
              />
            </motion.div>
          </motion.div>

          {/* Heading */}
          <motion.h2
            className="text-4xl sm:text-5xl md:text-7xl text-[#F0EDE8] mb-3 sm:mb-4 tracking-wider text-center"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.span
              className="inline-block"
              whileHover={{ scale: 1.05, color: '#C0392B' }}
              transition={{ duration: 0.3 }}
            >
              Stay in the Loop
            </motion.span>
          </motion.h2>

          {/* Animated Underline */}
          <motion.div className="flex justify-center mb-6 sm:mb-8">
            <motion.div
              className="h-1 bg-gradient-to-r from-transparent via-[#C0392B] to-transparent"
              initial={{ width: 0 }}
              whileInView={{ width: '160px' }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 1, delay: 0.4 }}
            />
          </motion.div>

          {/* Description */}
          <motion.p
            className="text-[#F0EDE8]/70 text-base sm:text-lg mb-8 sm:mb-10 text-center max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ delay: 0.5 }}
          >
            Get <span className="text-[#C0392B] font-semibold">exclusive early access</span> to new drops, 
            limited edition releases, and insider street culture updates. Join the rebellion.
          </motion.p>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="relative max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ delay: 0.6 }}
          >
            <div className="relative">
              {/* Input wrapper with animated border */}
              <motion.div
                className="relative bg-[#2C2C2C]/50 backdrop-blur-sm rounded-3xl md:rounded-full p-2 border-2"
                style={{
                  borderColor: isFocused ? 'rgba(192, 57, 43, 0.8)' : 'rgba(240, 237, 232, 0.1)',
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Glow effect on focus */}
                {isFocused && (
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-[#C0392B]/20 via-[#C0392B]/40 to-[#C0392B]/20 rounded-full blur-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                <div className="relative flex flex-col md:flex-row gap-3">
                  {/* Email Input */}
                  <div className="relative flex-1">
                    <motion.div
                      className="absolute left-6 top-1/2 -translate-y-1/2 z-10"
                      animate={{
                        x: isFocused || email ? 0 : 5,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Mail className="w-5 h-5 text-[#C0392B]/60" />
                    </motion.div>
                    
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="Enter your email address"
                      required
                      className="w-full bg-[#0A0A0A] text-[#F0EDE8] pl-12 sm:pl-14 pr-5 sm:pr-6 py-3.5 sm:py-4 text-sm sm:text-base outline-none placeholder:text-[#F0EDE8]/30 rounded-full"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    className="relative bg-gradient-to-r from-[#C0392B] to-[#C0392B]/80 text-[#F0EDE8] px-6 sm:px-8 py-3.5 sm:py-4 rounded-full tracking-wider overflow-hidden group"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={submitted}
                  >
                    {/* Button shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                    />

                    <span className="relative flex items-center justify-center gap-2">
                      {submitted ? (
                        <motion.span
                          className="flex items-center gap-2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500 }}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          Subscribed!
                        </motion.span>
                      ) : (
                        <>
                          Subscribe Now
                          <motion.span
                            className="inline-block"
                            animate={{ x: [0, 5, 0] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          >
                            <Send className="w-4 h-4" />
                          </motion.span>
                        </>
                      )}
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Privacy Text */}
            <motion.p
              className="text-[#F0EDE8]/40 text-xs text-center mt-4"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ delay: 0.8 }}
            >
              🔒 We respect your privacy. Unsubscribe at any time.
            </motion.p>
          </motion.form>

          {/* Benefits */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mt-10 sm:mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ delay: 0.9 }}
          >
            {[
              { title: 'Early Access', desc: 'Be the first to shop new drops' },
              { title: 'Exclusive Deals', desc: 'Subscriber-only discounts' },
              { title: 'Street Culture', desc: 'Latest trends & updates' },
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                className="text-center p-4 rounded-xl bg-[#2C2C2C]/30 border border-[#F0EDE8]/5 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 1 + index * 0.1 }}
                whileHover={{ 
                  borderColor: 'rgba(192, 57, 43, 0.3)',
                  backgroundColor: 'rgba(192, 57, 43, 0.05)',
                  y: -5,
                }}
              >
                <motion.h4
                  className="text-[#F0EDE8] text-lg mb-1 tracking-wide"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {benefit.title}
                </motion.h4>
                <p
                  className="text-[#F0EDE8]/50 text-sm"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {benefit.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}