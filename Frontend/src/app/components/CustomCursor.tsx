import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const hoverScale = useMotionValue(1);

  // Dot: fast spring, ring: slower spring — both driven from same raw values
  const dotSpringX = useSpring(cursorX, { stiffness: 500, damping: 28 });
  const dotSpringY = useSpring(cursorY, { stiffness: 500, damping: 28 });
  const ringSpringX = useSpring(cursorX, { stiffness: 150, damping: 20 });
  const ringSpringY = useSpring(cursorY, { stiffness: 150, damping: 20 });

  // Centre each element: dot is 8px (w-2), ring is 32px (w-8)
  const dotX = useTransform(dotSpringX, v => v - 4);
  const dotY = useTransform(dotSpringY, v => v - 4);
  const ringX = useTransform(ringSpringX, v => v - 16);
  const ringY = useTransform(ringSpringY, v => v - 16);

  // Springy scale that also bypasses React state
  const scaleSprung = useSpring(hoverScale, { stiffness: 300, damping: 25 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        !!target.closest('button') ||
        !!target.closest('a');
      hoverScale.set(isInteractive ? 1.5 : 1);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY, hoverScale]);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-[#C0392B] rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: dotX,
          y: dotY,
          scale: scaleSprung,
          willChange: 'transform',
        }}
      />
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-[#F0EDE8] rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: ringX,
          y: ringY,
          scale: scaleSprung,
          willChange: 'transform',
        }}
      />
    </>
  );
}
