async function loadLanguage(lang) {
  const response = await fetch(`${lang}.json`);
  translations = await response.json();
  applyLanguage();
}

// DOM Elements
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-link");
const menuTabs = document.querySelectorAll(".menu-tab");
const menuPanels = document.querySelectorAll(".menu-panel");
const heroBg = document.getElementById("heroBg");
const reservationBg = document.getElementById("reservationBg");
const reservationForm = document.getElementById("reservationForm");
const dateInput = document.getElementById("date");
const timeSelect = document.getElementById("time");
const themeToggle = document.getElementById("themeToggle");
if (dateInput) {
  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("min", today);

  dateInput.addEventListener("change", updateAvailableTimes);
}

// Update available time slots based on current time
function updateAvailableTimes() {
  if (!dateInput || !timeSelect) return;

  const selectedDate = dateInput.value;
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  const options = timeSelect.querySelectorAll("option");

  options.forEach((option) => {
    if (option.value === "") return;

    const [optionHours, optionMinutes] = option.value.split(":").map(Number);

    if (selectedDate === today) {
      // Disable if time is in the past (with a 30 min buffer)
      if (
        optionHours < currentHours ||
        (optionHours === currentHours && optionMinutes <= currentMinutes + 30)
      ) {
        option.disabled = true;
        if (option.selected) {
          timeSelect.value = "";
        }
      } else {
        option.disabled = false;
      }
    } else {
      option.disabled = false;
    }
  });
}

// Navigation scroll effect
let lastScroll = 0;

function handleScroll() {
  const currentScroll = window.pageYOffset;

  // Add scrolled class for background
  if (currentScroll > 50) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }

  lastScroll = currentScroll;

  // Parallax effect for hero and reservation backgrounds
  if (heroBg) {
    const heroSpeed = 0.5;
    heroBg.style.transform = `translateY(${currentScroll * heroSpeed}px)`;
  }

  if (reservationBg && currentScroll > window.innerHeight) {
    const reservationSection = document.getElementById("reservation");
    if (reservationSection) {
      const sectionTop = reservationSection.offsetTop;
      const offset = (currentScroll - sectionTop) * 0.3;
      reservationBg.style.transform = `translateY(${offset}px)`;
    }
  }

  // Update active nav link based on scroll position
  updateActiveNavLink();
}

// Update active navigation link based on scroll position
function updateActiveNavLink() {
  const sections = document.querySelectorAll("section[id]");
  const scrollPosition = window.pageYOffset + 150;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute("id");

    if (
      scrollPosition >= sectionTop &&
      scrollPosition < sectionTop + sectionHeight
    ) {
      navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("data-section") === sectionId) {
          link.classList.add("active");
        }
      });
    }
  });
}

// Mobile menu toggle
function toggleMobileMenu() {
  navToggle.classList.toggle("active");
  navMenu.classList.toggle("active");
  document.body.style.overflow = navMenu.classList.contains("active")
    ? "hidden"
    : "";
}

// Close mobile menu when clicking a link
function closeMobileMenu() {
  navToggle.classList.remove("active");
  navMenu.classList.remove("active");
  document.body.style.overflow = "";
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

//
// Theme Toggle
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
  document.body.classList.add("light-theme");
  themeToggle.textContent = "☀️";
} else {
  themeToggle.textContent = "🌙";
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");

  const isLight = document.body.classList.contains("light-theme");

  if (isLight) {
    localStorage.setItem("theme", "light");
    themeToggle.textContent = "☀️";
  } else {
    localStorage.setItem("theme", "dark");
    themeToggle.textContent = "🌙";
  }
});

// ── Menu Search and Filter ─────────────────────────

const filterBtns = document.querySelectorAll(".filter-btn");

const menuSearch = document.getElementById("menu-search");

function filterMenuItems(filter = "all", searchText = "") {
  const menuItems = document.querySelectorAll(".menu-item");

  let visibleCount = 0;

  menuItems.forEach((item) => {
    const itemName = item.querySelector("h3").textContent.toLowerCase();

    const category = item.dataset.category;

    const matchesSearch = itemName.includes(searchText.toLowerCase());

    const matchesFilter = filter === "all" || category === filter;

    if (matchesSearch && matchesFilter) {
      item.classList.remove("hidden-item");

      visibleCount++;
    } else {
      item.classList.add("hidden-item");
    }
  });

  let noResults = document.querySelector(".no-results");

  if (!visibleCount) {
    if (!noResults) {
      noResults = document.createElement("p");

      noResults.className = "no-results";

      noResults.textContent = "No menu items found.";

      document.querySelector(".menu-content").appendChild(noResults);
    }
  } else if (noResults) {
    noResults.remove();
  }
}

// Filter buttons
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");

    filterMenuItems(btn.dataset.filter, menuSearch.value);
  });
});

// Search
menuSearch.addEventListener("input", () => {
  const activeFilter =
    document.querySelector(".filter-btn.active").dataset.filter;

  filterMenuItems(activeFilter, menuSearch.value);
});

// Smooth scroll for navigation links
function smoothScroll(e) {
  e.preventDefault();
  const targetId = this.getAttribute("href");
  const targetSection = document.querySelector(targetId);

  if (targetSection) {
    const offsetTop = targetSection.offsetTop - 80;
    window.scrollTo({
      top: offsetTop,
      behavior: "smooth",
    });
  }

  closeMobileMenu();
}

// Form submission handler (visual only)
function handleFormSubmit(e) {
  e.preventDefault();

  // Get form data
  const formData = new FormData(reservationForm);
  const data = Object.fromEntries(formData.entries());

  // Simple validation visual feedback
  const inputs = reservationForm.querySelectorAll("input, select, textarea");
  let isValid = true;

  inputs.forEach((input) => {
    if (input.required && !input.value) {
      input.style.borderColor = "#c94a4a";
      isValid = false;
    } else {
      input.style.borderColor = "";
    }
  });

  if (isValid) {
    // Show success message (visual only)
    const submitBtn = reservationForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = "Reservation Requested!";
    submitBtn.style.backgroundColor = "#4a9c6a";
    submitBtn.disabled = true;

    // Reset form after delay
    setTimeout(() => {
      reservationForm.reset();
      submitBtn.textContent = originalText;
      submitBtn.style.backgroundColor = "";
      submitBtn.disabled = false;
    }, 3000);
  }
}

// Intersection Observer for fade-in animations
function setupIntersectionObserver() {
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, observerOptions);

  // Observe sections for animations
  const animatedElements = document.querySelectorAll(
    ".about-content, .menu-panel, .reservation-form, .location-info",
  );
  animatedElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });
}

// Add visible class styles
const style = document.createElement("style");
style.textContent = `
  .visible {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);

/// Scroll to Discover - Auto slow scroll
const heroScroll = document.querySelector(".hero-scroll");
let autoScrollInterval = null;

// top: pixels per step | 10: interval in ms
// top:1 + 20ms = dreamy slow | top:1 + 10ms = default | top:2 + 10ms = faster

function startAutoScroll() {
  autoScrollInterval = setInterval(() => {
    window.scrollBy({ top: 2, behavior: "instant" });

    // Stop automatically if bottom of page is reached
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
  heroScroll.style.cursor = "pointer";

  // Toggle scroll on click — click once to start, click again to stop
  heroScroll.addEventListener("click", () => {
    autoScrollInterval ? stopAutoScroll() : startAutoScroll();
  });
}

// Stop scrolling on any user interaction
["mousemove", "touchstart", "keydown", "wheel", "pointerdown"].forEach(
  (event) => {
    window.addEventListener(event, stopAutoScroll);
  },
);

// Event Listeners
window.addEventListener("scroll", handleScroll);
navToggle.addEventListener("click", toggleMobileMenu);

navLinks.forEach((link) => {
  link.addEventListener("click", smoothScroll);
});

document.querySelectorAll(".nav-cta, .hero-buttons a").forEach((link) => {
  link.addEventListener("click", smoothScroll);
});

menuTabs.forEach((tab) => {
  tab.addEventListener("click", switchMenuTab);
});

if (reservationForm) {
  reservationForm.addEventListener("submit", handleFormSubmit);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  handleScroll();
  setupIntersectionObserver();
  updateAvailableTimes();
});

// Close mobile menu on window resize
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    closeMobileMenu();
  }
});

// ── Reviews (localStorage) ────────────────────────────────────────────────

const STORAGE_KEY = "lighthouse_reviews";

// Default reviews so section is never empty on first visit
const defaultReviews = [];

function getReviews() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultReviews));
  return defaultReviews;
}

function saveReviews(reviews) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

// Permanent review — always shows first, cannot be removed
const pinnedReview = {
  name: "Rasshi Srivastav",
  rating: 5,
  text: "Absolutely loved the food and ambience! Every dish was crafted with such care and the atmosphere was warm and elegant. A truly memorable dining experience — will definitely be coming back!",
  date: "14 May 2026",
};

function renderReviews() {
  const grid = document.getElementById("reviews-grid");
  if (!grid) return;

  const userReviews = getReviews();

  // Pinned review always at top, user reviews below
  const allReviews = [pinnedReview, ...userReviews];

  grid.innerHTML = allReviews
    .map(
      (r) => `
    <div class="review-card">
      <div class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
      <p class="review-text">${r.text}</p>
      <div class="review-author">
        <div class="review-avatar">${r.name.slice(0, 2).toUpperCase()}</div>
        <div>
          <span class="review-name">${r.name}</span>
          <span class="review-date">${r.date}</span>
        </div>
      </div>
    </div>
  `,
    )
    .join("");
}

// Star rating widget
let selectedRating = 0;
const starBtns = document.querySelectorAll("#star-input .star-btn");

starBtns.forEach((btn) => {
  btn.addEventListener("mouseenter", () => {
    const val = +btn.dataset.value;
    starBtns.forEach((s) =>
      s.classList.toggle("active", +s.dataset.value <= val),
    );
  });
  btn.addEventListener("mouseleave", () => {
    starBtns.forEach((s) =>
      s.classList.toggle("active", +s.dataset.value <= selectedRating),
    );
  });
  btn.addEventListener("click", () => {
    selectedRating = +btn.dataset.value;
    document.getElementById("review-rating").value = selectedRating;
    starBtns.forEach((s) =>
      s.classList.toggle("active", +s.dataset.value <= selectedRating),
    );
  });
});

// Form submit
const reviewForm = document.getElementById("review-form");
const reviewMsg = document.getElementById("review-msg");
function isMeaningfulReview(text) {
  // At least 3 real words
  const words = text.trim().split(/\s+/);

  // Reject repeated and random characters
  const randomPattern = /^(.)\1+$|^[a-zA-Z]{1,6}$/;

  if (randomPattern.test(text.trim())) return false;

  return words.length >= 3;
}

function isValidName(name) {
  return /^[A-Za-z\s]{3,30}$/.test(name.trim());
}

if (reviewForm) {
  reviewForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("review-name").value.trim();
    const reviewText = document.getElementById("review-text").value.trim();

    // Reset message
    reviewMsg.style.display = "block";

    if (!selectedRating) {
      reviewMsg.textContent = "Please select a star rating.";
      reviewMsg.style.color = "#c94a4a";
      return;
    }

    if (!isValidName(name)) {
      reviewMsg.textContent =
        "Name should contain only letters and be 3–30 characters long.";
      reviewMsg.style.color = "#c94a4a";
      return;
    }

    if (reviewText.length < 20) {
      reviewMsg.textContent = "Review must contain at least 20 characters.";
      reviewMsg.style.color = "#c94a4a";
      return;
    }

    if (!isMeaningfulReview(reviewText)) {
      reviewMsg.textContent = "Please enter a meaningful review.";
      reviewMsg.style.color = "#c94a4a";
      return;
    }

    const today = new Date();

    const dateStr = today.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
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

    document.getElementById("review-rating").value = 0;

    starBtns.forEach((s) => s.classList.remove("active"));

    reviewMsg.textContent = "Review submitted successfully!";
    reviewMsg.style.color = "#4a9c6a";

    setTimeout(() => {
      reviewMsg.style.display = "none";
    }, 3000);
  });
}

// Init
renderReviews();
//BackToTop
const backToTopBtn = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  if (window.scrollY > 200) {
    backToTopBtn.style.display = "block";
  } else {
    backToTopBtn.style.display = "none";
  }
});

// Show/hide on scroll
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    backToTopBtn.classList.add("visible");
  } else {
    backToTopBtn.classList.remove("visible");
  }
});

// Scroll to top on click
backToTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

// ================= Language Toggle =================

const langToggle = document.getElementById("langToggle");



let translations = {};
let currentLang = "en";

let currentLanguage = localStorage.getItem("language") || "en";

function applyLanguage(lang) {
  document.getElementById("site-logo").textContent =
    translations.logo;

  document.getElementById("nav-home").textContent =
    translations.home;

  document.getElementById("nav-about").textContent =
   translations.about;

  document.getElementById("nav-menu").textContent =
    translations.menu;

  document.getElementById("nav-reservation").textContent =
    translations.reservation;

  document.getElementById("nav-reviews").textContent =
    translations.reviews;

  document.getElementById("nav-location").textContent =
    translations.location;

  document.getElementById("book-table").textContent =
    translations.book;

  langToggle.textContent =
    translations.button;

  document.getElementById("hero-tagline").textContent =
    translations.heroTagline;

  document.getElementById("hero-title").textContent =
    translations.heroTitle;

  document.getElementById("hero-subtitle").textContent =
    translations.heroSubtitle;

  document.getElementById("explore-menu").textContent =
    translations.exploreMenu;

  document.getElementById("reserve-table").textContent =
    translations.reserveTable;

  document.getElementById("scroll-discover").textContent =
    translations.scrollDiscover;

  document.getElementById("click-scroll").textContent =
    translations.clickScroll;

  document.getElementById("about-label").textContent =
    translations.aboutLabel;

  document.getElementById("about-title").textContent =
    translations.aboutTitle;

  document.getElementById("about-text-1").textContent =
    translations.aboutText1;

  document.getElementById("about-text-2").textContent =
    translations.aboutText2;

  document.getElementById("reservation-label").textContent =
    translations.reservationLabel;

  document.getElementById("reservation-title").textContent =
    translations.reservationTitle;

  document.getElementById("reservation-text").textContent =
    translations.reservationText;

  document.getElementById("hours-title").textContent =
    translations.hours;

  document.getElementById("call-title").textContent =
    translations.callUs;

  document.getElementById("label-name").textContent =
    translations.fullName;

  document.getElementById("label-email").textContent =
    translations.email;

  document.getElementById("label-phone").textContent =
    translations.phone;

  document.getElementById("label-guests").textContent =
    translations.guests;

  document.getElementById("label-date").textContent =
    translations.date;

  document.getElementById("label-time").textContent =
    translations.time;

  document.getElementById("label-requests").textContent =
    translations.specialRequests;

  document.getElementById("select-guests").textContent =
    translations.selectGuests;

  document.getElementById("select-time").textContent =
    translations.selectTime;

  document.getElementById("reservation-btn").textContent =
    translations.reservationBtn;

  document.getElementById("reservation-note").textContent =
    translations.reservationNote;

  document.getElementById("reviews-label").textContent =
    translations.reviewsLabel;

  document.getElementById("reviews-title").textContent =
    translations.reviewsTitle;

  document.getElementById("share-experience").textContent =
    translations.shareExperience;

  document.getElementById("review-name-label").textContent =
    translations.yourName;

  document.getElementById("review-name").placeholder =
    translations.namePlaceholder;

  document.getElementById("rating-label").textContent =
    translations.rating;

  document.getElementById("review-text-label").textContent =
    translations.yourReview;

  document.getElementById("review-text").placeholder =
    translations.reviewPlaceholder;

  document.getElementById("submit-review-btn").textContent =
    translations.submitReview;

  document.getElementById("location-label").textContent =
    translations.locationLabel;

  document.getElementById("location-title").textContent =
    translations.locationTitle;

  document.getElementById("opening-hours").textContent =
    translations.openingHours;

  document.getElementById("hours-breakfast").textContent =
    translations.breakfastHour;

  document.getElementById("hours-lunch").textContent =
    translations.lunchHour;

  document.getElementById("hours-dinner").textContent =
    translations.dinnerHour;

  document.getElementById("hours-bar").textContent =
    translations.barHour;

  document.getElementById("contact-title").textContent =
    translations.contactTitle;

  document.getElementById("phone-label").textContent =
    translations.phoneLabel;

  document.getElementById("email-label").textContent =
    translations.emailLabel;

  document.getElementById("footer-brand").textContent =
    translations.footerBrand;

  document.getElementById("footer-tagline").textContent =
    translations.footerTagline;

  document.getElementById("footer-home").textContent =
    translations.footerHome;

  document.getElementById("footer-menu").textContent =
    translations.footerMenu;

  document.getElementById("footer-reservation").textContent =
    translations.footerReservation;

  document.getElementById("footer-reviews").textContent =
    translations.footerReviews;

  document.getElementById("footer-location").textContent =
    translations.footerLocation;

  document.getElementById("footer-copy").textContent =
    translations.footerCopy;

  document.getElementById("backToTop").textContent =
    translations.backToTop;

  // Menu Header & Filters
  document.getElementById("menu-label").textContent =
    translations.menuLabel;

  document.getElementById("menu-title").textContent =
    translations.menuTitle;

  document.getElementById("menu-search").placeholder =
    translations.searchPlaceholder;

  document.getElementById("filter-all").textContent =
    translations.all;

  document.getElementById("filter-breakfast").textContent =
    translations.breakfast;

  document.getElementById("filter-lunch").textContent =
    translations.lunch;

  document.getElementById("filter-dinner").textContent =
    translations.dinner;

  document.getElementById("filter-desserts").textContent =
    translations.desserts;

  document.getElementById("filter-drinks").textContent =
    translations.drinks;

  // Masala Dosa
  document.getElementById("masala-dosa-name").textContent =
    translations.masalaDosa;

  document.getElementById("masala-dosa-desc").textContent =
    translations.masalaDosaDesc;

  document.getElementById("masala-dosa-tag").textContent =
    translations.veg;

  // Idli Sambar
  document.getElementById("idli-name").textContent =
    translations.idli;

  document.getElementById("idli-desc").textContent =
    translations.idliDesc;

  document.getElementById("idli-tag").textContent =
    translations.veg;

  // Chicken Keema Dosa
  document.getElementById("keema-name").textContent =
    translations.keema;

  document.getElementById("keema-desc").textContent =
    translations.keemaDesc;

  document.getElementById("keema-tag").textContent =
    translations.nonveg;

  // Paneer Butter Masala
  document.getElementById("paneer-name").textContent =
    translations.paneer;

  document.getElementById("paneer-desc").textContent =
    translations.paneerDesc;

  document.getElementById("paneer-tag").textContent =
    translations.veg;

  // Hyderabadi Chicken Biryani
  document.getElementById("biryani-name").textContent =
    translations.biryani;

  document.getElementById("biryani-desc").textContent =
    translations.biryaniDesc;

  document.getElementById("biryani-tag").textContent =
    translations.nonveg;

  // Butter Chicken
  document.getElementById("butter-name").textContent =
    translations.butter;

  document.getElementById("butter-desc").textContent =
    translations.butterDesc;

  document.getElementById("butter-tag").textContent =
    translations.nonveg;

  // Mango Lassi
  document.getElementById("lassi-name").textContent =
    translations.lassi;

  document.getElementById("lassi-desc").textContent =
    translations.lassiDesc;

  document.getElementById("lassi-tag").textContent =
    translations.veg;

  // Masala Chai
  document.getElementById("chai-name").textContent =
    translations.chai;

  document.getElementById("chai-desc").textContent =
    translations.chaiDesc;

  document.getElementById("chai-tag").textContent =
    translations.veg;

  // Fresh Lime Soda
  document.getElementById("soda-name").textContent =
    translations.soda;

  document.getElementById("soda-desc").textContent =
    translations.sodaDesc;

  document.getElementById("soda-tag").textContent =
    translations.veg;

  // Gulab Jamun
  document.getElementById("gulab-name").textContent =
    translations.gulab;

  document.getElementById("gulab-desc").textContent =
    translations.gulabDesc;

  document.getElementById("gulab-tag").textContent =
    translations.veg;

  // Rasmalai
  document.getElementById("rasmalai-name").textContent =
    translations.rasmalai;

  document.getElementById("rasmalai-desc").textContent =
    translations.rasmalaiDesc;

  document.getElementById("rasmalai-tag").textContent =
    translations.veg;

  // Kesar Pista Kulfi
  document.getElementById("kulfi-name").textContent =
    translations.kulfi;

  document.getElementById("kulfi-desc").textContent =
    translations.kulfiDesc;

  document.getElementById("kulfi-tag").textContent =
    translations.veg;

  // localStorage.setItem("language", lang);
}

document.addEventListener("DOMContentLoaded", async () => {
  currentLang =
    localStorage.getItem("language") || "en";

  await loadLanguage(currentLang);

  langToggle.textContent =
    currentLang === "en"
      ? "🌐 हिंदी"
      : "🌐 English";
});

langToggle.addEventListener("click", async () => {
  currentLang =
    currentLang === "en" ? "hi" : "en";

  localStorage.setItem("language", currentLang);

  await loadLanguage(currentLang);

  langToggle.textContent =
    currentLang === "en"
      ? "🌐 हिंदी"
      : "🌐 English";
});

// let translations = {};
// let currentLang = "en";

// async function loadLanguage(lang) {
//   const response = await fetch(`${lang}.json`);
//   translations = await response.json();
//   applyLanguage();
// }