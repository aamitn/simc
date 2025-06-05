// GSAP Animation Scripts
declare var gsap: any;
declare var ScrollTrigger: any;

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeAnimations();
});

function initializeAnimations() {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);

  // Navbar animation
  animateNavbar();
  
  // Hero section animations
  animateHero();
  
  // Features section animations
  animateFeatures();
  
  // Banner section animations
  animateBanner();
  
  // About section animations
  animateAbout();
  

  
  // Footer animations
  animateFooter();
  
  // Circuit nodes floating animation
  animateCircuitNodes();
  
  // Scroll-triggered animations
  initScrollAnimations();
}

function animateNavbar() {
  const navbar = document.getElementById('navbar');
  const logo = document.getElementById('logo');
  const navLinks = document.getElementById('nav-links');
  const navCta = document.getElementById('nav-cta');

  if (navbar && logo && navLinks && navCta) {
    // Initial navbar animation
    gsap.set([logo, navLinks, navCta], { opacity: 0, y: -20 });
    
    gsap.timeline()
      .to(logo, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" })
      .to(navLinks, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.3")
      .to(navCta, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.3");

    // Navbar scroll effect
    ScrollTrigger.create({
      start: "top -80",
      end: 99999,
      toggleClass: { className: "navbar-scrolled", targets: navbar }
    });
  }
}

function animateHero() {
  const heroTitle = document.getElementById('hero-title');
  const heroSubtitle = document.getElementById('hero-subtitle');
  const heroCta = document.getElementById('hero-cta');
  const heroStats = document.getElementById('hero-stats');
  const scrollIndicator = document.getElementById('scroll-indicator');

  const tl = gsap.timeline({ delay: 0.5 });

  // Animate circuit simulation elements first
  animateCircuitSimulation();

  if (heroTitle) {
    tl.from(heroTitle, {
      opacity: 0,
      y: 60,
      duration: 1,
      ease: "power2.out"
    });
  }

  if (heroSubtitle) {
    tl.from(heroSubtitle, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.5");
  }

  if (heroCta) {
    tl.from(heroCta.children, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.2,
      ease: "power2.out"
    }, "-=0.3");
  }

  if (heroStats) {
    tl.from(heroStats.children, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out"
    }, "-=0.2");
  }

  if (scrollIndicator) {
    tl.from(scrollIndicator, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.2");
  }

  // Hero buttons hover effects
  const launchBtn = document.getElementById('launch-btn');
  const demoBtn = document.getElementById('demo-btn');

  [launchBtn, demoBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('mouseenter', () => {
        gsap.to(btn, { scale: 1.05, duration: 0.3, ease: "power2.out" });
        createElectricalSpark(btn);
      });
      
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { scale: 1, duration: 0.3, ease: "power2.out" });
      });
    }
  });
}

function animateCircuitSimulation() {
  // Animate circuit lines with current flow
  const circuitLines = document.querySelectorAll('.circuit-line');
  circuitLines.forEach((line, index) => {
    gsap.fromTo(line, 
      { strokeDasharray: "0,1000" },
      { 
        strokeDasharray: "1000,0", 
        duration: 2 + index * 0.3, 
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true
      }
    );
  });

  // Animate current indicators moving along paths
  const currentIndicators = document.querySelectorAll('.current-indicator');
  currentIndicators.forEach((indicator, index) => {
    gsap.to(indicator, {
      x: "random(-50, 50)",
      y: "random(-30, 30)",
      duration: "random(2, 4)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: index * 0.5
    });

    gsap.to(indicator, {
      opacity: "random(0.3, 1)",
      scale: "random(0.8, 1.5)",
      duration: "random(1, 3)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  });

  // Animate circuit components
  const components = document.querySelectorAll('.circuit-component');
  components.forEach((component, index) => {
    gsap.from(component, {
      scale: 0,
      rotation: 180,
      duration: 1,
      delay: index * 0.3,
      ease: "back.out(1.7)"
    });

    // Add hover effects to components
    component.addEventListener('mouseenter', () => {
      gsap.to(component, { 
        scale: 1.2, 
        rotation: 360, 
        duration: 0.5, 
        ease: "power2.out" 
      });
    });

    component.addEventListener('mouseleave', () => {
      gsap.to(component, { 
        scale: 1, 
        rotation: 0, 
        duration: 0.5, 
        ease: "power2.out" 
      });
    });
  });

  // Animate oscilloscope waveform
  const waveform = document.getElementById('sine-wave');
  if (waveform) {
    gsap.to(waveform, {
      strokeDashoffset: -100,
      duration: 2,
      repeat: -1,
      ease: "none"
    });
  }

  // Animate signal dots on oscilloscope
  const signalDots = document.querySelectorAll('.signal-dot');
  signalDots.forEach((dot, index) => {
    gsap.to(dot, {
      cy: "+=random(-10, 10)",
      duration: "random(1, 2)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: index * 0.2
    });
  });

  // Animate voltage values with realistic fluctuations
  animateVoltageReadings();

  // Create electrical arc effects
  setInterval(() => {
    createElectricalArc();
  }, 3000);
}

function animateVoltageReadings() {
  const voltageElements = [
    { id: 'voltage-1', baseValue: 5.0, variance: 0.1 },
    { id: 'voltage-2', baseValue: 3.3, variance: 0.05 },
    { id: 'voltage-3', baseValue: 1.8, variance: 0.03 }
  ];

  voltageElements.forEach(voltage => {
    const element = document.getElementById(voltage.id);
    if (element) {
      gsap.to({}, {
        duration: 0.1,
        repeat: -1,
        onRepeat: () => {
          const fluctuation = (Math.random() - 0.5) * voltage.variance * 2;
          const newValue = voltage.baseValue + fluctuation;
          element.textContent = `${newValue.toFixed(2)}V`;
        }
      });
    }
  });
}

function createElectricalArc() {
  const heroSection = document.getElementById('home');
  if (!heroSection) return;

  const arc = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  arc.style.cssText = `
    position: absolute;
    top: ${Math.random() * 50 + 25}%;
    left: ${Math.random() * 50 + 25}%;
    width: 100px;
    height: 50px;
    pointer-events: none;
    z-index: 5;
  `;

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', `M 0,25 Q 25,${Math.random() * 20 + 5} 50,25 Q 75,${Math.random() * 20 + 35} 100,25`);
  path.setAttribute('stroke', '#00D9FF');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('fill', 'none');
  path.setAttribute('opacity', '0');
  path.setAttribute('filter', 'url(#glow)');

  arc.appendChild(path);
  heroSection.appendChild(arc);

  gsap.timeline()
    .to(path, { opacity: 1, duration: 0.1 })
    .to(path, { opacity: 0, duration: 0.2, delay: 0.1 })
    .to(path, { opacity: 0.8, duration: 0.05, delay: 0.05 })
    .to(path, { opacity: 0, duration: 0.3 })
    .call(() => {
      heroSection.removeChild(arc);
    });
}

function createElectricalSpark(element: HTMLElement) {
  const spark = document.createElement('div');
  spark.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    background: #00D9FF;
    border-radius: 50%;
    pointer-events: none;
    box-shadow: 0 0 10px #00D9FF;
  `;

  element.appendChild(spark);

  gsap.set(spark, { x: 0, y: 0, scale: 0 });
  
  gsap.timeline()
    .to(spark, { 
      scale: 1, 
      duration: 0.1 
    })
    .to(spark, { 
      x: "random(-20, 20)", 
      y: "random(-20, 20)", 
      scale: 0, 
      duration: 0.5,
      ease: "power2.out"
    })
    .call(() => {
      element.removeChild(spark);
    });
}

function animateFeatures() {
  const featuresHeader = document.getElementById('features-header');
  const featuresGrid = document.getElementById('features-grid');
  const featureShowcase = document.getElementById('feature-showcase');

  if (featuresHeader) {
    gsap.from(featuresHeader.children, {
      scrollTrigger: {
        trigger: featuresHeader,
        start: "top 80%",
        end: "bottom 20%"
      },
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out"
    });
  }

  if (featuresGrid) {
    const featureCards = featuresGrid.querySelectorAll('.feature-card');
    
    gsap.from(featureCards, {
      scrollTrigger: {
        trigger: featuresGrid,
        start: "top 80%",
        end: "bottom 20%"
      },
      opacity: 0,
      y: 60,
      duration: 0.8,
      stagger: 0.15,
      ease: "power2.out"
    });

    // Feature card hover effects
    featureCards.forEach(card => {
      const icon = card.querySelector('i');
      
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { y: -10, duration: 0.3, ease: "power2.out" });
        if (icon) {
          gsap.to(icon, { rotation: 360, duration: 0.6, ease: "power2.out" });
        }
      });
      
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { y: 0, duration: 0.3, ease: "power2.out" });
      });
    });
  }

  if (featureShowcase) {
    gsap.from(featureShowcase.children, {
      scrollTrigger: {
        trigger: featureShowcase,
        start: "top 80%"
      },
      opacity: 0,
      x: 50,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out"
    });
  }
}

function animateBanner() {
  const bannerHeader = document.getElementById('banner-header');
  const companyLogos = document.getElementById('company-logos');
  const testimonials = document.getElementById('testimonials');
  const ctaBanner = document.getElementById('cta-banner');

  if (bannerHeader) {
    gsap.from(bannerHeader.children, {
      scrollTrigger: {
        trigger: bannerHeader,
        start: "top 80%"
      },
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out"
    });
  }

  if (companyLogos) {
    const logos = companyLogos.querySelectorAll('.company-logo');
    
    gsap.from(logos, {
      scrollTrigger: {
        trigger: companyLogos,
        start: "top 80%"
      },
      opacity: 0,
      scale: 0.8,
      duration: 0.6,
      stagger: 0.1,
      ease: "back.out(1.7)"
    });

    // Logo hover effects
    logos.forEach(logo => {
      logo.addEventListener('mouseenter', () => {
        gsap.to(logo, { scale: 1.1, duration: 0.3, ease: "power2.out" });
      });
      
      logo.addEventListener('mouseleave', () => {
        gsap.to(logo, { scale: 1, duration: 0.3, ease: "power2.out" });
      });
    });
  }

  if (testimonials) {
    const testimonialCards = testimonials.querySelectorAll('.testimonial-card');
    
    gsap.from(testimonialCards, {
      scrollTrigger: {
        trigger: testimonials,
        start: "top 80%"
      },
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out"
    });
  }

  if (ctaBanner) {
    gsap.from(ctaBanner.children, {
      scrollTrigger: {
        trigger: ctaBanner,
        start: "top 80%"
      },
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.15,
      ease: "power2.out"
    });
  }
}

function animateAbout() {
  const aboutHeader = document.getElementById('about-header');
  const aboutContent = document.getElementById('about-content');
  const aboutVisual = document.getElementById('about-visual');
  const teamHeader = document.getElementById('team-header');
  const teamGrid = document.getElementById('team-grid');

  if (aboutHeader) {
    gsap.from(aboutHeader.children, {
      scrollTrigger: {
        trigger: aboutHeader,
        start: "top 80%"
      },
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out"
    });
  }

  if (aboutContent && aboutVisual) {
    gsap.from(aboutContent.children, {
      scrollTrigger: {
        trigger: aboutContent,
        start: "top 80%"
      },
      opacity: 0,
      x: -50,
      duration: 0.8,
      stagger: 0.15,
      ease: "power2.out"
    });

    gsap.from(aboutVisual, {
      scrollTrigger: {
        trigger: aboutVisual,
        start: "top 80%"
      },
      opacity: 0,
      x: 50,
      duration: 0.8,
      ease: "power2.out"
    });
  }

  if (teamHeader) {
    gsap.from(teamHeader.children, {
      scrollTrigger: {
        trigger: teamHeader,
        start: "top 80%"
      },
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out"
    });
  }

  if (teamGrid) {
    const teamMembers = teamGrid.querySelectorAll('.team-member');
    
    gsap.from(teamMembers, {
      scrollTrigger: {
        trigger: teamGrid,
        start: "top 80%"
      },
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out"
    });
  }
}



function animateFooter() {
  const footerSections = [
    'footer-company',
    'footer-navigation',
    'footer-support',
    'footer-contact'
  ];

  footerSections.forEach((sectionId, index) => {
    const section = document.getElementById(sectionId);
    if (section) {
      gsap.from(section.children, {
        scrollTrigger: {
          trigger: section,
          start: "top 90%"
        },
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        delay: index * 0.1,
        ease: "power2.out"
      });
    }
  });

  const newsletter = document.getElementById('newsletter');
  if (newsletter) {
    gsap.from(newsletter.children, {
      scrollTrigger: {
        trigger: newsletter,
        start: "top 80%"
      },
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out"
    });
  }
}

function animateCircuitNodes() {
  const nodes = document.querySelectorAll('.circuit-node');
  
  nodes.forEach((node, index) => {
    gsap.to(node, {
      y: "random(-20, 20)",
      x: "random(-10, 10)",
      rotation: "random(-180, 180)",
      scale: "random(0.8, 1.2)",
      duration: "random(3, 6)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: index * 0.5
    });

    gsap.to(node, {
      opacity: "random(0.3, 0.8)",
      duration: "random(2, 4)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: index * 0.3
    });
  });
}

function initScrollAnimations() {
  // Parallax effect for background elements
  gsap.to(".circuit-node", {
    yPercent: -50,
    ease: "none",
    scrollTrigger: {
      trigger: "body",
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });

  // Progress indicator
  gsap.to(".progress-bar", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: true
    }
  });

  // Reveal animations for all sections
  gsap.utils.toArray("section").forEach((section: any) => {
    gsap.from(section, {
      opacity: 0,
      y: 50,
      duration: 1,
      scrollTrigger: {
        trigger: section,
        start: "top 85%",
        end: "top 15%",
        toggleActions: "play none none reverse"
      }
    });
  });
}

// Utility functions
function createParticleEffect(element: HTMLElement) {
  const particles: HTMLElement[] = [];
  
  for (let i = 0; i < 10; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: absolute;
      width: 4px;
      height: 4px;
      background: #00D9FF;
      border-radius: 50%;
      pointer-events: none;
    `;
    
    element.appendChild(particle);
    particles.push(particle);
    
    gsap.set(particle, {
      x: 0,
      y: 0,
      opacity: 0
    });
  }
  
  return particles;
}

// Export functions for external use
(window as any).CircuitSimAnimations = {
  initializeAnimations,
  animateHero,
  animateFeatures,
  createParticleEffect
};
