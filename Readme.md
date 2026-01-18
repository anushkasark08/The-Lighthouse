# The Lighthouse | Fine Dining Website

A premium, responsive single-page website for **The Lighthouse**, an upscale fine-dining restaurant. This project features a sophisticated dark-themed aesthetic, parallax scrolling effects, and a dynamic menu system designed to provide an elegant user experience for high-end culinary brands.

    🏆 This repository is part of the Open Source 101 organised by ISTE HIT SC
---

## 🍽️ Features

* **Premium Visuals:** High-end typography using *Cormorant Garamond* and a gold-accented color palette specifically curated for fine dining.
* **Dynamic Menu System:** Interactive JavaScript-driven tabs allowing users to switch between Breakfast, Lunch, Dinner, and Drinks without page refreshes.
* **Responsive Navigation:** * Sticky header that changes opacity/blur on scroll.
    * Smooth-scroll integration for all internal links.
    * Fully functional mobile hamburger menu with overlay.
* **Advanced UI Interactions:**
    * **Parallax Backgrounds:** Subtle background movement on the Hero and Reservation sections for depth.
    * **Intersection Observer:** "Scroll-to-reveal" animations that trigger as elements enter the viewport.
    * **Custom Form Handling:** A reservation form with date validation (preventing past dates) and visual success feedback.
* **Location Integration:** Styled Google Maps iframe with a custom grayscale filter to match the site's aesthetic.

---

## 🛠️ Tech Stack

* **HTML5:** Semantic markup for accessibility and search engine optimization.
* **CSS3:** Custom properties (CSS variables), Flexbox, CSS Grid, and Keyframe animations.
* **JavaScript (ES6+):** Vanilla JS for DOM manipulation, Intersection Observer API, and form logic.
* **Google Fonts:** *Cormorant Garamond* (Serif) and *Inter* (Sans-serif).

---
## 📂 Project Structure
```
The Lighthouse/
├─ images/
│  ├─ breakfast.jpg
│  ├─ chef.jpg
│  ├─ dinner.jpg
│  ├─ drinks.jpg
│  ├─ hero-restaurant.jpg
│  └─ lunch.jpg
├─ Favicon.ico
├─ index.html
├─ LICENSE
├─ Readme.md
├─ script.js
└─ style.css
```
---

## 🚀 Getting Started

### 1. Clone the repository:
```bash
git clone [https://github.com/Anushka-Sarkar/the-lighthouse-restaurant.git](https://github.com/Anushka-Sarkar/the-lighthouse-restaurant.git)


```
### 2. Asset Setup:
Ensure your `images/` directory contains the corresponding assets referenced in the HTML:

* **hero-restaurant.jpg** (Used for Hero & Reservation background)
* **chef.jpg** (Used in the About section)
* **breakfast.jpg, lunch.jpg, dinner.jpg, drinks.jpg** (Used in Menu panels)

### 3. Launch:
Open `index.html` in any modern web browser or use the VS Code **Live Server** extension for the best experience.

---

## 🎨 Customization
The project is built with **CSS Variables**, making it incredibly easy to rebrand. Modify the primary colors in the `:root` selector of `style.css`:

```css
:root {
  --color-primary: #c9a962;   /* The signature gold accent */
  --color-bg: #1a1714;        /* The deep charcoal background */
  --color-text: #f5f2ed;      /* The off-white primary text */
  --transition: 0.3s ease;    /* Global animation speed */
}
```

## 📜 License
This project is open-source and available under the **MIT License**.

---

Developed with ❤️ by [Anushka Sarkar](https://github.com/Anushka-Sarkar)
