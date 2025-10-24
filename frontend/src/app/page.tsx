'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import About from '@/components/About';
import FAQ from '@/components/FAQ';
import Sponsors from '@/components/Sponsors';
import Contact from '@/components/Contact';
import Gallery from '@/components/Gallery';
import { AboutHackman } from '@/components/About';
import Timeline from '@/components/Timeline/Timeline';
import WelcomeScreen from '@/components/WelcomeScreen';
import BackgroundAudio from '@/components/BackgroundAudio';
import TypewriterText from '@/components/TypewriterText';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTypewriter, setShowTypewriter] = useState(false);

  useEffect(() => {
    // Check if user has already seen the welcome screen in this session
    const hasSeenWelcome = sessionStorage.getItem('welcomeScreenShown');

    if (!hasSeenWelcome) {
      // First visit in this session - show welcome screen
      setShowWelcome(true);
      setIsLoading(true);
    } else {
      // Already seen in this session - skip welcome screen
      setShowWelcome(false);
      setIsLoading(false);
    }
  }, []);

  const handleIntroComplete = () => {
    // Mark welcome screen as shown for this session
    sessionStorage.setItem('welcomeScreenShown', 'true');
    // Show typewriter screen
    setShowTypewriter(true);
  };

  const handleTypewriterComplete = () => {
    setShowTypewriter(false);
    setIsLoading(false);
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && showWelcome && (
          <WelcomeScreen onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>
      {showTypewriter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#000',
            zIndex: 20000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TypewriterText 
            text="Be Ready...<br/>For B/Witching The Binary."
            onComplete={handleTypewriterComplete}
          />
        </motion.div>
      )}
      {!isLoading && !showTypewriter && (
        <>
          {/* Background audio plays only after welcome screen */}
          <BackgroundAudio />
          <Navigation />
          <main className="min-h-screen">
            <section id="hero">
              <Hero />
            </section>
            <section id="about">
              <About />
            </section>
            <section id="about-hackman">
              <AboutHackman />
            </section>
            <section id="timeline">
              <Timeline />
            </section>
            <section id="faq">
              <FAQ />
            </section>
            <section id="gallery">
              <Gallery />
            </section>
            <section id="sponsors">
              <Sponsors />
            </section>
            <Contact />
          </main>
        </>
      )}
    </>
  );
}