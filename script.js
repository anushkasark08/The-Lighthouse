// =============================================
// DOM ELEMENTS
// =============================================
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const heroBg = document.getElementById('heroBg');
const heroScroll = document.getElementById('heroScroll');
const reservationBg = document.getElementById('reservationBg');
const reservationForm = document.getElementById('reservationForm');
const dateInput = document.getElementById('reservation-date');
const timeSelect = document.getElementById('time');
const guestsSelect = document.getElementById('guests');
const themeToggle = document.getElementById('themeToggle');
const backToTopBtn = document.getElementById('backToTop');
const filterBtns = document.querySelectorAll('.filter-btn');
const dietBtns = document.querySelectorAll('.diet-btn');
const menuSearch = document.getElementById('menu-search');
const currentYear = document.getElementById('current-year');
const downloadMenuPDFBtn = document.getElementById('downloadMenuPDF');
const newsletterForm = document.getElementById('newsletterForm');

// ── Device detection ──
const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

// ── EmailJS Configuration ──
// Replace these with your actual EmailJS credentials
const EMAILJS_CONFIG = {
  publicKey: 'YOUR_PUBLIC_KEY',
  serviceId: 'service_abc1234',
  guestTemplateId: 'template_guest01',
  adminTemplateId: 'template_admin02',
};

// Initialise EmailJS as soon as the key is set
if (EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY' && typeof emailjs !== 'undefined') {
  emailjs.init(EMAILJS_CONFIG.publicKey);
}

// ── Show correct scroll hint based on input type ──
const scrollHintMouse = document.querySelector('.scroll-hint-mouse');
const scrollHintTouch = document.querySelector('.scroll-hint-touch');

if (scrollHintMouse && scrollHintTouch) {
  scrollHintMouse.style.display = isTouchDevice ? 'none' : '';
  scrollHintTouch.style.display = isTouchDevice ? '' : 'none';
}

// =============================================
// LOCAL STORAGE HELPERS
// =============================================
function saveStoredList(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Could not save to storage:', e);
  }
}

function getStoredList(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    return [];
  }
}

// =============================================
// RESERVATION DATE / TIME LOGIC
// =============================================
function setReservationDateRange() {
  if (!dateInput) return;

  const tomorrow = new Date(Date.now() + 86400000);
  const maxDate = new Date(Date.now() + 90 * 86400000);

  dateInput.min = tomorrow.toISOString().split('T')[0];
  dateInput.max = maxDate.toISOString().split('T')[0];
}

// Disable past time options when today is selected
function updateAvailableTimes() {
  if (!dateInput || !timeSelect) return;

  const selectedDate = dateInput.value;
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentHours = now.getHours();
  const currentMins = now.getMinutes();

  Array.from(timeSelect.options).forEach((option) => {
    if (!option.value) return;

    const [optHours, optMins] = option.value.split(':').map(Number);
    let isPast = false;

    if (selectedDate === todayStr) {
      if (optHours < currentHours || (optHours === currentHours && optMins <= currentMins)) {
        isPast = true;
      }
    }

    option.disabled = isPast;
  });

  // If the currently selected time is now disabled, reset the selection
  const selectedOption = timeSelect.options[timeSelect.selectedIndex];
  if (selectedOption && selectedOption.disabled) {
    timeSelect.value = '';
  }
}

// =============================================
// THEME TOGGLE
// =============================================
function updateThemeImages(isLight) {
  const heroImg = document.querySelector('#heroBg img');
  const resImg = document.querySelector('#reservationBg img');
  const lightImg = './images/hero-restaurant-daytime.png';
  const darkImg = './images/hero-restaurant.jpg';

  if (heroImg) heroImg.src = isLight ? lightImg : darkImg;
  if (resImg) resImg.src = isLight ? lightImg : darkImg;
}

function setupThemeToggle() {
  if (!themeToggle) return;

  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem('theme');
  } catch (e) {
    /* ignore */
  }
  const isLightOnLoad = savedTheme === 'light';

  document.body.classList.toggle('light-theme', isLightOnLoad);
  themeToggle.textContent = isLightOnLoad ? '\u2600' : '\u263E';
  updateThemeImages(isLightOnLoad);

  themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');
    try {
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    } catch (e) {
      /* ignore */
    }
    themeToggle.textContent = isLight ? '\u2600' : '\u263E';
    updateThemeImages(isLight);
  });
}

// =============================================
// MOBILE MENU
// =============================================
function toggleMobileMenu() {
  if (!navToggle || !navMenu) return;
  navToggle.classList.toggle('active');
  navMenu.classList.toggle('active');
  document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
}

function closeMobileMenu() {
  if (!navToggle || !navMenu) return;
  navToggle.classList.remove('active');
  navMenu.classList.remove('active');
  document.body.style.overflow = '';
}

// =============================================
// SCROLL BEHAVIOUR (active nav link, navbar bg, parallax, back-to-top)
// =============================================
function updateActiveNavLink() {
  const scrollPosition = window.scrollY + 150;

  document.querySelectorAll('section[id]').forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;
    const sectionId = section.id;

    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.dataset.section === sectionId);
      });
    }
  });
}

function handleScroll() {
  const currentScroll = window.scrollY;

  if (nav) {
    nav.classList.toggle('scrolled', currentScroll > 50);
  }

  // Parallax is skipped on touch devices for performance
  if (!isTouchDevice) {
    if (heroBg) {
      heroBg.style.transform = `translateY(${currentScroll * 0.5}px)`;
    }

    const reservationSection = document.getElementById('reservation');
    if (reservationBg && reservationSection && currentScroll > window.innerHeight) {
      const offset = (currentScroll - reservationSection.offsetTop) * 0.3;
      reservationBg.style.transform = `translateY(${offset}px)`;
    }
  }

  if (backToTopBtn) {
    backToTopBtn.classList.toggle('visible', currentScroll > 300);
  }

  updateActiveNavLink();
}

// =============================================
// SMOOTH SCROLL
// =============================================
function smoothScroll(event) {
  const targetId = this.getAttribute('href');
  if (!targetId || targetId === '#') return;

  const target = document.querySelector(targetId);
  if (!target) return;

  event.preventDefault();
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  target.scrollIntoView({
    behavior: prefersReduced ? 'auto' : 'smooth',
    block: 'start',
  });

  closeMobileMenu();
}

// =============================================
// AUTO-SCROLL ON HERO CLICK
// =============================================
let autoScrollInterval = null;

function setupAutoScroll() {
  if (!heroScroll) return;

  function stopAutoScroll() {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = null;
    }
  }

  function startAutoScroll() {
    autoScrollInterval = setInterval(() => {
      window.scrollBy({ top: 2, behavior: 'auto' });
      if (window.scrollY + window.innerHeight >= document.body.scrollHeight) {
        stopAutoScroll();
      }
    }, 15);
  }

  heroScroll.addEventListener('click', () => {
    autoScrollInterval ? stopAutoScroll() : startAutoScroll();
  });

  ['mousemove', 'touchstart', 'keydown', 'wheel', 'pointerdown'].forEach((eventName) => {
    window.addEventListener(eventName, stopAutoScroll, { passive: true });
  });
}

// =============================================
// INTERSECTION OBSERVER (fade-in on scroll)
// =============================================
function setupIntersectionObserver() {
  const animatedElements = document.querySelectorAll(
    '.about-content, .menu-panel, .reservation-form, .location-info'
  );
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced || !('IntersectionObserver' in window)) {
    animatedElements.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -50px 0px' }
  );

  animatedElements.forEach((el) => observer.observe(el));
}

// =============================================
// MENU SEARCH & FILTER (category + diet + text search)
// =============================================
let currentCategory = 'all';
let currentDiet = 'all';

function filterMenuItems() {
  const menuItems = document.querySelectorAll('.menu-content .menu-item');
  const searchText = menuSearch ? menuSearch.value.trim().toLowerCase() : '';
  let visibleCount = 0;

  menuItems.forEach((item) => {
    const heading = item.querySelector('h3');
    const itemName = heading ? heading.textContent.toLowerCase() : '';
    const category = item.dataset.category || '';
    const diet = item.dataset.diet || '';

    const matchesSearch = itemName.includes(searchText);
    const matchesCategory = currentCategory === 'all' || category === currentCategory;
    const matchesDiet = currentDiet === 'all' || diet === currentDiet;

    if (matchesSearch && matchesCategory && matchesDiet) {
      item.classList.remove('hidden-item');
      visibleCount++;
    } else {
      item.classList.add('hidden-item');
    }
  });

  const noResultsMsg = document.getElementById('noResultsMsg');
  if (noResultsMsg) {
    noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  const categoryCountEl = document.getElementById('menu-category-count');
  if (categoryCountEl) {
    categoryCountEl.textContent = `Showing ${visibleCount} dish${visibleCount === 1 ? '' : 'es'}`;
  }
}

function setupMenuFilters() {
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((item) => item.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.filter || 'all';
      filterMenuItems();
    });
  });

  dietBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      dietBtns.forEach((item) => item.classList.remove('active'));
      btn.classList.add('active');
      currentDiet = btn.dataset.diet || 'all';
      filterMenuItems();
    });
  });

  if (menuSearch) {
    menuSearch.addEventListener('input', filterMenuItems);
  }
}

// =============================================
// RESERVATION FORM VALIDATION HELPERS
// =============================================
function addFieldError(input, message) {
  const error = document.createElement('small');
  error.className = 'error-message';
  error.style.color = '#c94a4a';
  error.style.display = 'block';
  error.style.marginTop = '4px';
  error.textContent = message;
  input.parentElement.appendChild(error);
  input.style.borderColor = '#c94a4a';
}

function formatBookingDate(dateStr) {
  if (!dateStr) return dateStr;
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatBookingTime(timeStr) {
  if (!timeStr) return timeStr;
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function showReservationToast(type, message) {
  const existing = document.querySelector('.reservation-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `reservation-toast reservation-toast--${type}`;
  toast.innerHTML = `
    <div class="reservation-toast__icon">${type === 'success' ? '✓' : '✕'}</div>
    <div class="reservation-toast__body">
      <p class="reservation-toast__title">${type === 'success' ? 'Reservation Requested!' : 'Something went wrong'}</p>
      <p class="reservation-toast__msg"></p>
    </div>
    <button class="reservation-toast__close" aria-label="Close">✕</button>
  `;
  toast.querySelector('.reservation-toast__msg').textContent = message;

  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('reservation-toast--visible'));

  toast.querySelector('.reservation-toast__close').addEventListener('click', () => {
    toast.classList.remove('reservation-toast--visible');
    setTimeout(() => toast.remove(), 400);
  });

  setTimeout(() => {
    toast.classList.remove('reservation-toast--visible');
    setTimeout(() => toast.remove(), 400);
  }, 6000);
}

// =============================================
// RESERVATION FORM SUBMISSION (with EmailJS)
// =============================================
async function handleFormSubmit(e) {
  e.preventDefault();

  reservationForm.querySelectorAll('.error-message').forEach((err) => err.remove());
  reservationForm.querySelectorAll('input, select, textarea').forEach((input) => {
    input.style.borderColor = '';
  });

  let isValid = true;

  reservationForm.querySelectorAll('input, select, textarea').forEach((input) => {
    if (input.required && !input.value.trim()) {
      addFieldError(input, 'This field is required.');
      isValid = false;
    }
  });

  const emailInput = document.getElementById('email');
  if (emailInput && emailInput.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailInput.value.trim())) {
    addFieldError(emailInput, 'Please enter a valid email address.');
    isValid = false;
  }

  if (!isValid) return;

  const submitBtn = reservationForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  const formData = {
    guest_name: document.getElementById('name').value.trim(),
    guest_email: document.getElementById('email').value.trim(),
    guest_phone: document.getElementById('phone').value.trim(),
    guest_count: document.getElementById('guests').value,
    booking_date: formatBookingDate(document.getElementById('reservation-date').value),
    booking_time: formatBookingTime(document.getElementById('time').value),
    special_requests: document.getElementById('requests').value.trim() || 'None',
    restaurant_name: 'The Lighthouse',
    restaurant_phone: '(555) 123-4567',
    restaurant_email: 'reservations@thelighthouse.com',
  };

  submitBtn.textContent = 'Sending…';
  submitBtn.disabled = true;

  // EmailJS not configured -> graceful demo-mode fallback
  if (EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
    console.warn('[EmailJS] Not configured — running in demo mode. Fill in EMAILJS_CONFIG in script.js.');
    await new Promise((r) => setTimeout(r, 1200));
    showReservationToast(
      'success',
      `Thank you, ${formData.guest_name}! We'll confirm your table for ${formData.guest_count} guest(s) on ${formData.booking_date} at ${formData.booking_time} within 24 hours.`
    );
    reservationForm.reset();
    setReservationDateRange();
    updateAvailableTimes();
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    return;
  }

  try {
    await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.guestTemplateId, formData);
    await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.adminTemplateId, formData);

    showReservationToast(
      'success',
      `Thank you, ${formData.guest_name}! A confirmation has been sent to ${formData.guest_email}. We look forward to welcoming you on ${formData.booking_date} at ${formData.booking_time}.`
    );

    reservationForm.reset();
    setReservationDateRange();
    updateAvailableTimes();
  } catch (err) {
    console.error('[EmailJS] Error:', err);
    showReservationToast(
      'error',
      "We couldn't send your confirmation email. Please call us at (555) 123-4567 or try again."
    );
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// =============================================
// REVIEWS SECTION
// =============================================
function setupReviews() {
  const storageKey = 'lighthouse_reviews';
  const reviewForm = document.getElementById('review-form');
  const reviewMsg = document.getElementById('review-msg');
  const starBtns = document.querySelectorAll('#star-input .star-btn');
  const ratingInput = document.getElementById('review-rating');
  let selectedRating = 0;

  const pinnedReview = {
    name: 'Rasshi Srivastav',
    rating: 5,
    text: 'Absolutely loved the food and ambience! Every dish was crafted with such care and the atmosphere was warm and elegant. A truly memorable dining experience - will definitely be coming back!',
    date: '14 May 2026',
  };

  function isValidName(name) {
    return /^[\p{L}\p{M}\s'-]{3,30}$/u.test(name.trim());
  }

  function isMeaningfulReview(text) {
    const value = text.trim();
    const words = value.split(/\s+/);
    const randomPattern = /^(.)\1+$|^[a-zA-Z]{1,6}$/;
    if (randomPattern.test(value)) return false;
    return words.length >= 3;
  }

  function renderReviews() {
    const grid = document.getElementById('reviews-grid');
    if (!grid) return;

    grid.innerHTML = '';
    [pinnedReview, ...getStoredList(storageKey)].forEach((review) => {
      const card = document.createElement('div');
      card.className = 'review-card';
      const rating = Math.max(0, Math.min(5, Math.round(Number(review.rating) || 0)));
      const stars = '\u2605'.repeat(rating) + '\u2606'.repeat(5 - rating);

      card.innerHTML = `
        <div class="review-stars">${stars}</div>
        <p class="review-text"></p>
        <div class="review-author">
          <div class="review-avatar"></div>
          <div>
            <span class="review-name"></span>
            <span class="review-date"></span>
          </div>
        </div>
      `;

      card.querySelector('.review-text').textContent = review.text;
      card.querySelector('.review-avatar').textContent = review.name.slice(0, 2).toUpperCase();
      card.querySelector('.review-name').textContent = review.name;
      card.querySelector('.review-date').textContent = review.date;
      grid.appendChild(card);
    });
  }

  starBtns.forEach((star) => {
    star.addEventListener('click', () => {
      selectedRating = Number(star.dataset.value);
      if (ratingInput) ratingInput.value = selectedRating;
      starBtns.forEach((s) => {
        s.classList.toggle('active', Number(s.dataset.value) <= selectedRating);
      });
    });
  });

  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('review-name');
      const textInput = document.getElementById('review-text');
      const name = nameInput.value.trim();
      const text = textInput.value.trim();

      if (!isValidName(name)) {
        reviewMsg.style.display = 'block';
        reviewMsg.textContent = 'Please enter a valid name (3-30 letters).';
        reviewMsg.style.color = '#c94a4a';
        return;
      }

      if (selectedRating < 1) {
        reviewMsg.style.display = 'block';
        reviewMsg.textContent = 'Please select a star rating.';
        reviewMsg.style.color = '#c94a4a';
        return;
      }

      if (text.length < 20 || !isMeaningfulReview(text)) {
        reviewMsg.style.display = 'block';
        reviewMsg.textContent = 'Please enter a meaningful review of at least 20 characters.';
        reviewMsg.style.color = '#c94a4a';
        return;
      }

      const reviews = getStoredList(storageKey);
      reviews.unshift({
        id: Date.now(),
        name,
        rating: selectedRating,
        text,
        date: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      });

      saveStoredList(storageKey, reviews);
      renderReviews();
      reviewForm.reset();
      selectedRating = 0;
      if (ratingInput) ratingInput.value = 0;
      starBtns.forEach((star) => star.classList.remove('active'));

      reviewMsg.style.display = 'block';
      reviewMsg.textContent = 'Review submitted successfully!';
      reviewMsg.style.color = '#4a9c6a';
      setTimeout(() => {
        reviewMsg.style.display = 'none';
      }, 3000);
    });
  }

  renderReviews();
}

// =============================================
// NEWSLETTER FORM
// =============================================
function setupNewsletterForm() {
  if (!newsletterForm) return;

  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('newsletter-email');
    const msg = document.getElementById('newsletter-msg');
    const email = emailInput.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      if (msg) {
        msg.style.display = 'block';
        msg.textContent = 'Please enter a valid email address.';
        msg.style.color = '#c94a4a';
      }
      return;
    }

    if (msg) {
      msg.style.display = 'block';
      msg.textContent = 'Thanks for subscribing!';
      msg.style.color = '#4a9c6a';
    }
    newsletterForm.reset();
  });
}

// =============================================
// PDF MENU DOWNLOAD
// =============================================
function loadHtml2Pdf() {
  return new Promise((resolve, reject) => {
    if (typeof html2pdf !== 'undefined') {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function showLoadingOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'pdf-loading';
  overlay.id = 'pdfLoading';
  overlay.innerHTML = `
    <div class="spinner"></div>
    <p>Generating your menu PDF...</p>
    <p style="font-size: 0.9rem; color: rgba(255,255,255,0.7); margin-top: 10px;">Please wait</p>
  `;
  document.body.appendChild(overlay);
}

function hideLoadingOverlay() {
  const overlay = document.getElementById('pdfLoading');
  if (overlay) overlay.remove();
}

function setupPDFDownload() {
  if (!downloadMenuPDFBtn) return;

  downloadMenuPDFBtn.addEventListener('click', async () => {
    const menuContent = document.querySelector('.menu-content');
    if (!menuContent) return;

    showLoadingOverlay();
    try {
      await loadHtml2Pdf();
      await html2pdf()
        .set({
          margin: 10,
          filename: 'the-lighthouse-menu.pdf',
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(menuContent)
        .save();
    } catch (err) {
      console.error('[PDF] Could not generate menu PDF:', err);
      alert('Sorry, the menu PDF could not be generated right now. Please try again later.');
    } finally {
      hideLoadingOverlay();
    }
  });
}

// =============================================
// FOOTER YEAR
// =============================================
function setupFooterYear() {
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }
}

// =============================================
// INITIALISE
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  setReservationDateRange();
  updateAvailableTimes();
  setupThemeToggle();
  setupIntersectionObserver();
  setupAutoScroll();
  setupReviews();
  setupNewsletterForm();
  setupPDFDownload();
  setupFooterYear();
  setupMenuFilters();
  filterMenuItems();
  handleScroll();

  dateInput?.addEventListener('change', updateAvailableTimes);
  navToggle?.addEventListener('click', toggleMobileMenu);
  reservationForm?.addEventListener('submit', handleFormSubmit);
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMobileMenu();
  });

  navLinks.forEach((link) => link.addEventListener('click', smoothScroll));
  document.querySelectorAll('.nav-cta, .nav-cta-mobile, .hero-buttons a').forEach((link) => {
    link.addEventListener('click', smoothScroll);
  });

  backToTopBtn?.addEventListener('click', () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  });
});