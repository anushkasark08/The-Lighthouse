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
const backToTopBtn = document.getElementById("backToTop");

const filterBtns = document.querySelectorAll(".filter-btn");
const menuTabs = document.querySelectorAll(".menu-tab");
const menuPanels = document.querySelectorAll(".menu-panel");
const dietBtns = document.querySelectorAll(".diet-btn");

const orderDock = document.getElementById("orderDock");
const orderToggle = document.getElementById("orderToggle");
const orderTabs = document.querySelectorAll(".order-tab");
const orderViews = document.querySelectorAll(".order-view");
const checkoutBtn = document.getElementById("checkoutBtn");
const cartCountEl = document.getElementById("cartCount");
const cartTotalEl = document.getElementById("cartTotal");
const cartItemsEl = document.getElementById("cartItems");
const favoriteItemsEl = document.getElementById("favoriteItems");

const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

// Initial state
let cart = [];
let favorites = [];
try {
  cart = JSON.parse(localStorage.getItem("lighthouse_cart")) || [];
  favorites = JSON.parse(localStorage.getItem("lighthouse_favorites")) || [];
} catch (e) {
  console.warn("Storage access failed:", e);
}

function saveStoredList(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("Saving to storage failed:", e);
  }
}

// ── EmailJS Configuration ──
const EMAILJS_CONFIG = {
  publicKey: 'abc123XYZ',        // actual public key
  serviceId: 'service_abc1234',  //  actual service ID
  guestTemplateId: 'template_guest01', //  template ID
  adminTemplateId: 'template_admin02', // template ID
};

// Initialise EmailJS
if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY') {
  emailjs.init(EMAILJS_CONFIG.publicKey);
}

// ── Scroll hint based on input type ──
const scrollHintMouse = document.querySelector('.scroll-hint-mouse');
const scrollHintTouch = document.querySelector('.scroll-hint-touch');

if (scrollHintMouse && scrollHintTouch) {
  scrollHintMouse.style.display = isTouchDevice ? 'none' : '';
  scrollHintTouch.style.display = isTouchDevice ? '' : 'none';
}

// ============= RESERVATION DATE/TIME VALIDATION =============
function setReservationDateRange() {
  if (!dateInput) return;
  const tomorrow = new Date(Date.now() + 86400000);
  const maxDate = new Date(Date.now() + 90 * 86400000);
  dateInput.min = tomorrow.toISOString().split('T')[0];
  dateInput.max = maxDate.toISOString().split('T')[0];
}

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
      const isPast = optHours < currentHours || (optHours === currentHours && optMins <= currentMins + 30);
      option.disabled = isPast;
      if (isPast && option.selected) {
        timeSelect.value = '';
      }
    } else {
      option.disabled = false;
    }
  });

  if (typeof reservationAPI !== 'undefined' && reservationAPI.token) {
    updateAvailableSlots();
  }
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
    try {
      const response = await fetch(
        `${this.baseURL}/reservations/slots?date=${date}&guests=${guests}`,
        { headers: this.getHeaders() }
      );
      return response.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async createReservation(data) {
    try {
      const response = await fetch(`${this.baseURL}/reservations`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      return response.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}

const reservationAPI = new ReservationAPI();
const guestsInput = document.getElementById("guests");

async function updateAvailableSlots() {
  if (!dateInput || !timeSelect) return;
  const date = dateInput.value;
  const guests = guestsInput ? guestsInput.value : 2;

  if (!date || !guests || guests < 1) return;

  try {
    const result = await reservationAPI.getAvailableSlots(date, guests);
    if (result.success && result.data && result.data.slots) {
      timeSelect.innerHTML = '<option value="">Select Time</option>';
      if (typeof i18next !== 'undefined' && i18next.t) {
        timeSelect.options[0].textContent = i18next.t("reservation.select_time");
      }
      
      result.data.slots.forEach(slot => {
        const option = document.createElement('option');
        option.value = slot.time;
        option.textContent = slot.time + (slot.available ? ' ✅' : ' ❌');
        option.disabled = !slot.available;
        timeSelect.appendChild(option);
      });

      const existingMsg = document.getElementById('availability-msg');
      if (existingMsg) existingMsg.remove();

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

// ── Theme Toggle & Background Update Logic ──
function updateThemeImages(isLight) {
  const heroImg = document.querySelector("#heroBg img");
  const resImg = document.querySelector("#reservationBg img");
  const lightImg = "./images/hero-restaurant-daytime.png";
  const darkImg = "./images/hero-restaurant.jpg";
  
  if (heroImg) heroImg.src = isLight ? lightImg : darkImg;
  if (resImg) resImg.src = isLight ? lightImg : darkImg;
}

function setupThemeToggle() {
  if (!themeToggle) return;

  let savedTheme = null;
  try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
  const isLightOnLoad = savedTheme === "light";
  
  document.body.classList.toggle("light-theme", isLightOnLoad);
  themeToggle.textContent = isLightOnLoad ? "☀️" : "🌙";
  updateThemeImages(isLightOnLoad);

  themeToggle.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light-theme");
    try { localStorage.setItem("theme", isLight ? "light" : "dark"); } catch (e) {}
    themeToggle.textContent = isLight ? "☀️" : "🌙";
    updateThemeImages(isLight);
  });
}

// ── Scroll effects & Parallax ──
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

function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollPosition = window.scrollY + 150;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      const hasLink = Array.from(navLinks).some((link) => link.dataset.section === sectionId);
      if (!hasLink) return;
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

// ── Menu Tabs and Filtering ──
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
  });
  filterMenuItems();
}

let currentCategory = "all";
let currentDiet = "all";

function filterMenuItems() {
  const menuItems = document.querySelectorAll('.menu-item');
  let visibleCount = 0;
  const searchText = menuSearch ? menuSearch.value.toLowerCase() : "";

  menuItems.forEach((item) => {
    const itemName = item.querySelector('h3')?.textContent.toLowerCase() || "";
    const category = item.dataset.category || "";
    const type = item.dataset.type || item.dataset.diet || "all";

    const matchesSearch = itemName.includes(searchText);
    const matchesFilter = currentCategory === 'all' || category === currentCategory;
    const matchesDiet = currentDiet === 'all' || type === currentDiet;

    if (matchesSearch && matchesFilter && matchesDiet) {
      item.classList.remove('hidden-item');
      item.style.display = "";
      visibleCount++;
    } else {
      item.classList.add('hidden-item');
      item.style.display = "none";
    }
  });

  menuPanels.forEach((panel) => {
    if (panel.classList.contains('active')) {
      let noResults = panel.querySelector('.diet-no-results');
      if (!noResults) {
        noResults = document.createElement('p');
        noResults.className = 'diet-no-results';
        noResults.textContent = 'No items match the selected filter.';
        if (typeof i18next !== 'undefined' && i18next.t) {
          noResults.textContent = i18next.t("menu.diet_no_results");
        }
        const menuItemsContainer = panel.querySelector('.menu-items');
        if (menuItemsContainer) {
          menuItemsContainer.appendChild(noResults);
        }
      }
      noResults.style.display = visibleCount === 0 ? "block" : "none";
      noResults.classList.toggle('visible', visibleCount === 0);
    }
  });
}

// ── Smooth Scroll ──
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

// ── EmailJS Helper formatting ──
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

function addError(input, message) {
  input.style.borderColor = "#c94a4a";
  const error = document.createElement("small");
  error.className = "error-message";
  error.style.color = "#c94a4a";
  error.textContent = message;
  input.parentElement.appendChild(error);
}

// ── Reservation submit ──
async function handleFormSubmit(e) {
  e.preventDefault();

  const inputs = reservationForm.querySelectorAll('input, select, textarea');
  let isValid = true;

  reservationForm.querySelectorAll(".error-message").forEach((error) => error.remove());

  inputs.forEach((input) => {
    const invalid = input.required && !input.value.trim();
    input.style.borderColor = invalid ? "#c94a4a" : "";
    if (invalid) isValid = false;
  });

  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const selectedTableInput = document.getElementById("selected-table");

  if (emailInput && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailInput.value.trim())) {
    addError(emailInput, typeof i18next !== 'undefined' && i18next.t ? i18next.t('reservation.email_error') : "Please enter a valid email address.");
    isValid = false;
  }

  if (phoneInput && phoneInput.value.replace(/\D/g, "").length !== 10) {
    addError(phoneInput, typeof i18next !== 'undefined' && i18next.t ? i18next.t('reservation.phone_error') : "Phone number must contain exactly 10 digits.");
    isValid = false;
  }

  if (selectedTableInput && !selectedTableInput.value) {
    const mapContainer = document.querySelector(".seating-map-container");
    if (mapContainer) {
      addError(mapContainer, typeof i18next !== 'undefined' && i18next.t ? i18next.t('reservation.table_error') : "Please select an available table on the map.");
      isValid = false;
    }
  }

  if (!isValid) return;

  const submitBtn = reservationForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  const dateVal = document.getElementById('date')?.value || document.getElementById('reservation-date')?.value;
  const timeVal = timeSelect?.value;
  const guestsVal = document.getElementById('guests')?.value;
  const requestsVal = document.getElementById('requests')?.value || '';
  const selectedZone = document.getElementById('selected-zone')?.value || 'main';
  const selectedTable = selectedTableInput?.value || '';

  const formData = {
    guest_name: document.getElementById('name')?.value.trim() || '',
    guest_email: emailInput?.value.trim() || '',
    guest_phone: phoneInput?.value.trim() || '',
    guest_count: guestsVal,
    booking_date: formatBookingDate(dateVal),
    booking_time: formatBookingTime(timeVal),
    special_requests: `[Zone: ${selectedZone.toUpperCase()}, Table: ${selectedTable}] ${requestsVal.trim()}`.trim(),
    restaurant_name: 'The Lighthouse',
    restaurant_phone: '(555) 123-4567',
    restaurant_email: 'reservations@thelighthouse.com',
  };

  submitBtn.textContent = 'Booking...';
  submitBtn.disabled = true;

  // Use API if logged in
  if (reservationAPI && reservationAPI.token) {
    try {
      const apiData = {
        date: dateVal,
        time: timeVal,
        guests: guestsVal,
        specialRequests: formData.special_requests
      };
      const result = await reservationAPI.createReservation(apiData);
      if (result.success) {
        showReservationToast('success', `Reservation confirmed for ${selectedTable}! Check your email for details.`);
        addLoyaltyPoints(100, "Table Reservation");
        reservationForm.reset();
        updateAvailableTimes();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }
    } catch (err) {
      console.warn('API reservation failed, trying EmailJS fallback', err);
    }
  }

  // Fallback to EmailJS or Demo mode
  if (EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY' || EMAILJS_CONFIG.publicKey === 'abc123XYZ') {
    await new Promise(r => setTimeout(r, 1200));
    showReservationToast('success', `Thank you, ${formData.guest_name}! We've registered your request for ${formData.guest_count} guest(s) at ${selectedTable} on ${formData.booking_date} at ${formData.booking_time}.`);
    addLoyaltyPoints(100, "Table Reservation");
    reservationForm.reset();
    updateAvailableTimes();
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  } else {
    try {
      await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.guestTemplateId, formData);
      await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.adminTemplateId, formData);
      showReservationToast('success', `Thank you, ${formData.guest_name}! A confirmation for ${selectedTable} has been sent to ${formData.guest_email}.`);
      addLoyaltyPoints(100, "Table Reservation");
      reservationForm.reset();
      updateAvailableTimes();
    } catch (err) {
      console.error('[EmailJS] Error:', err);
      showReservationToast('error', 'We couldn\'t send your confirmation email. Please call us at (555) 123-4567.');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }
}

// ── Auto-scroll indicator ──
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

// ── Auto-scroll stop ──
function stopAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
}

if (heroScroll) {
  heroScroll.addEventListener('click', () => {
    autoScrollInterval ? stopAutoScroll() : startAutoScroll();
  });
}

['mousemove', 'touchstart', 'keydown', 'wheel', 'pointerdown'].forEach((event) => {
  window.addEventListener(event, stopAutoScroll, { passive: true });
});

// ── Reviews submission and validation ──
const STORAGE_KEY = 'lighthouse_reviews';
const pinnedReview = {
  name: 'Rasshi Srivastav',
  rating: 5,
  text: 'reviews.pinned_review_text',
  date: 'reviews.pinned_review_date',
};

function getReviews() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveReviews(reviews) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

function renderReviews() {
  const grid = document.getElementById('reviews-grid');
  if (!grid) return;

  const userReviews = getReviews();
  const activePinned = {
    ...pinnedReview,
    text: typeof i18next !== 'undefined' && i18next.t ? i18next.t(pinnedReview.text) : pinnedReview.text,
    date: typeof i18next !== 'undefined' && i18next.t ? i18next.t(pinnedReview.date) : pinnedReview.date,
  };
  const allReviews = [activePinned, ...userReviews];

  grid.innerHTML = allReviews.map(r => `
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
    </div>
  `).join('');
}

// ── Star rating widget ──
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

function isMeaningfulReview(text) {
  const words = text.trim().split(/\s+/);
  const randomPattern = /^(.)\1+$|^[a-zA-Z]{1,6}$/;
  if (randomPattern.test(text.trim())) return false;
  return words.length >= 3;
}

function isValidName(name) {
  return /^[\p{L}\p{M}\s'-]{3,30}$/u.test(name.trim());
}

function setupReviews() {
  const reviewForm = document.getElementById('review-form');
  const reviewMsg = document.getElementById('review-msg');

  if (reviewForm) {
    reviewForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('review-name').value.trim();
      const reviewText = document.getElementById('review-text').value.trim();

      if (reviewMsg) reviewMsg.style.display = 'block';

      if (!selectedRating) {
        if (reviewMsg) {
          reviewMsg.textContent = typeof i18next !== 'undefined' && i18next.t ? i18next.t('reviews.rating_error') : 'Please select a star rating.';
          reviewMsg.style.color = '#c94a4a';
        }
        return;
      }
      if (!isValidName(name)) {
        if (reviewMsg) {
          reviewMsg.textContent = typeof i18next !== 'undefined' && i18next.t ? i18next.t('reviews.name_error') : 'Name should contain only letters.';
          reviewMsg.style.color = '#c94a4a';
        }
        return;
      }
      if (reviewText.length < 20) {
        if (reviewMsg) {
          reviewMsg.textContent = typeof i18next !== 'undefined' && i18next.t ? i18next.t('reviews.text_length_error') : 'Review must contain at least 20 characters.';
          reviewMsg.style.color = '#c94a4a';
        }
        return;
      }
      if (!isMeaningfulReview(reviewText)) {
        if (reviewMsg) {
          reviewMsg.textContent = typeof i18next !== 'undefined' && i18next.t ? i18next.t('reviews.meaningful_error') : 'Please enter a meaningful review.';
          reviewMsg.style.color = '#c94a4a';
        }
        return;
      }

      const dateStr = new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      });

      const newReview = { id: Date.now(), name, rating: selectedRating, text: reviewText, date: dateStr };
      const reviews = getReviews();
      reviews.unshift(newReview);
      saveReviews(reviews);
      renderReviews();

      reviewForm.reset();
      selectedRating = 0;
      document.getElementById('review-rating').value = 0;
      starBtns.forEach((s) => s.classList.remove('active'));

      addLoyaltyPoints(50, "Review Shared");

      if (reviewMsg) {
        reviewMsg.textContent = typeof i18next !== 'undefined' && i18next.t ? i18next.t('reviews.success_msg') : 'Review submitted successfully!';
        reviewMsg.style.color = '#4a9c6a';
        setTimeout(() => { reviewMsg.style.display = 'none'; }, 3000);
      }
    });
  }
}

// ── Cart and Favorites management ──
function getMenuItemData(item) {
  const title = item.querySelector("h3")?.textContent.trim() || "Menu item";
  const priceText = item.querySelector(".menu-price")?.textContent || "0";
  const price = Number(priceText.replace(/[^\d.]/g, "")) || 0;
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const image = item.querySelector("img")?.getAttribute("src") || "";
  return { id, title, price, image };
}

function setupOrderFeatures() {
  const menuItems = document.querySelectorAll(".menu-item");
  if (!menuItems.length || !orderDock) return;

  menuItems.forEach((item) => {
    const data = getMenuItemData(item);
    item.dataset.itemId = data.id;

    if (item.querySelector(".menu-actions")) return;

    const actions = document.createElement("div");
    actions.className = "menu-actions";
    actions.innerHTML = `
      <button class="menu-action-btn add-cart-btn" type="button" data-id="${data.id}">Add</button>
      <button class="menu-action-btn favorite-btn" type="button" data-id="${data.id}" aria-label="Add ${data.title} to favourites">\u2661</button>
    `;

    item.querySelector(".food-content")?.appendChild(actions);

    actions.querySelector(".add-cart-btn")?.addEventListener("click", () => {
      openCustomizerModal(data, item.dataset.category || "lunch");
    });
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

function toggleFavorite(item) {
  const exists = favorites.some((favorite) => favorite.id === item.id);
  favorites = exists
    ? favorites.filter((favorite) => favorite.id !== item.id)
    : [...favorites, item];
  saveStoredList("lighthouse_favorites", favorites);
  renderOrderState();
}

function updateCartQty(id, delta) {
  const item = cart.find((cartItem) => cartItem.id === id);
  if (!item) return;
  item.qty += delta;
  cart = cart.filter((cartItem) => cartItem.qty > 0);
  saveStoredList("lighthouse_cart", cart);
  renderOrderState();
}

function removeFavorite(id) {
  favorites = favorites.filter((favorite) => favorite.id !== id);
  saveStoredList("lighthouse_favorites", favorites);
  renderOrderState();
}

// Expose handlers globally for inline html events
window.updateCartQty = updateCartQty;
window.removeFavorite = removeFavorite;

function renderOrderState() {
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (cartCountEl) cartCountEl.textContent = totalCount;
  if (cartTotalEl) cartTotalEl.textContent = `\u20B9${totalPrice}`;
  if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;

  if (cartItemsEl) {
    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<p class="order-empty">Your cart is empty.</p>';
    } else {
      cartItemsEl.innerHTML = cart.map(item => `
        <div class="order-item">
          <img src="${item.image}" alt="${item.title}" class="order-item-img">
          <div class="order-item-details">
            <h4>${item.title}</h4>
            ${item.customizations ? `
              <div class="order-item-customizations">
                <span>🌶️ ${item.customizations.spice}</span> | <span>Side: ${item.customizations.side}</span>
                ${item.customizations.toppings && item.customizations.toppings.length ? `<br><span>Extras: ${item.customizations.toppings.join(', ')}</span>` : ''}
              </div>
            ` : ''}
            <p>\u20B9${item.price}</p>
          </div>
          <div class="order-item-qty">
            <button onclick="updateCartQty('${item.id}', -1)">-</button>
            <span>${item.qty}</span>
            <button onclick="updateCartQty('${item.id}', 1)">+</button>
          </div>
        </div>
      `).join('');
    }
  }

  if (favoriteItemsEl) {
    if (favorites.length === 0) {
      favoriteItemsEl.innerHTML = '<p class="order-empty">No favorites added yet.</p>';
    } else {
      favoriteItemsEl.innerHTML = favorites.map(item => `
        <div class="order-item">
          <img src="${item.image}" alt="${item.title}" class="order-item-img">
          <div class="order-item-details">
            <h4>${item.title}</h4>
            <p>\u20B9${item.price}</p>
          </div>
          <button class="menu-action-btn favorite-btn active" style="margin-left:auto;" onclick="removeFavorite('${item.id}')">\u2665</button>
        </div>
      `).join('');
    }
  }

  document.querySelectorAll(".favorite-btn").forEach((btn) => {
    const isFavorite = favorites.some((item) => item.id === btn.dataset.id);
    btn.classList.toggle("active", isFavorite);
    btn.textContent = isFavorite ? "\u2665" : "\u2661";
  });
}

// ── 3D Card flip for touch devices ──
function handleCardFlip() {
  const cards = document.querySelectorAll('.food-card-3d');
  if (isTouchDevice) {
    cards.forEach((card) => {
      card.addEventListener('click', function (e) {
        if (e.target.closest('a') || e.target.closest('button')) return;
        this.classList.toggle('flipped');
      });
    });
  }
}

document.addEventListener('click', function (e) {
  if (!e.target.closest('.food-card-3d')) {
    document.querySelectorAll('.food-card-3d.flipped').forEach((card) => {
      card.classList.remove('flipped');
    });
  }
});

// ── Skeletons ──
function initSkeletonLoaders() {
  const cards = document.querySelectorAll(".food-card");
  cards.forEach((card) => {
    const img = card.querySelector("img");
    if (!img) return;

    img.classList.add("image-hidden");
    const revealImage = () => {
      img.classList.remove("image-hidden");
      img.classList.add("image-loaded");
    };

    if (img.complete && img.naturalWidth > 0) {
      revealImage();
    } else {
      img.addEventListener("load", revealImage, { once: true });
      img.addEventListener("error", revealImage, { once: true });
    }
  });
}

// ── PDF menu download ──
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

const downloadBtn = document.getElementById('downloadMenuPDF');
if (downloadBtn) {
  downloadBtn.addEventListener('click', async () => {
    showLoadingOverlay();
    try {
      await loadHtml2Pdf();
      const element = document.getElementById('menu');
      const opt = {
        margin:       10,
        filename:     'The_Lighthouse_Menu.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#1a1714' },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error('PDF generation error:', e);
      alert('Could not generate PDF. Please try again.');
    } finally {
      hideLoadingOverlay();
    }
  });
}

// ── Display menu category count ──
function displayCategoryCount() {
  const categoryBtns = document.querySelectorAll('.filter-btn:not([data-filter="all"])');
  const countEl = document.getElementById('menu-category-count');
  if (countEl) countEl.textContent = categoryBtns.length + ' Menu Categories Available';
}

// ── Open / Closed badge ──
function updateOpenStatusBadge() {
  const sessions = [
    { name: 'Breakfast', open: [7, 0],  close: [11, 0]  },
    { name: 'Lunch',     open: [11, 30], close: [15, 0]  },
    { name: 'Dinner',    open: [17, 0],  close: [23, 0]  },
    { name: 'Bar',       open: [11, 0],  close: [24, 0]  },
  ];

  function getOpenSession() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const mins = h * 60 + m;
    return sessions.find(s => {
      const openMins  = s.open[0]  * 60 + s.open[1];
      const closeMins = s.close[0] * 60 + s.close[1];
      return mins >= openMins && mins < closeMins;
    }) || null;
  }

  function render() {
    const badge = document.getElementById('open-status-badge');
    if (!badge) return;
    const session = getOpenSession();
    if (session) {
      badge.className = 'status-badge status-badge--open';
      badge.textContent = `Open — ${session.name}`;
      if (typeof i18next !== 'undefined' && i18next.t) {
        badge.textContent = `${i18next.t('location.open') || 'Open'} — ${i18next.t('location.' + session.name.toLowerCase()) || session.name}`;
      }
    } else {
      badge.className = 'status-badge status-badge--closed';
      badge.textContent = 'Closed';
      if (typeof i18next !== 'undefined' && i18next.t) {
        badge.textContent = i18next.t('location.closed') || 'Closed';
      }
    }
  }

  render();
  setInterval(render, 60000);
}

// ── Translate UI Content ──
function updateContent() {
  if (typeof i18next === 'undefined' || !i18next.t) return;
  
  document.querySelectorAll("[data-i18n]").forEach((elem) => {
    const key = elem.getAttribute("data-i18n");
    elem.textContent = i18next.t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((elem) => {
    const key = elem.getAttribute("data-i18n-placeholder");
    elem.setAttribute("placeholder", i18next.t(key));
  });

  document.querySelectorAll("[data-i18n-title]").forEach((elem) => {
    const key = elem.getAttribute("data-i18n-title");
    elem.setAttribute("title", i18next.t(key));
  });

  const noResults = document.querySelector(".no-results");
  if (noResults) {
    noResults.textContent = i18next.t('menu.no_results');
  }

  const dietNoResults = document.querySelectorAll(".diet-no-results");
  dietNoResults.forEach((el) => {
    el.textContent = i18next.t('menu.diet_no_results');
  });

  renderReviews();
}

// ── Initialise page ──
document.addEventListener('DOMContentLoaded', () => {
  handleScroll();
  setReservationDateRange();
  updateAvailableTimes();
  setupThemeToggle();
  setupIntersectionObserver();
  setupAutoScroll();
  setupReviews();
  setupOrderFeatures();
  handleCardFlip();
  initSkeletonLoaders();
  displayCategoryCount();
  updateOpenStatusBadge();
  setupSeatingMap();
  setupGiftCardCustomizer();
  setupVirtualSommelier();
  setupLoyaltyClub();

  if (typeof i18next !== 'undefined') {
    i18next
      .use(i18nextHttpBackend)
      .use(i18nextBrowserLanguageDetector)
      .init({
        fallbackLng: 'en',
        supportedLngs: ['en', 'hi', 'gu'],
        load: 'languageOnly',
        backend: {
          loadPath: './locales/{{lng}}/translation.json'
        },
        detection: {
          order: ['localStorage', 'navigator'],
          caches: ['localStorage']
        }
      }, function (err, t) {
        if (err) return console.error(err);

        const activeLang = i18next.resolvedLanguage || 'en';
        const langSelector = document.getElementById('languageSelector');
        if (langSelector) {
          langSelector.value = activeLang;
          langSelector.addEventListener('change', (e) => {
            i18next.changeLanguage(e.target.value, (err, t) => {
              if (err) return console.error(err);
              updateContent();
            });
          });
        }
        updateContent();
      });
  } else {
    renderReviews();
  }
});

// Event bindings
window.addEventListener('scroll', handleScroll, { passive: true });
if (reservationForm) {
  reservationForm.addEventListener('submit', handleFormSubmit);
}
if (dateInput) {
  dateInput.addEventListener('change', updateAvailableTimes);
}
if (navToggle) {
  navToggle.addEventListener('click', toggleMobileMenu);
}
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) closeMobileMenu();
});

navLinks.forEach((link) => link.addEventListener('click', smoothScroll));
document.querySelectorAll('.nav-cta, .nav-cta-mobile, .hero-buttons a').forEach((link) => {
  link.addEventListener('click', smoothScroll);
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
    currentDiet = btn.dataset.diet || btn.dataset.type || "all";
    filterMenuItems();
  });
});

if (cuisineDropdown) {
  cuisineDropdown.addEventListener("change", filterMenuItems);
}
if (menuSearch) {
  menuSearch.addEventListener("input", filterMenuItems);
}

// Automatically update copyright year
const currentYear = document.getElementById("current-year");
if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

// =============================================
// Feature 1: Seating Zone Map Selector
// =============================================
function setupSeatingMap() {
  const zoneCards = document.querySelectorAll(".zone-card");
  const seatingMap = document.getElementById("seating-map");
  const selectedZoneInput = document.getElementById("selected-zone");
  const selectedTableInput = document.getElementById("selected-table");

  if (!zoneCards.length || !seatingMap) return;

  function renderSeatingMap() {
    const zone = selectedZoneInput.value;
    const dateVal = dateInput?.value || "today";
    const timeVal = timeSelect?.value || "18:00";
    
    seatingMap.innerHTML = "";
    selectedTableInput.value = "";

    for (let t = 1; t <= 10; t++) {
      const tableBtn = document.createElement("button");
      tableBtn.type = "button";
      tableBtn.className = "seating-table";
      
      let capacity = 2;
      if (t % 3 === 0) capacity = 4;
      else if (t === 10) capacity = 6;

      tableBtn.innerHTML = `T${t} <span>${capacity} Seats</span>`;
      
      const seed = dateVal.replace(/-/g, "") + timeVal.replace(/:/g, "") + zone + t;
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
      }
      const isReserved = Math.abs(hash) % 3 === 0;

      if (isReserved) {
        tableBtn.classList.add("reserved");
        tableBtn.disabled = true;
      } else {
        tableBtn.classList.add("available");
        tableBtn.addEventListener("click", () => {
          document.querySelectorAll(".seating-table").forEach(btn => btn.classList.remove("selected"));
          tableBtn.classList.add("selected");
          selectedTableInput.value = `Table ${t} (${zone.toUpperCase()})`;
        });
      }

      seatingMap.appendChild(tableBtn);
    }
  }

  zoneCards.forEach(card => {
    card.addEventListener("click", () => {
      zoneCards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      selectedZoneInput.value = card.dataset.zone;
      renderSeatingMap();
    });
  });

  dateInput?.addEventListener("change", renderSeatingMap);
  timeSelect?.addEventListener("change", renderSeatingMap);

  if (reservationForm) {
    reservationForm.addEventListener("reset", () => {
      zoneCards.forEach(c => c.classList.remove("active"));
      const mainZoneCard = document.querySelector('.zone-card[data-zone="main"]');
      if (mainZoneCard) mainZoneCard.classList.add("active");
      selectedZoneInput.value = "main";
      setTimeout(renderSeatingMap, 0);
    });
  }

  renderSeatingMap();
}

// =============================================
// Feature 2: Luxury Dining Gift Cards
// =============================================
function setupGiftCardCustomizer() {
  const valueButtons = document.querySelectorAll(".value-btn");
  const customValueWrapper = document.querySelector(".custom-value-input-wrapper");
  const customValueInput = document.getElementById("custom-giftcard-value");
  const selectedValueInput = document.getElementById("selected-giftcard-value");
  const valueDisplay = document.querySelector(".giftcard-card-value-display");

  const themeButtons = document.querySelectorAll(".theme-option-btn");
  const selectedThemeInput = document.getElementById("selected-giftcard-theme");
  const cardPreview = document.getElementById("giftcard-card-preview");

  const recipientInput = document.getElementById("giftcard-recipient");
  const senderInput = document.getElementById("giftcard-sender");
  const messageInput = document.getElementById("giftcard-message");

  const previewTo = document.getElementById("preview-to");
  const previewFrom = document.getElementById("preview-from");
  const previewMessage = document.getElementById("preview-message");

  const giftcardForm = document.getElementById("giftcard-form");
  const successPanel = document.getElementById("voucher-success-panel");
  const downloadBtn = document.getElementById("download-voucher-btn");

  if (!giftcardForm) return;

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Handle Value Select
  valueButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      valueButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const val = btn.dataset.value;
      if (val === "custom") {
        customValueWrapper.style.display = "block";
        selectedValueInput.value = customValueInput.value || 0;
        valueDisplay.textContent = formatCurrency(customValueInput.value || 0);
      } else {
        customValueWrapper.style.display = "none";
        selectedValueInput.value = val;
        valueDisplay.textContent = formatCurrency(val);
      }
    });
  });

  customValueInput?.addEventListener("input", () => {
    const val = parseInt(customValueInput.value) || 0;
    selectedValueInput.value = val;
    valueDisplay.textContent = formatCurrency(val);
  });

  // Handle Theme Select
  themeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      themeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const theme = btn.dataset.theme;
      selectedThemeInput.value = theme;
      
      cardPreview.className = `giftcard-card ${theme}`;
    });
  });

  // Handle Input Changes
  recipientInput?.addEventListener("input", () => {
    previewTo.textContent = recipientInput.value || "Recipient Name";
  });

  senderInput?.addEventListener("input", () => {
    previewFrom.textContent = senderInput.value || "Your Name";
  });

  messageInput?.addEventListener("input", () => {
    previewMessage.textContent = messageInput.value ? `"${messageInput.value}"` : '"Write a warm message..."';
  });

  // Handle Form Submit (Simulation)
  giftcardForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = giftcardForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    const value = parseInt(selectedValueInput.value) || 0;

    if (value < 1000) {
      alert("Minimum voucher value is ₹1,000");
      return;
    }

    submitBtn.textContent = "Processing Luxury Gift Card...";
    submitBtn.disabled = true;

    await new Promise(r => setTimeout(r, 1500));

    // Generate random code
    const randCode = "LH-" + Math.floor(1000 + Math.random() * 9000) + "-" + Math.floor(1000 + Math.random() * 9000);
    const codeSpan = cardPreview.querySelector(".giftcard-card-footer .code");
    if (codeSpan) codeSpan.textContent = randCode;

    // Show Success Panel
    successPanel.style.display = "block";
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

    // Show toast
    showReservationToast("success", `Voucher for ${formatCurrency(value)} successfully customized and generated!`);
  });

  downloadBtn?.addEventListener("click", () => {
    window.print();
  });
}

// =============================================
// Feature 3: Menu Item Customizer
// =============================================
let currentCustomizingItem = null;

function openCustomizerModal(item, category) {
  currentCustomizingItem = item;
  
  const modal = document.getElementById("customizer-modal");
  const title = document.getElementById("customizer-title");
  const basePriceEl = document.getElementById("customizer-base-price");
  const form = document.getElementById("customizer-form");

  if (!modal || !form) return;

  title.textContent = `Customize ${item.title}`;
  basePriceEl.textContent = `Base Price: ₹${item.price}`;

  const spiceGroup = document.getElementById("customizer-spice-group");
  const sidesGroup = document.getElementById("customizer-sides-group");
  const toppingsGroup = document.getElementById("customizer-toppings-group");

  // Reset form elements
  form.reset();

  // Dynamic configuration based on Category
  if (category === "drinks" || category === "desserts") {
    // Customize label and inputs for Sweetness instead of Spice
    spiceGroup.style.display = "block";
    spiceGroup.querySelector(".option-label").textContent = "Sweetness Level";
    const spanElements = spiceGroup.querySelectorAll(".customizer-radio-label span");
    if (spanElements.length >= 4) {
      spanElements[0].textContent = "No Sugar";
      spanElements[1].textContent = "Less Sweet";
      spanElements[2].textContent = "Regular";
      spanElements[3].textContent = "Extra Sweet";
    }
    // Hide side swapping for drinks/desserts
    sidesGroup.style.display = "none";
  } else {
    // Restore Spice level
    spiceGroup.style.display = "block";
    spiceGroup.querySelector(".option-label").textContent = "Spice Level";
    const spanElements = spiceGroup.querySelectorAll(".customizer-radio-label span");
    if (spanElements.length >= 4) {
      spanElements[0].textContent = "Mild";
      spanElements[1].textContent = "Medium";
      spanElements[2].textContent = "Hot";
      spanElements[3].textContent = "Chef's Special (Extra Hot)";
    }
    // Show side swapping
    sidesGroup.style.display = "block";
  }

  // Update total price display function
  function calculateTotal() {
    let total = item.price;
    const checkedToppings = form.querySelectorAll(".topping-cb:checked");
    checkedToppings.forEach(cb => {
      total += parseInt(cb.dataset.price) || 0;
    });
    document.getElementById("customizer-total-val").textContent = `₹${total}`;
  }

  // Bind change listeners for real-time recalculation
  form.querySelectorAll("input, select").forEach(input => {
    input.addEventListener("change", calculateTotal);
  });

  calculateTotal();

  // Close handler
  const closeBtn = document.getElementById("customizer-close");
  const closeEvent = () => {
    modal.style.display = "none";
    closeBtn.removeEventListener("click", closeEvent);
  };
  closeBtn.addEventListener("click", closeEvent);

  // Show Modal
  modal.style.display = "flex";

  // Form Submit handler
  const submitEvent = (e) => {
    e.preventDefault();
    form.removeEventListener("submit", submitEvent);

    // Read selected choices
    const spiceOrSweetKey = category === "drinks" || category === "desserts" ? "Sweetness" : "Spice";
    const selectedSpiceVal = form.querySelector('input[name="spice-level"]:checked')?.value || "Regular/Mild";
    const selectedSideVal = sidesGroup.style.display !== "none" ? document.getElementById("customizer-side-select").value : "None";
    
    const selectedToppings = [];
    const checkedToppings = form.querySelectorAll(".topping-cb:checked");
    let extraPrice = 0;
    checkedToppings.forEach(cb => {
      selectedToppings.push(cb.value);
      extraPrice += parseInt(cb.dataset.price) || 0;
    });

    const calculatedPrice = item.price + extraPrice;
    
    // Generate unique ID based on customization to separate items
    const toppingsSlug = selectedToppings.length ? selectedToppings.join("-") : "none";
    const customId = `${item.id}-${selectedSpiceVal.toLowerCase().replace(/\s+/g, "-")}-${selectedSideVal.toLowerCase().replace(/\s+/g, "-")}-${toppingsSlug.toLowerCase().replace(/\s+/g, "-")}`;

    const customizedItem = {
      id: customId,
      baseId: item.id,
      title: item.title,
      price: calculatedPrice,
      image: item.image,
      customizations: {
        spice: `${spiceOrSweetKey}: ${selectedSpiceVal}`,
        side: selectedSideVal,
        toppings: selectedToppings
      }
    };

    addToCart(customizedItem);
    modal.style.display = "none";
  };

  form.addEventListener("submit", submitEvent);
}

// =============================================
// Feature 4: Virtual Sommelier
// =============================================
function setupVirtualSommelier() {
  const selectEl = document.getElementById("sommelier-main-select");
  const resultEl = document.getElementById("sommelier-result");

  if (!selectEl || !resultEl) return;

  // Pairing database
  const pairings = {
    "paneer-butter-masala": {
      name: "Saffron Mango Lassi (Premium)",
      desc: "Cooling traditional lassi blended with premium Alphonso mango pulp and pure Kashmiri saffron threads.",
      notes: "Sweetness and milk fat balance the richness of paneer gravy perfectly.",
      price: 180,
      image: "./images/drinks/mango-lassi.jpg"
    },
    "chicken-keema-dosa": {
      name: "Coastal Craft IPA Beer",
      desc: "Local citrus-forward craft India Pale Ale with crisp aromatic hops.",
      notes: "Bitterness contrasts beautifully with spiced minced chicken keema masala.",
      price: 250,
      image: "./images/drinks/ipa-beer.jpg"
    },
    "masala-dosa": {
      name: "Traditional South Indian Filter Coffee",
      desc: "Premium chicory blend coffee brewed in brass filter, served with frothy milk.",
      notes: "Deep roasted chicory notes complement the crispy lentil batter and potato spice.",
      price: 110,
      image: "./images/drinks/filter-coffee.jpg"
    },
    "idli-sambar": {
      name: "Fresh Coconut Lime Water",
      desc: "Chilled tender coconut water with a squeeze of fresh Key lime and mint.",
      notes: "Light and hydrating, matches the clean steamed texture of idli.",
      price: 90,
      image: "./images/drinks/coconut-lime.jpg"
    }
  };

  const defaultPairing = {
    name: "The Lighthouse Reserve Shiraz",
    desc: "Premium oak-aged red wine with notes of dark plum, vanilla, and peppercorn.",
    notes: "Deep fruit complexity that complements rich tandoori dishes and grilled entrees.",
    price: 490,
    image: "./images/drinks/reserve-wine.jpg"
  };

  // Populate options dynamically from main menu items
  const menuItems = document.querySelectorAll(".menu-item");
  const addedIds = new Set();

  menuItems.forEach(item => {
    const title = item.querySelector("h3")?.textContent.trim() || "";
    const category = item.dataset.category || "";
    if (!title || category === "drinks" || category === "desserts") return;

    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (addedIds.has(id)) return;
    addedIds.add(id);

    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = title;
    selectEl.appendChild(opt);
  });

  // Handle Select Change
  selectEl.addEventListener("change", () => {
    const selectedId = selectEl.value;
    const pairing = pairings[selectedId] || defaultPairing;

    resultEl.innerHTML = `
      <div class="sommelier-pairing-card">
        <div class="pairing-info">
          <span class="pairing-label">Perfect Pairing Recommendation</span>
          <h4 id="pairing-name">${pairing.name}</h4>
          <p id="pairing-desc">${pairing.desc}</p>
          <div class="tasting-notes">
            <strong>Tasting Notes:</strong> <span id="pairing-notes">${pairing.notes}</span>
          </div>
          <div class="pairing-price-row">
            <span class="pairing-price" id="pairing-price">₹${pairing.price}</span>
            <button type="button" class="btn btn-primary btn-sm" id="sommelier-add-btn">Add Pairing to Cart</button>
          </div>
        </div>
      </div>
    `;

    resultEl.style.display = "block";

    // Bind Add to Cart
    document.getElementById("sommelier-add-btn")?.addEventListener("click", () => {
      const drinkItem = {
        id: `pairing-${pairing.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        title: pairing.name,
        price: pairing.price,
        image: pairing.image || "./images/drinks.jpg"
      };
      addToCart(drinkItem);
      showReservationToast("success", `Added ${pairing.name} pairing to your cart!`);
    });
  });
}

// =============================================
// Feature 5: Guest Loyalty Rewards & Referral
// =============================================
function setupLoyaltyClub() {
  const authCard = document.getElementById("loyalty-auth-card");
  const dashboardCard = document.getElementById("loyalty-dashboard-card");
  const authForm = document.getElementById("loyalty-auth-form");
  const logoutBtn = document.getElementById("loyalty-logout-btn");
  const nameInput = document.getElementById("loyalty-name");
  const emailInput = document.getElementById("loyalty-email");

  const displayNameEl = document.getElementById("member-display-name");
  const pointsValEl = document.getElementById("member-points-val");
  const activeCodesContainer = document.getElementById("active-codes-container");
  const vouchersList = document.getElementById("vouchers-list");
  const redeemButtons = document.querySelectorAll(".redeem-btn");

  if (!authForm || !dashboardCard) return;

  function getMemberDb() {
    return JSON.parse(localStorage.getItem("lighthouse_loyalty_db") || "{}");
  }

  function saveMemberDb(db) {
    localStorage.setItem("lighthouse_loyalty_db", JSON.stringify(db));
  }

  function getLoggedInMember() {
    return JSON.parse(localStorage.getItem("lighthouse_loyalty_member"));
  }

  function setLoggedInMember(member) {
    localStorage.setItem("lighthouse_loyalty_member", JSON.stringify(member));
    // update db too
    const db = getMemberDb();
    db[member.email] = member;
    saveMemberDb(db);
  }

  function renderDashboard() {
    const member = getLoggedInMember();
    if (!member) {
      authCard.style.display = "block";
      dashboardCard.style.display = "none";
      return;
    }

    authCard.style.display = "none";
    dashboardCard.style.display = "block";

    displayNameEl.textContent = member.name;
    pointsValEl.textContent = member.points;

    // Render Vouchers
    if (member.vouchers && member.vouchers.length > 0) {
      activeCodesContainer.style.display = "block";
      vouchersList.innerHTML = member.vouchers.map(v => `
        <div class="voucher-code-item">
          <div>
            <strong>${v.reward}</strong> Code:
          </div>
          <span>${v.code}</span>
        </div>
      `).join("");
    } else {
      activeCodesContainer.style.display = "none";
    }
  }

  // Handle Login / Registration
  authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = emailInput.value.trim().toLowerCase();
    const name = nameInput.value.trim();

    const db = getMemberDb();
    let member = db[email];

    if (member) {
      // Existing member login
      showReservationToast("success", `Welcome back, ${member.name}!`);
    } else {
      // New registration - give a welcome bonus of 100 points!
      member = {
        email,
        name: name || "Valued Club Member",
        points: 100,
        vouchers: []
      };
      showReservationToast("success", `Thank you for joining the Club, ${member.name}! You have been awarded 100 Welcome Points!`);
    }

    setLoggedInMember(member);
    renderDashboard();
  });

  // Handle Logout
  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("lighthouse_loyalty_member");
    renderDashboard();
  });

  // Handle Rewards Redemption
  redeemButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const cost = parseInt(btn.dataset.cost) || 0;
      const reward = btn.dataset.reward;
      const baseCode = btn.dataset.code;

      const member = getLoggedInMember();
      if (!member) {
        showReservationToast("error", "Please sign in to redeem rewards!");
        return;
      }

      if (member.points < cost) {
        showReservationToast("error", `Insufficient points! You need ${cost} points to redeem this reward.`);
        return;
      }

      // Deduct points and generate unique reward code
      member.points -= cost;
      const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
      const generatedCode = `${baseCode}-${uniqueSuffix}`;
      
      if (!member.vouchers) member.vouchers = [];
      member.vouchers.push({
        reward,
        code: generatedCode
      });

      setLoggedInMember(member);
      renderDashboard();
      showReservationToast("success", `Successfully redeemed ${reward}! Use code ${generatedCode} at checkout.`);
    });
  });

  // Initial render
  renderDashboard();
}

function addLoyaltyPoints(points, reason) {
  const memberStr = localStorage.getItem("lighthouse_loyalty_member");
  if (!memberStr) return;
  try {
    const member = JSON.parse(memberStr);
    member.points += points;
    
    // Save state
    localStorage.setItem("lighthouse_loyalty_member", JSON.stringify(member));
    const db = JSON.parse(localStorage.getItem("lighthouse_loyalty_db") || "{}");
    db[member.email] = member;
    localStorage.setItem("lighthouse_loyalty_db", JSON.stringify(db));

    // Update UI if present
    const pointsValEl = document.getElementById("member-points-val");
    if (pointsValEl) pointsValEl.textContent = member.points;
    
    showReservationToast("success", `🎉 Club Bonus: +${points} Points! (${reason})`);
  } catch (e) {
    console.error(e);
  }
}
