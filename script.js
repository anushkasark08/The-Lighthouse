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

const translations = {
  en: {
    logo: "The Lighthouse",
    home: "Home",
    about: "About",
    menu: "Menu",
    reservation: "Reservations",
    reviews: "Reviews",
    location: "Location",
    book: "Book a Table",
    button: "🌐 हिंदी",
    heroTagline: "Est. 1987",
    heroTitle: "The Lighthouse",
    heroSubtitle: "Where culinary artistry meets timeless elegance",
    exploreMenu: "Explore Menu",
    reserveTable: "Reserve Table",
    scrollDiscover: "Scroll To Discover",
    clickScroll: "Click To Scroll",
    aboutLabel: "Our Story",
    aboutTitle: "A Legacy of Flavor",
    aboutText1:
      "For over three decades, The Lighthouse has been a beacon of culinary excellence. Our chef combines classical techniques with modern innovation, sourcing only the finest seasonal ingredients from local farms and trusted suppliers.",
    aboutText2:
      "Every dish tells a story, every meal creates a memory. We invite you to experience the art of fine dining in an atmosphere of warmth and sophistication.",
    reservationLabel: "Join Us",
    reservationTitle: "Make a Reservation",
    reservationText:
      "Reserve your table and experience an unforgettable evening of culinary excellence. For parties larger than 8, please call us directly.",
    hours: "Hours",
    callUs: "Call Us",
    fullName: "Full Name",
    email: "Email",
    phone: "Phone",
    guests: "Guests",
    date: "Date",
    time: "Time",
    specialRequests: "Special Requests",
    selectGuests: "Select guests",
    selectTime: "Select time",
    reservationBtn: "Request Reservation",
    reservationNote:
      "You will receive a confirmation email within 24 hours.",
    reviewsLabel: "Guest Experiences",
    reviewsTitle: "Customer Reviews",
    shareExperience: "Share Your Experience",
    yourName: "Your Name",
    namePlaceholder: "Jane Smith",
    rating: "Rating",
    yourReview: "Your Review",
    reviewPlaceholder: "Tell us about your visit...",
    submitReview: "Submit Review",
    locationLabel: "Find Us",
    locationTitle: "Our Location",
    openingHours: "Opening Hours",
    breakfastHour: "Breakfast",
    lunchHour: "Lunch",
    dinnerHour: "Dinner",
    barHour: "Bar",
    contactTitle: "Contact",
    phoneLabel: "Phone:",
    emailLabel: "Email:",
    footerBrand: "The Lighthouse",
    footerTagline: "Fine Dining Since 1987",
    footerHome: "Home",
    footerMenu: "Menu",
    footerReservation: "Reservations",
    footerReviews: "Reviews",
    footerLocation: "Location",
    footerCopy:
      "© 2026 The Lighthouse. All rights reserved.",
    backToTop: "BACK TO TOP ▲",
    menuLabel: "Culinary Offerings",
    menuTitle: "Our Menu",
    searchPlaceholder: "Search dishes...",
    all: "All",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    desserts: "Desserts",
    drinks: "Drinks",
    masalaDosa: "Masala Dosa",
    masalaDosaDesc: "Crispy dosa served with chutney and sambar",
    idli: "Idli Sambar",
    idliDesc: "Soft steamed idlis served with hot sambar and coconut chutney",
    keema: "Chicken Keema Dosa",
    keemaDesc: "Crispy dosa stuffed with spicy chicken keema masala",
    paneer: "Paneer Butter Masala",
    paneerDesc: "Rich creamy paneer curry served with butter naan",
    biryani: "Hyderabadi Chicken Biryani",
    biryaniDesc: "Aromatic dum biryani layered with spicy chicken and basmati rice",
    butter: "Butter Chicken",
    butterDesc: "Creamy tomato-based chicken curry with naan",
    lassi: "Mango Lassi",
    lassiDesc: "Refreshing chilled yogurt drink blended with sweet mango pulp",
    chai: "Masala Chai",
    chaiDesc: "Traditional Indian tea brewed with aromatic spices and milk",
    soda: "Fresh Lime Soda",
    sodaDesc: "Fizzy lime soda served sweet, salted, or mixed style",
    gulab: "Gulab Jamun",
    gulabDesc: "Soft milk-solid dumplings soaked in warm sugar syrup",
    rasmalai: "Rasmalai",
    rasmalaiDesc: "Soft paneer discs soaked in creamy saffron-flavored milk",
    kulfi: "Kesar Pista Kulfi",
    kulfiDesc: "Traditional Indian frozen dessert flavored with saffron and pistachios",
    veg: "Veg",
    nonveg: "Non-Veg",
  },

  hi: {
    logo: "द लाइटहाउस",
    home: "होम",
    about: "हमारे बारे में",
    menu: "मेन्यू",
    reservation: "बुकिंग",
    reviews: "रिव्यू",
    location: "लोकेशन",
    book: "टेबल बुक करें",
    button: "🌐 English",
    heroTagline: "1987 से",
    heroTitle: "द लाइटहाउस",
    heroSubtitle: "जहाँ स्वाद और शानदार माहौल का अनोखा संगम है",
    exploreMenu: "मेन्यू देखें",
    reserveTable: "टेबल बुक करें",
    scrollDiscover: "और देखें",
    clickScroll: "स्क्रॉल करने के लिए क्लिक करें",
    aboutLabel: "हमारी कहानी",
    aboutTitle: "हमारी खास पहचान",
    aboutText1:
      "पिछले 30 सालों से द लाइटहाउस अपने बेहतरीन स्वाद और शानदार सेवा के लिए जाना जाता है। हमारे शेफ पारंपरिक और आधुनिक तरीकों का उपयोग करके स्वादिष्ट व्यंजन तैयार करते हैं।",
    aboutText2:
      "हर डिश अपने आप में खास है और हर भोजन एक यादगार अनुभव बनाता है। हम आपको शानदार माहौल और बेहतरीन खाने का आनंद लेने के लिए आमंत्रित करते हैं।",
    reservationLabel: "हमारे साथ जुड़ें",
    reservationTitle: "टेबल बुक करें",
    reservationText:
      "अपनी टेबल बुक करें और शानदार खाने का अनुभव लें। अगर आपके साथ 8 से ज्यादा लोग हैं, तो कृपया हमें कॉल करें।",
    hours: "समय",
    callUs: "हमें कॉल करें",
    fullName: "पूरा नाम",
    email: "ईमेल",
    phone: "मोबाइल नंबर",
    guests: "लोगों की संख्या",
    date: "तारीख",
    time: "समय",
    specialRequests: "खास अनुरोध",
    selectGuests: "संख्या चुनें",
    selectTime: "समय चुनें",
    reservationBtn: "बुकिंग भेजें",
    reservationNote:
      "आपको 24 घंटे के अंदर पुष्टि ईमेल मिल जाएगी।",
    reviewsLabel: "लोग क्या कहते हैं",
    reviewsTitle: "रिव्यू",
    shareExperience: "अपना अनुभव बताएं",
    yourName: "आपका नाम",
    namePlaceholder: "अपना नाम लिखें",
    rating: "रेटिंग",
    yourReview: "आपका रिव्यू",
    reviewPlaceholder: "अपने अनुभव के बारे में बताइए...",
    submitReview: "रिव्यू भेजें",
    locationLabel: "हमसे मिलें",
    locationTitle: "हमारी लोकेशन",
    openingHours: "खुलने का समय",
    breakfastHour: "नाश्ता",
    lunchHour: "लंच",
    dinnerHour: "डिनर",
    barHour: "बार",
    contactTitle: "संपर्क",
    phoneLabel: "फोन:",
    emailLabel: "ईमेल:",
    footerBrand: "द लाइटहाउस",
    footerTagline: "1987 से शानदार डाइनिंग",
    footerHome: "होम",
    footerMenu: "मेन्यू",
    footerReservation: "बुकिंग",
    footerReviews: "रिव्यू",
    footerLocation: "लोकेशन",
    footerCopy:
      "© 2026 द लाइटहाउस। सर्वाधिकार सुरक्षित।",
    backToTop: "ऊपर जाएँ ▲",
    menuLabel: "हमारे खास व्यंजन",
    menuTitle: "हमारा मेन्यू",
    searchPlaceholder: "खाना खोजें...",
    all: "सभी",
    breakfast: "नाश्ता",
    lunch: "लंच",
    dinner: "डिनर",
    desserts: "मिठाई",
    drinks: "ड्रिंक्स",
    masalaDosa: "मसाला डोसा",
    masalaDosaDesc: "करारा डोसा, चटनी और सांभर के साथ।",
    idli: "इडली सांभर",
    idliDesc: "नरम इडली, गर्म सांभर और नारियल चटनी के साथ।",
    keema: "चिकन कीमा डोसा",
    keemaDesc: "मसालेदार चिकन कीमा से भरा करारा डोसा।",
    paneer: "पनीर बटर मसाला",
    paneerDesc: "मलाईदार पनीर करी, बटर नान के साथ।",
    biryani: "हैदराबादी चिकन बिरयानी",
    biryaniDesc: "मसालेदार चिकन और बासमती चावल से बनी दम बिरयानी।",
    butter: "बटर चिकन",
    butterDesc: "मलाईदार टमाटर वाली चिकन करी, नान के साथ।",
    lassi: "मैंगो लस्सी",
    lassiDesc: "मीठे आम से बनी ठंडी लस्सी।",
    chai: "मसाला चाय",
    chaiDesc: "मसालों और दूध से बनी चाय।",
    soda: "फ्रेश लाइम सोडा",
    sodaDesc: "मीठा, नमकीन या मिक्स फ्रेश लाइम सोडा।",
    gulab: "गुलाब जामुन",
    gulabDesc: "गर्म चाशनी में डूबे नरम गुलाब जामुन।",
    rasmalai: "रसमलाई",
    rasmalaiDesc: "मलाईदार दूध में डूबी रसमलाई।",
    kulfi: "केसर पिस्ता कुल्फी",
    kulfiDesc: "केसर और पिस्ता वाली कुल्फी।",
    veg: "वेज",
    nonveg: "नॉन-वेज",
  },
};

let currentLanguage = localStorage.getItem("language") || "en";

function applyLanguage(lang) {
  document.getElementById("site-logo").textContent =
    translations[lang].logo;

  document.getElementById("nav-home").textContent =
    translations[lang].home;

  document.getElementById("nav-about").textContent =
    translations[lang].about;

  document.getElementById("nav-menu").textContent =
    translations[lang].menu;

  document.getElementById("nav-reservation").textContent =
    translations[lang].reservation;

  document.getElementById("nav-reviews").textContent =
    translations[lang].reviews;

  document.getElementById("nav-location").textContent =
    translations[lang].location;

  document.getElementById("book-table").textContent =
    translations[lang].book;

  langToggle.textContent =
    translations[lang].button;

  document.getElementById("hero-tagline").textContent =
    translations[lang].heroTagline;

  document.getElementById("hero-title").textContent =
    translations[lang].heroTitle;

  document.getElementById("hero-subtitle").textContent =
    translations[lang].heroSubtitle;

  document.getElementById("explore-menu").textContent =
    translations[lang].exploreMenu;

  document.getElementById("reserve-table").textContent =
    translations[lang].reserveTable;

  document.getElementById("scroll-discover").textContent =
    translations[lang].scrollDiscover;

  document.getElementById("click-scroll").textContent =
    translations[lang].clickScroll;

  document.getElementById("about-label").textContent =
    translations[lang].aboutLabel;

  document.getElementById("about-title").textContent =
    translations[lang].aboutTitle;

  document.getElementById("about-text-1").textContent =
    translations[lang].aboutText1;

  document.getElementById("about-text-2").textContent =
    translations[lang].aboutText2;

  document.getElementById("reservation-label").textContent =
    translations[lang].reservationLabel;

  document.getElementById("reservation-title").textContent =
    translations[lang].reservationTitle;

  document.getElementById("reservation-text").textContent =
    translations[lang].reservationText;

  document.getElementById("hours-title").textContent =
    translations[lang].hours;

  document.getElementById("call-title").textContent =
    translations[lang].callUs;

  document.getElementById("label-name").textContent =
    translations[lang].fullName;

  document.getElementById("label-email").textContent =
    translations[lang].email;

  document.getElementById("label-phone").textContent =
    translations[lang].phone;

  document.getElementById("label-guests").textContent =
    translations[lang].guests;

  document.getElementById("label-date").textContent =
    translations[lang].date;

  document.getElementById("label-time").textContent =
    translations[lang].time;

  document.getElementById("label-requests").textContent =
    translations[lang].specialRequests;

  document.getElementById("select-guests").textContent =
    translations[lang].selectGuests;

  document.getElementById("select-time").textContent =
    translations[lang].selectTime;

  document.getElementById("reservation-btn").textContent =
    translations[lang].reservationBtn;

  document.getElementById("reservation-note").textContent =
    translations[lang].reservationNote;

  document.getElementById("reviews-label").textContent =
    translations[lang].reviewsLabel;

  document.getElementById("reviews-title").textContent =
    translations[lang].reviewsTitle;

  document.getElementById("share-experience").textContent =
    translations[lang].shareExperience;

  document.getElementById("review-name-label").textContent =
    translations[lang].yourName;

  document.getElementById("review-name").placeholder =
    translations[lang].namePlaceholder;

  document.getElementById("rating-label").textContent =
    translations[lang].rating;

  document.getElementById("review-text-label").textContent =
    translations[lang].yourReview;

  document.getElementById("review-text").placeholder =
    translations[lang].reviewPlaceholder;

  document.getElementById("submit-review-btn").textContent =
    translations[lang].submitReview;

  document.getElementById("location-label").textContent =
    translations[lang].locationLabel;

  document.getElementById("location-title").textContent =
    translations[lang].locationTitle;

  document.getElementById("opening-hours").textContent =
    translations[lang].openingHours;

  document.getElementById("hours-breakfast").textContent =
    translations[lang].breakfastHour;

  document.getElementById("hours-lunch").textContent =
    translations[lang].lunchHour;

  document.getElementById("hours-dinner").textContent =
    translations[lang].dinnerHour;

  document.getElementById("hours-bar").textContent =
    translations[lang].barHour;

  document.getElementById("contact-title").textContent =
    translations[lang].contactTitle;

  document.getElementById("phone-label").textContent =
    translations[lang].phoneLabel;

  document.getElementById("email-label").textContent =
    translations[lang].emailLabel;

  document.getElementById("footer-brand").textContent =
    translations[lang].footerBrand;

  document.getElementById("footer-tagline").textContent =
    translations[lang].footerTagline;

  document.getElementById("footer-home").textContent =
    translations[lang].footerHome;

  document.getElementById("footer-menu").textContent =
    translations[lang].footerMenu;

  document.getElementById("footer-reservation").textContent =
    translations[lang].footerReservation;

  document.getElementById("footer-reviews").textContent =
    translations[lang].footerReviews;

  document.getElementById("footer-location").textContent =
    translations[lang].footerLocation;

  document.getElementById("footer-copy").textContent =
    translations[lang].footerCopy;

  document.getElementById("backToTop").textContent =
    translations[lang].backToTop;

  // Menu Header & Filters
  document.getElementById("menu-label").textContent =
    translations[lang].menuLabel;

  document.getElementById("menu-title").textContent =
    translations[lang].menuTitle;

  document.getElementById("menu-search").placeholder =
    translations[lang].searchPlaceholder;

  document.getElementById("filter-all").textContent =
    translations[lang].all;

  document.getElementById("filter-breakfast").textContent =
    translations[lang].breakfast;

  document.getElementById("filter-lunch").textContent =
    translations[lang].lunch;

  document.getElementById("filter-dinner").textContent =
    translations[lang].dinner;

  document.getElementById("filter-desserts").textContent =
    translations[lang].desserts;

  document.getElementById("filter-drinks").textContent =
    translations[lang].drinks;

  // Masala Dosa
  document.getElementById("masala-dosa-name").textContent =
    translations[lang].masalaDosa;

  document.getElementById("masala-dosa-desc").textContent =
    translations[lang].masalaDosaDesc;

  document.getElementById("masala-dosa-tag").textContent =
    translations[lang].veg;

  // Idli Sambar
  document.getElementById("idli-name").textContent =
    translations[lang].idli;

  document.getElementById("idli-desc").textContent =
    translations[lang].idliDesc;

  document.getElementById("idli-tag").textContent =
    translations[lang].veg;

  // Chicken Keema Dosa
  document.getElementById("keema-name").textContent =
    translations[lang].keema;

  document.getElementById("keema-desc").textContent =
    translations[lang].keemaDesc;

  document.getElementById("keema-tag").textContent =
    translations[lang].nonveg;

  // Paneer Butter Masala
  document.getElementById("paneer-name").textContent =
    translations[lang].paneer;

  document.getElementById("paneer-desc").textContent =
    translations[lang].paneerDesc;

  document.getElementById("paneer-tag").textContent =
    translations[lang].veg;

  // Hyderabadi Chicken Biryani
  document.getElementById("biryani-name").textContent =
    translations[lang].biryani;

  document.getElementById("biryani-desc").textContent =
    translations[lang].biryaniDesc;

  document.getElementById("biryani-tag").textContent =
    translations[lang].nonveg;

  // Butter Chicken
  document.getElementById("butter-name").textContent =
    translations[lang].butter;

  document.getElementById("butter-desc").textContent =
    translations[lang].butterDesc;

  document.getElementById("butter-tag").textContent =
    translations[lang].nonveg;

  // Mango Lassi
  document.getElementById("lassi-name").textContent =
    translations[lang].lassi;

  document.getElementById("lassi-desc").textContent =
    translations[lang].lassiDesc;

  document.getElementById("lassi-tag").textContent =
    translations[lang].veg;

  // Masala Chai
  document.getElementById("chai-name").textContent =
    translations[lang].chai;

  document.getElementById("chai-desc").textContent =
    translations[lang].chaiDesc;

  document.getElementById("chai-tag").textContent =
    translations[lang].veg;

  // Fresh Lime Soda
  document.getElementById("soda-name").textContent =
    translations[lang].soda;

  document.getElementById("soda-desc").textContent =
    translations[lang].sodaDesc;

  document.getElementById("soda-tag").textContent =
    translations[lang].veg;

  // Gulab Jamun
  document.getElementById("gulab-name").textContent =
    translations[lang].gulab;

  document.getElementById("gulab-desc").textContent =
    translations[lang].gulabDesc;

  document.getElementById("gulab-tag").textContent =
    translations[lang].veg;

  // Rasmalai
  document.getElementById("rasmalai-name").textContent =
    translations[lang].rasmalai;

  document.getElementById("rasmalai-desc").textContent =
    translations[lang].rasmalaiDesc;

  document.getElementById("rasmalai-tag").textContent =
    translations[lang].veg;

  // Kesar Pista Kulfi
  document.getElementById("kulfi-name").textContent =
    translations[lang].kulfi;

  document.getElementById("kulfi-desc").textContent =
    translations[lang].kulfiDesc;

  document.getElementById("kulfi-tag").textContent =
    translations[lang].veg;

  localStorage.setItem("language", lang);
}

applyLanguage(currentLanguage);

langToggle.addEventListener("click", () => {
  currentLanguage =
    currentLanguage === "en" ? "hi" : "en";

  applyLanguage(currentLanguage);
});
