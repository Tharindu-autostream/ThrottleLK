import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

/**
 * Kept in sync by hand with the FAQPage JSON-LD hardcoded in index.html — that
 * copy must render even when JavaScript doesn't run (most AI answer-engine
 * crawlers don't execute JS), so the schema can't be generated from this array.
 * If you edit a question/answer here, update the matching entry in index.html.
 */
const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: 'What is Throttle LK?',
    answer:
      "Throttle LK is a streetwear and rider culture brand based in Colombo, Sri Lanka, known for bold, oversized hoodies and t-shirts built for people who refuse to blend in.",
  },
  {
    question: 'Does Throttle LK deliver island-wide in Sri Lanka?',
    answer:
      'Yes. Throttle LK delivers to every district in Sri Lanka for a flat island-wide delivery fee of LKR 450, added at checkout.',
  },
  {
    question: 'How do I place an order and what payment methods are accepted?',
    answer:
      "Add items to your cart and check out on the website. Orders are confirmed via WhatsApp \u2014 you'll send us your order, we'll reply with our bank details, and you confirm with a deposit slip.",
  },
  {
    question: 'What sizes are available for Throttle LK hoodies and t-shirts?',
    answer:
      'Most Throttle LK products are available from S to XXL. Exact sizing can vary slightly by drop, so check the size options listed on each product page.',
  },
  {
    question: 'Is Throttle LK adding motorbike parts and riders\u2019 accessories?',
    answer:
      'Yes. Throttle LK is expanding beyond streetwear into "Motor Garage" \u2014 a new line of modified motorbike parts and riders\u2019 accessories for Sri Lanka\u2019s bike culture. Subscribe to the newsletter to be notified when it launches.',
  },
  {
    question: 'Where is Throttle LK based?',
    answer: 'Throttle LK is based in Colombo, Sri Lanka.',
  },
  {
    question: 'How can I contact Throttle LK for support?',
    answer:
      'You can reach Throttle LK via WhatsApp directly from the checkout page, or through our Facebook and TikTok pages linked in the footer.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative bg-[#0A0A0A] py-24 px-6">
      <div className="relative mx-auto max-w-3xl">
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="mb-4 text-5xl tracking-wider text-[#F0EDE8] sm:text-6xl"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Frequently Asked Questions
          </h2>
          <motion.div
            className="mx-auto h-1 w-[120px] bg-[#C0392B]"
            initial={{ width: 0 }}
            whileInView={{ width: '120px' }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </motion.div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={item.question}
                className="overflow-hidden rounded-2xl border border-[#2C2C2C] bg-[#1a1a1a]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span
                    className="text-base text-[#F0EDE8] sm:text-lg"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {item.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="shrink-0 text-[#C0392B]"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p
                        className="px-6 pb-5 text-sm leading-relaxed text-[#F0EDE8]/60 sm:text-base"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
