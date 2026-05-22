// DOM Elements
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
let menuTabs = [];
let menuPanels = [];
// Full menu data (titles, prices, descriptions, exact image filenames)
const menuData = {
  breakfast: [
    {
      title: 'Eggs Benedict Royale',
      price: 'Rs.24',
      description: 'Poached eggs, smoked salmon, hollandaise, toasted brioche',
      image: 'images/breakfast.jpg'
    },
    {
      title: 'Avocado Toast Sourdough',
      price: 'Rs.18',
      description: 'Sourdough, heirloom tomatoes, poached eggs, microgreens',
      image: 'images/Avocado Toast Sourdough.jpg'
    },
    {
      title: 'Belgian Waffles',
      price: 'Rs.17',
      description: 'Caramelized bananas, toasted pecans, bourbon vanilla cream',
      image: 'images/Belgian Waffles.jpg'
    },
    {
      title: 'French Toast Brioche',
      price: 'Rs.19',
      description: 'Vanilla bean custard, fresh berries, maple syrup, whipped cream',
      image: 'images/French Toast Brioche.jpg'
    },
    {
      title: 'Shakshuka Spiced tomato sauce',
      price: 'Rs.21',
      description: 'Spiced tomato sauce, baked eggs, feta, fresh herbs, warm pita',
      image: 'images/Shakshuka Spiced tomato sauce.jpg'
    }
  ],
  lunch: [
    {
      title: 'Grilled Salmon Salad',
      price: 'Rs.28',
      description: 'Atlantic salmon, mixed greens, citrus vinaigrette, avocado',
      image: 'images/lunch.jpg'
    },
    {
      title: 'French Onion Soup',
      price: 'Rs.22',
      description: 'Slow-cooked onions, gruyère toast, rich beef broth',
      image: 'images/French Onion Soup.jpg'
    },
    {
      title: 'Lobster Roll Maine lobster',
      price: 'Rs.28',
      description: 'Butter toasted brioche, fresh lobster, herb aioli',
      image: 'images/Lobster Roll Maine lobster.jpg'
    },
    {
      title: 'Mediterranean Bowl Quinoa',
      price: 'Rs.20',
      description: 'Quinoa, roasted vegetables, feta, tahini dressing',
      image: 'images/Mediterranean Bowl Quinoa.jpg'
    },
    {
      title: 'Truffle Burger',
      price: 'Rs.26',
      description: 'Black truffle aioli, aged cheddar, brioche bun',
      image: 'images/Truffle Burger.jpg'
    }
  ],
  dinner: [
    {
      title: 'Filet Mignon',
      price: 'Rs.58',
      description: '8oz center cut, herb butter, truffle mashed potatoes, asparagus',
      image: 'images/dinner.jpg'
    },
    {
      title: 'Chilean Sea Bass',
      price: 'Rs.38',
      description: 'Miso glaze, asparagus, citrus beurre blanc',
      image: 'images/Chilean Sea Bass.jpg'
    },
    {
      title: 'Lamb Chops',
      price: 'Rs.36',
      description: 'Rosemary crust, garlic mash, red wine reduction',
      image: 'images/Lamb Chops.jpg'
    },
    {
      title: 'Mushroom Risotto',
      price: 'Rs.29',
      description: 'Wild mushrooms, parmesan, truffle oil',
      image: 'images/Mushroom Risotto.jpg'
    },
    {
      title: 'Pan-Seared Duck Breast',
      price: 'Rs.34',
      description: 'Cherry glaze, roasted vegetables, herb jus',
      image: 'images/Pan-Seared Duck Breast.jpg'
    }
  ],
  drinks: [
    {
      title: 'Lighthouse Old Fashioned',
      price: 'Rs.18',
      description: 'Bourbon, demerara, angostura, orange peel, luxardo cherry',
      image: 'images/drinks.jpg'
    },
    {
      title: 'Espresso Martini',
      price: 'Rs.16',
      description: 'Vodka, espresso, coffee liqueur',
      image: 'images/Espresso Martini.jpg'
    },
    {
      title: 'French 75',
      price: 'Rs.15',
      description: 'Gin, lemon, champagne',
      image: 'images/French 75.jpg'
    },
    {
      title: 'Negroni Gin',
      price: 'Rs.17',
      description: 'Gin, Campari, sweet vermouth',
      image: 'images/Negroni Gin.jpg'
    },
    {
      title: 'Wine Selection',
      price: 'Rs.14+',
      description: 'Curated wines by the glass',
      image: 'images/Wine Selection.jpg'
    }
  ],
  _fallbacks: {
    breakfast: './images/breakfast.jpg',
    lunch: './images/lunch.jpg',
    dinner: './images/dinner.jpg',
    drinks: './images/drinks.jpg'
  }
};
const previewFadeClass = 'fade-out';

const heroBg = document.getElementById('heroBg');
const reservationBg = document.getElementById('reservationBg');
const reservationForm = document.getElementById('reservationForm');
const dateInput = document.getElementById('date');
const timeSelect = document.getElementById('time');

if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
  
  dateInput.addEventListener('change', updateAvailableTimes);
}

// Update available time slots based on current time
function updateAvailableTimes() {
  if (!dateInput || !timeSelect) return;

  const selectedDate = dateInput.value;
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  const options = timeSelect.querySelectorAll('option');

  options.forEach(option => {
    if (option.value === "") return;

    const [optionHours, optionMinutes] = option.value.split(':').map(Number);

    if (selectedDate === today) {
      // Disable if time is in the past (with a 30 min buffer)
      if (optionHours < currentHours || (optionHours === currentHours && optionMinutes <= currentMinutes + 30)) {
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

function preloadMenuImages() {
  Object.keys(menuData).forEach(key => {
    if (key === '_fallbacks') return;
    menuData[key].forEach(item => {
      const image = new Image();
      image.src = item.image;
      // if image fails, browser will fall back when used — no flicker due to buffering
    });
  });
}

function updateFeaturedImage(panel, item) {
  if (!panel || !item) return;
  const imageEl = panel.querySelector('.menu-image img');
  if (!imageEl) return;

  const currentSrc = imageEl.getAttribute('src');
  const newSrc = item.image;
  if (!newSrc) return;

  if (imageEl.dataset.currentImage === newSrc || currentSrc === newSrc) {
    imageEl.alt = item.alt || item.title || '';
    imageEl.dataset.currentImage = newSrc;
    return;
  }

  const applyNewImage = () => {
    imageEl.src = newSrc;
    imageEl.alt = item.alt || item.title || '';
    imageEl.dataset.currentImage = newSrc;
    requestAnimationFrame(() => imageEl.classList.remove(previewFadeClass));
  };

  const handleFade = () => {
    imageEl.removeEventListener('transitionend', handleFade);
    applyNewImage();
  };

  imageEl.addEventListener('transitionend', handleFade, { once: true });
  imageEl.classList.remove(previewFadeClass);
  void imageEl.offsetWidth;
  requestAnimationFrame(() => imageEl.classList.add(previewFadeClass));

  setTimeout(() => {
    if (imageEl.classList.contains(previewFadeClass)) {
      imageEl.removeEventListener('transitionend', handleFade);
      applyNewImage();
    }
  }, 600);
}

// Render menu items from `menuData` into their panels while preserving markup structure
function renderMenuItems() {
  Object.keys(menuData).forEach(key => {
    if (key === '_fallbacks') return;
    const panel = document.getElementById(key);
    if (!panel) return;

    const container = panel.querySelector('.menu-items');
    if (!container) return;

    // Create markup for each item using price and description
    container.innerHTML = menuData[key].map((item, idx) => `
      <div class="menu-item" data-index="${idx}">
        <div class="menu-item-header">
          <h3>${item.title}</h3>
          <span class="menu-price">${item.price || ''}</span>
        </div>
        <p>${item.description || ''}</p>
      </div>
    `).join('');
  });
}

function setActiveMenuItem(panel, index) {
  if (!panel) return;
  const menuItems = Array.from(panel.querySelectorAll('.menu-item'));
  const category = panel.id;
  const selectedItem = menuData[category] && menuData[category][index];

  if (!selectedItem) return;

  menuItems.forEach((menuItem, menuIndex) => {
    const isActive = menuIndex === index;
    menuItem.classList.toggle('active', isActive);
    menuItem.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  updateFeaturedImage(panel, selectedItem);
}

function bindMenuPanel(panel) {
  if (!panel) return;
  const category = panel.id;
  const items = Array.from(panel.querySelectorAll('.menu-item'));

  items.forEach((menuItem, index) => {
    const item = menuData[category] && menuData[category][index];
    if (!item) return;

    menuItem.setAttribute('tabindex', '0');
    menuItem.setAttribute('role', 'button');
    menuItem.setAttribute('aria-label', `Preview ${item.title}`);
    menuItem.setAttribute('aria-pressed', 'false');

    menuItem.addEventListener('mouseenter', () => setActiveMenuItem(panel, index));
    menuItem.addEventListener('click', () => setActiveMenuItem(panel, index));
    menuItem.addEventListener('focus', () => setActiveMenuItem(panel, index));
    menuItem.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setActiveMenuItem(panel, index);
      }
    });
  });

  // Load category default image on initial load
  loadCategoryDefaultImage(panel);
  markFirstMenuItemActive(panel);
}

function initializeMenuPreviews() {
  renderMenuItems();
  // refresh panel element list after rendering
  const refreshedPanels = document.querySelectorAll('.menu-panel');
  refreshedPanels.forEach(panel => bindMenuPanel(panel));
  preloadMenuImages();
}

// Navigation scroll effect
let lastScroll = 0;

function handleScroll() {
  const currentScroll = window.pageYOffset;
  
  // Add scrolled class for background
  if (currentScroll > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
  
  lastScroll = currentScroll;
  
  // Parallax effect for hero and reservation backgrounds
  if (heroBg) {
    const heroSpeed = 0.5;
    heroBg.style.transform = `translateY(${currentScroll * heroSpeed}px)`;
  }
  
  if (reservationBg && currentScroll > window.innerHeight) {
    const reservationSection = document.getElementById('reservation');
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
  const sections = document.querySelectorAll('section[id]');
  const scrollPosition = window.pageYOffset + 150;
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
          link.classList.add('active');
        }
      });
    }
  });
}

// Mobile menu toggle
function toggleMobileMenu() {
  navToggle.classList.toggle('active');
  navMenu.classList.toggle('active');
  document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
}

// Close mobile menu when clicking a link
function closeMobileMenu() {
  navToggle.classList.remove('active');
  navMenu.classList.remove('active');
  document.body.style.overflow = '';
}

// Load category default image (breakfast.jpg, lunch.jpg, etc.)
function loadCategoryDefaultImage(panel) {
  if (!panel) return;
  const imageEl = panel.querySelector('.menu-image img');
  const category = panel.id;
  const fallbackSrc = menuData._fallbacks && menuData._fallbacks[category];
  
  if (!imageEl || !fallbackSrc) return;
  
  imageEl.src = fallbackSrc;
  imageEl.alt = category.charAt(0).toUpperCase() + category.slice(1) + ' Selection';
  imageEl.dataset.currentImage = fallbackSrc;
}

// Mark first menu item as active visually
function markFirstMenuItemActive(panel) {
  if (!panel) return;
  const menuItems = Array.from(panel.querySelectorAll('.menu-item'));
  menuItems.forEach((menuItem, idx) => {
    menuItem.classList.toggle('active', idx === 0);
    menuItem.setAttribute('aria-pressed', idx === 0 ? 'true' : 'false');
  });
}

// Menu tabs functionality
function switchMenuTab(e) {
  const targetTab = e.target.dataset.tab;
  
  // Update tab buttons
  menuTabs.forEach(tab => {
    tab.classList.remove('active');
  });
  e.target.classList.add('active');
  
  // Update panels
  menuPanels.forEach(panel => {
    panel.classList.remove('active');
    if (panel.id === targetTab) {
      panel.classList.add('active');
      loadCategoryDefaultImage(panel);
      markFirstMenuItemActive(panel);
    }
  });
}

// Smooth scroll for navigation links
function smoothScroll(e) {
  e.preventDefault();
  const targetId = this.getAttribute('href');
  const targetSection = document.querySelector(targetId);
  
  if (targetSection) {
    const offsetTop = targetSection.offsetTop - 80;
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
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
  const inputs = reservationForm.querySelectorAll('input, select, textarea');
  let isValid = true;
  
  inputs.forEach(input => {
    if (input.required && !input.value) {
      input.style.borderColor = '#c94a4a';
      isValid = false;
    } else {
      input.style.borderColor = '';
    }
  });
  
  if (isValid) {
    // Show success message (visual only)
    const submitBtn = reservationForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Reservation Requested!';
    submitBtn.style.backgroundColor = '#4a9c6a';
    submitBtn.disabled = true;
    
    // Reset form after delay
    setTimeout(() => {
      reservationForm.reset();
      submitBtn.textContent = originalText;
      submitBtn.style.backgroundColor = '';
      submitBtn.disabled = false;
    }, 3000);
  }
}

// Intersection Observer for fade-in animations
function setupIntersectionObserver() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);
  
  // Observe sections for animations
  const animatedElements = document.querySelectorAll('.about-content, .menu-panel, .reservation-form, .location-info');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// Add visible class styles
const style = document.createElement('style');
style.textContent = `
  .visible {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);

/// Scroll to Discover - Auto slow scroll
const heroScroll = document.querySelector('.hero-scroll');
let autoScrollInterval = null;

// top: pixels per step | 10: interval in ms
// top:1 + 20ms = dreamy slow | top:1 + 10ms = default | top:2 + 10ms = faster

function startAutoScroll() {
  autoScrollInterval = setInterval(() => {
    window.scrollBy({ top: 2, behavior: 'instant' });

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
  heroScroll.style.cursor = 'pointer';

  // Toggle scroll on click — click once to start, click again to stop
  heroScroll.addEventListener('click', () => {
    autoScrollInterval ? stopAutoScroll() : startAutoScroll();
  });
}

// Stop scrolling on any user interaction
['mousemove', 'touchstart', 'keydown', 'wheel', 'pointerdown'].forEach(event => {
  window.addEventListener(event, stopAutoScroll);
});


// Event Listeners
window.addEventListener('scroll', handleScroll);
navToggle.addEventListener('click', toggleMobileMenu);

navLinks.forEach(link => {
  link.addEventListener('click', smoothScroll);
});

document.querySelectorAll('.nav-cta, .hero-buttons a').forEach(link => {
  link.addEventListener('click', smoothScroll);
});

if (reservationForm) {
  reservationForm.addEventListener('submit', handleFormSubmit);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  menuTabs = document.querySelectorAll('.menu-tab');
  menuPanels = document.querySelectorAll('.menu-panel');

  menuTabs.forEach(tab => {
    tab.addEventListener('click', switchMenuTab);
  });

  handleScroll();
  setupIntersectionObserver();
  initializeMenuPreviews();
  updateAvailableTimes();
});

// Close mobile menu on window resize
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    closeMobileMenu();
  }
});


// ── Reviews (localStorage) ────────────────────────────────────────────────

const STORAGE_KEY = 'lighthouse_reviews';

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
  name: 'Rasshi Srivastav',
  rating: 5,
  text: 'Absolutely loved the food and ambience! Every dish was crafted with such care and the atmosphere was warm and elegant. A truly memorable dining experience — will definitely be coming back!',
  date: '14 May 2026'
};

function renderReviews() {
  const grid = document.getElementById('reviews-grid');
  if (!grid) return;

  const userReviews = getReviews();

  // Pinned review always at top, user reviews below
  const allReviews = [pinnedReview, ...userReviews];

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

// Star rating widget
let selectedRating = 0;
const starBtns = document.querySelectorAll('#star-input .star-btn');

starBtns.forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    const val = +btn.dataset.value;
    starBtns.forEach(s => s.classList.toggle('active', +s.dataset.value <= val));
  });
  btn.addEventListener('mouseleave', () => {
    starBtns.forEach(s => s.classList.toggle('active', +s.dataset.value <= selectedRating));
  });
  btn.addEventListener('click', () => {
    selectedRating = +btn.dataset.value;
    document.getElementById('review-rating').value = selectedRating;
    starBtns.forEach(s => s.classList.toggle('active', +s.dataset.value <= selectedRating));
  });
});

// Form submit
const reviewForm = document.getElementById('review-form');
const reviewMsg  = document.getElementById('review-msg');

if (reviewForm) {
  reviewForm.addEventListener('submit', function(e) {
    e.preventDefault();

    if (!selectedRating) {
      reviewMsg.textContent = 'Please select a star rating.';
      reviewMsg.style.color = '#c94a4a';
      reviewMsg.style.display = 'block';
      return;
    }

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const newReview = {
      id: Date.now(),
      name: document.getElementById('review-name').value.trim(),
      rating: selectedRating,
      text: document.getElementById('review-text').value.trim(),
      date: dateStr
    };

    const reviews = getReviews();
    reviews.unshift(newReview);
    saveReviews(reviews);
    renderReviews();

    // Reset
    reviewForm.reset();
    selectedRating = 0;
    document.getElementById('review-rating').value = 0;
    starBtns.forEach(s => s.classList.remove('active'));

    reviewMsg.textContent = 'Thank you for your review!';
    reviewMsg.style.color = '#4a9c6a';
    reviewMsg.style.display = 'block';
    setTimeout(() => { reviewMsg.style.display = 'none'; }, 3000);

    document.getElementById('reviews-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
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
