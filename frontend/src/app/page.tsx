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

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

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
    // Show main content after button expansion completes
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && showWelcome ? (
        <WelcomeScreen onComplete={handleIntroComplete} />
      ) : (
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