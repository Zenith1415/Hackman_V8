"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface BlocksTransitionProps {
  isAnimating: boolean;
  onComplete?: () => void;
}

const BlocksTransition: React.FC<BlocksTransitionProps> = ({
  isAnimating,
  onComplete,
}) => {
  const [blocks, setBlocks] = useState<number[]>([]);
  const [columns, setColumns] = useState(0);
  const [rows, setRows] = useState(0);

  
  useEffect(() => {
    const cols = Math.ceil(window.innerWidth / 100);
    const rowsCount = Math.ceil(window.innerHeight / 100);
    const totalBlocks = cols * rowsCount;
    setColumns(cols);
    setRows(rowsCount);
    setBlocks(Array.from({ length: totalBlocks }, (_, i) => i));
  }, []);

  if (!isAnimating || blocks.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        pointerEvents: "none",
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 0,
      }}
    >
      {blocks.map((index) => {
        
        const randomDelay = Math.random() * 0.5;
        const row = Math.floor(index / columns);
        const col = index % columns;
        
        return (
          <motion.div
            key={index}
            initial={{ scaleY: 0.6 }}
            animate={{ scaleY: 0 }}
            transition={{
              duration: 1,
              delay: randomDelay,
              ease: "easeInOut",
            }}
            onAnimationComplete={() => {
              
              if (index === blocks.length - 1 && onComplete) {
                onComplete();
              }
            }}
            style={{
              backgroundImage: "url('/welcome_bg.png')",
              
              backgroundRepeat: "repeat",
              transformOrigin: "bottom",
              width: "100%",
              height: "100%",
            }}
          />
        );
      })}
    </div>
  );
};

export default BlocksTransition;
