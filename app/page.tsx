"use client";

import { useState, useEffect } from "react";
import Hero3D from "@/components/Hero3D";

export default function Home() {
  const [currentSection, setCurrentSection] = useState<"home" | "implant" | "ortho" | "rehab" | "profile">("home");
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [implantExploded, setImplantExploded] = useState(false);
  const [implantXray, setImplantXray] = useState(false);
  const [implantAutoRotate, setImplantAutoRotate] = useState(false);

  useEffect(() => {
    // Remove loader after initial load
    const timer1 = setTimeout(() => {
      setLoaderVisible(false);
    }, 1500);

    // Remove from DOM after fade out
    const timer2 = setTimeout(() => {
      const loader = document.getElementById('loader');
      if (loader) {
        loader.remove();
      }
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const switchSection = (section: "home" | "implant" | "ortho" | "rehab" | "profile") => {
    setCurrentSection(section);
    // Reset implant controls when switching away from implant section
    if (section !== "implant") {
      setImplantExploded(false);
      setImplantXray(false);
      setImplantAutoRotate(false);
    }
  };

  // Swipe / Scroll Navigation Logic
  useEffect(() => {
    let lastScrollTime = 0;
    const scrollDelay = 1000; // ms between switches
    const sections: ("home" | "implant" | "ortho" | "rehab" | "profile")[] = ["home", "implant", "ortho", "rehab", "profile"];

    const handleScroll = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScrollTime < scrollDelay) return;

      const direction = e.deltaY > 0 ? 1 : -1;
      const currentIndex = sections.indexOf(currentSection);
      let nextIndex = currentIndex + direction;

      // Clamp index
      if (nextIndex < 0) nextIndex = 0;
      if (nextIndex >= sections.length) nextIndex = sections.length - 1;

      if (nextIndex !== currentIndex) {
        lastScrollTime = now;
        switchSection(sections[nextIndex]);
      }
    };

    // Touch handling
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;

      if (Math.abs(diff) > 50) { // Threshold
        const now = Date.now();
        if (now - lastScrollTime < 500) return; // Faster debounce for touch

        const direction = diff > 0 ? 1 : -1; // > 0 means swipe up (scroll down)
        const currentIndex = sections.indexOf(currentSection);
        let nextIndex = currentIndex + direction;

        if (nextIndex < 0) nextIndex = 0;
        if (nextIndex >= sections.length) nextIndex = sections.length - 1;

        if (nextIndex !== currentIndex) {
          lastScrollTime = now;
          switchSection(sections[nextIndex]);
        }
      }
    };

    window.addEventListener("wheel", handleScroll);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [currentSection]);

  const resetView = () => {
    switchSection("home");
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#F9FAFB]">
      {/* Loader */}
      {loaderVisible && (
        <div
          id="loader"
          className={`fixed inset-0 bg-white z-50 flex items-center justify-center transition-opacity duration-1000 ${loaderVisible ? "opacity-100" : "opacity-0"
            }`}
        >
          <div className="serif text-2xl tracking-widest text-gray-800 animate-pulse">
            PREPARANDO SU SONRISA...
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <div className="fixed inset-0 z-0">
        <Hero3D
          currentSection={currentSection}
          implantExploded={implantExploded}
          implantXray={implantXray}
          implantAutoRotate={implantAutoRotate}
        />
      </div>

      {/* UI Layer */}
      <div className="ui-layer p-6 md:p-12">
        {/* Header */}
        <header className="flex justify-between items-center w-full">
          <div
            className="interactive cursor-pointer"
            onClick={resetView}
          >
            <h1
              className="text-3xl md:text-4xl font-semibold tracking-wide transition-colors duration-300 text-gray-900"
            >
              DR. OSWALDO CHEYNE
            </h1>
            <p
              className="text-xs tracking-widest mt-1 uppercase transition-colors duration-300 text-gray-500"
            >
              Odontología Avanzada
            </p>
          </div>

          <nav
            className="hidden md:flex space-x-8 text-sm tracking-widest font-medium interactive transition-colors duration-300 text-gray-600"
          >
            <button
              onClick={() => switchSection("implant")}
              className={`nav-btn ${currentSection === "implant" ? "active" : ""}`}
              id="btn-implant"
            >
              IMPLANTOLOGÍA
            </button>
            <button
              onClick={() => switchSection("ortho")}
              className={`nav-btn ${currentSection === "ortho" ? "active" : ""}`}
              id="btn-ortho"
            >
              ORTODONCIA
            </button>
            <button
              onClick={() => switchSection("rehab")}
              className={`nav-btn ${currentSection === "rehab" ? "active" : ""}`}
              id="btn-rehab"
            >
              REHABILITACIÓN
            </button>
            <button
              onClick={() => switchSection("profile")}
              className={`nav-btn ${currentSection === "profile" ? "active" : ""}`}
              id="btn-profile"
            >
              PERFIL
            </button>
          </nav>

          <button
            className="interactive px-6 py-2 text-xs tracking-widest transition-colors duration-300 bg-gray-900 text-white hover:bg-[#D4AF37]"
          >
            RESERVAR CITA
          </button>
        </header>

        {/* Main Content Area (Dynamic) */}
        <main className="flex-1 flex items-center">
          <div className="w-full md:w-1/3 interactive">
            {/* Welcome / Default Card */}
            <div
              className={`content-card ${currentSection === "home" ? "visible" : "hidden"
                } p-8 md:p-12 rounded-none border-l-4 border-[#D4AF37]`}
              id="card-home"
            >
              <h2 className="serif text-4xl md:text-5xl text-gray-900 mb-4">
                El Arte de la <br />
                <span className="italic gold-text">Precisión.</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6 font-light">
                Dedicado a la perfección de la sonrisa. Fusionando tecnología
                avanzada con arte clínico para restaurar la función y la
                confianza.
              </p>
              <div className="flex space-x-2 text-xs tracking-widest text-gray-400">
                <span>DESLIZA O SELECCIONA UN SERVICIO</span>
                <span>&rarr;</span>
              </div>
            </div>

            {/* Implantology Card */}
            <div
              className={`content-card absolute top-1/2 -translate-y-1/2 left-0 md:left-12 p-8 md:p-12 rounded-none border-l-4 border-gray-900 ${currentSection === "implant" ? "visible" : "hidden"
                }`}
              id="card-implant"
            >
              <div className="text-xs font-bold tracking-widest text-gray-400 mb-2">
                SERVICIO 01
              </div>
              <h2 className="serif text-4xl md:text-5xl text-gray-900 mb-4">
                Implantología
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6 font-light">
                La base de la estabilidad. Usando estructuras de titanio
                biocompatibles para reemplazar raíces perdidas, proporcionando una
                base sólida y permanente para tu sonrisa.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#D4AF37] mr-3"></span>
                  Reemplazo de Diente Único
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#D4AF37] mr-3"></span>
                  Restauración de Arco Completo
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#D4AF37] mr-3"></span>
                  Regeneración Ósea
                </li>
              </ul>
            </div>

            {/* Orthodontics Card */}
            <div
              className={`content-card absolute top-1/2 -translate-y-1/2 left-0 md:left-12 p-8 md:p-12 rounded-none border-l-4 border-gray-900 ${currentSection === "ortho" ? "visible" : "hidden"
                }`}
              id="card-ortho"
            >
              <div className="text-xs font-bold tracking-widest text-gray-400 mb-2">
                SERVICIO 02
              </div>
              <h2 className="serif text-4xl md:text-5xl text-gray-900 mb-4">
                Ortodoncia
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6 font-light">
                Armonía en la alineación. Corregimos irregularidades en la
                posición dental y la relación mandibular para lograr no solo
                estética, sino equilibrio funcional a largo plazo.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#D4AF37] mr-3"></span>
                  Alineadores Invisibles
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#D4AF37] mr-3"></span>
                  Brackets Cerámicos
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#D4AF37] mr-3"></span>
                  Ajuste Oclusal
                </li>
              </ul>
            </div>

            {/* Rehabilitation Card */}
            <div
              className={`content-card absolute top-1/2 -translate-y-1/2 left-0 md:left-12 p-8 md:p-12 rounded-none border-l-4 border-gray-900 ${currentSection === "rehab" ? "visible" : "hidden"
                }`}
              id="card-rehab"
            >
              <div className="text-xs font-bold tracking-widest text-gray-400 mb-2">
                SERVICIO 03
              </div>
              <h2 className="serif text-4xl md:text-5xl text-gray-900 mb-4">
                Rehabilitación Oral
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6 font-light">
                Restauración total. Casos complejos que requieren un enfoque
                multidisciplinario para reconstruir la integridad funcional y
                estética de la boca desde cero.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#D4AF37] mr-3"></span>
                  Carillas de Porcelana
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#D4AF37] mr-3"></span>
                  Reconstrucción de Boca Completa
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#D4AF37] mr-3"></span>
                  Diseño de Sonrisa
                </li>
              </ul>
            </div>

            {/* Profile Card - NO NAME/DESCRIPTION */}
            <div
              className={`content-card absolute top-1/2 -translate-y-1/2 left-0 md:left-12 p-8 md:p-12 rounded-none border-l-4 border-gray-900 max-h-[80vh] overflow-y-auto w-full md:w-1/2 ${currentSection === "profile" ? "visible" : "hidden"
                }`}
              id="card-profile"
            >
              <div className="text-xs font-bold tracking-widest text-gray-400 mb-4">
                SOBRE EL DOCTOR
              </div>

              <div className="space-y-4 text-sm text-gray-700 mb-6">
                <div>
                  <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs mb-2">Ubicación</h3>
                  <p className="mb-2">Calle 45 #22-18, Bogotá, Colombia</p>
                  <div className="w-full h-32 rounded overflow-hidden border border-gray-200">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.6347!2d-74.0658!3d4.6486!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9a287b8c1c1b%3A0x1!2sCalle%2045%20%2322-18%2C%20Bogot%C3%A1!5e0!3m2!1ses!2sco!4v1234567890"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs mb-1">Estudios</h3>
                  <p>Odontólogo egresado de la Universidad Nacional de Colombia especializado en Rehabilitación Oral e Implantología.</p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs mb-1">Experiencia</h3>
                  <p>Más de 30 años transformando sonrisas y liderando procedimientos de alta complejidad en implantología y rehabilitación oral.</p>
                </div>
              </div>
            </div>

          </div>
        </main>

        {/* Mobile Nav (Bottom) */}
        <div className="md:hidden flex justify-between items-center border-t border-gray-200 pt-4 interactive bg-white/80 backdrop-blur-md p-4 -mx-6 -mb-6">
          <button
            onClick={() => switchSection("implant")}
            className="text-xs font-bold tracking-widest text-gray-500 hover:text-[#D4AF37]"
          >
            IMPLANTE
          </button>
          <button
            onClick={() => switchSection("ortho")}
            className="text-xs font-bold tracking-widest text-gray-500 hover:text-[#D4AF37]"
          >
            ORTO
          </button>
          <button
            onClick={() => switchSection("rehab")}
            className="text-xs font-bold tracking-widest text-gray-500 hover:text-[#D4AF37]"
          >
            REHAB
          </button>
          <button
            onClick={() => switchSection("profile")}
            className="text-xs font-bold tracking-widest text-gray-500 hover:text-[#D4AF37]"
          >
            PERFIL
          </button>
        </div>

        {/* Footer Info */}
        <footer className="hidden md:flex justify-between items-end text-gray-400 text-xs tracking-widest">
          <div>
            <p>BOGOTÁ, COLOMBIA</p>
          </div>
          <div className="text-right">
            <p>&copy; 2025 DR. OSWALDO CHEYNE</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
