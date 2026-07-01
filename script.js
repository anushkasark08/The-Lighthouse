document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll(".nav-link");
  const heroBg = document.getElementById("heroBg");
  const reservationBg = document.getElementById("reservationBg");
  const reservationForm = document.getElementById("reservationForm");
  const dateInput = document.getElementById("reservation-date");
  const timeInput = document.getElementById("time");
  const timeSlotsGrid = document.getElementById("timeSlotsGrid");
  const guestsSelect = document.getElementById("guests");
  const themeToggle = document.getElementById("themeToggle");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const dietBtns = document.querySelectorAll(".diet-btn");
  const cuisineDropdown = document.getElementById("cuisine-filter");
  const menuSearch = document.getElementById("menu-search");
  const heroScroll = document.querySelector(".hero-scroll");
  const backToTopBtn = document.getElementById("backToTop");
  const orderDock = document.getElementById("orderDock");
  const orderToggle = document.getElementById("orderToggle");
  const orderTabs = document.querySelectorAll(".order-tab");
  const orderViews = document.querySelectorAll(".order-view");
  const cartItemsEl = document.getElementById("cartItems");
  const favoriteItemsEl = document.getElementById("favoriteItems");
  const cartCountEl = document.getElementById("cartCount");
  const cartTotalEl = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const isTouchDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  
  const menuContent = document.querySelector(".menu-content");
  const menuTabs = document.querySelectorAll(".menu-tab");
  const menuPanels = document.querySelectorAll(".menu-panel");

  let currentCategory = "all";
  let currentDiet = "all";
  let autoScrollInterval = null;
  let cart = loadStoredList("lighthouse_cart");
  let favorites = loadStoredList("lighthouse_favorites");

  function loadStoredList(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  }

  function saveStoredList(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function setReservationDateRange() {
    if (!dateInput) return;

    const tomorrow = new Date(Date.now() + 86400000);
    const maxDate = new Date(Date.now() + 90 * 86400000);

    dateInput.min = tomorrow.toISOString().split("T")[0];
    dateInput.max = maxDate.toISOString().split("T")[0];
  }


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

  function handleTimeSlotClick(e, timeVal) {
    e.preventDefault();
    const btns = timeSlotsGrid.querySelectorAll('.time-slot-btn');
    btns.forEach(b => b.classList.remove('selected'));
    
    const btn = e.currentTarget;
    btn.classList.add('selected');
    timeInput.value = timeVal;
  }

  function updateAvailableTimes() {
    if (!dateInput || !timeSlotsGrid) return;
    
    const selectedDate = dateInput.value;
    const guestsCount = guestsSelect ? guestsSelect.value : '2';
    
    if (!selectedDate || !guestsCount) {
      timeSlotsGrid.innerHTML = '<div class="time-slot-placeholder">Please select a date and number of guests to view available times.</div>';
      timeInput.value = '';
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentHours = now.getHours();
    const currentMins = now.getMinutes();

    const allTimes = [
      "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
      "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
      "19:00", "20:00", "21:00", "22:00", "23:00"
    ];

    timeSlotsGrid.innerHTML = '';
    let hasAvailable = false;

    allTimes.forEach((timeVal) => {
      const [optHours, optMins] = timeVal.split(':').map(Number);
      let isPast = false;

      if (selectedDate === todayStr) {
        isPast = optHours < currentHours || (optHours === currentHours && optMins <= currentMins + 30);
      }
      
      const availableTables = getAvailableTables(selectedDate, timeVal, guestsCount);
      const isFullyBooked = availableTables === 0;
      
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time-slot-btn';
      
      if (availableTables > 0 && availableTables <= 3) {
        btn.classList.add('limited');
      }
      
      if (isPast || isFullyBooked) {
        btn.disabled = true;
      } else {
        hasAvailable = true;
        btn.addEventListener('click', (e) => handleTimeSlotClick(e, timeVal));
      }

      if (timeInput.value === timeVal && !isPast && !isFullyBooked) {
        btn.classList.add('selected');
      }

      const ampm = optHours >= 12 ? 'PM' : 'AM';
      const displayHour = optHours % 12 || 12;
      const timeLabel = `${displayHour}:${optMins === 0 ? '00' : optMins} ${ampm}`;
      const availabilityText = isPast ? 'Past' : (isFullyBooked ? 'Booked' : (availableTables <= 3 ? `${availableTables} left` : 'Available'));
      
      btn.innerHTML = `
        <span class="time-label">${timeLabel}</span>
        <span class="availability">${availabilityText}</span>
      `;
      timeSlotsGrid.appendChild(btn);
    });
    
    if (!hasAvailable) {
       timeSlotsGrid.innerHTML = '<div class="time-slot-placeholder">No times available for this date.</div>';
    }

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

  function smoothScroll(event) {
    const targetId = event.currentTarget.getAttribute("href");
    if (!targetId || !targetId.startsWith("#")) return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({
      top: target.offsetTop - 80,
      behavior: prefersReduced ? "auto" : "smooth",
    });

    closeMobileMenu();
  }

  function filterMenuItems() {
    const cuisine = cuisineDropdown ? cuisineDropdown.value : "all";
    const search = menuSearch ? menuSearch.value.trim().toLowerCase() : "";
    let visibleCount = 0;

    document.querySelectorAll(".menu-content .menu-item").forEach((item) => {
      const title = item.querySelector("h3")?.textContent.toLowerCase() || "";
      const category = item.dataset.category || "all";
      const itemCuisine = item.dataset.cuisine || "all";
      const itemDiet = item.dataset.diet || (item.querySelector(".food-tag.nonveg") ? "non-veg" : "veg");
      const matchesCategory =
        currentCategory === "all" ||
        category === currentCategory ||
        (currentCategory === "veg" && itemDiet === "veg") ||
        (currentCategory === "nonveg" && itemDiet === "non-veg");

      const visible =
        matchesCategory &&
        (cuisine === "all" || itemCuisine === cuisine) &&
        (currentDiet === "all" || itemDiet === currentDiet) &&
        title.includes(search);

      item.classList.toggle("hidden-item", !visible);
      if (visible) visibleCount++;
    });

    let noResults = document.querySelector(".menu-content .no-results");
    if (!noResults) {
      noResults = document.createElement("p");
      noResults.className = "no-results";
      noResults.textContent = "No menu items found.";
      document.querySelector(".menu-content")?.appendChild(noResults);
    }
    noResults.style.display = visibleCount === 0 ? "block" : "none";
  }

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

  function validateReservationForm(event) {
    event.preventDefault();
    if (!reservationForm) return;

    let isValid = true;
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");

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

    if (phoneInput && phoneInput.value.replace(/\D/g, "").length !== 10) {
      addError(phoneInput, "Phone number must contain exactly 10 digits.");
      isValid = false;
    }

    if (!isValid) return;

    const submitBtn = reservationForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = "Reservation Requested!";
    submitBtn.style.backgroundColor = "#4a9c6a";
    submitBtn.disabled = true;

    // Simulate backend recording the booking
    const selectedDate = dateInput.value;
    const selectedTime = timeInput.value;
    const guestsCount = guestsSelect ? guestsSelect.value : '2';
    
    if (selectedDate && selectedTime) {
      if (!mockBookings[selectedDate]) mockBookings[selectedDate] = {};
      const currentAvailable = getAvailableTables(selectedDate, selectedTime, guestsCount);
      mockBookings[selectedDate][selectedTime] = Math.max(0, currentAvailable - 1);
    }

    setTimeout(() => {
      reservationForm.reset();
      updateAvailableTimes();
      submitBtn.textContent = originalText;
      submitBtn.style.backgroundColor = "";
      submitBtn.disabled = false;
    }, 3000);
  }

  function addError(input, message) {
    input.style.borderColor = "#c94a4a";

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
        const stars = "\u2605".repeat(review.rating) + "\u2606".repeat(5 - review.rating);

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
      return /^[A-Za-z\s'-]{3,30}$/.test(name.trim());
    }

    function isMeaningfulReview(text) {
      const value = text.trim();
      const words = value.split(/\s+/);
      return words.length >= 3 && !/^(.)\1+$|^[a-zA-Z]{1,6}$/.test(value);
    }

    starBtns.forEach((btn) => {
      btn.addEventListener("mouseenter", () => {
        const value = Number(btn.dataset.value);
        starBtns.forEach((star) => star.classList.toggle("active", Number(star.dataset.value) <= value));
      });

      btn.addEventListener("mouseleave", () => {
        starBtns.forEach((star) => star.classList.toggle("active", Number(star.dataset.value) <= selectedRating));
      });

      btn.addEventListener("click", () => {
        selectedRating = Number(btn.dataset.value);
        document.getElementById("review-rating").value = selectedRating;
        starBtns.forEach((star) => star.classList.toggle("active", Number(star.dataset.value) <= selectedRating));
      });
    });

    if (reviewForm) {
      reviewForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("review-name").value.trim();
        const text = document.getElementById("review-text").value.trim();
        reviewMsg.style.display = "block";

        if (!selectedRating) {
          reviewMsg.textContent = "Please select a star rating.";
          reviewMsg.style.color = "#c94a4a";
          return;
        }

        if (!isValidName(name)) {
          reviewMsg.textContent = "Name should contain only letters and be 3-30 characters long.";
          reviewMsg.style.color = "#c94a4a";
          return;
        }

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

  function updateCartQty(id, delta) {
    const item = cart.find((cartItem) => cartItem.id === id);
    if (!item) return;


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

// Initialize Reservation API
const reservationAPI = new ReservationAPI();

// ============= UPDATE RESERVATION FORM =============

// Update the existing reservation form submit handler
const originalReservationSubmit = reservationForm?.onsubmit;

reservationForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  // Check if user is logged in
  if (!reservationAPI.token) {
    alert('Please login or register to make a reservation');
    // Show login modal or redirect to login
    return;
  }

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

// Add event listeners for real-time availability
dateInput?.addEventListener('change', updateAvailableSlots);
guestsInput?.addEventListener('change', updateAvailableSlots);

// ============= AUTO-LOGIN FOR TESTING =============

// Uncomment for testing
// (async function autoLogin() {
//   const result = await reservationAPI.login('test@example.com', 'password123');
//   if (result.success) {
//     console.log('Auto-login successful');
//   }
// })();


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

// ─── Open / Closed Badge ────────────────────────────────────────────────────
(function updateOpenStatusBadge() {
  const sessions = [
    { name: 'Breakfast', open: [7, 0],  close: [11, 0]  },
    { name: 'Lunch',     open: [11, 30], close: [15, 0]  },
    { name: 'Dinner',    open: [17, 0],  close: [23, 0]  },
    { name: 'Bar',       open: [11, 0],  close: [24, 0]  },
  ];

  function getOpenSession() {
    const now  = new Date();
    const h    = now.getHours();
    const m    = now.getMinutes();
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
    } else {
      badge.className = 'status-badge status-badge--closed';
      badge.textContent = 'Closed';
    }
  }

  render();
  // Re-evaluate every minute so the badge stays accurate without a reload
  setInterval(render, 60 * 1000);
})();

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


