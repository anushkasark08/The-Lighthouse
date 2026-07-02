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

// FIX #4 — Declare filterBtns, menuTabs, menuPanels (were used but never declared)
const filterBtns = document.querySelectorAll(".filter-btn");
const menuTabs = document.querySelectorAll(".menu-tab");
const menuPanels = document.querySelectorAll(".menu-panel");

// ── Device detection ───
const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;


// ── DOM ELEMENTS ──
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const heroBg = document.getElementById('heroBg');
const reservationBg = document.getElementById('reservationBg');
const reservationForm = document.getElementById('reservationForm');
const dateInput = document.getElementById('date');
const timeSelect = document.getElementById('time');
const themeToggle = document.getElementById('themeToggle');


// ── EmailJS Configuration ──
// Replace these with your actual EmailJS credentials
const EMAILJS_CONFIG = {
  publicKey: 'abc123XYZ',        // actual public key
  serviceId: 'service_abc1234',  //  actual service ID
  guestTemplateId: 'template_guest01', //  template ID
  adminTemplateId: 'template_admin02', // template ID
};

// Initialise EmailJS as soon as the key is set
if (EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY') {
  emailjs.init(EMAILJS_CONFIG.publicKey);
}

// ── FIX #9 — show correct scroll hint based on input type ────────
const scrollHintMouse = document.querySelector('.scroll-hint-mouse');
const scrollHintTouch = document.querySelector('.scroll-hint-touch');

if (scrollHintMouse && scrollHintTouch) {
  scrollHintMouse.style.display = isTouchDevice ? 'none' : '';
  scrollHintTouch.style.display = isTouchDevice ? '' : 'none';
}

  function saveStoredList(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function setReservationDateRange() {
    if (!dateInput) return;

    const tomorrow = new Date(Date.now() + 86400000);
    const maxDate = new Date(Date.now() + 90 * 86400000);


// ── FIX #11 — Disable past time slots when today is selected ──

function updateAvailableTimes() {
  if (!dateInput || !timeSelect) return;


  // Theme Toggle & Background Update Logic
  function updateThemeImages(isLight) {
    const heroImg = document.querySelector("#heroBg img");
    const resImg = document.querySelector("#reservationBg img");
    const lightImg = "./images/hero-restaurant-daytime.png";
    const darkImg = "./images/hero-restaurant.jpg";
    
    if (heroImg) heroImg.src = isLight ? lightImg : darkImg;
    if (resImg) resImg.src = isLight ? lightImg : darkImg;
  }

  if (guestsSelect) {
    guestsSelect.addEventListener('change', updateAvailableTimes);
  }

  // ── Live Table Availability ─────
  const TOTAL_TABLES = 12;
  const mockBookings = {};

  function getAvailableTables(dateStr, timeStr, guestsCount) {
    if (mockBookings[dateStr] && mockBookings[dateStr][timeStr] !== undefined) {
      return mockBookings[dateStr][timeStr];
    }
    const hash = dateStr.split('-').join('') + timeStr.replace(':', '') + (guestsCount || '2');
    let num = parseInt(hash, 10);
    
    const hour = parseInt(timeStr.split(':')[0], 10);
    if (hour >= 18 && hour <= 20) num += 7;
    
    const booked = (num % (TOTAL_TABLES + 3)) - 1; 
    return Math.max(0, TOTAL_TABLES - Math.max(0, booked));
  }

  nav.classList.toggle('scrolled', currentScroll > 50);


  // FIX #14 — Parallax completely skipped on touch/iOS


  if (!isTouchDevice) {
    if (heroBg) {
      heroBg.style.transform = `translateY(${currentScroll * 0.5}px)`;
    }
    if (reservationBg && currentScroll > window.innerHeight) {
      const sectionTop = document.getElementById('reservation').offsetTop;
      const offset = (currentScroll - sectionTop) * 0.3;
      reservationBg.style.transform = `translateY(${offset}px)`;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentHours = now.getHours();
    const currentMins = now.getMinutes();

// ── Active nav link on scroll ──
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

// ── Mobile menu ──
function toggleMobileMenu() {
  navToggle.classList.toggle('active');
  navMenu.classList.toggle('active');
  document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
}

    allTimes.forEach((timeVal) => {
      const [optHours, optMins] = timeVal.split(':').map(Number);
      let isPast = false;

// ── Menu tabs functionality ──
function switchMenuTab(e) {
  const targetTab = e.target.dataset.tab;

  document.querySelectorAll('.menu-tab').forEach((tab) => {
    tab.classList.remove('active');
  });
  e.target.classList.add('active');

  document.querySelectorAll('.menu-panel').forEach((panel) => {
    panel.classList.remove('active');
    if (panel.id === targetTab) {
      panel.classList.add('active');
    }

// ── Menu search & filter ──
const filterBtns = document.querySelectorAll('.filter-btn');
const menuSearch = document.getElementById('menu-search');

function getActiveFilter() {
  return document.querySelector('.filter-btn.active').dataset.filter;
}

function getActiveDiet() {
  const activeBtn = document.querySelector('.diet-btn.active');
  return activeBtn ? activeBtn.dataset.type : 'all';
}

function filterMenuItems(filter = 'all', searchText = '', diet = 'all') {
  const menuItems = document.querySelectorAll('.menu-item');
  let visibleCount = 0;

  menuItems.forEach((item) => {
    const itemName = item.querySelector('h3').textContent.toLowerCase();
    const category = item.dataset.category;
    const type = item.dataset.type;

    const matchesSearch = itemName.includes(searchText.toLowerCase());
    const matchesFilter = filter === 'all' || category === filter;
    const matchesDiet = diet === 'all' || type === diet;

    if (matchesSearch && matchesFilter && matchesDiet) {

      item.classList.remove('hidden-item');
      visibleCount++;
    } else {
      item.classList.add('hidden-item');
    const selectedBtn = timeSlotsGrid.querySelector('.selected');
    if (!selectedBtn) {
      timeInput.value = '';
    }
  }

  function closeMobileMenu() {
    if (!navToggle || !navMenu) return;
    navToggle.classList.remove("active");
    navMenu.classList.remove("active");
    document.body.style.overflow = "";
  }

  function toggleMobileMenu() {
    if (!navToggle || !navMenu) return;
    navToggle.classList.toggle("active");
    navMenu.classList.toggle("active");
    document.body.style.overflow = navMenu.classList.contains("active") ? "hidden" : "";
  }

  function updateActiveNavLink() {
    const scrollPosition = window.scrollY + 150;

    document.querySelectorAll("section[id]").forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;
      const sectionId = section.id;

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        const hasLink = Array.from(navLinks).some((link) => link.dataset.section === sectionId);
        if (!hasLink) return;
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.dataset.section === sectionId);
        });
      }
    });
  }

  function handleScroll() {
    const currentScroll = window.scrollY;

    if (nav) {
      nav.classList.toggle("scrolled", currentScroll > 50);
    }

    if (!isTouchDevice) {
      if (heroBg) {
        heroBg.style.transform = `translateY(${currentScroll * 0.5}px)`;
      }

      const reservationSection = document.getElementById("reservation");
      if (reservationBg && reservationSection && currentScroll > window.innerHeight) {
        const offset = (currentScroll - reservationSection.offsetTop) * 0.3;
        reservationBg.style.transform = `translateY(${offset}px)`;
      }

    }

    if (backToTopBtn) {
      backToTopBtn.classList.toggle("visible", currentScroll > 300);
    }

    updateActiveNavLink();
  }

function triggerFilter() {
  const activeBtn = document.querySelector(".filter-btn.active");
  const timeFilter = activeBtn ? activeBtn.dataset.filter : "all";
  const cuisineFilter = cuisineDropdown ? cuisineDropdown.value : "all";
  const searchText = menuSearch ? menuSearch.value : "";

  filterMenuItems(timeFilter, cuisineFilter, searchText);
}

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Filter buttons
filterBtns.forEach((btn) => {

  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    filterMenuItems(btn.dataset.filter, menuSearch ? menuSearch.value : '', getActiveDiet());
  });
});

if (menuSearch) {
  menuSearch.addEventListener('input', () => {
    filterMenuItems(getActiveFilter(), menuSearch.value, getActiveDiet());
  });
}

// ── Diet filter buttons ──
const dietBtns = document.querySelectorAll('.diet-btn');

dietBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    dietBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    filterMenuItems(getActiveFilter(), menuSearch ? menuSearch.value : '', btn.dataset.type);
  });
});

// ── Smooth scroll ──

function smoothScroll(e) {
  e.preventDefault();
  const targetId = this.getAttribute('href');
  const targetSection = document.querySelector(targetId);

  function setupThemeToggle() {
    if (!themeToggle) return;

    let savedTheme = null;
    try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
    const isLightOnLoad = savedTheme === "light";
    
    document.body.classList.toggle("light-theme", isLightOnLoad);
    themeToggle.textContent = isLightOnLoad ? "\u2600" : "\u263E";
    
    // Set correct images on initial load
    updateThemeImages(isLightOnLoad);

    themeToggle.addEventListener("click", () => {
      const isLight = document.body.classList.toggle("light-theme");
      try { localStorage.setItem("theme", isLight ? "light" : "dark"); } catch (e) {}
      themeToggle.textContent = isLight ? "\u2600" : "\u263E";
      
      // Swap daytime/nighttime images dynamically
      updateThemeImages(isLight);
    });
  }

// ── EmailJS helper: format date & time for readable email ──
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

// ── Reservation toast notification ──
function showReservationToast(type, message) {
  // Remove any existing toast
  const existing = document.querySelector('.reservation-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `reservation-toast reservation-toast--${type}`;
  toast.innerHTML = `
    <div class="reservation-toast__icon">${type === 'success' ? '✓' : '✕'}</div>
    <div class="reservation-toast__body">
      <p class="reservation-toast__title">${type === 'success' ? 'Reservation Requested!' : 'Something went wrong'}</p>
      <p class="reservation-toast__msg">${message}</p>
    </div>
    <button class="reservation-toast__close" aria-label="Close">✕</button>
  `;

  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => toast.classList.add('reservation-toast--visible'));

  // Close button
  toast.querySelector('.reservation-toast__close').addEventListener('click', () => {
    toast.classList.remove('reservation-toast--visible');
    setTimeout(() => toast.remove(), 400);
  });

  // Auto-remove after 6s
  setTimeout(() => {
    toast.classList.remove('reservation-toast--visible');
    setTimeout(() => toast.remove(), 400);
  }, 6000);
}

// ── Reservation form submission (with EmailJS) ──
async function handleFormSubmit(e) {
  e.preventDefault();

  const inputs = reservationForm.querySelectorAll('input, select, textarea');

  let isValid = true;

    reservationForm.querySelectorAll(".error-message").forEach((error) => error.remove());

    reservationForm.querySelectorAll("input, select, textarea").forEach((input) => {
      const invalid = input.required && !input.value.trim();
      input.style.borderColor = invalid ? "#c94a4a" : "";
      if (invalid) isValid = false;
    });

    if (emailInput && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailInput.value.trim())) {
      addError(emailInput, "Please enter a valid email address.");
      isValid = false;
    }


  if (!isValid) return;

  const submitBtn = reservationForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  // Gather form data
  const formData = {
    guest_name: document.getElementById('name').value.trim(),
    guest_email: document.getElementById('email').value.trim(),
    guest_phone: document.getElementById('phone').value.trim(),
    guest_count: document.getElementById('guests').value,
    booking_date: formatBookingDate(document.getElementById('date').value),
    booking_time: formatBookingTime(document.getElementById('time').value),
    special_requests: document.getElementById('requests').value.trim() || 'None',
    restaurant_name: 'The Lighthouse',
    restaurant_phone: '(555) 123-4567',
    restaurant_email: 'reservations@thelighthouse.com',
  };

  // Loading state
  submitBtn.textContent = 'Sending…';
  submitBtn.disabled = true;

  // EmailJS not configured → graceful fallback (still shows success UX)
  if (EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
    console.warn('[EmailJS] Not configured — running in demo mode. Fill in EMAILJS_CONFIG in script.js.');
    await new Promise(r => setTimeout(r, 1200));
    showReservationToast('success', `Thank you, ${formData.guest_name}! We'll confirm your table for ${formData.guest_count} guest(s) on ${formData.booking_date} at ${formData.booking_time} within 24 hours.`);
    reservationForm.reset();
    updateAvailableTimes();
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    return;
  }

  try {
    // Send guest confirmation email
    await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.guestTemplateId,
      formData
    );

    // Send admin notification email
    await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.adminTemplateId,
      formData
    );

    showReservationToast(
      'success',
      `Thank you, ${formData.guest_name}! A confirmation has been sent to ${formData.guest_email}. We look forward to welcoming you on ${formData.booking_date} at ${formData.booking_time}.`
    );

    reservationForm.reset();
    updateAvailableTimes();

  } catch (err) {
    console.error('[EmailJS] Error:', err);
    showReservationToast(
      'error',
      'We couldn\'t send your confirmation email. Please call us at (555) 123-4567 or try again.'
    );
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }

// ── FIX #15 — Intersection Observer with prefers-reduced-motion ──

function setupIntersectionObserver() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const error = document.createElement("small");
    error.className = "error-message";
    error.style.color = "#c94a4a";
    error.textContent = message;
    input.parentElement.appendChild(error);
  }

  function setupIntersectionObserver() {
    const animatedElements = document.querySelectorAll(
      ".about-content, .menu-panel, .reservation-form, .location-info"
    );
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      animatedElements.forEach((el) => el.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -50px 0px" }
    );

    animatedElements.forEach((el) => observer.observe(el));
  }

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
        window.scrollBy({ top: 2, behavior: "auto" });
        if (window.scrollY + window.innerHeight >= document.body.scrollHeight) {
          stopAutoScroll();
        }
      }, 15);
    }

    heroScroll.addEventListener("click", () => {
      autoScrollInterval ? stopAutoScroll() : startAutoScroll();
    });

    ["mousemove", "touchstart", "keydown", "wheel", "pointerdown"].forEach((eventName) => {
      window.addEventListener(eventName, stopAutoScroll, { passive: true });
    });
  }

  function setupReviews() {
    const storageKey = "lighthouse_reviews";
    const reviewForm = document.getElementById("review-form");
    const reviewMsg = document.getElementById("review-msg");
    const starBtns = document.querySelectorAll("#star-input .star-btn");
    let selectedRating = 0;

    const pinnedReview = {
      name: "Rasshi Srivastav",
      rating: 5,
      text: "Absolutely loved the food and ambience! Every dish was crafted with such care and the atmosphere was warm and elegant. A truly memorable dining experience - will definitely be coming back!",
      date: "14 May 2026",
    };

    function getReviews() {
      try {
        return JSON.parse(localStorage.getItem(storageKey)) || [];
      } catch {
        return [];
      }
    }

    function renderReviews() {
      const grid = document.getElementById("reviews-grid");
      if (!grid) return;

      grid.innerHTML = "";
      [pinnedReview, ...getReviews()].forEach((review) => {
        const card = document.createElement("div");
        card.className = "review-card";
        const rating = Math.max(0, Math.min(5, Math.round(Number(review.rating) || 0)));
        const stars = "\u2605".repeat(rating) + "\u2606".repeat(5 - rating);

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

        card.querySelector(".review-text").textContent = review.text;
        card.querySelector(".review-avatar").textContent = review.name.slice(0, 2).toUpperCase();
        card.querySelector(".review-name").textContent = review.name;
        card.querySelector(".review-date").textContent = review.date;
        grid.appendChild(card);
      });
    }

    function isValidName(name) {
      return /^[\p{L}\p{M}\s'-]{3,30}$/u.test(name.trim());
    }

    function isMeaningfulReview(text) {
      const value = text.trim();
      const words = value.split(/\s+/);
      return words.length >= 3 && !/^(.)\1+$|^[a-zA-Z]{1,6}$/.test(value);
    }

// ── Auto-scroll on hero click ──
const heroScroll = document.querySelector('.hero-scroll');
let autoScrollInterval = null;

        if (text.length < 20 || !isMeaningfulReview(text)) {
          reviewMsg.textContent = "Please enter a meaningful review of at least 20 characters.";
          reviewMsg.style.color = "#c94a4a";
          return;
        }

        const reviews = getReviews();
        reviews.unshift({
          id: Date.now(),
          name,
          rating: selectedRating,
          text,
          date: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        });

        localStorage.setItem(storageKey, JSON.stringify(reviews));
        renderReviews();
        reviewForm.reset();
        selectedRating = 0;
        document.getElementById("review-rating").value = 0;
        starBtns.forEach((star) => star.classList.remove("active"));

        reviewMsg.textContent = "Review submitted successfully!";
        reviewMsg.style.color = "#4a9c6a";
        setTimeout(() => {
          reviewMsg.style.display = "none";
        }, 3000);
      });
    }

    renderReviews();
  }

  function getMenuItemData(item) {
    const title = item.querySelector("h3")?.textContent.trim() || "Menu item";
    const priceText = item.querySelector(".menu-price")?.textContent || "0";
    const price = Number(priceText.replace(/[^\d.]/g, "")) || 0;
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const image = item.querySelector("img")?.getAttribute("src") || "";

    return { id, title, price, image };
  }

  function setupOrderFeatures() {
    const menuItems = document.querySelectorAll(".menu-content .menu-item");
    if (!menuItems.length || !orderDock) return;

    menuItems.forEach((item) => {
      const data = getMenuItemData(item);
      item.dataset.itemId = data.id;

      const actions = document.createElement("div");
      actions.className = "menu-actions";
      actions.innerHTML = `
        <button class="menu-action-btn add-cart-btn" type="button" data-id="${data.id}">Add</button>
        <button class="menu-action-btn favorite-btn" type="button" data-id="${data.id}" aria-label="Add ${data.title} to favourites">\u2661</button>
      `;

      item.querySelector(".food-content")?.appendChild(actions);

      actions.querySelector(".add-cart-btn")?.addEventListener("click", () => addToCart(data));
      actions.querySelector(".favorite-btn")?.addEventListener("click", () => toggleFavorite(data));
    });

    orderToggle?.addEventListener("click", () => {
      const isOpen = orderDock.classList.toggle("open");
      orderToggle.setAttribute("aria-expanded", String(isOpen));
    });

    orderTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetView = tab.dataset.orderView;
        orderTabs.forEach((item) => item.classList.toggle("active", item === tab));
        orderViews.forEach((view) => view.classList.toggle("active", view.id === `${targetView}View`));
      });
    });

    checkoutBtn?.addEventListener("click", () => {
      if (!cart.length) return;

      const summary = cart.map((item) => `${item.qty} x ${item.title}`).join(", ");
      checkoutBtn.textContent = "Order Ready!";
      checkoutBtn.title = summary;
      setTimeout(() => {
        checkoutBtn.textContent = "Review Order";
        checkoutBtn.title = "";
      }, 2200);
    });

    renderOrderState();
  }

  function addToCart(item) {
    const existing = cart.find((cartItem) => cartItem.id === item.id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...item, qty: 1 });
    }

    saveStoredList("lighthouse_cart", cart);
    renderOrderState();
    orderDock?.classList.add("open");
    orderToggle?.setAttribute("aria-expanded", "true");
  }

// ── Star rating widget ──
let selectedRating = 0;
const starBtns = document.querySelectorAll('#star-input .star-btn');


  // Large section images: hero, about image, reservation bg
  const largeContainers = [
    document.querySelector('.hero-bg'),
    document.querySelector('.about-image'),
    document.querySelector('.reservation-bg'),
  ];

  largeContainers.forEach((c) => {
    if (c) attachSkeletonToSimpleImage(c, 360);
  });

// ── Review validation helpers ──
function isMeaningfulReview(text) {
  const words = text.trim().split(/\s+/);
  const randomPattern = /^(.)\1+$|^[a-zA-Z]{1,6}$/;
  if (randomPattern.test(text.trim())) return false;
  return words.length >= 3;
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

// ============= RESERVATION API INTEGRATION =============

class ReservationAPI {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async getAvailableSlots(date, guests) {
    const response = await fetch(
      `${this.baseURL}/reservations/slots?date=${date}&guests=${guests}`,
      { headers: this.getHeaders() }
    );
    return response.json();
  }

  async createReservation(data) {
    const response = await fetch(`${this.baseURL}/reservations`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async getMyReservations() {
    const response = await fetch(`${this.baseURL}/reservations`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async cancelReservation(id) {
    const response = await fetch(`${this.baseURL}/reservations/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return response.json();
  }

  async login(email, password) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.success && data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async register(name, email, password, phone) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone })
    });
    const data = await response.json();
    if (data.success && data.token) {
      this.setToken(data.token);
    }
    return data;
  }
}


// ── Initialise ──
document.addEventListener('DOMContentLoaded', () => {
  handleScroll();
  setupIntersectionObserver();
  updateAvailableTimes();
  renderReviews();
});

// ── Veg / Non-Veg Filter ──

(function () {
  const dietFilterBtns = document.querySelectorAll('.diet-btn');
  if (!dietFilterBtns.length) return;

  const formData = new FormData(this);
  const data = {
    date: formData.get('date'),
    time: formData.get('time'),
    guests: formData.get('guests'),
    specialRequests: formData.get('specialRequests') || ''
  };

  // Validate
  if (!data.date || !data.time || !data.guests) {
    alert('Please fill in all required fields');
    return;
  }

  // Show loading state
  const submitBtn = this.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Booking...';
  submitBtn.disabled = true;

  try {
    const result = await reservationAPI.createReservation(data);
    
    if (result.success) {
      alert('✅ Reservation confirmed! Check your email for details.');
      this.reset();
    } else {
      alert('❌ ' + result.error);
    }
  } catch (error) {
    alert('❌ Something went wrong. Please try again.');
    console.error(error);
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// ============= ADD REAL-TIME AVAILABILITY =============

// Update time slot dropdown dynamically
const dateInput = document.querySelector('#reservation input[type="date"]');
const guestsInput = document.querySelector('#reservation input[type="number"]');
const timeSelect = document.querySelector('#reservation select');

async function updateAvailableSlots() {
  const date = dateInput?.value;
  const guests = guestsInput?.value;

  if (!date || !guests || guests < 1) {
    return;
  }

  try {
    const result = await reservationAPI.getAvailableSlots(date, guests);
    
    if (result.success && result.data.slots) {
      // Clear existing options
      timeSelect.innerHTML = '<option value="">Select Time</option>';
      
      // Add available slots
      result.data.slots.forEach(slot => {
        const option = document.createElement('option');
        option.value = slot.time;
        option.textContent = slot.time + (slot.available ? ' ✅' : ' ❌');
        option.disabled = !slot.available;
        timeSelect.appendChild(option);
      });

      // Show availability message
      const availableCount = result.data.slots.filter(s => s.available).length;
      if (availableCount === 0) {
        const msg = document.createElement('p');
        msg.id = 'availability-msg';
        msg.style.color = '#c9a962';
        msg.textContent = '⚠️ No tables available for this date and party size';
        timeSelect.parentNode.appendChild(msg);
      }
    }
  } catch (error) {
    console.error('Error fetching availability:', error);
  }
}


  dietFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dietFilterBtns.forEach(b => b.classList.remove('active'));


      btn.classList.add('active');
      applyDietFilter(btn.dataset.diet);
    });
  });

  document.querySelectorAll('.menu-tab').forEach(tab => {

    tab.addEventListener('click', () => {
      const activeDiet = document.querySelector('.diet-btn.active')?.dataset.diet || 'all';
      setTimeout(() => applyDietFilter(activeDiet), 50);
    });
  });
})();


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

    item.qty += delta;
    cart = cart.filter((cartItem) => cartItem.qty > 0);
    saveStoredList("lighthouse_cart", cart);
    renderOrderState();

  }

  function toggleFavorite(item) {
    const exists = favorites.some((favorite) => favorite.id === item.id);
    favorites = exists
      ? favorites.filter((favorite) => favorite.id !== item.id)
      : [...favorites, item];

    saveStoredList("lighthouse_favorites", favorites);
    renderOrderState();
  }

  function renderOrderState() {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    if (cartCountEl) cartCountEl.textContent = totalCount;
    if (cartTotalEl) cartTotalEl.textContent = `\u20B9${totalPrice}`;
    if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;

    document.querySelectorAll(".favorite-btn").forEach((btn) => {
      const isFavorite = favorites.some((item) => item.id === btn.dataset.id);
      btn.classList.toggle("active", isFavorite);
      btn.textContent = isFavorite ? "\u2665" : "\u2661";
    });
  }

// Translate UI Content
function updateContent() {
  if (typeof i18next === 'undefined' || !i18next.t) return;

  // Translate standard data-i18n elements
  document.querySelectorAll("[data-i18n]").forEach((elem) => {
    const key = elem.getAttribute("data-i18n");
    elem.textContent = i18next.t(key);
  });

  setReservationDateRange();
  updateAvailableTimes();
  setupThemeToggle();
  setupIntersectionObserver();
  setupAutoScroll();
  setupReviews();
  setupOrderFeatures();
  filterMenuItems();
  handleScroll();

  dateInput?.addEventListener("change", updateAvailableTimes);
  navToggle?.addEventListener("click", toggleMobileMenu);
  reservationForm?.addEventListener("submit", validateReservationForm);
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) closeMobileMenu();
  });

  navLinks.forEach((link) => link.addEventListener("click", smoothScroll));
  document.querySelectorAll(".nav-cta, .nav-cta-mobile, .hero-buttons a").forEach((link) => {
    link.addEventListener("click", smoothScroll);
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.filter || "all";
      filterMenuItems();
    });
  });

  dietBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      dietBtns.forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
      currentDiet = btn.dataset.diet || "all";
      filterMenuItems();
    });
  });

  cuisineDropdown?.addEventListener("change", filterMenuItems);
  menuSearch?.addEventListener("input", filterMenuItems);

  backToTopBtn?.addEventListener("click", () => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  });
});


console.log('PDF Menu Download feature loaded!');


if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

