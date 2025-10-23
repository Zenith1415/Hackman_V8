"use client";

import React, { useState, useEffect, useRef } from "react";
import { Nosifer } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../styles/WelcomeScreen.module.css";

const nosifer = Nosifer({
  weight: "400",
  subsets: ["latin"],
});


const ANIMATION_DURATION_MS = 800;
const AUDIO_GAP_MS = 1000;

interface WelcomeScreenProps {
  onComplete?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<"initial" | "expanding" | "complete">("initial");
  const [isMuted, setIsMuted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioLoopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isCompletingRef = useRef(false);

  useEffect(() => {
    setIsClient(true);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (audioLoopTimerRef.current) {
        clearTimeout(audioLoopTimerRef.current);
      }
    };
  }, []);

  const handleEnter = () => {
    // Setup audio
    const playAudioWithGap = () => {
      if (audioRef.current && !isCompletingRef.current) {
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        if (playPromise) {
          playPromise
            .then(() => setAudioEnabled(true))
            .catch(() => console.log("Audio blocked by browser gesture policy"));
        }
      }
    };

    if (audioRef.current) {
      audioRef.current.volume = 0.4;
      audioRef.current.muted = false;
      const handleAudioEnd = () => {
        if (!isCompletingRef.current) {
          audioLoopTimerRef.current = setTimeout(playAudioWithGap, AUDIO_GAP_MS);
        }
      };
      audioRef.current.addEventListener("ended", handleAudioEnd);
      playAudioWithGap();
    }

    // Start button expansion animation
    setStage("expanding");
    
    // After expansion completes, trigger homepage reveal
    setTimeout(() => {
      handleComplete();
    }, 1200); // Allow time for expansion animation
  };

  const handleComplete = () => {
    isCompletingRef.current = true;
    if (audioLoopTimerRef.current) clearTimeout(audioLoopTimerRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setStage("complete");
    onComplete?.();
  };



  if (!isClient) {
    return <div className={styles.container}></div>;
  }

  return (
    <>
      <audio ref={audioRef} preload="auto">
        <source src="/audio/spooky-intro.mp3" type="audio/mpeg" />
      </audio>

      <motion.div
        className={styles.container}
        animate={stage === "expanding" ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <AnimatePresence>
          {stage === "initial" && (
            <motion.div 
              className={styles.enterSection}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                onClick={handleEnter}
                className={`${styles.enterButton} ${nosifer.className}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ENTER IF YOU DARE
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Button expansion overlay */}
        <AnimatePresence>
          {stage === "expanding" && (
            <motion.div
              initial={{ scale: 0, borderRadius: "0.5rem" }}
              animate={{ 
                scale: 50, 
                borderRadius: "0%",
                opacity: [1, 1, 0]
              }}
              transition={{ 
                duration: 1.2, 
                ease: "easeInOut",
                opacity: { times: [0, 0.7, 1], duration: 1.2 }
              }}
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                width: "100px",
                height: "50px",
                backgroundColor: "#ffffff",
                transform: "translate(-50%, -50%)",
                zIndex: 10001,
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default WelcomeScreen;
