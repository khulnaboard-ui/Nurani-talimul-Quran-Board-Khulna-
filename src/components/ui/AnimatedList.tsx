"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  as?: any;
}

export default function AnimatedList({ children, className = "", as = "div" }: AnimatedListProps) {
  const Component = motion.create(as);
  
  return (
    <Component layout className={className}>
      <AnimatePresence mode="popLayout">
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          
          return (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              key={child.key || Math.random()}
              className="w-full"
            >
              {child}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </Component>
  );
}
