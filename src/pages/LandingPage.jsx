import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";

import Atmosphere from "../components/Atmosphere.jsx";
import AgeGate from "../components/AgeGate.jsx";
import Nav from "../components/Nav.jsx";
import Hero from "../components/Hero.jsx";
import FeaturedDrops from "../components/FeaturedDrops.jsx";
import MapSection from "../components/MapSection.jsx";
import FinalCTA from "../components/FinalCTA.jsx";
import Footer from "../components/Footer.jsx";
import BackToTop from "../components/BackToTop.jsx";

export default function LandingPage() {
  // Always show the age-gate on every visit (no persistence).
  const [entered, setEntered] = useState(false);

  // Non-bypassable: lock page scroll until the visitor enters.
  useEffect(() => {
    document.body.style.overflow = entered ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [entered]);

  const handleEnter = () => setEntered(true);

  return (
    <>
      <Atmosphere />

      <AnimatePresence>
        {!entered && <AgeGate key="gate" onEnter={handleEnter} />}
      </AnimatePresence>

      {/* The site content only mounts after the visitor clicks "Entra" —
          nothing behind the gate (images, animations) loads before then. */}
      {entered && (
        <>
          <Nav />
          <main>
            <Hero />
            <FeaturedDrops />
            <MapSection />
            <FinalCTA />
          </main>
          <Footer />
          <BackToTop />
        </>
      )}
    </>
  );
}
