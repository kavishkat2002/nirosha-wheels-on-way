import { useRef, ReactNode } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';

interface ScrollAnimationProps {
  children: ReactNode;
  className?: string;
}

export function FadeInOnScroll({ children, className }: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.2 1"]
  });
  
  const springProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const opacity = useTransform(springProgress, [0, 1], [0, 1]);
  const y = useTransform(springProgress, [0, 1], [60, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleOnScroll({ children, className }: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1 1"]
  });
  
  const springProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const scale = useTransform(springProgress, [0, 1], [0.8, 1]);
  const opacity = useTransform(springProgress, [0, 1], [0, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideInFromLeft({ children, className }: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.2 1"]
  });
  
  const springProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const x = useTransform(springProgress, [0, 1], [-100, 0]);
  const opacity = useTransform(springProgress, [0, 1], [0, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ x, opacity }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideInFromRight({ children, className }: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.2 1"]
  });
  
  const springProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const x = useTransform(springProgress, [0, 1], [100, 0]);
  const opacity = useTransform(springProgress, [0, 1], [0, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ x, opacity }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ParallaxSection({ children, className, speed = 0.5 }: ScrollAnimationProps & { speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [-50 * speed, 50 * speed]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

export function StaggerChildren({ children, className }: ScrollAnimationProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.15
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: ScrollAnimationProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
      }}
    >
      {children}
    </motion.div>
  );
}

// Animated counter for statistics
export function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1 1"]
  });
  
  const springValue = useSpring(useTransform(scrollYProgress, [0, 1], [0, value]), {
    stiffness: 100,
    damping: 30
  });

  return (
    <motion.span ref={ref}>
      <motion.span>
        {springValue.get().toFixed(0)}
      </motion.span>
      {suffix}
    </motion.span>
  );
}
