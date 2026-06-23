// DOM Elements
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-link");
// Menu tabs/panels removed — menu uses filter buttons and data-category items
const heroBg = document.getElementById("heroBg");
const reservationBg = document.getElementById("reservationBg");
const reservationForm = document.getElementById("reservationForm");
const dateInput = document.getElementById("reservation-date");
const timeSelect = document.getElementById("time");
const themeToggle = document.getElementById("themeToggle");
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
  const maxDate  = new Date(Date.now() + 90 * 86400000);

  dateInput.setAttribute('min', tomorrow.toISOString().split('T')[0]);
  dateInput.setAttribute('max', maxDate.toISOString().split('T')[0]);

  dateInput.addEventListener('change', updateAvailableTimes);
}

// ── FIX #11 — Disable past time slots when today is selected.
// Original had no handler for this — users could pick 7AM at 10PM.
function updateAvailableTimes() {
  if (!dateInput || !timeSelect) return;

  const selectedDate = dateInput.value;
  const todayStr     = new Date().toISOString().split('T')[0];
  const now          = new Date();
  const currentHours = now.getHours();
  const currentMins  = now.getMinutes();

  timeSelect.querySelectorAll('option').forEach((option) => {
    if (!option.value) return;

    const [optHours, optMins] = option.value.split(':').map(Number);

    if (selectedDate === todayStr) {
      // Disable times already passed (30-min buffer for travel/prep)
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

// ── Theme Toggle ──
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'light') {
  document.body.classList.add('light-theme');
  themeToggle.textContent = '☀️';
} else {
  themeToggle.textContent = '🌙';
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  const isLight = document.body.classList.contains('light-theme');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  themeToggle.textContent = isLight ? '☀️' : '🌙';
});

// ── Navigation scroll effect ──
function handleScroll() {
  const currentScroll = window.scrollY;

  // Sticky nav background
  nav.classList.toggle('scrolled', currentScroll > 50);

  // FIX #14 — Parallax completely skipped on touch/iOS
  // background-attachment:fixed doesn't work on iOS Safari and the JS
  // translateY parallax causes severe jank on touch devices.
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
  const sections       = document.querySelectorAll('section[id]');
  const scrollPosition = window.scrollY + 150;

  sections.forEach((section) => {
    const sectionTop    = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId     = section.getAttribute('id');

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

// ── Menu search & filter ────
const filterBtns = document.querySelectorAll('.filter-btn');
const menuSearch = document.getElementById('menu-search');

function filterMenuItems(filter = 'all', searchText = '') {
  const menuItems = document.querySelectorAll('.menu-item');
  let visibleCount = 0;

  menuItems.forEach((item) => {
    const itemName      = item.querySelector('h3').textContent.toLowerCase();
    const category      = item.dataset.category;
    const matchesSearch = itemName.includes(searchText.toLowerCase());


    const foodTag = item.querySelector(".food-tag");

    const isVeg = foodTag.classList.contains("veg");
    
    const isNonVeg = foodTag.classList.contains("nonveg");

    let matchesFilter = false;

    if (filter === "all") {
      matchesFilter = true;
    } else if (
      ["breakfast", "lunch", "dinner", "desserts", "drinks"].includes(filter)
    ) {
      matchesFilter = category === filter;
    } else if (filter === "veg") {
      matchesFilter = isVeg;
    } else if (filter === "nonveg") {
      matchesFilter = isNonVeg;
    }


    if (matchesSearch && matchesFilter) {
      item.classList.remove('hidden-item');
      visibleCount++;
    } else {
      item.classList.add('hidden-item');
    }
  });

  let noResults = document.querySelector('.no-results');
  if (!visibleCount) {
    if (!noResults) {
      noResults = document.createElement('p');
      noResults.className = 'no-results';
      noResults.textContent = 'No menu items found.';
      document.querySelector('.menu-content').appendChild(noResults);
    }
  } else if (noResults) {
    noResults.remove();
  }
}

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    filterMenuItems(btn.dataset.filter, menuSearch ? menuSearch.value : '');
  });
});

if (menuSearch) {
  menuSearch.addEventListener('input', () => {
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    filterMenuItems(activeFilter, menuSearch.value);
  });
}

// ── Smooth scroll ──
function smoothScroll(e) {
  e.preventDefault();
  const targetId      = this.getAttribute('href');
  const targetSection = document.querySelector(targetId);

  if (targetSection) {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const offsetTop = targetSection.offsetTop - 80;
    window.scrollTo({
      top: offsetTop,
      behavior: prefersReduced ? "auto" : "smooth",
    // FIX #15 partial — respect reduced motion in smooth scroll too
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

  const inputs  = reservationForm.querySelectorAll('input, select, textarea');
  let isValid   = true;

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

// Remove old error messages if already present
document.querySelectorAll('.error-message').forEach(el => el.remove());

// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (emailInput && !emailRegex.test(emailInput.value.trim())) {
  emailInput.style.borderColor = '#c94a4a';

  const emailError = document.createElement('small');
  emailError.className = 'error-message';
  emailError.style.color = '#c94a4a';
  emailError.textContent = 'Please enter a valid email address.';

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
    phoneError.textContent = 'Phone number must contain exactly 10 digits.';

    phoneInput.parentElement.appendChild(phoneError);

    isValid = false;
  }
}
  
  if (isValid) {
    const submitBtn  = reservationForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Reservation Requested!';
    submitBtn.style.backgroundColor = '#4a9c6a';
    submitBtn.disabled = true;

    setTimeout(() => {
      reservationForm.reset();
      updateAvailableTimes();
      submitBtn.textContent = originalText;
      submitBtn.style.backgroundColor = '';
      submitBtn.disabled = false;
      // Re-run time filter after form reset in case date was today
      updateAvailableTimes();
    }, 3000);
  }
}

// ── FIX #15 — Intersection Observer with prefers-reduced-motion ──────
function setupIntersectionObserver() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animatedElements = document.querySelectorAll(
    '.about-content, .menu-panel, .reservation-form, .location-info'
  );

  if (prefersReduced) {
    // Skip animation entirely — just show everything immediately
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
          observer.unobserve(entry.target);
        }
      });
    },
    { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0 }
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

// Scroll to Discover - Auto slow scroll
const heroScroll = document.querySelector(".hero-scroll");
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
  // Two scroll listeners in original were duplicated — merged into one
  window.addEventListener('scroll', () => {
    const past = window.scrollY > 300;
    backToTopBtn.style.display = past ? 'block' : 'none';
    backToTopBtn.classList.toggle('visible', past);
  });

  backToTopBtn.addEventListener('click', () => {
    // FIX #15 partial — respect reduced motion on back-to-top too
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  });
}

// ── Event Listeners ──
window.addEventListener('scroll', handleScroll);
navToggle.addEventListener('click', toggleMobileMenu);

navLinks.forEach((link) => link.addEventListener('click', smoothScroll));

// Menu tab listeners removed — menu uses filter buttons
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
  text: 'Absolutely loved the food and ambience! Every dish was crafted with such care and the atmosphere was warm and elegant. A truly memorable dining experience — will definitely be coming back!',
  date: '14 May 2026',
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

function renderReviews() {
  const grid = document.getElementById('reviews-grid');
  if (!grid) return;

  const userReviews = getReviews();
  const allReviews  = [pinnedReview, ...userReviews];

  grid.innerHTML = "";

  allReviews.forEach((r) => {
    const card = document.createElement("div");
    card.className = "review-card";

    const stars = document.createElement("div");
    stars.className = "review-stars";
    stars.textContent =
      "★".repeat(r.rating) + "☆".repeat(5 - r.rating);

    const text = document.createElement("p");
    text.className = "review-text";
    text.textContent = r.text;

    const author = document.createElement("div");
    author.className = "review-author";

    const avatar = document.createElement("div");
    avatar.className = "review-avatar";
    avatar.textContent = r.name.slice(0, 2).toUpperCase();

    const info = document.createElement("div");

    const name = document.createElement("span");
    name.className = "review-name";
    name.textContent = r.name;

    const date = document.createElement("span");
    date.className = "review-date";
    date.textContent = r.date;

    info.appendChild(name);
    info.appendChild(date);

    author.appendChild(avatar);
    author.appendChild(info);

    card.appendChild(stars);
    card.appendChild(text);
    card.appendChild(author);

    grid.appendChild(card);
  });
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
const reviewMsg  = document.getElementById('review-msg');

if (reviewForm) {
  reviewForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name       = document.getElementById('review-name').value.trim();
    const reviewText = document.getElementById('review-text').value.trim();

    reviewMsg.style.display = 'block';

    if (!selectedRating) {
      reviewMsg.textContent = 'Please select a star rating.';
      reviewMsg.style.color = '#c94a4a';
      return;
    }
    if (!isValidName(name)) {
      reviewMsg.textContent = 'Name should contain only letters and be 3–30 characters long.';
      reviewMsg.style.color = '#c94a4a';
      return;
    }
    if (reviewText.length < 20) {
      reviewMsg.textContent = 'Review must contain at least 20 characters.';
      reviewMsg.style.color = '#c94a4a';
      return;
    }
    if (!isMeaningfulReview(reviewText)) {
      reviewMsg.textContent = 'Please enter a meaningful review.';
      reviewMsg.style.color = '#c94a4a';
      return;
    }

    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });

    const newReview = { id: Date.now(), name, rating: selectedRating, text: reviewText, date: dateStr };
    const reviews   = getReviews();
    reviews.unshift(newReview);
    saveReviews(reviews);
    renderReviews();

    reviewForm.reset();
    selectedRating = 0;
    document.getElementById('review-rating').value = 0;
    starBtns.forEach((s) => s.classList.remove('active'));

    reviewMsg.textContent = 'Review submitted successfully!';
    reviewMsg.style.color = '#4a9c6a';
    setTimeout(() => { reviewMsg.style.display = 'none'; }, 3000);
  });
}

// ── Initialise ───
document.addEventListener('DOMContentLoaded', () => {
  handleScroll();
  setupIntersectionObserver();
  updateAvailableTimes();
  renderReviews();
});

// ── Veg / Non-Veg Filter ──────────────────────────────
(function () {
  const filterBtns = document.querySelectorAll('.diet-btn');
  if (!filterBtns.length) return;

  function applyDietFilter(diet) {
    // Filter within whichever panel is currently active
    const activePanels = document.querySelectorAll('.menu-panel.active');

// Init
renderReviews();

// BackToTop
const backToTopBtn = document.getElementById("backToTop");

if (backToTopBtn) {
  window.addEventListener("scroll", () => {
    const past = window.scrollY > 300;
    backToTopBtn.style.display = past ? "block" : "none";
    backToTopBtn.classList.toggle("visible", past);
  });

  backToTopBtn.addEventListener("click", () => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  });
}
    activePanels.forEach(panel => {
      const items = panel.querySelectorAll('.menu-item');
      let visibleCount = 0;

      items.forEach(item => {
        const itemDiet = item.dataset.diet || 'all';
        const show = diet === 'all' || itemDiet === diet;
        item.classList.toggle('diet-hidden', !show);
        if (show) visibleCount++;
      });

      // Show/hide no-results message
      let noResults = panel.querySelector('.diet-no-results');
      if (!noResults) {
        noResults = document.createElement('p');
        noResults.className = 'diet-no-results';
        noResults.textContent = 'No items match the selected filter.';
        panel.querySelector('.menu-items').appendChild(noResults);
      }
      noResults.classList.toggle('visible', visibleCount === 0);
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyDietFilter(btn.dataset.diet);
    });
  });

  // Re-apply filter when menu tab changes
  document.querySelectorAll('.menu-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const activeDiet = document.querySelector('.diet-btn.active')?.dataset.diet || 'all';
      // slight delay to let the panel become active
      setTimeout(() => applyDietFilter(activeDiet), 50);
    });
  });
})();

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
