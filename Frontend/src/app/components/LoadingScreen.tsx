import { motion, AnimatePresence } from 'motion/react';
import logo from '../../imports/Gemini_Generated_Image_s1qapns1qapns1qa-removebg-preview.png';

export default function LoadingScreen({ isLoading }: { isLoading: boolean }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 bg-[#0A0A0A] z-[10000] flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.3, rotate: 10 }}
            transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
            className="text-center"
          >
            <motion.img
              src={logo}
              alt="Throttle LK"
              className="w-64 md:w-96 h-auto brightness-0 invert"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            />
            <motion.div
              className="h-1 bg-[#C0392B] mt-8 mx-auto"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
