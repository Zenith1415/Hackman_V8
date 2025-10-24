"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface TypewriterTextProps {
  text: string;
  onComplete?: () => void;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Split text into lines and create a flat character array
  const textLines = text.split('\n');
  const flatText = textLines.join('\n');

  useEffect(() => {
    if (currentIndex < flatText.length) {
      const timeout = setTimeout(() => {
      
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {
         
          });
        }
        
        setDisplayedText(prev => prev + flatText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, Math.floor(3200 / flatText.length)); 

      return () => clearTimeout(timeout);
    } else {
      
      const timeout = setTimeout(() => {
        onComplete?.();
      }, 1500); 

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, flatText, onComplete]);

  return (
    <>
      <audio ref={audioRef} preload="auto">
        <source src="/audio/typewriter.mp3" type="audio/mpeg" />
      </audio>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1
          className="text-white tracking-wider"
          style={{
            fontFamily: 'Courier New, monospace',
            fontSize: '1.8rem',
            fontWeight: '100',
            textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
          }}
          dangerouslySetInnerHTML={{
            __html: displayedText + '<span style="animation: blink 0.8s infinite;">|</span>'
          }}
        />
        <style jsx>{`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}</style>
      </motion.div>
    </>
  );
};

export default TypewriterText;
