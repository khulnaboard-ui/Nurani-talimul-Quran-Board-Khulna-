"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CollapseProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function Collapse({ isOpen, children, className = "" }: CollapseProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`overflow-hidden ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
