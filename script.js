// =============================================
// DOM ELEMENTS
// =============================================
const nav = document.getElementById("nav");
const cuisineDropdown = document.getElementById("cuisine-filter");
const menuSearch = document.getElementById("menu-search");
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-link");
const heroBg = document.getElementById("heroBg");
const reservationBg = document.getElementById("reservationBg");
const reservationForm = document.getElementById("reservationForm");
const dateInput = document.getElementById("reservation-date");
const timeSelect = document.getElementById("time");
const themeToggle = document.getElementById("themeToggle");
const filterBtns = document.querySelectorAll(".filter-btn");
const menuContent = document.querySelector(".menu-content");
const menuTabs = document.querySelectorAll(".menu-tab");
const menuPanels = document.querySelectorAll(".menu-panel");

// ── Device detection (used by FIX #9 and FIX #14) ───
const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

// ── FIX #9 — show correct scroll hint based on input type ────────
const scrollHintMouse = document.querySelector('.scroll-hint-mouse');
const scrollHintTouch = document.querySelector('.scroll-hint-touch');

if (scrollHintMouse && scrollHintTouch) {
  scrollHintMouse.style.display = isTouchDevice ? 'none' : '';
  scrollHintTouch.style.display = isTouchDevice ? '' : 'none';
}

// ── FIX #13 — Date validation: min = tomorrow, max = 90 days out ─────
if (dateInput) {
  const tomorrow = new Date(Date.now() + 86400000);
  const maxDate = new Date(Date.now() + 90 * 86400000);

  dateInput.setAttribute('min', tomorrow.toISOString().split('T')[0]);
  dateInput.setAttribute('max', maxDate.toISOString().split('T')[0]);

  dateInput.addEventListener('change', updateAvailableTimes);
}

// ── FIX #11 — Disable past time slots when today is selected ─────
function updateAvailableTimes() {
  if (!dateInput || !timeSelect) return;

  const selectedDate = dateInput.value;
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentHours = now.getHours();
  const currentMins = now.getMinutes();

  timeSelect.querySelectorAll('option').forEach((option) => {
    if (!option.value) return;

    const [optHours, optMins] = option.value.split(':').map(Number);

    if (selectedDate === todayStr) {
      const isPast =
        optHours < currentHours ||
        (optHours === currentHours && optMins <= currentMins + 30);

      option.disabled = isPast;
      if (isPast && option.selected) {
        timeSelect.value = '';
      }
    } else {
      option.disabled = false;
    }
  });
}

// ── Navigation scroll effect ──
function handleScroll() {
  const currentScroll = window.scrollY;

  // Sticky nav background
  nav.classList.toggle('scrolled', currentScroll > 50);

  // Parallax skipped on touch devices
  if (!isTouchDevice) {
    if (heroBg) {
      heroBg.style.transform = `translateY(${currentScroll * 0.5}px)`;
    }
    if (reservationBg && currentScroll > window.innerHeight) {
      const sectionTop = document.getElementById('reservation').offsetTop;
      const offset = (currentScroll - sectionTop) * 0.3;
      reservationBg.style.transform = `translateY(${offset}px)`;
    }
  }

  updateActiveNavLink();
}

// ── Active nav link on scroll ───
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollPosition = window.scrollY + 150;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
          link.classList.add('active');
        }
      });
    }
  });
}

// ── Mobile menu ───
function toggleMobileMenu() {
  navToggle.classList.toggle('active');
  navMenu.classList.toggle('active');
  document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
}

function closeMobileMenu() {
  navToggle.classList.remove('active');
  navMenu.classList.remove('active');
  document.body.style.overflow = '';
}

// Menu tabs functionality
function switchMenuTab(e) {
  const targetTab = e.target.dataset.tab;

  // Update tab buttons
  menuTabs.forEach((tab) => {
    tab.classList.remove("active");
  });
  e.target.classList.add("active");

  // Update panels
  menuPanels.forEach((panel) => {
    panel.classList.remove("active");
    if (panel.id === targetTab) {
      panel.classList.add("active");
    }
  });
}

// Theme Toggle
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
  document.body.classList.add("light-theme");
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");

  const isLight = document.body.classList.contains("light-theme");

  if (isLight) {
    localStorage.setItem("theme", "light");
  } else {
    localStorage.setItem("theme", "dark");
  }
});

// ── Menu Search and Filter ─────────────────────────

// FIX #1 — Use the correct parameter names (timeFilter, cuisineFilter) instead of undefined 'filter'
function filterMenuItems(timeFilter, cuisineFilter, searchText) {
  const menuItems = document.querySelectorAll(".menu-item");
  let visibleCount = 0;

  menuItems.forEach((item) => {
    const itemName = item.querySelector('h3')?.textContent?.toLowerCase() || '';
    const category = item.dataset.category;
    const matchesSearch = !searchText || itemName.includes(searchText.toLowerCase());
    const matchesTime = timeFilter === 'all' || category === timeFilter;
    const matchesCuisine = !cuisineFilter || cuisineFilter === 'all' || item.dataset.cuisine === cuisineFilter;

    if (matchesSearch && matchesTime && matchesCuisine) {
      item.classList.remove('hidden-item');
      visibleCount++;
    } else {
      item.classList.add('hidden-item');
    }
  });

  // Handle "No Results" display
  let noResults = document.querySelector(".no-results");
  if (visibleCount === 0) {
    if (!noResults) {
      noResults = document.createElement('p');
      noResults.className = 'no-results';
      noResults.textContent = i18next.t('menu.no_results');
      document.querySelector('.menu-content')?.appendChild(noResults);
    }
  } else if (noResults) {
    noResults.remove();
  }
}

function triggerFilter() {
  const activeBtn = document.querySelector(".filter-btn.active");
  const timeFilter = activeBtn ? activeBtn.dataset.filter : "all";
  const cuisineFilter = cuisineDropdown ? cuisineDropdown.value : "all";
  const searchText = menuSearch ? menuSearch.value : "";
  
  filterMenuItems(timeFilter, cuisineFilter, searchText);
}

if (cuisineDropdown) {
  cuisineDropdown.addEventListener("change", triggerFilter);
}

if (menuSearch) {
  menuSearch.addEventListener("input", triggerFilter);
}

// Filter buttons
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    triggerFilter();
  });
});

// FIX #2 — Removed duplicate menuSearch 'input' listener (was calling filterMenuItems with wrong/missing args)

// Smooth scroll for navigation links
function smoothScroll(e) {
  e.preventDefault();
  const targetId = this.getAttribute('href');
  const targetSection = document.querySelector(targetId);

  if (targetSection) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: targetSection.offsetTop - 80,
      behavior: prefersReduced ? 'auto' : 'smooth',
    });
  }
  closeMobileMenu();
}

// ── Reservation form submission ──
function handleFormSubmit(e) {
  e.preventDefault();

  const inputs = reservationForm.querySelectorAll('input, select, textarea');
  let isValid = true;

  inputs.forEach((input) => {
    if (input.required && !input.value) {
      input.style.borderColor = '#c94a4a';
      isValid = false;
    } else {
      input.style.borderColor = '';
    }
  });

  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');

  // Remove old error messages
  document.querySelectorAll('.error-message').forEach(el => el.remove());

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailInput && !emailRegex.test(emailInput.value.trim())) {
    emailInput.style.borderColor = '#c94a4a';
    const emailError = document.createElement('small');
    emailError.className = 'error-message';
    emailError.style.color = '#c94a4a';
    emailError.textContent = i18next.t('reservation.email_error');
    emailInput.parentElement.appendChild(emailError);
    isValid = false;
  }

  // Phone validation
  if (phoneInput) {
    const phoneValue = phoneInput.value.replace(/\D/g, '');
    if (phoneValue.length !== 10) {
      phoneInput.style.borderColor = '#c94a4a';
      const phoneError = document.createElement('small');
      phoneError.className = 'error-message';
      phoneError.style.color = '#c94a4a';
      phoneError.textContent = i18next.t('reservation.phone_error');
      phoneInput.parentElement.appendChild(phoneError);
      isValid = false;
    }
  }

  if (isValid) {
    const submitBtn = reservationForm.querySelector('button[type="submit"]');
    submitBtn.textContent = i18next.t('reservation.submit_requested');
    submitBtn.style.backgroundColor = '#4a9c6a';
    submitBtn.disabled = true;

    setTimeout(() => {
      reservationForm.reset();
      updateAvailableTimes();
      submitBtn.textContent = i18next.t('reservation.submit');
      submitBtn.style.backgroundColor = '';
      submitBtn.disabled = false;
      updateAvailableTimes();
    }, 3000);
  }
}

// ── Intersection Observer with prefers-reduced-motion ──────
function setupIntersectionObserver() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animatedElements = document.querySelectorAll(
    '.about-content, .menu-panel, .reservation-form, .location-info'
  );

  if (prefersReduced) {
    animatedElements.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { root: null, rootMargin: '0px', threshold: 0.1 }
  );

  animatedElements.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// Inject .visible class styles
const style = document.createElement('style');
style.textContent = `.visible { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(style);

// ── Auto-scroll on hero "Scroll To Discover" click ───
const heroScroll = document.querySelector('.hero-scroll');
let autoScrollInterval = null;

function startAutoScroll() {
  autoScrollInterval = setInterval(() => {
    window.scrollBy({ top: 2, behavior: 'instant' });
    if (window.scrollY + window.innerHeight >= document.body.scrollHeight) {
      stopAutoScroll();
    }
  }, 15);
}

function stopAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
}

if (heroScroll) {
  heroScroll.style.cursor = 'pointer';
  heroScroll.addEventListener('click', () => {
    autoScrollInterval ? stopAutoScroll() : startAutoScroll();
  });
}

['mousemove', 'touchstart', 'keydown', 'wheel', 'pointerdown'].forEach((event) => {
  window.addEventListener(event, stopAutoScroll);
});

// ── Back To Top ──
const backToTopBtn = document.getElementById('backToTop');

if (backToTopBtn) {
  window.addEventListener('scroll', () => {
    const past = window.scrollY > 300;
    backToTopBtn.style.display = past ? 'block' : 'none';
    backToTopBtn.classList.toggle('visible', past);
  });

  backToTopBtn.addEventListener('click', () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  });
}

// ── Event Listeners ──
window.addEventListener('scroll', handleScroll);

navToggle.addEventListener('click', toggleMobileMenu);

navLinks.forEach((link) => link.addEventListener('click', smoothScroll));

document.querySelectorAll('.nav-cta, .nav-cta-mobile, .hero-buttons a').forEach((link) => {
  link.addEventListener('click', smoothScroll);
});

if (reservationForm) {
  reservationForm.addEventListener('submit', handleFormSubmit);
}

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) closeMobileMenu();
});

// ── Reviews (localStorage) ──
const STORAGE_KEY = 'lighthouse_reviews';

const pinnedReview = {
  name: 'Rasshi Srivastav',
  rating: 5,
  text: 'reviews.pinned_review_text',
  date: 'reviews.pinned_review_date',
};

function getReviews() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
}

function saveReviews(reviews) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}
function updateAverageRating() {
  const averageRating = document.getElementById("average-rating");
  if (!averageRating) return;

  const userReviews = getReviews();
  const allReviews = [pinnedReview, ...userReviews];

  const totalRating = allReviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );

  const average = (totalRating / allReviews.length).toFixed(1);

  averageRating.textContent = `⭐ ${average}/5 from ${allReviews.length} review${
    allReviews.length > 1 ? "s" : ""
  }`;
}
function renderReviews() {
  const grid = document.getElementById('reviews-grid');
  if (!grid) return;

  const userReviews = getReviews();
  const activePinnedReview = {
    ...pinnedReview,
    text: typeof i18next !== 'undefined' && i18next.t ? i18next.t(pinnedReview.text) : pinnedReview.text,
    date: typeof i18next !== 'undefined' && i18next.t ? i18next.t(pinnedReview.date) : pinnedReview.date,
  };
  const allReviews = [activePinnedReview, ...userReviews];

  grid.innerHTML = allReviews
    .map(
      (r) => `
      <div class="review-card">
        <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
        <p class="review-text">${r.text}</p>
        <div class="review-author">
          <div class="review-avatar">${r.name.slice(0, 2).toUpperCase()}</div>
          <div>
            <span class="review-name">${r.name}</span>
            <span class="review-date">${r.date}</span>
          </div>
        </div>
      </div>`
    )
    .join('');
    updateAverageRating();
}

// Star rating widget
let selectedRating = 0;
const starBtns = document.querySelectorAll('#star-input .star-btn');

starBtns.forEach((btn) => {
  btn.addEventListener('mouseenter', () => {
    const val = +btn.dataset.value;
    starBtns.forEach((s) => s.classList.toggle('active', +s.dataset.value <= val));
  });
  btn.addEventListener('mouseleave', () => {
    starBtns.forEach((s) => s.classList.toggle('active', +s.dataset.value <= selectedRating));
  });
  btn.addEventListener('click', () => {
    selectedRating = +btn.dataset.value;
    document.getElementById('review-rating').value = selectedRating;
    starBtns.forEach((s) => s.classList.toggle('active', +s.dataset.value <= selectedRating));
  });
});

// Review validation helpers
function isMeaningfulReview(text) {
  const words = text.trim().split(/\s+/);
  const randomPattern = /^(.)\1+$|^[a-zA-Z]{1,6}$/;
  if (randomPattern.test(text.trim())) return false;
  return words.length >= 3;
}

function isValidName(name) {
  return /^[A-Za-z\s'\-]{3,30}$/.test(name.trim());
}

const reviewForm = document.getElementById('review-form');
const reviewMsg = document.getElementById('review-msg');

if (reviewForm) {
  reviewForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('review-name').value.trim();
    const reviewText = document.getElementById('review-text').value.trim();

    reviewMsg.style.display = 'block';

    if (!selectedRating) {
      reviewMsg.textContent = i18next.t('reviews.rating_error');
      reviewMsg.style.color = '#c94a4a';
      return;
    }
    if (!isValidName(name)) {
      reviewMsg.textContent = i18next.t('reviews.name_error');
      reviewMsg.style.color = '#c94a4a';
      return;
    }
    if (reviewText.length < 20) {
      reviewMsg.textContent = i18next.t('reviews.text_length_error');
      reviewMsg.style.color = '#c94a4a';
      return;
    }
    if (!isMeaningfulReview(reviewText)) {
      reviewMsg.textContent = i18next.t('reviews.meaningful_error');
      reviewMsg.style.color = '#c94a4a';
      return;
    }

    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newReview = {
      id: Date.now(),
      name,
      rating: selectedRating,
      text: reviewText,
      date: dateStr,
    };
    const reviews = getReviews();
    reviews.unshift(newReview);
    saveReviews(reviews);
    renderReviews();

    reviewForm.reset();
    selectedRating = 0;
    document.getElementById('review-rating').value = 0;
    starBtns.forEach((s) => s.classList.remove('active'));

    reviewMsg.textContent = i18next.t('reviews.success_msg');
    reviewMsg.style.color = '#4a9c6a';
    setTimeout(() => {
      reviewMsg.style.display = 'none';
    }, 3000);
  });
}

// ── Veg / Non-Veg Filter ──────────────────────────────
// 1. Your filtering function, contained properly
(function () {
  const dietFilterBtns = document.querySelectorAll('.diet-btn');
  if (!dietFilterBtns.length) return;

  function applyDietFilter(diet) {
    const activePanels = document.querySelectorAll('.menu-panel.active');

    activePanels.forEach((panel) => {
      const items = panel.querySelectorAll('.menu-item');
      let visibleCount = 0;

      items.forEach((item) => {
        const itemDiet = item.dataset.diet || 'all';
        const show = diet === 'all' || itemDiet === diet;
        item.classList.toggle('diet-hidden', !show);
        if (show) visibleCount++;
      });

      let noResults = panel.querySelector('.diet-no-results');
      if (!noResults) {
        noResults = document.createElement('p');
        noResults.className = 'diet-no-results';
        noResults.textContent = i18next.t('menu.diet_no_results');
        const menuItems = panel.querySelector('.menu-items');
        if (menuItems) {
          menuItems.appendChild(noResults);
        }
      }
      noResults.classList.toggle('visible', visibleCount === 0);
    });
  }

  dietFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      dietFilterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      applyDietFilter(btn.dataset.diet);
    });
  });

  document.querySelectorAll('.menu-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const activeDiet = document.querySelector('.diet-btn.active')?.dataset.diet || 'all';
      setTimeout(() => applyDietFilter(activeDiet), 50);
    });
  });
})();

// =============================================
// 3D CARD FLIP ENHANCEMENTS
// =============================================

function handleCardFlip() {
  const cards = document.querySelectorAll('.food-card-3d');
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (isTouch) {
    cards.forEach((card) => {
      card.addEventListener('click', function (e) {
        if (e.target.closest('a') || e.target.closest('button')) return;
        this.classList.toggle('flipped');
      });
    });
  }
}

// Reset mobile flip when clicking elsewhere
document.addEventListener('click', function (e) {
  if (!e.target.closest('.food-card-3d')) {
    document.querySelectorAll('.food-card-3d.flipped').forEach((card) => {
      card.classList.remove('flipped');
    });
  }
});
// Random Chef's Recommendation
function displayChefsRecommendation() {
  const recommendation = document.getElementById("chefRecommendation");
  if (!recommendation) return;

  const menuItems = Array.from(document.querySelectorAll(".menu-item h3"));

  if (menuItems.length === 0) return;

  const randomItem =
    menuItems[Math.floor(Math.random() * menuItems.length)];

  recommendation.textContent = randomItem.textContent;
}

// Translate UI Content
function updateContent() {
  if (typeof i18next === 'undefined' || !i18next.t) return;
  
  // Translate standard data-i18n elements
  document.querySelectorAll("[data-i18n]").forEach((elem) => {
    const key = elem.getAttribute("data-i18n");
    elem.textContent = i18next.t(key);
  });

  // Translate placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach((elem) => {
    const key = elem.getAttribute("data-i18n-placeholder");
    elem.setAttribute("placeholder", i18next.t(key));
  });

  // Translate titles
  document.querySelectorAll("[data-i18n-title]").forEach((elem) => {
    const key = elem.getAttribute("data-i18n-title");
    elem.setAttribute("title", i18next.t(key));
  });

  // Dynamic Elements
  const noResults = document.querySelector(".no-results");
  if (noResults) {
    noResults.textContent = i18next.t('menu.no_results');
  }

  const dietNoResults = document.querySelectorAll(".diet-no-results");
  dietNoResults.forEach((el) => {
    el.textContent = i18next.t('menu.diet_no_results');
  });

  // Update reviews
  renderReviews();
}

// ── Initialise ───
document.addEventListener('DOMContentLoaded', function () {
  handleScroll();
  setupIntersectionObserver();
  updateAvailableTimes();
  handleCardFlip();

  // Initialize i18next
  if (typeof i18next !== 'undefined') {
    i18next
      .use(i18nextHttpBackend)
      .use(i18nextBrowserLanguageDetector)
      .init({
        fallbackLng: 'en',
        supportedLngs: ['en', 'hi', 'gu'],
        load: 'languageOnly',
        backend: {
          loadPath: '/locales/{{lng}}/translation.json'
        },
        detection: {
          order: ['localStorage', 'navigator'],
          caches: ['localStorage']
        }
      }, function (err, t) {
        if (err) return console.error(err);

        const activeLang = i18next.resolvedLanguage || 'en';
        const langSelectors = document.querySelectorAll('.language-select');
        langSelectors.forEach((langSelector) => {
          langSelector.value = activeLang;
          langSelector.addEventListener('change', (e) => {
            const selectedVal = e.target.value;
            // Update all language dropdowns on the page to match
            document.querySelectorAll('.language-select').forEach((sel) => {
              sel.value = selectedVal;
            });
            i18next.changeLanguage(selectedVal, (err, t) => {
              if (err) return console.error(err);
              updateContent();
            });
          });
        });

        updateContent();
      });
  } else {
    renderReviews();
  }
});

// Mobile flip style
const styleForMobile = `
  @media (max-width: 768px) {
    .food-card-3d.flipped .food-card-inner {
      transform: rotateY(180deg) scale(1.01);
    }
  }
`;

// ── Skeleton Loader Initialization ─────────────────────────────────────
function createCardSkeleton() {
  const sk = document.createElement('div');
  sk.className = 'skeleton-card skeleton';

  const left = document.createElement('div');
  left.className = 'skeleton-img';

  const right = document.createElement('div');
  right.className = 'skeleton-lines';

  const line1 = document.createElement('div');
  line1.className = 'skeleton-line long';
  const line2 = document.createElement('div');
  line2.className = 'skeleton-line medium';
  const line3 = document.createElement('div');
  line3.className = 'skeleton-line short';

  right.appendChild(line1);
  right.appendChild(line2);
  right.appendChild(line3);

  sk.appendChild(left);
  sk.appendChild(right);

  return sk;
}

function attachSkeletonToCard(card) {
  if (card.__skeletonAttached) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'skeleton-wrapper';

  // Move existing children into wrapper
  while (card.firstChild) {
    wrapper.appendChild(card.firstChild);
  }

  card.appendChild(wrapper);

  const skeleton = createCardSkeleton();
  wrapper.appendChild(skeleton);

  // Hide native images inside the card while loading
  const imgs = wrapper.querySelectorAll('img');
  imgs.forEach((img) => {
    img.classList.add('image-hidden');
    // lazy-load optimization: set loading attribute where supported
    try { if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy'); } catch (e) {}

    if (img.complete && img.naturalWidth > 0) {
      // Already loaded from cache - reveal immediately
      img.classList.add('image-loaded');
      img.classList.remove('image-hidden');
      skeleton.remove();
    } else {
      // Wait for load or error
      img.addEventListener('load', function onLoad() {
        img.classList.add('image-loaded');
        img.classList.remove('image-hidden');
        // fade out skeleton then remove
        skeleton.style.transition = 'opacity 0.45s ease';
        skeleton.style.opacity = '0';
        setTimeout(() => skeleton.remove(), 500);
        img.removeEventListener('load', onLoad);
      });

      img.addEventListener('error', function onError() {
        // remove skeleton even if image fails to avoid permanent overlays
        skeleton.style.transition = 'opacity 0.25s ease';
        skeleton.style.opacity = '0';
        setTimeout(() => skeleton.remove(), 300);
        img.classList.remove('image-hidden');
        img.removeEventListener('error', onError);
      });
    }
  });

  card.__skeletonAttached = true;
}

function attachSkeletonToSimpleImage(container, minHeight = 180) {
  // container is element that contains a single img as background or child
  const img = container.querySelector('img');
  if (!img) return;
  if (container.__skeletonAttached) return;

  const sk = document.createElement('div');
  sk.className = 'skeleton-img skeleton';
  sk.style.height = minHeight + 'px';
  sk.style.width = '100%';
  sk.style.borderRadius = getComputedStyle(container).borderRadius || '4px';
  sk.style.position = 'absolute';
  sk.style.inset = '0';
  sk.style.zIndex = '2';

  // ensure container is positioned to allow absolute overlay
  const prevPos = getComputedStyle(container).position;
  if (prevPos === 'static') container.style.position = 'relative';

  container.appendChild(sk);

  img.classList.add('image-hidden');

  if (img.complete && img.naturalWidth > 0) {
    img.classList.add('image-loaded');
    img.classList.remove('image-hidden');
    sk.remove();
  } else {
    try { if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy'); } catch (e) {}

    img.addEventListener('load', function onLoad() {
      img.classList.add('image-loaded');
      img.classList.remove('image-hidden');
      sk.style.transition = 'opacity 0.45s ease';
      sk.style.opacity = '0';
      setTimeout(() => sk.remove(), 500);
      img.removeEventListener('load', onLoad);
    });
    img.addEventListener('error', function onError() {
      sk.style.opacity = '0';
      setTimeout(() => sk.remove(), 300);
      img.classList.remove('image-hidden');
      img.removeEventListener('error', onError);
    });
  }

  container.__skeletonAttached = true;
}

// Text skeletons
function createTextSkeleton(lines = 3) {
  const wrapper = document.createElement('div');
  wrapper.className = 'skeleton skeleton-overlay skeleton-fade';
  wrapper.setAttribute('aria-hidden', 'true');

  const block = document.createElement('div');
  block.className = 'skeleton-lines';

  for (let i = 0; i < lines; i++) {
    const line = document.createElement('div');
    line.className = 'skeleton-line';
    // vary width for realism
    if (i === 0) line.classList.add('long');
    else if (i === lines - 1) line.classList.add('short');
    else line.classList.add('medium');
    block.appendChild(line);
  }

  wrapper.appendChild(block);
  return wrapper;
}

function attachSkeletonToTextBlock(el, lines = 3) {
  if (!el || el.__skeletonAttached) return;

  // ensure wrapper for absolute overlay
  el.classList.add('skeleton-wrapper');
  const sk = createTextSkeleton(lines);

  // hide content until revealed
  el.classList.add('content-hidden');

  // insert skeleton overlay
  sk.style.position = 'absolute';
  sk.style.top = 0;
  sk.style.left = 0;
  sk.style.right = 0;
  sk.style.bottom = 0;
  sk.style.zIndex = 2;
  el.appendChild(sk);

  // Reveal content after microtask or when images inside have loaded
  // For static text, unhide quickly to avoid long overlays
  requestAnimationFrame(() => {
    // small delay to allow shimmer to show slightly
    setTimeout(() => {
      el.classList.remove('content-hidden');
      el.classList.add('content-visible');
      // fade out skeleton
      sk.style.opacity = '0';
      setTimeout(() => sk.remove(), 500);
    }, 300);
  });

  el.__skeletonAttached = true;
}

// Updated init to attach text skeletons
function initSkeletonLoaders() {
  // Menu card skeletons
  const cards = document.querySelectorAll('.food-card');
  cards.forEach((card) => attachSkeletonToCard(card));

  // Large section images: hero, about image, reservation bg
  const largeContainers = [
    document.querySelector('.hero-bg'),
    document.querySelector('.about-image'),
    document.querySelector('.reservation-bg'),
  ];

  largeContainers.forEach((c) => {
    if (c) attachSkeletonToSimpleImage(c, 360);
  });

  // Text blocks (about, reservation info, first paragraph areas)
  const textTargets = document.querySelectorAll('.about-content, .reservation-info, .review-form-heading');
  textTargets.forEach((t) => attachSkeletonToTextBlock(t, 3));
}

// Initialize skeletons once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // existing DOMContentLoaded handlers already call init functions earlier,
  // but ensure skeletons are attached after render
  initSkeletonLoaders();
});

const mobileStyle = document.createElement('style');
mobileStyle.textContent = styleForMobile;
document.head.appendChild(mobileStyle);

// Automatically update copyright year
const currentYear = document.getElementById("current-year");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}


// =============================================
// PDF MENU DOWNLOAD
// =============================================

// Load html2pdf library dynamically
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

// Create loading overlay
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
  if (overlay) {
    overlay.remove();
  }
}

// Generate PDF Menu
async function generateMenuPDF() {
  try {
    // Show loading
    showLoadingOverlay();

    // Load html2pdf library if not loaded
    await loadHtml2Pdf();

    // Get menu items
    const menuItems = document.querySelectorAll('.menu-item:not(.hidden-item)');
    
    if (menuItems.length === 0) {
      alert('No menu items available to download.');
      hideLoadingOverlay();
      return;
    }

    // Build PDF content
    const pdfContent = document.createElement('div');
    pdfContent.style.cssText = `
      padding: 40px;
      background: white;
      font-family: 'Georgia', serif;
      max-width: 1000px;
      margin: 0 auto;
      color: #1a1714;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      text-align: center;
      border-bottom: 3px solid #c9a962;
      padding-bottom: 30px;
      margin-bottom: 30px;
    `;
    header.innerHTML = `
      <h1 style="font-size: 36px; font-family: 'Georgia', serif; color: #c9a962; margin-bottom: 10px; letter-spacing: 2px;">
        The Lighthouse
      </h1>
      <p style="font-size: 18px; color: #666; font-style: italic; margin-bottom: 5px;">
        Where culinary artistry meets timeless elegance
      </p>
      <p style="font-size: 14px; color: #999; letter-spacing: 1px;">
        EST. 1987
      </p>
      <p style="font-size: 14px; color: #999; margin-top: 10px;">
        123 Harbor View Drive, Coastal City, CA 90210
      </p>
      <p style="font-size: 14px; color: #999;">
        📞 (555) 123-4567
      </p>
    `;
    pdfContent.appendChild(header);

    // Group items by category
    const categories = {
      breakfast: { title: 'Breakfast', items: [] },
      lunch: { title: 'Lunch', items: [] },
      dinner: { title: 'Dinner', items: [] },
      desserts: { title: 'Desserts', items: [] },
      drinks: { title: 'Drinks', items: [] }
    };

    menuItems.forEach((item) => {
      const category = item.dataset.category;
      if (categories[category]) {
        const name = item.querySelector('h3')?.textContent || 'Unknown';
        const price = item.querySelector('.polaroid-price')?.textContent || 
                      item.querySelector('.menu-price')?.textContent || 
                      'Price on Request';
        const diet = item.dataset.diet || 'veg';
        const description = item.querySelector('.back-content p')?.textContent || 
                           item.querySelector('.food-content p')?.textContent || 
                           '';
        
        categories[category].items.push({ name, price, diet, description });
      }
    });

    // Add categories to PDF
    Object.values(categories).forEach((category) => {
      if (category.items.length === 0) return;

      const section = document.createElement('div');
      section.style.cssText = `
        margin-bottom: 30px;
        page-break-inside: avoid;
      `;

      const title = document.createElement('h2');
      title.style.cssText = `
        font-size: 24px;
        color: #c9a962;
        border-bottom: 2px solid #c9a962;
        padding-bottom: 8px;
        margin-bottom: 20px;
        font-family: 'Georgia', serif;
      `;
      title.textContent = category.title;
      section.appendChild(title);

      const grid = document.createElement('div');
      grid.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      `;

      category.items.forEach((item) => {
        const card = document.createElement('div');
        card.style.cssText = `
          border: 1px solid #e0e0e0;
          padding: 15px;
          border-radius: 8px;
          background: #fafafa;
        `;

        const namePrice = document.createElement('div');
        namePrice.style.cssText = `
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 6px;
        `;

        const nameEl = document.createElement('span');
        nameEl.style.cssText = `
          font-size: 16px;
          font-weight: 600;
          color: #1a1714;
        `;
        nameEl.textContent = item.name;

        const priceEl = document.createElement('span');
        priceEl.style.cssText = `
          font-size: 15px;
          font-weight: 600;
          color: #c9a962;
        `;
        priceEl.textContent = item.price;

        namePrice.appendChild(nameEl);
        namePrice.appendChild(priceEl);
        card.appendChild(namePrice);

        // Diet tag
        const dietTag = document.createElement('span');
        dietTag.style.cssText = `
          display: inline-block;
          font-size: 11px;
          padding: 2px 10px;
          border-radius: 12px;
          margin-top: 4px;
          margin-bottom: 6px;
          font-weight: 600;
          background: ${item.diet === 'veg' ? '#e8f5e9' : '#ffebee'};
          color: ${item.diet === 'veg' ? '#2e7d32' : '#c62828'};
        `;
        dietTag.textContent = item.diet === 'veg' ? '🌱 Vegetarian' : '🍗 Non-Veg';
        card.appendChild(dietTag);

        if (item.description) {
          const desc = document.createElement('p');
          desc.style.cssText = `
            font-size: 13px;
            color: #666;
            margin-top: 6px;
            line-height: 1.5;
          `;
          desc.textContent = item.description.substring(0, 100) + (item.description.length > 100 ? '...' : '');
          card.appendChild(desc);
        }

        grid.appendChild(card);
      });

      section.appendChild(grid);
      pdfContent.appendChild(section);
    });

    // Footer
    const footer = document.createElement('div');
    footer.style.cssText = `
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #c9a962;
      text-align: center;
      color: #999;
      font-size: 12px;
    `;
    footer.innerHTML = `
      <p>Thank you for dining with us at The Lighthouse</p>
      <p style="margin-top: 5px;">We look forward to serving you!</p>
      <p style="margin-top: 10px; font-size: 11px;">
        Menu generated on ${new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </p>
    `;
    pdfContent.appendChild(footer);

    // Generate PDF
    const opt = {
      margin: [15, 15, 15, 15],
      filename: `The_Lighthouse_Menu_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
        windowHeight: pdfContent.scrollHeight
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    await html2pdf().set(opt).from(pdfContent).save();

    // Hide loading
    hideLoadingOverlay();

  } catch (error) {
    console.error('Error generating PDF:', error);
    hideLoadingOverlay();
    alert('Sorry, there was an error generating the PDF. Please try again.');
  }
}

// ── PDF Download Button ──
const downloadBtn = document.getElementById('downloadMenuPDF');
if (downloadBtn) {
  downloadBtn.addEventListener('click', generateMenuPDF);
}

// ── Also add a floating download button for quick access ──
const floatingDownloadBtn = document.createElement('button');
floatingDownloadBtn.id = 'floatingPdfBtn';
floatingDownloadBtn.innerHTML = '📄 Menu PDF';
floatingDownloadBtn.style.cssText = `
  position: fixed;
  bottom: 100px;
  right: 32px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #c9a962, #a88b4a);
  color: #1a1714;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  z-index: 999;
  box-shadow: 0 4px 20px rgba(201, 169, 98, 0.4);
  transition: all 0.3s ease;
  font-size: 14px;
  display: none;
`;

floatingDownloadBtn.addEventListener('mouseenter', () => {
  floatingDownloadBtn.style.transform = 'translateY(-3px) scale(1.05)';
  floatingDownloadBtn.style.boxShadow = '0 6px 30px rgba(201, 169, 98, 0.6)';
});

floatingDownloadBtn.addEventListener('mouseleave', () => {
  floatingDownloadBtn.style.transform = 'translateY(0) scale(1)';
  floatingDownloadBtn.style.boxShadow = '0 4px 20px rgba(201, 169, 98, 0.4)';
});

floatingDownloadBtn.addEventListener('click', generateMenuPDF);
document.body.appendChild(floatingDownloadBtn);

// Show/hide floating button based on scroll position
window.addEventListener('scroll', () => {
  const menuSection = document.getElementById('menu');
  if (!menuSection) return;
  
  const rect = menuSection.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    floatingDownloadBtn.style.display = 'block';
  } else {
    floatingDownloadBtn.style.display = 'none';
  }
});

console.log('PDF Menu Download feature loaded!');
