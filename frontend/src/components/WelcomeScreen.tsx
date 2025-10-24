"use client";

import React, { useState, useEffect } from "react";
import { Nosifer } from "next/font/google";
import { motion } from "framer-motion";
import styles from "../styles/WelcomeScreen.module.css";

const nosifer = Nosifer({
  weight: "400",
  subsets: ["latin"],
});

interface WelcomeScreenProps {
  onComplete?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleEnter = () => {
    // Directly trigger completion
    handleComplete();
  };

  const handleComplete = () => {
    onComplete?.();
  };



  if (!isClient) {
    return <div className={styles.container}></div>;
  }

  return (
    <div className={styles.container}>
        <div className={styles.enterSection}>
          <motion.button
            onClick={handleEnter}
            className={`${styles.enterButton} ${nosifer.className}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ENTER IF YOU DARE
          </motion.button>
        </div>
    </div>
  );
};

export default WelcomeScreen;
