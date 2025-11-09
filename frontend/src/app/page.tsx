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

import BackgroundAudio from '@/components/BackgroundAudio';

import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [showTypewriter, setShowTypewriter] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
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
