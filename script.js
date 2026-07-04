// =============================================
// DOM ELEMENTS & GLOBAL VARIABLES
// =============================================
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-link");
const heroBg = document.getElementById("heroBg");
const reservationBg = document.getElementById("reservationBg");
const reservationForm = document.getElementById("reservationForm");
const dateInput = document.getElementById("reservation-date") || document.getElementById("date");
const timeSelect = document.getElementById("time");
const guestsSelect = document.getElementById("guests");
const themeToggle = document.getElementById("themeToggle");
const menuSearch = document.getElementById("menu-search");
const backToTopBtn = document.getElementById("backToTop");

const filterBtns = document.querySelectorAll(".filter-btn");
const menuTabs = document.querySelectorAll(".menu-tab");
const menuPanels = document.querySelectorAll(".menu-panel");
const dietBtns = document.querySelectorAll(".diet-btn");
const cuisineDropdown = document.getElementById("cuisine-filter");
const heroScroll = document.querySelector(".hero-scroll");
const currentYear = document.getElementById("current-year");

// Order & Features globals
const orderDock = document.querySelector(".order-dock") || document.getElementById("orderDock");
const orderToggle = document.querySelector(".order-toggle") || document.getElementById("orderToggle");
const orderTabs = document.querySelectorAll(".order-tab");
const orderViews = document.querySelectorAll(".order-view");
const cartCountEl = document.querySelector(".cart-count") || document.getElementById("cartCount");
const cartTotalEl = document.querySelector(".cart-total") || document.getElementById("cartTotal");
const checkoutBtn = document.querySelector(".order-checkout") || document.getElementById("checkoutBtn");
const cartItemsEl = document.getElementById("cartItems");
const favoriteItemsEl = document.getElementById("favoriteItems");

const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

// Initial state
let cart = [];
let favorites = [];
let autoScrollInterval = null;

// =============================================
// UTILITIES
// =============================================
function saveStoredList(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("Saving to storage failed:", e);
  }
}

function getStoredList(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    console.warn("Storage access failed:", e);
    return [];
  }
}

function updateDeviceHints() {
  const scrollHintMouse = document.querySelector('.scroll-hint-mouse');
  const scrollHintTouch = document.querySelector('.scroll-hint-touch');
  if (scrollHintMouse && scrollHintTouch) {
    scrollHintMouse.style.display = isTouchDevice ? 'none' : '';
    scrollHintTouch.style.display = isTouchDevice ? '' : 'none';
  }
}

// =============================================
// EMAILJS CONFIGURATION
// =============================================
const EMAILJS_CONFIG = {
  publicKey: 'abc123XYZ',
  serviceId: 'service_abc1234',
  guestTemplateId: 'template_guest01',
  adminTemplateId: 'template_admin02',
};

if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY') {
  emailjs.init(EMAILJS_CONFIG.publicKey);
}

// =============================================
// NAVIGATION & SCROLLING
// =============================================
function updateActiveNavLink() {
  const scrollPosition = window.scrollY + 150;

  document.querySelectorAll("section[id]").forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.id;

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

function smoothScroll(e) {
  const targetId = this.getAttribute('href');
  if (!targetId || targetId.startsWith('http') || targetId === '#') return;
  const target = document.querySelector(targetId);
  if (!target) return;

  e.preventDefault();
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({
    top: target.offsetTop - 80,
    behavior: prefersReduced ? "auto" : "smooth"
  });
  closeMobileMenu();
}

function toggleMobileMenu() {
  if (!navToggle || !navMenu) return;
  navToggle.classList.toggle("active");
  navMenu.classList.toggle("active");
  document.body.style.overflow = navMenu.classList.contains("active") ? "hidden" : "";
}

function closeMobileMenu() {
  if (!navToggle || !navMenu) return;
  navToggle.classList.remove("active");
  navMenu.classList.remove("active");
  document.body.style.overflow = "";
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
      window.scrollBy({ top: 2, behavior: "instant" });
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

// =============================================
// THEME TOGGLE
// =============================================
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
  themeToggle.textContent = isLightOnLoad ? "\u2600" : "\u263E";
  updateThemeImages(isLightOnLoad);

  themeToggle.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light-theme");
    try { localStorage.setItem("theme", isLight ? "light" : "dark"); } catch (e) {}
    themeToggle.textContent = isLight ? "\u2600" : "\u263E";
    updateThemeImages(isLight);
  });
}

// ── Scroll effects & Parallax ──
function handleScroll() {
  const currentScroll = window.scrollY;

  // Scroll Progress Bar Update
  const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = totalHeight > 0 ? (currentScroll / totalHeight) * 100 : 0;
  const progressBar = document.getElementById("scrollProgressBar");
  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }

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
// =============================================
// MENU FILTERING & TABS
// =============================================
function switchMenuTab(e) {
  const targetTab = e.target.dataset.tab;
  if (!targetTab) return;

  menuTabs.forEach((tab) => tab.classList.remove('active'));
  e.target.classList.add('active');

  menuPanels.forEach((panel) => {
    panel.classList.remove('active');
    if (panel.id === targetTab) {
      panel.classList.add('active');
    }
  });
  
  filterMenuItems(getActiveFilter(), menuSearch ? menuSearch.value : '', getActiveDiet());
}

function getActiveFilter() {
  const activeBtn = document.querySelector('.filter-btn.active');
  return activeBtn ? activeBtn.dataset.filter : 'all';
}

function getActiveDiet() {
  const activeBtn = document.querySelector('.diet-btn.active');
  return activeBtn ? (activeBtn.dataset.type || activeBtn.dataset.diet) : 'all';
}

function filterMenuItems(filter = 'all', searchText = '', diet = 'all') {
  const menuItems = document.querySelectorAll('.menu-item');
  let visibleCount = 0;
  const searchText = menuSearch ? menuSearch.value.trim().toLowerCase() : "";

  menuItems.forEach((item) => {
    const h3 = item.querySelector('h3');
    const itemName = h3 ? h3.textContent.toLowerCase() : "";
    const category = item.dataset.category || "";
    const type = item.dataset.type || item.dataset.diet || "all";
  const searchLower = searchText.toLowerCase();

  menuItems.forEach((item) => {
    const itemName = (item.querySelector('h3')?.textContent || "").toLowerCase();
    const category = item.dataset.category || 'all';
    const itemDiet = item.dataset.diet || item.dataset.type || 'all';

    const matchesSearch = itemName.includes(searchLower);
    const matchesFilter = filter === 'all' || category === filter;
    const matchesDiet = diet === 'all' || itemDiet === diet;

    if (h3) {
      if (!h3.dataset.original) {
        h3.dataset.original = h3.innerHTML;
      }
      const originalText = h3.dataset.original;
      if (searchText) {
        const regex = new RegExp(`(${searchText})`, 'gi');
        h3.innerHTML = originalText.replace(regex, '<span class="search-highlight">$1</span>');
      } else {
        h3.innerHTML = originalText;
      }
    }

    // Use both class manipulation (from HEAD) and display toggle (from main) for robustness
    if (matchesSearch && matchesFilter && matchesDiet) {
      item.classList.remove('hidden-item', 'diet-hidden');
      item.style.display = "";
      visibleCount++;
    } else {
      item.classList.add('hidden-item', 'diet-hidden');
      item.style.display = "none";
    }
  });

  menuPanels.forEach((panel) => {
    if (panel.classList.contains('active')) {
      let noResultsMsg = panel.querySelector('.diet-no-results') || panel.querySelector('.no-results');
      if (!noResultsMsg) {
        noResultsMsg = document.createElement('p');
        noResultsMsg.className = 'diet-no-results';
        noResultsMsg.textContent = (typeof i18next !== 'undefined' && i18next.t) 
          ? i18next.t("menu.diet_no_results") 
          : 'No items match the selected filter.';
        
        const menuItemsContainer = panel.querySelector('.menu-items');
        if (menuItemsContainer) {
          menuItemsContainer.appendChild(noResultsMsg);
        } else {
          panel.appendChild(noResultsMsg);
        }
      }
      
      if (visibleCount === 0) {
        noResultsMsg.classList.add('visible');
        noResultsMsg.style.display = 'block';
      } else {
        noResultsMsg.classList.remove('visible');
        noResultsMsg.style.display = 'none';
      }
    }
  });
}

function displayCategoryCount() {
  const categoryBtns = document.querySelectorAll('.filter-btn:not([data-filter="all"])');
  const countEl = document.getElementById('menu-category-count');
  if (countEl) countEl.textContent = categoryBtns.length + ' Menu Categories Available';
}

// =============================================
// RESERVATION API & SYSTEM
// =============================================
function setReservationDateRange() {
  if (!dateInput) return;
  const tomorrow = new Date(Date.now() + 86400000);
  const maxDate = new Date(Date.now() + 90 * 86400000);
  dateInput.min = tomorrow.toISOString().split('T')[0];
  dateInput.max = maxDate.toISOString().split('T')[0];
}

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

class ReservationAPI {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    this.token = localStorage.getItem('token');
  }
  setToken(token) {
    this.token = token;
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }
  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    return headers;
  }
  async getAvailableSlots(date, guests) {
    try {
      const response = await fetch(`${this.baseURL}/reservations/slots?date=${date}&guests=${guests}`, { headers: this.getHeaders() });
      return response.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  async createReservation(data) {
    try {
      const response = await fetch(`${this.baseURL}/reservations`, { method: 'POST', headers: this.getHeaders(), body: JSON.stringify(data) });
      return response.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}
const reservationAPI = new ReservationAPI();

async function updateAvailableSlots() {
  if (!dateInput || !timeSelect) return;
  const date = dateInput.value;
  const guests = guestsSelect ? guestsSelect.value : 2;

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

function updateAvailableTimes() {
  if (!dateInput || !timeSelect) return;

  const selectedDate = dateInput.value;
  const guests = guestsSelect ? guestsSelect.value : "2";
  
  if(!selectedDate) return;

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentHours = now.getHours();
  const currentMins = now.getMinutes();

  Array.from(timeSelect.options).forEach(opt => {
    if(!opt.value) return;
    
    const [optHours, optMins] = opt.value.split(':').map(Number);
    let isPast = false;

    if (selectedDate === todayStr) {
      if (optHours < currentHours || (optHours === currentHours && optMins <= currentMins + 30)) {
        isPast = true;
      }
    }
    
    const tables = getAvailableTables(selectedDate, opt.value, guests);
    if (isPast || tables === 0) {
      opt.disabled = true;
      opt.textContent = formatBookingTime(opt.value) + " (Unavailable)";
      if (isPast && opt.selected) timeSelect.value = '';
    } else {
      opt.disabled = false;
      opt.textContent = formatBookingTime(opt.value);
    }
  });

  if (typeof reservationAPI !== 'undefined' && reservationAPI.token) {
    updateAvailableSlots();
  }
}

function formatBookingDate(dateStr) {
  if (!dateStr) return dateStr;
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatBookingTime(timeStr) {
  if (!timeStr || !timeStr.includes(':')) return timeStr;
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function addError(input, message) {
  input.style.borderColor = "#c94a4a";
  const error = document.createElement("small");
  error.className = "error-message";
  error.style.color = "#c94a4a";
  error.textContent = message;
  input.parentElement.appendChild(error);
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

async function handleFormSubmit(e) {
  e.preventDefault();

  let isValid = true;
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const selectedTableInput = document.getElementById("selected-table");
  const submitBtn = reservationForm.querySelector('button[type="submit"]');

  reservationForm.querySelectorAll(".error-message").forEach((error) => error.remove());

  reservationForm.querySelectorAll("input, select, textarea").forEach((input) => {
    const invalid = input.required && !input.value.trim();
    input.style.borderColor = invalid ? "#c94a4a" : "";
    if (invalid) isValid = false;
  });

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

  const originalText = submitBtn.textContent;
  const dateVal = dateInput?.value;
  const timeVal = timeSelect?.value;
  const guestsVal = guestsSelect?.value || '2';
  const requestsVal = document.getElementById('requests')?.value || 'None';
  const selectedZone = document.getElementById('selected-zone')?.value || 'main';
  const selectedTable = selectedTableInput?.value || '';

  const structuredRequests = selectedTable ? `[Zone: ${selectedZone.toUpperCase()}, Table: ${selectedTable}] ${requestsVal}`.trim() : requestsVal.trim();

  const formData = {
    guest_name: document.getElementById('name').value.trim(),
    guest_email: emailInput.value.trim(),
    guest_phone: phoneInput ? phoneInput.value.trim() : document.getElementById('phone').value.trim(),
    guest_count: guestsVal,
    booking_date: formatBookingDate(dateVal),
    booking_time: formatBookingTime(timeVal),
    special_requests: structuredRequests,
    restaurant_name: 'The Lighthouse',
    restaurant_phone: '(555) 123-4567',
    restaurant_email: 'reservations@thelighthouse.com',
  };

  submitBtn.textContent = 'Sending…';
  submitBtn.disabled = true;

  // 1. API Route
  if (reservationAPI && reservationAPI.token) {
    try {
      const apiData = { date: dateVal, time: timeVal, guests: guestsVal, specialRequests: structuredRequests };
      const result = await reservationAPI.createReservation(apiData);
      if (result.success) {
        showReservationToast('success', `Reservation confirmed for ${selectedTable}! Check your email for details.`);
        addLoyaltyPoints(100, "Table Reservation");
        showDigitalTicket(formData.guest_name, formData.booking_date, formData.booking_time, formData.guest_count, selectedTable);
        showReservationSuccessModal(dateVal, timeVal, guestsVal);
        showReservationToast('success', `Reservation confirmed for ${selectedTable || formData.guest_count + ' guest(s)'}! Check your email for details.`);
        if (typeof addLoyaltyPoints === 'function') addLoyaltyPoints(100, "Table Reservation");
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

  // 2. Demo / Fallback Route
  if (typeof emailjs === 'undefined' || EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY' || EMAILJS_CONFIG.publicKey === 'abc123XYZ') {
    console.warn('[EmailJS] Not configured — running in demo mode.');
    await new Promise(r => setTimeout(r, 1200));
    showReservationToast('success', `Thank you, ${formData.guest_name}! We've registered your request for ${formData.guest_count} guest(s) at ${selectedTable} on ${formData.booking_date} at ${formData.booking_time}.`);
    addLoyaltyPoints(100, "Table Reservation");
    showDigitalTicket(formData.guest_name, formData.booking_date, formData.booking_time, formData.guest_count, selectedTable);
    showReservationSuccessModal(dateVal, timeVal, guestsVal);
    showReservationToast('success', `Thank you, ${formData.guest_name}! We've registered your request for ${formData.guest_count} guest(s) at ${selectedTable || 'your table'} on ${formData.booking_date} at ${formData.booking_time}.`);
    if (typeof addLoyaltyPoints === 'function') addLoyaltyPoints(100, "Table Reservation");
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
      showDigitalTicket(formData.guest_name, formData.booking_date, formData.booking_time, formData.guest_count, selectedTable);
      showReservationSuccessModal(dateVal, timeVal, guestsVal);
      reservationForm.reset();
      updateAvailableTimes();
    } catch (err) {
      console.error('[EmailJS] Error:', err);
      showReservationToast('error', 'We couldn\'t send your confirmation email. Please call us at (555) 123-4567.');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
    return;
  }

  // 3. EmailJS Route
  try {
    await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.guestTemplateId, formData);
    await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.adminTemplateId, formData);
    showReservationToast('success', `Thank you, ${formData.guest_name}! A confirmation has been sent to ${formData.guest_email}.`);
    if (typeof addLoyaltyPoints === 'function') addLoyaltyPoints(100, "Table Reservation");
    reservationForm.reset();
    updateAvailableTimes();
  } catch (err) {
    console.error('[EmailJS] Error:', err);
    showReservationToast('error', 'We couldn\'t send your confirmation email. Please call us at (555) 123-4567 or try again.');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// =============================================
// SEATING ZONE MAP (Feature)
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
      if (selectedZoneInput) selectedZoneInput.value = "main";
      setTimeout(renderSeatingMap, 0);
    });
  }

  renderSeatingMap();
}

// =============================================
// INTERSECTION OBSERVER & ANIMATIONS
// =============================================
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

function handleCardFlip() {
  const cards = document.querySelectorAll('.food-card-3d');
  if (isTouchDevice) {
    cards.forEach((card) => {
      card.addEventListener('click', function (e) {
        if (e.target.closest('a') || e.target.closest('button') || e.target.closest('.menu-action-btn')) return;
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

function initSkeletonLoaders() {
  const cards = document.querySelectorAll(".food-card, .polaroid-image-wrapper");
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

// =============================================
// REVIEWS
// =============================================
function setupReviews() {
  const storageKey = "lighthouse_reviews";
  const reviewForm = document.getElementById("review-form");
  const reviewMsg = document.getElementById("review-msg");
  const starBtns = document.querySelectorAll("#star-input .star-btn");
  const ratingInput = document.getElementById("review-rating");
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
    
    // Apply translations to pinned review if available
    const activePinned = {
      ...pinnedReview,
      text: typeof i18next !== 'undefined' && i18next.t && i18next.t('reviews.pinned_review_text') !== 'reviews.pinned_review_text' 
        ? i18next.t('reviews.pinned_review_text') : pinnedReview.text,
      date: typeof i18next !== 'undefined' && i18next.t && i18next.t('reviews.pinned_review_date') !== 'reviews.pinned_review_date' 
        ? i18next.t('reviews.pinned_review_date') : pinnedReview.date,
    };

    [activePinned, ...getReviews()].forEach((review) => {
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

  function isMeaningfulReview(text) {
    const value = text.trim();
    const words = value.split(/\s+/);
    return words.length >= 3 && !/^(.)\1+$|^[a-zA-Z]{1,6}$/.test(value);
  }

  if (starBtns.length) {
    starBtns.forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        const val = +btn.dataset.value;
        starBtns.forEach((s) => s.classList.toggle('active', +s.dataset.value <= val));
      });
      btn.addEventListener('mouseleave', () => {
        starBtns.forEach((s) => s.classList.toggle('active', +s.dataset.value <= selectedRating));
      });
      btn.addEventListener('click', (e) => {
        selectedRating = parseInt(e.target.dataset.value, 10);
        if (ratingInput) ratingInput.value = selectedRating;
        starBtns.forEach((s) => s.classList.toggle('active', +s.dataset.value <= selectedRating));
      });
    });
  }

  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("review-name");
      const textInput = document.getElementById("review-text");
      const name = nameInput ? nameInput.value.trim() : "";
      const text = textInput ? textInput.value.trim() : "";

      if (!reviewMsg) return;
      reviewMsg.style.display = "block";

      if (selectedRating === 0) {
        reviewMsg.textContent = typeof i18next !== 'undefined' && i18next.t ? i18next.t('reviews.rating_error') : "Please select a rating.";
        reviewMsg.style.color = "#c94a4a";
        return;
      }

      if (!name || !/^[\p{L}\p{M}\s'-]{3,30}$/u.test(name)) {
        reviewMsg.textContent = typeof i18next !== 'undefined' && i18next.t ? i18next.t('reviews.name_error') : "Please enter a valid name.";
        reviewMsg.style.color = "#c94a4a";
        return;
      }

      if (text.length < 20 || !isMeaningfulReview(text)) {
        reviewMsg.textContent = typeof i18next !== 'undefined' && i18next.t ? i18next.t('reviews.meaningful_error') : "Please enter a meaningful review of at least 20 characters.";
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
      if (ratingInput) ratingInput.value = 0;
      starBtns.forEach((star) => star.classList.remove("active"));

      if (typeof addLoyaltyPoints === 'function') addLoyaltyPoints(50, "Review Shared");

      reviewMsg.textContent = typeof i18next !== 'undefined' && i18next.t ? i18next.t('reviews.success_msg') : "Review submitted successfully!";
      reviewMsg.style.color = "#4a9c6a";
      setTimeout(() => {
        reviewMsg.style.display = "none";
      }, 3000);
    });
  }

  // Expose global render function for i18n
  window.renderReviews = renderReviews;
  renderReviews();
}

// =============================================
// ORDER & CART SYSTEM
// =============================================
function getMenuItemData(item) {
  const title = item.querySelector("h3")?.textContent.trim() || "Menu item";
  const priceText = item.querySelector(".menu-price")?.textContent || "0";
  const price = Number(priceText.replace(/[^\d.]/g, "")) || 0;
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const image = item.querySelector("img")?.getAttribute("src") || "";
  return { id, title, price, image };
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
  if (orderDock) {
    orderDock.classList.add("open");
    if (orderToggle) orderToggle.setAttribute("aria-expanded", "true");
  }
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
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  cart = cart.filter(c => c.qty > 0);
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

  // Toggle favorite icons on menu cards
  document.querySelectorAll(".favorite-btn").forEach((btn) => {
    const isFavorite = favorites.some((item) => item.id === btn.dataset.id);
    btn.classList.toggle("active", isFavorite);
    btn.textContent = isFavorite ? "\u2665" : "\u2661";
  });

  // Render Cart (Advanced UI if element exists, simple UI fallback)
  if (cartItemsEl) {
    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<p class="order-empty">Your cart is empty.</p>';
    } else {
      cartItemsEl.innerHTML = cart.map(item => `
        <div class="order-item">
          ${item.image ? `<img src="${item.image}" alt="${item.title}" class="order-item-img" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">` : ''}
          <div class="order-item-details" style="flex:1;">
            <h4 style="margin: 0; font-size: 0.95rem;">${item.title}</h4>
            ${item.customizations ? `
              <div class="order-item-customizations" style="font-size: 0.75rem; color: #9a958e;">
                <span>${item.customizations.spice || ''}</span> | <span>Side: ${item.customizations.side || 'None'}</span>
                ${item.customizations.toppings && item.customizations.toppings.length ? `<br><span>Extras: ${item.customizations.toppings.join(', ')}</span>` : ''}
              </div>
            ` : ''}
            <p style="margin: 4px 0 0 0; color: #9a958e; font-size: 0.8rem;">\u20B9${item.price}</p>
          </div>
          <div class="qty-control">
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
  setupTableAvailabilityEstimator();
  setupSearchSuggestions();
  setupFaqAccordion();

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
    // Fallback Cart Renderer
    const cartList = document.querySelector("#cartView .order-list");
    if (cartList) {
      if (cart.length === 0) {
        cartList.innerHTML = `<div class="order-empty">Your cart is empty.</div>`;
      } else {
        cartList.innerHTML = cart.map(item => `
          <div class="order-item">
            <div>
              <strong>${item.title}</strong>
              <span>\u20B9${item.price} x ${item.qty} = \u20B9${item.price * item.qty}</span>
            </div>
            <div class="qty-control">
              <button type="button" onclick="window.updateCartQty('${item.id}', -1)">-</button>
              <span>${item.qty}</span>
              <button type="button" onclick="window.updateCartQty('${item.id}', 1)">+</button>
            </div>
          </div>
        `).join('');
      }
    }
  }

  // Render Favorites
  if (favoriteItemsEl) {
    if (favorites.length === 0) {
      favoriteItemsEl.innerHTML = '<p class="order-empty">No favorites added yet.</p>';
    } else {
      favoriteItemsEl.innerHTML = favorites.map(item => `
        <div class="order-item">
          ${item.image ? `<img src="${item.image}" alt="${item.title}" class="order-item-img" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">` : ''}
          <div class="order-item-details" style="flex:1;">
            <h4 style="margin: 0; font-size: 0.95rem;">${item.title}</h4>
            <p style="margin: 4px 0 0 0; color: #9a958e; font-size: 0.8rem;">\u20B9${item.price}</p>
          </div>
          <button class="menu-action-btn favorite-btn active" style="margin-left:auto; width: 38px; height: 38px; display:flex; align-items:center; justify-content:center;" onclick="removeFavorite('${item.id}')">\u2665</button>
        </div>
      `).join('');
    }
  }
}

function setupOrderFeatures() {
  const menuItems = document.querySelectorAll(".menu-item");
  if (!menuItems.length) return;

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

    // Append safely to standard layout or 3D flip card layout
    const foodContent = item.querySelector(".food-content") || item.querySelector(".back-content");
    if (foodContent) foodContent.appendChild(actions);

    actions.querySelector(".add-cart-btn")?.addEventListener("click", () => {
      if (typeof openCustomizerModal === 'function') {
        openCustomizerModal(data, item.dataset.category || "lunch");
      } else {
        addToCart(data);
      }
    });
    actions.querySelector(".favorite-btn")?.addEventListener("click", () => toggleFavorite(data));
  });

  if (orderToggle && orderDock) {
    orderToggle.addEventListener("click", () => {
      const isOpen = orderDock.classList.toggle("open");
      orderToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  if (orderTabs.length) {
    orderTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetView = tab.dataset.orderView;
        orderTabs.forEach((item) => item.classList.toggle("active", item === tab));
        orderViews.forEach((view) => view.classList.toggle("active", view.id === `${targetView}View`));
      });
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (!cart.length) return;
      const summary = cart.map((item) => `${item.qty} x ${item.title}`).join(", ");
      checkoutBtn.textContent = "Order Ready!";
      checkoutBtn.title = summary;
      setTimeout(() => {
        checkoutBtn.textContent = "Review Order";
        checkoutBtn.title = "";
      }, 2200);
    });
  }

  renderOrderState();
}

// =============================================
// MENU ITEM CUSTOMIZER (Feature)
// =============================================
let currentCustomizingItem = null;

function openCustomizerModal(item, category) {
  currentCustomizingItem = item;
  
  const modal = document.getElementById("customizer-modal");
  const title = document.getElementById("customizer-title");
  const basePriceEl = document.getElementById("customizer-base-price");
  const form = document.getElementById("customizer-form");

  // Fallback if HTML for modal doesn't exist
  if (!modal || !form) {
    addToCart(item);
    return;
  }

  title.textContent = `Customize ${item.title}`;
  basePriceEl.textContent = `Base Price: ₹${item.price}`;

  const spiceGroup = document.getElementById("customizer-spice-group");
  const sidesGroup = document.getElementById("customizer-sides-group");
  
  form.reset();

  // Dynamic configuration based on Category
  if (category === "drinks" || category === "desserts") {
    spiceGroup.style.display = "block";
    spiceGroup.querySelector(".option-label").textContent = "Sweetness Level";
    const spanElements = spiceGroup.querySelectorAll(".customizer-radio-label span");
    if (spanElements.length >= 4) {
      spanElements[0].textContent = "No Sugar";
      spanElements[1].textContent = "Less Sweet";
      spanElements[2].textContent = "Regular";
      spanElements[3].textContent = "Extra Sweet";
    }
    if (sidesGroup) sidesGroup.style.display = "none";
  } else {
    spiceGroup.style.display = "block";
    spiceGroup.querySelector(".option-label").textContent = "Spice Level";
    const spanElements = spiceGroup.querySelectorAll(".customizer-radio-label span");
    if (spanElements.length >= 4) {
      spanElements[0].textContent = "Mild";
      spanElements[1].textContent = "Medium";
      spanElements[2].textContent = "Hot";
      spanElements[3].textContent = "Chef's Special (Extra Hot)";
    }
    if (sidesGroup) sidesGroup.style.display = "block";
  }

  function calculateTotal() {
    let total = item.price;
    const checkedToppings = form.querySelectorAll(".topping-cb:checked");
    checkedToppings.forEach(cb => {
      total += parseInt(cb.dataset.price) || 0;
    });
    const totalVal = document.getElementById("customizer-total-val");
    if (totalVal) totalVal.textContent = `₹${total}`;
  }

  form.querySelectorAll("input, select").forEach(input => {
    input.addEventListener("change", calculateTotal);
  });

  calculateTotal();

  const closeBtn = document.getElementById("customizer-close");
  const closeEvent = () => {
    modal.style.display = "none";
    closeBtn.removeEventListener("click", closeEvent);
  };
  closeBtn.addEventListener("click", closeEvent);

  modal.style.display = "flex";

  const submitEvent = (e) => {
    e.preventDefault();
    form.removeEventListener("submit", submitEvent);

    const spiceOrSweetKey = category === "drinks" || category === "desserts" ? "Sweetness" : "Spice";
    const selectedSpiceVal = form.querySelector('input[name="spice-level"]:checked')?.value || "Regular/Mild";
    const selectedSideVal = (sidesGroup && sidesGroup.style.display !== "none") ? document.getElementById("customizer-side-select")?.value : "None";
    
    const selectedToppings = [];
    const checkedToppings = form.querySelectorAll(".topping-cb:checked");
    let extraPrice = 0;
    checkedToppings.forEach(cb => {
      selectedToppings.push(cb.value);
      extraPrice += parseInt(cb.dataset.price) || 0;
    });

    const calculatedPrice = item.price + extraPrice;
    const toppingsSlug = selectedToppings.length ? selectedToppings.join("-") : "none";
    const customId = `${item.id}-${selectedSpiceVal.toLowerCase().replace(/\s+/g, "-")}-${selectedSideVal ? selectedSideVal.toLowerCase().replace(/\s+/g, "-") : 'none'}-${toppingsSlug.toLowerCase().replace(/\s+/g, "-")}`;

    const customizedItem = {
      id: customId,
      baseId: item.id,
      title: item.title,
      price: calculatedPrice,
      image: item.image,
      customizations: {
        spice: `${spiceOrSweetKey}: ${selectedSpiceVal}`,
        side: selectedSideVal || 'None',
        toppings: selectedToppings
      }
    };

    addToCart(customizedItem);
    modal.style.display = "none";
  };

  form.addEventListener("submit", submitEvent);
}

// =============================================
// VIRTUAL SOMMELIER (Feature)
// =============================================
function setupVirtualSommelier() {
  const selectEl = document.getElementById("sommelier-main-select");
  const resultEl = document.getElementById("sommelier-result");

  if (!selectEl || !resultEl) return;

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

  // Populate dynamic options
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
// GIFT CARDS (Feature)
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
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  }

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

  themeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      themeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const theme = btn.dataset.theme;
      selectedThemeInput.value = theme;
      cardPreview.className = `giftcard-card ${theme}`;
    });
  });

  recipientInput?.addEventListener("input", () => { previewTo.textContent = recipientInput.value || "Recipient Name"; });
  senderInput?.addEventListener("input", () => { previewFrom.textContent = senderInput.value || "Your Name"; });
  messageInput?.addEventListener("input", () => { previewMessage.textContent = messageInput.value ? `"${messageInput.value}"` : '"Write a warm message..."'; });

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

    const randCode = "LH-" + Math.floor(1000 + Math.random() * 9000) + "-" + Math.floor(1000 + Math.random() * 9000);
    const codeSpan = cardPreview.querySelector(".giftcard-card-footer .code");
    if (codeSpan) codeSpan.textContent = randCode;

    successPanel.style.display = "block";
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

    showReservationToast("success", `Voucher for ${formatCurrency(value)} successfully generated!`);
  });

  downloadBtn?.addEventListener("click", () => window.print());
}

// =============================================
// LOYALTY CLUB (Feature)
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

    if (member.vouchers && member.vouchers.length > 0) {
      activeCodesContainer.style.display = "block";
      vouchersList.innerHTML = member.vouchers.map(v => `
        <div class="voucher-code-item">
          <div><strong>${v.reward}</strong> Code:</div>
          <span>${v.code}</span>
        </div>
      `).join("");
    } else {
      activeCodesContainer.style.display = "none";
    }
  }

  authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = emailInput.value.trim().toLowerCase();
    const name = nameInput.value.trim();

    const db = getMemberDb();
    let member = db[email];

    if (member) {
      showReservationToast("success", `Welcome back, ${member.name}!`);
    } else {
      member = { email, name: name || "Valued Club Member", points: 100, vouchers: [] };
      showReservationToast("success", `Thank you for joining the Club, ${member.name}! You have been awarded 100 Welcome Points!`);
    }

    setLoggedInMember(member);
    renderDashboard();
  });

  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("lighthouse_loyalty_member");
    renderDashboard();
  });

  redeemButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const cost = parseInt(btn.dataset.cost) || 0;
      const reward = btn.dataset.reward;
      const baseCode = btn.dataset.code;
      const member = getLoggedInMember();
      
      if (!member) return showReservationToast("error", "Please sign in to redeem rewards!");
      if (member.points < cost) return showReservationToast("error", `Insufficient points! You need ${cost} points.`);

      member.points -= cost;
      const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
      const generatedCode = `${baseCode}-${uniqueSuffix}`;
      
      if (!member.vouchers) member.vouchers = [];
      member.vouchers.push({ reward, code: generatedCode });

      setLoggedInMember(member);
      renderDashboard();
      showReservationToast("success", `Successfully redeemed ${reward}! Use code ${generatedCode}.`);
    });
  });

  renderDashboard();
}

function addLoyaltyPoints(points, reason) {
  const memberStr = localStorage.getItem("lighthouse_loyalty_member");
  if (!memberStr) return;
  try {
    const member = JSON.parse(memberStr);
    member.points += points;
    localStorage.setItem("lighthouse_loyalty_member", JSON.stringify(member));
    const db = JSON.parse(localStorage.getItem("lighthouse_loyalty_db") || "{}");
    db[member.email] = member;
    localStorage.setItem("lighthouse_loyalty_db", JSON.stringify(db));

    const pointsValEl = document.getElementById("member-points-val");
    if (pointsValEl) pointsValEl.textContent = member.points;
    showReservationToast("success", `🎉 Club Bonus: +${points} Points! (${reason})`);
  } catch (e) {
    console.error(e);
  }
}

// =============================================
// Feature 7: Digital Reservation Ticket & Events
// =============================================
function showDigitalTicket(name, date, time, guests, table) {
  const modal = document.getElementById("ticket-modal");
  const guestNameEl = document.getElementById("ticket-guest-name");
  const dateEl = document.getElementById("ticket-date");
  const timeEl = document.getElementById("ticket-time");
  const guestsEl = document.getElementById("ticket-guests");
  const tableEl = document.getElementById("ticket-table");
  const bookingCodeEl = document.getElementById("ticket-booking-code");

  if (!modal) return;

  if (guestNameEl) guestNameEl.textContent = name;
  if (dateEl) dateEl.textContent = date;
  if (timeEl) timeEl.textContent = time;
  if (guestsEl) guestsEl.textContent = `${guests} Guest(s)`;
  if (tableEl) tableEl.textContent = table || "Assigned Table";

  const randomCode = "LH-" + Math.floor(1000 + Math.random() * 9000) + "-" + Math.floor(1000 + Math.random() * 9000);
  if (bookingCodeEl) bookingCodeEl.textContent = randomCode;

  modal.style.display = "block";
}

// Ticket Event Handlers
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("ticket-modal");
  const closeBtn = document.getElementById("closeTicketModal");
  const printBtn = document.getElementById("printTicketBtn");

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }

  // Close modal when clicking outside content
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
// Feature 9: Live Table Availability Estimator
// =============================================
function setupTableAvailabilityEstimator() {
  const dateInput = document.getElementById("reservation-date");
  const timeSelect = document.getElementById("time");
  const estimator = document.getElementById("availability-estimator");

  if (!dateInput || !timeSelect || !estimator) return;

  function updateEstimator() {
    const dateVal = dateInput.value;
    const timeVal = timeSelect.value;

    if (!dateVal || !timeVal) {
      estimator.style.display = "none";
      return;
    }

    const seed = dateVal.replace(/-/g, "") + timeVal.replace(/:/g, "");
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const availabilityIndex = Math.abs(hash) % 3;

    estimator.className = "availability-estimator"; // reset classes
    estimator.innerHTML = "";

    const dot = document.createElement("span");
    dot.className = "availability-dot";
    estimator.appendChild(dot);

    const text = document.createElement("span");

    if (availabilityIndex === 0) {
      estimator.classList.add("low");
      text.textContent = "⚠️ Peak Hour - Highly Popular! Only 2 tables remaining.";
    } else if (availabilityIndex === 1) {
      estimator.classList.add("medium");
      text.textContent = "⚡ Filling up fast - 5 tables remaining for this time slot.";
    } else {
      estimator.classList.add("high");
      text.textContent = "✅ Excellent Choice - Table availability is high.";
    }

    estimator.appendChild(text);
    estimator.style.display = "flex";
  }

  dateInput.addEventListener("change", updateEstimator);
  timeSelect.addEventListener("change", updateEstimator);
  
  if (reservationForm) {
    reservationForm.addEventListener("reset", () => {
      setTimeout(() => {
        estimator.style.display = "none";
      }, 0);
    });
  }
// Feature 10: Search Suggestions Handler
// =============================================
function setupSearchSuggestions() {
  const chips = document.querySelectorAll(".suggestion-chip");
  const searchInput = document.getElementById("menu-search");

  if (!chips.length || !searchInput) return;

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      searchInput.value = chip.dataset.query;
      searchInput.dispatchEvent(new Event("input"));
// Feature 9: Reservation Success & Calendar Integration
// =============================================
function showReservationSuccessModal(date, time, guests) {
  const modal = document.getElementById("reservation-success-modal");
  const dateEl = document.getElementById("summary-date");
  const timeEl = document.getElementById("summary-time");
  const guestsEl = document.getElementById("summary-guests");
  const googleBtn = document.getElementById("googleCalBtn");
  const icsBtn = document.getElementById("icsCalBtn");
  const closeBtn = document.getElementById("closeSuccessModal");

  if (!modal) return;

  if (dateEl) dateEl.textContent = date;
  if (timeEl) timeEl.textContent = time;
  if (guestsEl) guestsEl.textContent = guests + " Guest(s)";

  // Format Date for iCal / Google Cal
  const startDateTime = new Date(`${date}T${time}:00`);
  const finalStart = isNaN(startDateTime.getTime()) ? new Date() : startDateTime;
  const finalEnd = new Date(finalStart.getTime() + 2 * 60 * 60 * 1000); // 2 hours

  const formatTime = (dt) => dt.toISOString().replace(/-|:|\.\d\d\d/g, "");

  // Google Calendar URL
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Table+Reservation+-+The+Lighthouse&dates=${formatTime(finalStart)}/${formatTime(finalEnd)}&details=Table+reservation+confirmed+for+${guests}+guests.+We+look+forward+to+serving+you.&location=123+Harbor+View+Drive,+Coastal+City,+CA`;
  
  if (googleBtn) {
    googleBtn.onclick = () => window.open(googleUrl, "_blank");
  }

  // iCalendar (.ics) Download
  if (icsBtn) {
    icsBtn.onclick = () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//The Lighthouse//NONSGML Table Reservation//EN
BEGIN:VEVENT
UID:${Date.now()}@thelighthouse.com
DTSTAMP:${formatTime(new Date())}
DTSTART:${formatTime(finalStart)}
DTEND:${formatTime(finalEnd)}
SUMMARY:Table Reservation - The Lighthouse
DESCRIPTION:Table reservation confirmed for ${guests} guests.
LOCATION:123 Harbor View Drive, Coastal City, CA
END:VEVENT
END:VCALENDAR`;

      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `lighthouse_reservation_${date}.ics`;
      link.click();
    };
  }

  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.style.display = "none";
    };
  }

  window.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  };

  modal.style.display = "block";
// Feature 11: Scroll Reveal & Autoplay
// =============================================
function setupIntersectionObserver() {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });

  reveals.forEach((el) => observer.observe(el));
}

function setupAutoScroll() {
  const grid = document.getElementById("reviews-grid");
  if (!grid) return;

  let autoplayTimer = null;

  function startAutoplay() {
    autoplayTimer = setInterval(() => {
      const maxScroll = grid.scrollWidth - grid.clientWidth;
      if (grid.scrollLeft >= maxScroll - 10) {
        grid.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        grid.scrollBy({ left: 320, behavior: "smooth" });
      }
    }, 4000);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  const isScrollable = () => grid.scrollWidth > grid.clientWidth;

  if (isScrollable()) {
    startAutoplay();
  }

  window.addEventListener("resize", () => {
    stopAutoplay();
    if (isScrollable()) {
      startAutoplay();
    }
  });

  grid.addEventListener("mouseenter", stopAutoplay);
  grid.addEventListener("mouseleave", () => {
    if (isScrollable()) startAutoplay();
  });
  grid.addEventListener("touchstart", stopAutoplay, { passive: true });
  grid.addEventListener("touchend", () => {
    if (isScrollable()) startAutoplay();
// Feature 6: Interactive FAQ Accordion
// =============================================
function setupFaqAccordion() {
  const faqQuestions = document.querySelectorAll(".faq-question");
  faqQuestions.forEach(question => {
    question.addEventListener("click", () => {
      const item = question.parentElement;
      const isActive = item.classList.contains("active");
      
      // Close all other items
      document.querySelectorAll(".faq-item").forEach(el => el.classList.remove("active"));
      
      if (!isActive) {
        item.classList.add("active");
      }
    });
  });
}
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
    <div class="spinner" style="border:4px solid #fff;border-top:4px solid var(--color-primary);border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;margin:0 auto 15px;"></div>
    <p>Generating your menu PDF...</p>
    <p style="font-size: 0.9rem; color: rgba(255,255,255,0.7); margin-top: 10px;">Please wait</p>
  `;
  overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;";
  document.body.appendChild(overlay);
  
  if (!document.getElementById('spinner-style')) {
    const style = document.createElement('style');
    style.id = 'spinner-style';
    style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }
}

function hideLoadingOverlay() {
  const overlay = document.getElementById('pdfLoading');
  if (overlay) overlay.remove();
}

// =============================================
// UI BADGES & I18N
// =============================================
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

function updateContent() {
  if (typeof i18next === 'undefined' || !i18next.t) return;
  
  document.querySelectorAll("[data-i18n]").forEach((elem) => {
    const key = elem.getAttribute("data-i18n");
    if(elem.tagName === 'INPUT' || elem.tagName === 'TEXTAREA') {
        if(elem.hasAttribute('placeholder')) elem.placeholder = i18next.t(key);
    } else {
        elem.textContent = i18next.t(key);
    }
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
  if (noResults) noResults.textContent = i18next.t('menu.no_results');

  const dietNoResults = document.querySelectorAll(".diet-no-results");
  dietNoResults.forEach((el) => { el.textContent = i18next.t('menu.diet_no_results'); });

  if (typeof window.renderReviews === 'function') window.renderReviews();
  updateOpenStatusBadge();
}

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  // Pre-load Storage Data
  cart = getStoredList("lighthouse_cart");
  favorites = getStoredList("lighthouse_favorites");

  // Init features
  updateDeviceHints();
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

  // i18next Setup
  if (typeof i18next !== 'undefined' && typeof i18nextHttpBackend !== 'undefined' && typeof i18nextBrowserLanguageDetector !== 'undefined') {
    i18next
      .use(i18nextHttpBackend)
      .use(i18nextBrowserLanguageDetector)
      .init({
        fallbackLng: 'en',
        supportedLngs: ['en', 'hi', 'gu'],
        load: 'languageOnly',
        backend: { loadPath: './locales/{{lng}}/translation.json' },
        detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] }
      }, function (err, t) {
        if (err) return console.error(err);

        const activeLang = i18next.resolvedLanguage || 'en';
        const langSelector = document.querySelector('.language-select');
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
  }

  // Bind loose event listeners
  if (dateInput) dateInput.addEventListener("change", updateAvailableTimes);
  if (guestsSelect) guestsSelect.addEventListener("change", updateAvailableTimes);
  if (navToggle) navToggle.addEventListener("click", toggleMobileMenu);
  if (reservationForm) reservationForm.addEventListener("submit", handleFormSubmit);

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
      filterMenuItems(btn.dataset.filter, menuSearch ? menuSearch.value : '', getActiveDiet());
    });
  });

  dietBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      dietBtns.forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
      filterMenuItems(getActiveFilter(), menuSearch ? menuSearch.value : '', btn.dataset.diet || btn.dataset.type);
    });
  });

  menuTabs.forEach(tab => tab.addEventListener('click', switchMenuTab));

  if (cuisineDropdown) {
    cuisineDropdown.addEventListener("change", () => {
      filterMenuItems(getActiveFilter(), menuSearch ? menuSearch.value : '', getActiveDiet());
    });
  }

  if (menuSearch) {
    menuSearch.addEventListener("input", () => {
      filterMenuItems(getActiveFilter(), menuSearch.value, getActiveDiet());
    });
  }

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }

  const downloadMenuPDFBtn = document.getElementById("downloadMenuPDF");
  if (downloadMenuPDFBtn) {
    downloadMenuPDFBtn.addEventListener('click', async () => {
      try {
        showLoadingOverlay();
        await loadHtml2Pdf();
        const element = document.getElementById('menu');
        const opt = {
          margin: 10,
          filename: 'The_Lighthouse_Menu.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#1a1714' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        await html2pdf().set(opt).from(element).save();
      } catch (e) {
        console.error("PDF generation failed", e);
        alert("Could not generate PDF menu at this time.");
      } finally {
        hideLoadingOverlay();
      }
    });
  }

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  if (typeof attachSkeletonToSimpleImage === 'function') {
    const largeContainers = [
      document.querySelector('.hero-bg'),
      document.querySelector('.about-image'),
      document.querySelector('.reservation-bg'),
    ];
    largeContainers.forEach((c) => {
      if (c) attachSkeletonToSimpleImage(c, 360);
    });
  }
});
