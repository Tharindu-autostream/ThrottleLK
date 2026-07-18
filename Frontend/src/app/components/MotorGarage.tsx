import { motion } from 'motion/react';
import { Bike, Wrench, ShieldCheck, Bell } from 'lucide-react';
import { Link } from 'react-router';

const pillars = [
  {
    icon: Wrench,
    title: 'Modified Parts',
    desc: 'Performance upgrades and modified components chosen for Sri Lanka riding conditions — not just showroom cosmetics.',
  },
  {
    icon: ShieldCheck,
    title: 'Riding Accessories',
    desc: "Helmets, gloves, and protective gear that fit daily commuting, weekend runs, and island weather swings.",
  },
  {
    icon: Bike,
    title: 'Rider Culture',
    desc: "Built with the same street attitude as our hoodies — for riders who live the bike, not only pose with it.",
  },
];

/**
 * Homepage section for the motorbike modified-parts & riders'-accessories
 * line. Substantial copy so it is not a hollow "coming soon" stub for AdSense.
 */
export default function MotorGarage() {
  return (
    <section id="motor-garage" className="relative overflow-hidden bg-[#0A0A0A] py-24 px-6">
      <motion.div
        className="absolute top-1/3 right-10 h-80 w-80 rounded-full bg-[#C0392B]/10 blur-[110px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="mb-3 inline-block rounded-full border border-[#C0392B]/40 bg-[#C0392B]/10 px-4 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-[#C0392B]"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.5 }}
          >
            Expanding soon
          </motion.span>
          <h2
            className="mb-4 text-5xl tracking-wider text-[#F0EDE8] sm:text-6xl"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Motor Garage
          </h2>
          <motion.div
            className="mx-auto mb-6 h-1 w-[120px] bg-[#C0392B]"
            initial={{ width: 0 }}
            whileInView={{ width: '120px' }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <p
            className="mx-auto max-w-2xl text-base leading-relaxed text-[#F0EDE8]/70 md:text-lg"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Throttle LK is expanding beyond streetwear into{' '}
            <span className="text-[#C0392B]">modified motorbike parts</span> and{' '}
            <span className="text-[#C0392B]">riders&apos; accessories</span> —
            curated for how people actually ride in Sri Lanka: mixed traffic,
            humidity, monsoon showers, and long island distances.
          </p>
        </motion.div>

        <div className="mx-auto mb-12 max-w-3xl space-y-4 text-left text-sm leading-relaxed text-[#F0EDE8]/65 md:text-base">
          <p>
            In Sri Lanka a bike is often daily transport, not a weekend toy.
            Motor Garage will focus on upgrades and accessories that respect
            that reality — braking, visibility, comfort, and durable style —
            alongside the graphic streetwear already in the shop.
          </p>
          <p>
            Until the catalogue opens, read our{' '}
            <Link to="/blog/beginner-rider-gear-basics-sri-lanka" className="text-[#C0392B] underline underline-offset-2">
              beginner rider gear guide
            </Link>{' '}
            and subscribe below so you are first in line when drops go live.
          </p>
        </div>

        <div className="mb-12 grid gap-6 sm:grid-cols-3">
          {pillars.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              className="rounded-2xl border border-[#2C2C2C] bg-[#1a1a1a] p-6 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6, borderColor: 'rgba(192, 57, 43, 0.5)' }}
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#C0392B]/15">
                <Icon className="h-6 w-6 text-[#C0392B]" />
              </div>
              <h3
                className="mb-2 text-xl tracking-wide text-[#F0EDE8]"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {title}
              </h3>
              <p
                className="text-sm leading-relaxed text-[#F0EDE8]/60"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ delay: 0.3 }}
        >
          <a
            href="#newsletter"
            className="group inline-flex items-center gap-2 rounded-full border-2 border-[#C0392B]/50 bg-[#C0392B]/20 px-8 py-3 tracking-wider text-[#F0EDE8] backdrop-blur-md transition-colors hover:bg-[#C0392B]/30"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            <Bell className="h-4 w-4 transition-transform group-hover:rotate-12" />
            Notify Me When It Drops
          </a>
        </motion.div>
      </div>
    </section>
  );
}
