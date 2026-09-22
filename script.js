/**
 * PHONIXE MEDIA - INTERACTIVE LANDING PAGE ENGINE
 * Handles: Scroll Animations, Counter Animations, Lead Capture Modal,
 * FAQ Accordion, Mobile Menu, and Direct WhatsApp Integration.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Update footer year dynamically
  const currentYearEl = document.getElementById('currentYear');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  /* --------------------------------------------------------------------------
     1. STICKY NAVBAR SCROLL LISTENER
  -------------------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const handleScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* --------------------------------------------------------------------------
     2. MOBILE MENU DRAWER TOGGLE
  -------------------------------------------------------------------------- */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  const toggleMobileMenu = () => {
    const isOpen = mobileNavDrawer.classList.toggle('open');
    mobileMenuBtn.classList.toggle('active');
    mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  if (mobileMenuBtn && mobileNavDrawer) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (mobileNavDrawer.classList.contains('open')) {
          toggleMobileMenu();
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     3. SCROLL-TRIGGERED REVEAL ANIMATIONS (INTERSECTION OBSERVER)
  -------------------------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once animated, unobserve for better performance
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback for older browsers
    revealElements.forEach(el => el.classList.add('active'));
  }

  /* --------------------------------------------------------------------------
     4. ANIMATED STAT COUNTERS
  -------------------------------------------------------------------------- */
  const counterElements = document.querySelectorAll('.counter');
  let countersStarted = false;

  const animateCounters = () => {
    counterElements.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const duration = 1600; // ms
      const startTime = performance.now();

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out expo curve for premium smooth finish
        const easeOutProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = Math.floor(easeOutProgress * target);

        counter.textContent = currentVal;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      };

      requestAnimationFrame(updateCounter);
    });
  };

  const statsSection = document.getElementById('social-proof');
  if (statsSection && 'IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersStarted) {
          countersStarted = true;
          animateCounters();
        }
      });
    }, { threshold: 0.25 });

    statsObserver.observe(statsSection);
  } else {
    animateCounters();
  }

  /* --------------------------------------------------------------------------
     5. FAQ ACCORDION INTERACTIVITY
  -------------------------------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const button = item.querySelector('.faq-question');
    if (!button) return;

    button.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other open items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherBtn = otherItem.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current item
      if (isActive) {
        item.classList.remove('active');
        button.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* --------------------------------------------------------------------------
     6. STRATEGY CALL BOOKING MODAL & LEAD CAPTURE
  -------------------------------------------------------------------------- */
  const modal = document.getElementById('bookingModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTriggers = document.querySelectorAll('.open-modal-trigger');
  const leadForm = document.getElementById('leadCaptureForm');
  const modalSuccessState = document.getElementById('modalSuccessState');
  const successWhatsAppLink = document.getElementById('successWhatsAppLink');

  // Open modal
  const openModal = (e) => {
    if (e) e.preventDefault();
    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Focus first input field
      const firstInput = modal.querySelector('input');
      if (firstInput) setTimeout(() => firstInput.focus(), 150);
    }
  };

  // Close modal
  const closeModal = () => {
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      
      // Reset form view after animation
      setTimeout(() => {
        if (leadForm) {
          leadForm.style.display = 'flex';
          leadForm.reset();
        }
        if (modalSuccessState) modalSuccessState.style.display = 'none';
      }, 350);
    }
  };

  // Attach triggers
  modalTriggers.forEach(btn => btn.addEventListener('click', openModal));

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

  // Close when clicking backdrop
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Handle Form Submission -> WhatsApp Lead Routing
  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('leadName')?.value.trim() || 'Prospect';
      const whatsapp = document.getElementById('leadWhatsapp')?.value.trim() || 'N/A';
      const instagram = document.getElementById('leadInstagram')?.value.trim() || 'N/A';
      const niche = document.getElementById('leadNiche')?.value || 'Coaching / Personal Brand';
      const goal = document.getElementById('leadGoal')?.value || 'Client Growth';
      const message = document.getElementById('leadMessage')?.value.trim() || 'None provided';

      // Build structured WhatsApp inquiry message
      const textMessage = 
`*New Strategy Call Request - Phonixe Media*
---------------------------------------
👤 *Name:* ${name}
📱 *WhatsApp:* ${whatsapp}
📸 *Instagram:* ${instagram}
🔮 *Domain/Niche:* ${niche}
🎯 *Primary Goal:* ${goal}
📝 *Notes/Challenges:* ${message}
---------------------------------------
_Looking forward to discussing our 360° growth strategy!_`;

      const encodedMessage = encodeURIComponent(textMessage);
      const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

      // Show success state inside modal
      leadForm.style.display = 'none';
      if (modalSuccessState) {
        modalSuccessState.style.display = 'block';
      }
      if (successWhatsAppLink) {
        successWhatsAppLink.href = whatsappUrl;
      }

      // Automatically launch WhatsApp in new tab after 800ms
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 800);
    });
  }

  /* --------------------------------------------------------------------------
     7. SMOOTH SCROLL FOR IN-PAGE ANCHOR LINKS
  -------------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#booking-modal' || targetId.startsWith('#terms') || targetId.startsWith('#privacy')) {
        return;
      }
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 90;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

});
