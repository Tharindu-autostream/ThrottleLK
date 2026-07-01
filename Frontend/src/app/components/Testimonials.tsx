import { motion } from 'motion/react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Kamal Perera',
    location: 'Colombo',
    text: 'The quality is insane. Finally found a brand that gets streetwear right.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Nadia Fernando',
    location: 'Kandy',
    text: 'Oversized fit is perfect. The material feels premium and looks even better in person.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Rohan Silva',
    location: 'Galle',
    text: 'Been waiting for a local brand like this. Throttle LK is the real deal.',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[#0A0A0A] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-6xl text-[#F0EDE8] mb-4 tracking-wider text-center"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          What They Say
        </motion.h2>

        <motion.div
          className="h-1 bg-[#C0392B] mb-16 mx-auto"
          initial={{ width: 0 }}
          whileInView={{ width: '120px' }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              className="bg-[#2C2C2C] p-8 border border-[#2C2C2C] hover:border-[#C0392B] transition-colors"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8, borderColor: '#C0392B' }}
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-[#C0392B] text-[#C0392B]"
                  />
                ))}
              </div>

              <p
                className="text-[#F0EDE8] mb-6 leading-relaxed"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                "{testimonial.text}"
              </p>

              <div className="border-t border-[#2C2C2C] pt-4">
                <p
                  className="text-[#F0EDE8] tracking-wide"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {testimonial.name}
                </p>
                <p
                  className="text-[#F0EDE8]/60 text-sm"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {testimonial.location}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
