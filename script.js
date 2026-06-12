// // DOM Elements
// const nav = document.getElementById("nav");
// const navToggle = document.getElementById("navToggle");
// const navMenu = document.getElementById("navMenu");
// const navLinks = document.querySelectorAll(".nav-link");
// const heroBg = document.getElementById("heroBg");
// const reservationBg = document.getElementById("reservationBg");
// const reservationForm = document.getElementById("reservationForm");
// const dateInput = document.getElementById("date");
// const timeSelect = document.getElementById("time");
// const themeToggle = document.getElementById("themeToggle");
// if (dateInput) {
//   const today = new Date().toISOString().split("T")[0];
//   dateInput.setAttribute("min", today);

//   dateInput.addEventListener("change", updateAvailableTimes);
// }

// // Update available time slots based on current time
// function updateAvailableTimes() {
//   if (!dateInput || !timeSelect) return;

//   const selectedDate = dateInput.value;
//   const today = new Date().toISOString().split("T")[0];
//   const now = new Date();
//   const currentHours = now.getHours();
//   const currentMinutes = now.getMinutes();

//   const options = timeSelect.querySelectorAll("option");

//   options.forEach((option) => {
//     if (option.value === "") return;

//     const [optionHours, optionMinutes] = option.value.split(":").map(Number);

//     if (selectedDate === today) {
//       // Disable if time is in the past (with a 30 min buffer)
//       if (
//         optionHours < currentHours ||
//         (optionHours === currentHours && optionMinutes <= currentMinutes + 30)
//       ) {
//         option.disabled = true;
//         if (option.selected) {
//           timeSelect.value = "";
//         }
//       } else {
//         option.disabled = false;
//       }
//     } else {
//       option.disabled = false;
//     }
//   });
// }

// // Navigation scroll effect
// let lastScroll = 0;

// function handleScroll() {
//   const currentScroll = window.pageYOffset;

//   // Add scrolled class for background
//   if (currentScroll > 50) {
//     nav.classList.add("scrolled");
//   } else {
//     nav.classList.remove("scrolled");
//   }

//   lastScroll = currentScroll;

//   // Parallax effect for hero and reservation backgrounds
//   if (heroBg) {
//     const heroSpeed = 0.5;
//     heroBg.style.transform = `translateY(${currentScroll * heroSpeed}px)`;
//   }

//   if (reservationBg && currentScroll > window.innerHeight) {
//     const reservationSection = document.getElementById("reservation");
//     if (reservationSection) {
//       const sectionTop = reservationSection.offsetTop;
//       const offset = (currentScroll - sectionTop) * 0.3;
//       reservationBg.style.transform = `translateY(${offset}px)`;
//     }
//   }

//   // Update active nav link based on scroll position
//   updateActiveNavLink();
// }

// // Update active navigation link based on scroll position
// function updateActiveNavLink() {
//   const sections = document.querySelectorAll("section[id]");
//   const scrollPosition = window.pageYOffset + 150;

//   sections.forEach((section) => {
//     const sectionTop = section.offsetTop;
//     const sectionHeight = section.offsetHeight;
//     const sectionId = section.getAttribute("id");

//     if (
//       scrollPosition >= sectionTop &&
//       scrollPosition < sectionTop + sectionHeight
//     ) {
//       navLinks.forEach((link) => {
//         link.classList.remove("active");
//         if (link.getAttribute("data-section") === sectionId) {
//           link.classList.add("active");
//         }
//       });
//     }
//   });
// }

// // Mobile menu toggle
// function toggleMobileMenu() {
//   navToggle.classList.toggle("active");
//   navMenu.classList.toggle("active");
//   document.body.style.overflow = navMenu.classList.contains("active")
//     ? "hidden"
//     : "";
// }

// // Close mobile menu when clicking a link
// function closeMobileMenu() {
//   navToggle.classList.remove("active");
//   navMenu.classList.remove("active");
//   document.body.style.overflow = "";
// }
// //PAGINATION
// const itemsPerPage = 6;

// let currentPage = 1;
// let currentFilter = "all";
// let searchTerm = "";

// //added MENU
// const menuData = [

// /* BREAKFAST (20) */
// {id:1,name:"Masala Dosa",category:"breakfast",price:180,image:"./images/MasalaDosa.jpg",description:"Crispy dosa served with chutney and sambar",type:"Veg",rating:4.8,badge:"Popular"},
// {id:2,name:"Idli Sambar",category:"breakfast",price:120,image:"./images/Idli_Sambar.jpg",description:"Soft steamed idlis",type:"Veg",rating:4.7,badge:"Best Seller"},
// {id:3,name:"Chicken Keema Dosa",category:"breakfast",price:240,image:"./images/Chicken_Keema_Dosa.jpg",description:"Spicy chicken keema filling",type:"Non-Veg",rating:4.6,badge:"Chef Choice"},
// {id:4,name:"Medu Vada",category:"breakfast",price:110,image:"./images/Idli_Sambar.jpg",description:"Crispy lentil donuts",type:"Veg",rating:4.5,badge:"Popular"},
// {id:5,name:"Pongal",category:"breakfast",price:130,image:"./images/Idli_Sambar.jpg",description:"Traditional rice and lentil dish",type:"Veg",rating:4.4,badge:"Classic"},
// {id:6,name:"Upma",category:"breakfast",price:100,image:"./images/Idli_Sambar.jpg",description:"Savory semolina breakfast",type:"Veg",rating:4.3,badge:"Fresh"},
// {id:7,name:"Aloo Paratha",category:"breakfast",price:160,image:"./images/Paneer_Butter_Masala.jpg",description:"Stuffed potato flatbread",type:"Veg",rating:4.8,badge:"Popular"},
// {id:8,name:"Paneer Paratha",category:"breakfast",price:180,image:"./images/Paneer_Butter_Masala.jpg",description:"Stuffed paneer flatbread",type:"Veg",rating:4.7,badge:"Best Seller"},
// {id:9,name:"Poha",category:"breakfast",price:90,image:"./images/Idli_Sambar.jpg",description:"Flattened rice snack",type:"Veg",rating:4.4,badge:"Healthy"},
// {id:10,name:"Misal Pav",category:"breakfast",price:170,image:"./images/Butter_Chicken.jpg",description:"Spicy Maharashtrian breakfast",type:"Veg",rating:4.6,badge:"Trending"},
// {id:11,name:"Pesarattu",category:"breakfast",price:150,image:"./images/MasalaDosa.jpg",description:"Green gram dosa",type:"Veg",rating:4.5,badge:"Healthy"},
// {id:12,name:"Rava Dosa",category:"breakfast",price:190,image:"./images/MasalaDosa.jpg",description:"Crispy semolina dosa",type:"Veg",rating:4.7,badge:"Popular"},
// {id:13,name:"Egg Bhurji",category:"breakfast",price:180,image:"./images/Butter_Chicken.jpg",description:"Spiced scrambled eggs",type:"Non-Veg",rating:4.6,badge:"Protein"},
// {id:14,name:"Omelette Toast",category:"breakfast",price:150,image:"./images/Butter_Chicken.jpg",description:"Classic egg breakfast",type:"Non-Veg",rating:4.5,badge:"Classic"},
// {id:15,name:"Chole Kulche",category:"breakfast",price:190,image:"./images/Paneer_Butter_Masala.jpg",description:"Spicy chickpeas with kulcha",type:"Veg",rating:4.7,badge:"Popular"},
// {id:16,name:"Veg Sandwich",category:"breakfast",price:130,image:"./images/Paneer_Butter_Masala.jpg",description:"Fresh vegetable sandwich",type:"Veg",rating:4.3,badge:"Fresh"},
// {id:17,name:"Cheese Toast",category:"breakfast",price:140,image:"./images/Paneer_Butter_Masala.jpg",description:"Loaded cheese toast",type:"Veg",rating:4.4,badge:"Kids Favorite"},
// {id:18,name:"French Toast",category:"breakfast",price:180,image:"./images/Kulfi.jpg",description:"Sweet breakfast toast",type:"Veg",rating:4.6,badge:"Sweet"},
// {id:19,name:"Cornflakes Bowl",category:"breakfast",price:120,image:"./images/Kulfi.jpg",description:"Healthy cereal breakfast",type:"Veg",rating:4.2,badge:"Healthy"},
// {id:20,name:"Fruit Bowl",category:"breakfast",price:150,image:"./images/Kulfi.jpg",description:"Seasonal fruits platter",type:"Veg",rating:4.5,badge:"Fresh"},

// /* LUNCH (20) */
// {id:21,name:"Paneer Butter Masala",category:"lunch",price:280,image:"./images/Paneer_Butter_Masala.jpg",description:"Creamy paneer curry",type:"Veg",rating:4.8,badge:"Best Seller"},
// {id:22,name:"Dal Tadka",category:"lunch",price:220,image:"./images/Paneer_Butter_Masala.jpg",description:"Yellow lentils tempered",type:"Veg",rating:4.6,badge:"Classic"},
// {id:23,name:"Veg Biryani",category:"lunch",price:260,image:"./images/Hyderabadi_Chicken_Biryani.jpg",description:"Aromatic vegetable rice",type:"Veg",rating:4.7,badge:"Popular"},
// {id:24,name:"Rajma Chawal",category:"lunch",price:240,image:"./images/Paneer_Butter_Masala.jpg",description:"Kidney beans with rice",type:"Veg",rating:4.5,badge:"Homestyle"},
// {id:25,name:"Chole Bhature",category:"lunch",price:250,image:"./images/Paneer_Butter_Masala.jpg",description:"North Indian favorite",type:"Veg",rating:4.7,badge:"Popular"},
// {id:26,name:"Veg Thali",category:"lunch",price:320,image:"./images/Paneer_Butter_Masala.jpg",description:"Complete Indian meal",type:"Veg",rating:4.8,badge:"Chef Choice"},
// {id:27,name:"Kadai Paneer",category:"lunch",price:290,image:"./images/Paneer_Butter_Masala.jpg",description:"Spicy paneer curry",type:"Veg",rating:4.7,badge:"Hot"},
// {id:28,name:"Mushroom Masala",category:"lunch",price:280,image:"./images/Paneer_Butter_Masala.jpg",description:"Mushroom curry",type:"Veg",rating:4.5,badge:"Fresh"},
// {id:29,name:"Palak Paneer",category:"lunch",price:270,image:"./images/Paneer_Butter_Masala.jpg",description:"Spinach paneer curry",type:"Veg",rating:4.6,badge:"Healthy"},
// {id:30,name:"Veg Fried Rice",category:"lunch",price:240,image:"./images/Paneer_Butter_Masala.jpg",description:"Chinese style rice",type:"Veg",rating:4.4,badge:"Trending"},
// {id:31,name:"Chicken Curry",category:"lunch",price:320,image:"./images/Butter_Chicken.jpg",description:"Traditional chicken curry",type:"Non-Veg",rating:4.8,badge:"Popular"},
// {id:32,name:"Chicken Biryani",category:"lunch",price:340,image:"./images/Hyderabadi_Chicken_Biryani.jpg",description:"Flavorful biryani",type:"Non-Veg",rating:4.9,badge:"Best Seller"},
// {id:33,name:"Mutton Curry",category:"lunch",price:420,image:"./images/Butter_Chicken.jpg",description:"Rich mutton curry",type:"Non-Veg",rating:4.8,badge:"Premium"},
// {id:34,name:"Fish Curry",category:"lunch",price:380,image:"./images/Butter_Chicken.jpg",description:"Coastal fish curry",type:"Non-Veg",rating:4.7,badge:"Chef Choice"},
// {id:35,name:"Egg Curry",category:"lunch",price:240,image:"./images/Butter_Chicken.jpg",description:"Boiled eggs in gravy",type:"Non-Veg",rating:4.5,badge:"Classic"},
// {id:36,name:"Chicken Fried Rice",category:"lunch",price:280,image:"./images/Butter_Chicken.jpg",description:"Chicken rice bowl",type:"Non-Veg",rating:4.6,badge:"Popular"},
// {id:37,name:"Butter Naan Combo",category:"lunch",price:250,image:"./images/Paneer_Butter_Masala.jpg",description:"Naan with curry",type:"Veg",rating:4.5,badge:"Value"},
// {id:38,name:"Tandoori Roti Meal",category:"lunch",price:220,image:"./images/Paneer_Butter_Masala.jpg",description:"Healthy meal combo",type:"Veg",rating:4.4,badge:"Healthy"},
// {id:39,name:"Jeera Rice",category:"lunch",price:180,image:"./images/Paneer_Butter_Masala.jpg",description:"Cumin flavored rice",type:"Veg",rating:4.3,badge:"Classic"},
// {id:40,name:"Curd Rice",category:"lunch",price:170,image:"./images/Paneer_Butter_Masala.jpg",description:"South Indian comfort food",type:"Veg",rating:4.4,badge:"Comfort"},

// /* DINNER (20) */
// {id:41,name:"Butter Chicken",category:"dinner",price:340,image:"./images/Butter_Chicken.jpg",description:"Creamy chicken curry",type:"Non-Veg",rating:4.9,badge:"Best Seller"},
// {id:42,name:"Hyderabadi Chicken Biryani",category:"dinner",price:320,image:"./images/Hyderabadi_Chicken_Biryani.jpg",description:"Authentic dum biryani",type:"Non-Veg",rating:4.9,badge:"Popular"},
// {id:43,name:"Paneer Tikka",category:"dinner",price:290,image:"./images/Paneer_Butter_Masala.jpg",description:"Tandoor grilled paneer",type:"Veg",rating:4.7,badge:"Popular"},
// {id:44,name:"Malai Kofta",category:"dinner",price:280,image:"./images/Paneer_Butter_Masala.jpg",description:"Creamy kofta curry",type:"Veg",rating:4.6,badge:"Classic"},
// {id:45,name:"Dal Makhani",category:"dinner",price:250,image:"./images/Paneer_Butter_Masala.jpg",description:"Slow cooked lentils",type:"Veg",rating:4.7,badge:"Best Seller"},
// {id:46,name:"Veg Pulao",category:"dinner",price:240,image:"./images/Paneer_Butter_Masala.jpg",description:"Vegetable rice dish",type:"Veg",rating:4.4,badge:"Fresh"},
// {id:47,name:"Tandoori Chicken",category:"dinner",price:380,image:"./images/Butter_Chicken.jpg",description:"Smoky grilled chicken",type:"Non-Veg",rating:4.8,badge:"Chef Choice"},
// {id:48,name:"Chicken Tikka",category:"dinner",price:340,image:"./images/Butter_Chicken.jpg",description:"Boneless grilled chicken",type:"Non-Veg",rating:4.8,badge:"Popular"},
// {id:49,name:"Mutton Rogan Josh",category:"dinner",price:450,image:"./images/Butter_Chicken.jpg",description:"Kashmiri lamb curry",type:"Non-Veg",rating:4.8,badge:"Premium"},
// {id:50,name:"Fish Fry",category:"dinner",price:390,image:"./images/Butter_Chicken.jpg",description:"Crispy fried fish",type:"Non-Veg",rating:4.7,badge:"Trending"},
// {id:51,name:"Veg Manchurian",category:"dinner",price:260,image:"./images/Paneer_Butter_Masala.jpg",description:"Chinese style appetizer",type:"Veg",rating:4.5,badge:"Popular"},
// {id:52,name:"Hakka Noodles",category:"dinner",price:240,image:"./images/Paneer_Butter_Masala.jpg",description:"Stir fried noodles",type:"Veg",rating:4.4,badge:"Trending"},
// {id:53,name:"Chicken Noodles",category:"dinner",price:280,image:"./images/Butter_Chicken.jpg",description:"Chicken hakka noodles",type:"Non-Veg",rating:4.6,badge:"Popular"},
// {id:54,name:"Egg Fried Rice",category:"dinner",price:250,image:"./images/Butter_Chicken.jpg",description:"Rice with egg",type:"Non-Veg",rating:4.5,badge:"Classic"},
// {id:55,name:"Paneer Lababdar",category:"dinner",price:300,image:"./images/Paneer_Butter_Masala.jpg",description:"Rich paneer gravy",type:"Veg",rating:4.7,badge:"Premium"},
// {id:56,name:"Kadai Chicken",category:"dinner",price:350,image:"./images/Butter_Chicken.jpg",description:"Spicy chicken curry",type:"Non-Veg",rating:4.8,badge:"Hot"},
// {id:57,name:"Veg Thali Deluxe",category:"dinner",price:380,image:"./images/Paneer_Butter_Masala.jpg",description:"Full course meal",type:"Veg",rating:4.8,badge:"Chef Choice"},
// {id:58,name:"Chicken Thali",category:"dinner",price:420,image:"./images/Butter_Chicken.jpg",description:"Complete chicken meal",type:"Non-Veg",rating:4.8,badge:"Popular"},
// {id:59,name:"Garlic Naan Basket",category:"dinner",price:180,image:"./images/Paneer_Butter_Masala.jpg",description:"Assorted naan breads",type:"Veg",rating:4.5,badge:"Side Dish"},
// {id:60,name:"Stuffed Kulcha",category:"dinner",price:190,image:"./images/Paneer_Butter_Masala.jpg",description:"Stuffed bread",type:"Veg",rating:4.4,badge:"Classic"},

// /* DESSERTS (15) */
// {id:61,name:"Gulab Jamun",category:"desserts",price:120,image:"./images/Gulab_Jamun.jpg",description:"Milk dumplings in syrup",type:"Veg",rating:4.8,badge:"Best Seller"},
// {id:62,name:"Rasmalai",category:"desserts",price:140,image:"./images/Rasmalai.jpg",description:"Paneer discs in milk",type:"Veg",rating:4.7,badge:"Popular"},
// {id:63,name:"Kesar Pista Kulfi",category:"desserts",price:130,image:"./images/Kulfi.jpg",description:"Traditional kulfi",type:"Veg",rating:4.8,badge:"Popular"},
// {id:64,name:"Chocolate Brownie",category:"desserts",price:180,image:"./images/Kulfi.jpg",description:"Warm chocolate brownie",type:"Veg",rating:4.9,badge:"Trending"},
// {id:65,name:"Ice Cream Sundae",category:"desserts",price:200,image:"./images/Kulfi.jpg",description:"Ice cream with toppings",type:"Veg",rating:4.8,badge:"Kids Favorite"},
// {id:66,name:"Cheesecake",category:"desserts",price:220,image:"./images/Kulfi.jpg",description:"Creamy baked cheesecake",type:"Veg",rating:4.7,badge:"Premium"},
// {id:67,name:"Tiramisu",category:"desserts",price:250,image:"./images/Kulfi.jpg",description:"Italian dessert",type:"Veg",rating:4.7,badge:"Premium"},
// {id:68,name:"Carrot Halwa",category:"desserts",price:150,image:"./images/Kulfi.jpg",description:"Traditional Indian sweet",type:"Veg",rating:4.6,badge:"Classic"},
// {id:69,name:"Moong Dal Halwa",category:"desserts",price:170,image:"./images/Kulfi.jpg",description:"Rich festive dessert",type:"Veg",rating:4.7,badge:"Popular"},
// {id:70,name:"Fruit Custard",category:"desserts",price:130,image:"./images/Kulfi.jpg",description:"Creamy fruit dessert",type:"Veg",rating:4.5,badge:"Fresh"},
// {id:71,name:"Falooda",category:"desserts",price:180,image:"./images/Kulfi.jpg",description:"Rose flavored dessert drink",type:"Veg",rating:4.8,badge:"Trending"},
// {id:72,name:"Mango Mousse",category:"desserts",price:190,image:"./images/Kulfi.jpg",description:"Light mango dessert",type:"Veg",rating:4.6,badge:"Seasonal"},
// {id:73,name:"Red Velvet Pastry",category:"desserts",price:160,image:"./images/Kulfi.jpg",description:"Soft pastry slice",type:"Veg",rating:4.7,badge:"Popular"},
// {id:74,name:"Black Forest Cake",category:"desserts",price:180,image:"./images/Kulfi.jpg",description:"Chocolate cherry cake",type:"Veg",rating:4.8,badge:"Best Seller"},
// {id:75,name:"Donut Delight",category:"desserts",price:120,image:"./images/Kulfi.jpg",description:"Fresh glazed donut",type:"Veg",rating:4.5,badge:"Sweet"},

// /* DRINKS (15) */
// {id:76,name:"Mango Lassi",category:"drinks",price:110,image:"./images/Mango_Lassi.jpg",description:"Sweet mango yogurt drink",type:"Veg",rating:4.8,badge:"Popular"},
// {id:77,name:"Masala Chai",category:"drinks",price:70,image:"./images/Masala_Chai.jpg",description:"Spiced Indian tea",type:"Veg",rating:4.9,badge:"Best Seller"},
// {id:78,name:"Fresh Lime Soda",category:"drinks",price:90,image:"./images/Fresh_Lime_Soda.jpg",description:"Refreshing soda",type:"Veg",rating:4.7,badge:"Fresh"},
// {id:79,name:"Cold Coffee",category:"drinks",price:140,image:"./images/Mango_Lassi.jpg",description:"Chilled coffee drink",type:"Veg",rating:4.8,badge:"Trending"},
// {id:80,name:"Cappuccino",category:"drinks",price:160,image:"./images/Mango_Lassi.jpg",description:"Espresso coffee",type:"Veg",rating:4.7,badge:"Premium"},
// {id:81,name:"Latte",category:"drinks",price:170,image:"./images/Mango_Lassi.jpg",description:"Creamy milk coffee",type:"Veg",rating:4.6,badge:"Popular"},
// {id:82,name:"Espresso",category:"drinks",price:130,image:"./images/Mango_Lassi.jpg",description:"Strong coffee shot",type:"Veg",rating:4.5,badge:"Classic"},
// {id:83,name:"Mocha",category:"drinks",price:180,image:"./images/Mango_Lassi.jpg",description:"Chocolate coffee",type:"Veg",rating:4.7,badge:"Premium"},
// {id:84,name:"Watermelon Juice",category:"drinks",price:120,image:"./images/Fresh_Lime_Soda.jpg",description:"Fresh fruit juice",type:"Veg",rating:4.6,badge:"Healthy"},
// {id:85,name:"Orange Juice",category:"drinks",price:130,image:"./images/Fresh_Lime_Soda.jpg",description:"Freshly squeezed juice",type:"Veg",rating:4.6,badge:"Healthy"},
// {id:86,name:"Pineapple Juice",category:"drinks",price:130,image:"./images/Fresh_Lime_Soda.jpg",description:"Tropical fruit juice",type:"Veg",rating:4.5,badge:"Fresh"},
// {id:87,name:"Chocolate Shake",category:"drinks",price:180,image:"./images/Mango_Lassi.jpg",description:"Rich chocolate milkshake",type:"Veg",rating:4.8,badge:"Kids Favorite"},
// {id:88,name:"Strawberry Shake",category:"drinks",price:180,image:"./images/Mango_Lassi.jpg",description:"Strawberry milkshake",type:"Veg",rating:4.7,badge:"Popular"},
// {id:89,name:"Green Tea",category:"drinks",price:90,image:"./images/Masala_Chai.jpg",description:"Healthy herbal tea",type:"Veg",rating:4.4,badge:"Healthy"},
// {id:90,name:"Mineral Water",category:"drinks",price:40,image:"./images/Fresh_Lime_Soda.jpg",description:"Packaged drinking water",type:"Veg",rating:4.3,badge:"Essential"}

// ];
// //Filter + Search
// function getFilteredItems() {

//  return menuData.filter(item => {

//    const categoryMatch =
//      currentFilter === "all" ||
//      item.category === currentFilter;

//    const searchMatch =
//      item.name.toLowerCase()
//      .includes(searchTerm.toLowerCase());

//    return categoryMatch && searchMatch;

//  });

// }
// //render menu

// function renderMenu() {

//  const menuContainer =
//  document.getElementById("menu-container");

//  const filtered = getFilteredItems();

//  const start =
//  (currentPage - 1) * itemsPerPage;

//  const end = start + itemsPerPage;

//  const items =
//  filtered.slice(start,end);

//  menuContainer.innerHTML = "";

//  items.forEach((item,index)=>{

// const card = document.createElement("div");
// card.className = "menu-item";
// card.dataset.category = item.category;

//  card.innerHTML = `
//  <div class="food-card">

//  <img src="${item.image}"
//  class="food-image">

//  <div class="food-content">

//  <span class="badge">
//  ${item.badge}
//  </span>

//  <div class="rating">
//  ⭐ ${item.rating}
//  </div>

//  <div class="menu-item-header">
//  <h3>${item.name}</h3>
//  <span class="menu-price">
//  ₹${item.price}
//  </span>
//  </div>

//  <span class="food-tag
//  ${item.type==="Veg" ? "veg":"nonveg"}">
//  ${item.type}
//  </span>

//  <p>${item.description}</p>

//  </div>
//  </div>
//  `;

//  menuContainer.appendChild(card);

//  setTimeout(()=>{
//    card.classList.add("show");
//  }, index * 120);

//  });
// //Pagination UI
//  renderPagination(filtered.length);

// }
// function renderPagination(totalItems){

//  const pages =
//  Math.ceil(totalItems/itemsPerPage);

//  const pageNumbers =
//  document.getElementById("pageNumbers");

//  pageNumbers.innerHTML="";

//  for(let i=1;i<=pages;i++){

//    const btn =
//    document.createElement("button");

//    btn.textContent=i;

//    btn.classList.add("page-btn");

//    if(i===currentPage)
//       btn.classList.add("active");

//    btn.addEventListener("click",()=>{

//       currentPage=i;
//       renderMenu();

//    });

//    pageNumbers.appendChild(btn);

//  }

// }

// const searchInput = document.getElementById("menu-search");

// if (searchInput) {
//   searchInput.addEventListener("input", (e) => {
//     searchTerm = e.target.value;
//     currentPage = 1;
//     renderMenu();
//   });
// }

// //category event
// document.querySelectorAll(".filter-btn").forEach(btn=>{

//  btn.addEventListener("click",()=>{

//    document
//    .querySelector(".filter-btn.active")
//    ?.classList.remove("active");

//    btn.classList.add("active");

//    currentFilter =
//    btn.dataset.filter;

//    currentPage = 1;

//    renderMenu();

//  });

// });
// //Previous / Next controls
// document.getElementById("prevPage").addEventListener("click",()=>{

//  if(currentPage>1){

//    currentPage--;
//    renderMenu();

//  }

// });

// document.getElementById("nextPage").addEventListener("click",()=>{
//  const totalPages =
//  Math.ceil(
//  getFilteredItems().length /
//  itemsPerPage
//  );

//  if(currentPage<totalPages){

//    currentPage++;
//    renderMenu();

//  }

// });

// renderMenu();

// //
// // Theme Toggle
// const savedTheme = localStorage.getItem("theme");

// if (savedTheme === "light") {
//   document.body.classList.add("light-theme");
//   themeToggle.textContent = "☀️";
// } else {
//   themeToggle.textContent = "🌙";
// }

// themeToggle.addEventListener("click", () => {
//   document.body.classList.toggle("light-theme");

//   const isLight = document.body.classList.contains("light-theme");

//   if (isLight) {
//     localStorage.setItem("theme", "light");
//     themeToggle.textContent = "☀️";
//   } else {
//     localStorage.setItem("theme", "dark");
//     themeToggle.textContent = "🌙";
//   }
// });


// // Search
// menuSearch.addEventListener("input", () => {
//   const activeFilter =
//     document.querySelector(".filter-btn.active").dataset.filter;

//   filterMenuItems(activeFilter, menuSearch.value);
// });

// // Smooth scroll for navigation links
// function smoothScroll(e) {
//   e.preventDefault();
//   const targetId = this.getAttribute("href");
//   const targetSection = document.querySelector(targetId);

//   if (targetSection) {
//     const offsetTop = targetSection.offsetTop - 80;
//     window.scrollTo({
//       top: offsetTop,
//       behavior: "smooth",
//     });
//   }

//   closeMobileMenu();
// }

// // Form submission handler (visual only)
// function handleFormSubmit(e) {
//   e.preventDefault();

//   // Get form data
//   const formData = new FormData(reservationForm);
//   const data = Object.fromEntries(formData.entries());

//   // Simple validation visual feedback
//   const inputs = reservationForm.querySelectorAll("input, select, textarea");
//   let isValid = true;

//   inputs.forEach((input) => {
//     if (input.required && !input.value) {
//       input.style.borderColor = "#c94a4a";
//       isValid = false;
//     } else {
//       input.style.borderColor = "";
//     }
//   });

//   if (isValid) {
//     // Show success message (visual only)
//     const submitBtn = reservationForm.querySelector('button[type="submit"]');
//     const originalText = submitBtn.textContent;

//     submitBtn.textContent = "Reservation Requested!";
//     submitBtn.style.backgroundColor = "#4a9c6a";
//     submitBtn.disabled = true;

//     // Reset form after delay
//     setTimeout(() => {
//       reservationForm.reset();
//       submitBtn.textContent = originalText;
//       submitBtn.style.backgroundColor = "";
//       submitBtn.disabled = false;
//     }, 3000);
//   }
// }

// // Intersection Observer for fade-in animations
// function setupIntersectionObserver() {
//   const observerOptions = {
//     root: null,
//     rootMargin: "0px",
//     threshold: 0.1,
//   };

//   const observer = new IntersectionObserver((entries) => {
//     entries.forEach((entry) => {
//       if (entry.isIntersecting) {
//         entry.target.classList.add("visible");
//       }
//     });
//   }, observerOptions);

//   // Observe sections for animations
//   const animatedElements = document.querySelectorAll(
//     ".about-content, .menu-panel, .reservation-form, .location-info",
//   );
//   animatedElements.forEach((el) => {
//     el.style.opacity = "0";
//     el.style.transform = "translateY(30px)";
//     el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
//     observer.observe(el);
//   });
// }

// // Add visible class styles
// const style = document.createElement("style");
// style.textContent = `
//   .visible {
//     opacity: 1 !important;
//     transform: translateY(0) !important;
//   }
// `;
// document.head.appendChild(style);

// /// Scroll to Discover - Auto slow scroll
// const heroScroll = document.querySelector(".hero-scroll");
// let autoScrollInterval = null;

// // top: pixels per step | 10: interval in ms
// // top:1 + 20ms = dreamy slow | top:1 + 10ms = default | top:2 + 10ms = faster

// function startAutoScroll() {
//   autoScrollInterval = setInterval(() => {
//     window.scrollBy({ top: 2, behavior: "instant" });

//     // Stop automatically if bottom of page is reached
//     if (window.scrollY + window.innerHeight >= document.body.scrollHeight) {
//       stopAutoScroll();
//     }
//   }, 15);
// }

// function stopAutoScroll() {
//   if (autoScrollInterval) {
//     clearInterval(autoScrollInterval);
//     autoScrollInterval = null;
//   }
// }

// if (heroScroll) {
//   heroScroll.style.cursor = "pointer";

//   // Toggle scroll on click — click once to start, click again to stop
//   heroScroll.addEventListener("click", () => {
//     autoScrollInterval ? stopAutoScroll() : startAutoScroll();
//   });
// }

// // Stop scrolling on any user interaction
// ["mousemove", "touchstart", "keydown", "wheel", "pointerdown"].forEach(
//   (event) => {
//     window.addEventListener(event, stopAutoScroll);
//   },
// );

// // Event Listeners
// window.addEventListener("scroll", handleScroll);
// navToggle.addEventListener("click", toggleMobileMenu);

// navLinks.forEach((link) => {
//   link.addEventListener("click", smoothScroll);
// });

// document.querySelectorAll(".nav-cta, .hero-buttons a").forEach((link) => {
//   link.addEventListener("click", smoothScroll);
// });
// if (reservationForm) {
//   reservationForm.addEventListener("submit", handleFormSubmit);
// }

// // Initialize
// document.addEventListener("DOMContentLoaded", () => {
//   handleScroll();
//   setupIntersectionObserver();
//   updateAvailableTimes();
// });

// // Close mobile menu on window resize
// window.addEventListener("resize", () => {
//   if (window.innerWidth > 768) {
//     closeMobileMenu();
//   }
// });

// // ── Reviews (localStorage) ────────────────────────────────────────────────

// const STORAGE_KEY = "lighthouse_reviews";

// // Default reviews so section is never empty on first visit
// const defaultReviews = [];

// function getReviews() {
//   const stored = localStorage.getItem(STORAGE_KEY);
//   if (stored) return JSON.parse(stored);
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultReviews));
//   return defaultReviews;
// }

// function saveReviews(reviews) {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
// }

// // Permanent review — always shows first, cannot be removed
// const pinnedReview = {
//   name: "Rasshi Srivastav",
//   rating: 5,
//   text: "Absolutely loved the food and ambience! Every dish was crafted with such care and the atmosphere was warm and elegant. A truly memorable dining experience — will definitely be coming back!",
//   date: "14 May 2026",
// };

// function renderReviews() {
//   const grid = document.getElementById("reviews-grid");
//   if (!grid) return;

//   const userReviews = getReviews();

//   // Pinned review always at top, user reviews below
//   const allReviews = [pinnedReview, ...userReviews];

//   grid.innerHTML = allReviews
//     .map(
//       (r) => `
//     <div class="review-card">
//       <div class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
//       <p class="review-text">${r.text}</p>
//       <div class="review-author">
//         <div class="review-avatar">${r.name.slice(0, 2).toUpperCase()}</div>
//         <div>
//           <span class="review-name">${r.name}</span>
//           <span class="review-date">${r.date}</span>
//         </div>
//       </div>
//     </div>
//   `,
//     )
//     .join("");
// }

// // Star rating widget
// let selectedRating = 0;
// const starBtns = document.querySelectorAll("#star-input .star-btn");

// starBtns.forEach((btn) => {
//   btn.addEventListener("mouseenter", () => {
//     const val = +btn.dataset.value;
//     starBtns.forEach((s) =>
//       s.classList.toggle("active", +s.dataset.value <= val),
//     );
//   });
//   btn.addEventListener("mouseleave", () => {
//     starBtns.forEach((s) =>
//       s.classList.toggle("active", +s.dataset.value <= selectedRating),
//     );
//   });
//   btn.addEventListener("click", () => {
//     selectedRating = +btn.dataset.value;
//     document.getElementById("review-rating").value = selectedRating;
//     starBtns.forEach((s) =>
//       s.classList.toggle("active", +s.dataset.value <= selectedRating),
//     );
//   });
// });

// // Form submit
// const reviewForm = document.getElementById("review-form");
// const reviewMsg = document.getElementById("review-msg");
// function isMeaningfulReview(text) {
//   // At least 3 real words
//   const words = text.trim().split(/\s+/);

//   // Reject repeated and random characters
//   const randomPattern = /^(.)\1+$|^[a-zA-Z]{1,6}$/;

//   if (randomPattern.test(text.trim())) return false;

//   return words.length >= 3;
// }

// function isValidName(name) {
//   return /^[A-Za-z\s]{3,30}$/.test(name.trim());
// }

// if (reviewForm) {
//   reviewForm.addEventListener("submit", function (e) {
//     e.preventDefault();

//     const name = document.getElementById("review-name").value.trim();
//     const reviewText = document.getElementById("review-text").value.trim();

//     // Reset message
//     reviewMsg.style.display = "block";

//     if (!selectedRating) {
//       reviewMsg.textContent = "Please select a star rating.";
//       reviewMsg.style.color = "#c94a4a";
//       return;
//     }

//     if (!isValidName(name)) {
//       reviewMsg.textContent =
//         "Name should contain only letters and be 3–30 characters long.";
//       reviewMsg.style.color = "#c94a4a";
//       return;
//     }

//     if (reviewText.length < 20) {
//       reviewMsg.textContent = "Review must contain at least 20 characters.";
//       reviewMsg.style.color = "#c94a4a";
//       return;
//     }

//     if (!isMeaningfulReview(reviewText)) {
//       reviewMsg.textContent = "Please enter a meaningful review.";
//       reviewMsg.style.color = "#c94a4a";
//       return;
//     }

//     const today = new Date();

//     const dateStr = today.toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });

//     const newReview = {
//       id: Date.now(),
//       name,
//       rating: selectedRating,
//       text: reviewText,
//       date: dateStr,
//     };

//     const reviews = getReviews();
//     reviews.unshift(newReview);

//     saveReviews(reviews);
//     renderReviews();

//     reviewForm.reset();

//     selectedRating = 0;

//     document.getElementById("review-rating").value = 0;

//     starBtns.forEach((s) => s.classList.remove("active"));

//     reviewMsg.textContent = "Review submitted successfully!";
//     reviewMsg.style.color = "#4a9c6a";

//     setTimeout(() => {
//       reviewMsg.style.display = "none";
//     }, 3000);
//   });
// }

// // Init
// renderReviews();
// //BackToTop
// const backToTopBtn = document.getElementById("backToTop");

// window.addEventListener("scroll", () => {
//   if (window.scrollY > 200) {
//     backToTopBtn.style.display = "block";
//   } else {
//     backToTopBtn.style.display = "none";
//   }
// });

// // Show/hide on scroll
// window.addEventListener("scroll", () => {
//   if (window.scrollY > 300) {
//     backToTopBtn.classList.add("visible");
//   } else {
//     backToTopBtn.classList.remove("visible");
//   }
// });

// // Scroll to top on click
// backToTopBtn.addEventListener("click", () => {
//   window.scrollTo({
//     top: 0,
//     behavior: "smooth",
//   });
// });

// DOM elements
const nav          = document.getElementById("nav");
const navToggle    = document.getElementById("navToggle");
const navMenu      = document.getElementById("navMenu");
const navLinks     = document.querySelectorAll(".nav-link");
const heroBg       = document.getElementById("heroBg");
const reservationBg  = document.getElementById("reservationBg");
const reservationForm = document.getElementById("reservationForm");
const dateInput    = document.getElementById("date");
const timeSelect   = document.getElementById("time");
const themeToggle  = document.getElementById("themeToggle");

//Date/time
if (dateInput) {
  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("min", today);
  dateInput.addEventListener("change", updateAvailableTimes);
}

function updateAvailableTimes() {
  if (!dateInput || !timeSelect) return;

  const selectedDate  = dateInput.value;
  const today         = new Date().toISOString().split("T")[0];
  const now           = new Date();
  const currentHours  = now.getHours();
  const currentMinutes = now.getMinutes();

  timeSelect.querySelectorAll("option").forEach((option) => {
    if (option.value === "") return;

    const [optionHours, optionMinutes] = option.value.split(":").map(Number);

    if (selectedDate === today) {
      const isPast =
        optionHours < currentHours ||
        (optionHours === currentHours && optionMinutes <= currentMinutes + 30);
      option.disabled = isPast;
      if (isPast && option.selected) timeSelect.value = "";
    } else {
      option.disabled = false;
    }
  });
}

// Navigation scroll
let lastScroll = 0;

function handleScroll() {
  const currentScroll = window.pageYOffset;

  nav.classList.toggle("scrolled", currentScroll > 50);
  lastScroll = currentScroll;

  if (heroBg) {
    heroBg.style.transform = `translateY(${currentScroll * 0.5}px)`;
  }

  if (reservationBg && currentScroll > window.innerHeight) {
    const sec = document.getElementById("reservation");
    if (sec) {
      reservationBg.style.transform =
        `translateY(${(currentScroll - sec.offsetTop) * 0.3}px)`;
    }
  }

  updateActiveNavLink();
}

function updateActiveNavLink() {
  const sections      = document.querySelectorAll("section[id]");
  const scrollPosition = window.pageYOffset + 150;

  sections.forEach((section) => {
    const sectionId = section.getAttribute("id");
    if (
      scrollPosition >= section.offsetTop &&
      scrollPosition < section.offsetTop + section.offsetHeight
    ) {
      navLinks.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("data-section") === sectionId
        );
      });
    }
  });
}

// mobile view
function toggleMobileMenu() {
  navToggle.classList.toggle("active");
  navMenu.classList.toggle("active");
  document.body.style.overflow = navMenu.classList.contains("active") ? "hidden" : "";
}

function closeMobileMenu() {
  navToggle.classList.remove("active");
  navMenu.classList.remove("active");
  document.body.style.overflow = "";
}

// Menu data
const menuData = [
  //breakfast
  {id:1, name:"Masala Dosa",         category:"breakfast", price:180, image:"./images/MasalaDosa.jpg",           description:"Crispy dosa served with chutney and sambar",         type:"Veg",     rating:4.8, badge:"Popular"},
  {id:2, name:"Idli Sambar",         category:"breakfast", price:120, image:"./images/Idli_Sambar.jpg",          description:"Soft steamed idlis with hot sambar & coconut chutney", type:"Veg",   rating:4.7, badge:"Best Seller"},
  {id:3, name:"Chicken Keema Dosa",  category:"breakfast", price:240, image:"./images/Chicken_Keema_Dosa.jpg",   description:"Crispy dosa stuffed with spicy chicken keema",        type:"Non-Veg", rating:4.6, badge:"Chef Choice"},
  {id:4, name:"Medu Vada",           category:"breakfast", price:110, image:"./images/Idli_Sambar.jpg",          description:"Crispy golden lentil donuts",                         type:"Veg",     rating:4.5, badge:"Popular"},
  {id:5, name:"Pongal",              category:"breakfast", price:130, image:"./images/Idli_Sambar.jpg",          description:"Traditional rice and lentil comfort dish",            type:"Veg",     rating:4.4, badge:"Classic"},
  {id:6, name:"Upma",                category:"breakfast", price:100, image:"./images/Idli_Sambar.jpg",          description:"Savory semolina breakfast with vegetables",           type:"Veg",     rating:4.3, badge:"Fresh"},
  {id:7, name:"Aloo Paratha",        category:"breakfast", price:160, image:"./images/Paneer_Butter_Masala.jpg", description:"Stuffed potato flatbread with butter",                type:"Veg",     rating:4.8, badge:"Popular"},
  {id:8, name:"Paneer Paratha",      category:"breakfast", price:180, image:"./images/Paneer_Butter_Masala.jpg", description:"Stuffed paneer flatbread, served with curd",          type:"Veg",     rating:4.7, badge:"Best Seller"},
  {id:9, name:"Poha",                category:"breakfast", price:90,  image:"./images/Idli_Sambar.jpg",          description:"Light flattened rice snack with mustard & curry leaf",type:"Veg",     rating:4.4, badge:"Healthy"},
  {id:10,name:"Misal Pav",           category:"breakfast", price:170, image:"./images/Butter_Chicken.jpg",       description:"Spicy Maharashtrian sprout curry with pav",           type:"Veg",     rating:4.6, badge:"Trending"},
  {id:11,name:"Pesarattu",           category:"breakfast", price:150, image:"./images/MasalaDosa.jpg",           description:"Protein-rich green gram dosa",                        type:"Veg",     rating:4.5, badge:"Healthy"},
  {id:12,name:"Rava Dosa",           category:"breakfast", price:190, image:"./images/MasalaDosa.jpg",           description:"Thin, crispy instant semolina dosa",                  type:"Veg",     rating:4.7, badge:"Popular"},
  {id:13,name:"Egg Bhurji",          category:"breakfast", price:180, image:"./images/Butter_Chicken.jpg",       description:"Spiced scrambled eggs with onion & tomato",           type:"Non-Veg", rating:4.6, badge:"Protein"},
  {id:14,name:"Omelette Toast",      category:"breakfast", price:150, image:"./images/Butter_Chicken.jpg",       description:"Classic fluffy omelette on buttered toast",           type:"Non-Veg", rating:4.5, badge:"Classic"},
  {id:15,name:"Chole Kulche",        category:"breakfast", price:190, image:"./images/Paneer_Butter_Masala.jpg", description:"Spicy chickpeas with soft kulcha bread",              type:"Veg",     rating:4.7, badge:"Popular"},
  {id:16,name:"Veg Sandwich",        category:"breakfast", price:130, image:"./images/Paneer_Butter_Masala.jpg", description:"Grilled fresh vegetable sandwich",                    type:"Veg",     rating:4.3, badge:"Fresh"},
  {id:17,name:"Cheese Toast",        category:"breakfast", price:140, image:"./images/Paneer_Butter_Masala.jpg", description:"Loaded melted cheese on crispy bread",                type:"Veg",     rating:4.4, badge:"Kids Fav"},
  {id:18,name:"French Toast",        category:"breakfast", price:180, image:"./images/Kulfi.jpg",                description:"Sweet egg-dipped toast with maple syrup",             type:"Veg",     rating:4.6, badge:"Sweet"},
  {id:19,name:"Cornflakes Bowl",     category:"breakfast", price:120, image:"./images/Kulfi.jpg",                description:"Healthy cereal with chilled milk & fruits",           type:"Veg",     rating:4.2, badge:"Healthy"},
  {id:20,name:"Fruit Bowl",          category:"breakfast", price:150, image:"./images/Kulfi.jpg",                description:"Seasonal fresh fruits platter",                       type:"Veg",     rating:4.5, badge:"Fresh"},

  //lunch
  {id:21,name:"Paneer Butter Masala",category:"lunch",     price:280, image:"./images/Paneer_Butter_Masala.jpg", description:"Rich creamy paneer curry with butter naan",           type:"Veg",     rating:4.8, badge:"Best Seller"},
  {id:22,name:"Dal Tadka",           category:"lunch",     price:220, image:"./images/Paneer_Butter_Masala.jpg", description:"Yellow lentils tempered with cumin & garlic",         type:"Veg",     rating:4.6, badge:"Classic"},
  {id:23,name:"Veg Biryani",         category:"lunch",     price:260, image:"./images/Hyderabadi_Chicken_Biryani.jpg", description:"Aromatic basmati rice with vegetables & spices", type:"Veg",   rating:4.7, badge:"Popular"},
  {id:24,name:"Rajma Chawal",        category:"lunch",     price:240, image:"./images/Paneer_Butter_Masala.jpg", description:"Kidney beans curry served over steamed rice",         type:"Veg",     rating:4.5, badge:"Homestyle"},
  {id:25,name:"Chole Bhature",       category:"lunch",     price:250, image:"./images/Paneer_Butter_Masala.jpg", description:"Spicy chickpeas with fluffy deep-fried bhature",      type:"Veg",     rating:4.7, badge:"Popular"},
  {id:26,name:"Veg Thali",           category:"lunch",     price:320, image:"./images/Paneer_Butter_Masala.jpg", description:"Complete Indian meal — dal, sabzi, roti & rice",      type:"Veg",     rating:4.8, badge:"Chef Choice"},
  {id:27,name:"Kadai Paneer",        category:"lunch",     price:290, image:"./images/Paneer_Butter_Masala.jpg", description:"Paneer cooked in a spicy kadai masala",               type:"Veg",     rating:4.7, badge:"Hot"},
  {id:28,name:"Mushroom Masala",     category:"lunch",     price:280, image:"./images/Paneer_Butter_Masala.jpg", description:"Button mushrooms in a rich onion-tomato gravy",       type:"Veg",     rating:4.5, badge:"Fresh"},
  {id:29,name:"Palak Paneer",        category:"lunch",     price:270, image:"./images/Paneer_Butter_Masala.jpg", description:"Creamy spinach curry with soft paneer cubes",         type:"Veg",     rating:4.6, badge:"Healthy"},
  {id:30,name:"Veg Fried Rice",      category:"lunch",     price:240, image:"./images/Paneer_Butter_Masala.jpg", description:"Indo-Chinese stir-fried rice with vegetables",        type:"Veg",     rating:4.4, badge:"Trending"},
  {id:31,name:"Chicken Curry",       category:"lunch",     price:320, image:"./images/Butter_Chicken.jpg",       description:"Traditional home-style chicken curry",                type:"Non-Veg", rating:4.8, badge:"Popular"},
  {id:32,name:"Chicken Biryani",     category:"lunch",     price:340, image:"./images/Hyderabadi_Chicken_Biryani.jpg", description:"Flavorful dum-cooked chicken biryani",          type:"Non-Veg", rating:4.9, badge:"Best Seller"},
  {id:33,name:"Mutton Curry",        category:"lunch",     price:420, image:"./images/Butter_Chicken.jpg",       description:"Slow-cooked rich mutton curry",                       type:"Non-Veg", rating:4.8, badge:"Premium"},
  {id:34,name:"Fish Curry",          category:"lunch",     price:380, image:"./images/Butter_Chicken.jpg",       description:"Coastal-style tangy fish curry",                      type:"Non-Veg", rating:4.7, badge:"Chef Choice"},
  {id:35,name:"Egg Curry",           category:"lunch",     price:240, image:"./images/Butter_Chicken.jpg",       description:"Boiled eggs in spiced onion-tomato gravy",            type:"Non-Veg", rating:4.5, badge:"Classic"},
  {id:36,name:"Chicken Fried Rice",  category:"lunch",     price:280, image:"./images/Butter_Chicken.jpg",       description:"Wok-tossed chicken with egg-fried rice",              type:"Non-Veg", rating:4.6, badge:"Popular"},
  {id:37,name:"Butter Naan Combo",   category:"lunch",     price:250, image:"./images/Paneer_Butter_Masala.jpg", description:"Soft butter naan with your choice of curry",          type:"Veg",     rating:4.5, badge:"Value"},
  {id:38,name:"Tandoori Roti Meal",  category:"lunch",     price:220, image:"./images/Paneer_Butter_Masala.jpg", description:"Healthy tandoor roti with dal & sabzi",               type:"Veg",     rating:4.4, badge:"Healthy"},
  {id:39,name:"Jeera Rice",          category:"lunch",     price:180, image:"./images/Paneer_Butter_Masala.jpg", description:"Fragrant cumin-flavored basmati rice",                type:"Veg",     rating:4.3, badge:"Classic"},
  {id:40,name:"Curd Rice",           category:"lunch",     price:170, image:"./images/Paneer_Butter_Masala.jpg", description:"South Indian cooling curd rice with tempering",       type:"Veg",     rating:4.4, badge:"Comfort"},

  //dinner
  {id:41,name:"Butter Chicken",      category:"dinner",    price:340, image:"./images/Butter_Chicken.jpg",       description:"Tender chicken in a velvety tomato-cream sauce",     type:"Non-Veg", rating:4.9, badge:"Best Seller"},
  {id:42,name:"Hyderabadi Biryani",  category:"dinner",    price:320, image:"./images/Hyderabadi_Chicken_Biryani.jpg", description:"Authentic layered dum chicken biryani",         type:"Non-Veg", rating:4.9, badge:"Popular"},
  {id:43,name:"Paneer Tikka",        category:"dinner",    price:290, image:"./images/Paneer_Butter_Masala.jpg", description:"Tandoor-grilled marinated paneer with peppers",       type:"Veg",     rating:4.7, badge:"Popular"},
  {id:44,name:"Malai Kofta",         category:"dinner",    price:280, image:"./images/Paneer_Butter_Masala.jpg", description:"Soft cottage cheese dumplings in cream sauce",        type:"Veg",     rating:4.6, badge:"Classic"},
  {id:45,name:"Dal Makhani",         category:"dinner",    price:250, image:"./images/Paneer_Butter_Masala.jpg", description:"Slow-cooked black lentils in butter & cream",         type:"Veg",     rating:4.7, badge:"Best Seller"},
  {id:46,name:"Veg Pulao",           category:"dinner",    price:240, image:"./images/Paneer_Butter_Masala.jpg", description:"Light aromatic rice dish with mixed vegetables",      type:"Veg",     rating:4.4, badge:"Fresh"},
  {id:47,name:"Tandoori Chicken",    category:"dinner",    price:380, image:"./images/Butter_Chicken.jpg",       description:"Smoky clay-oven roasted half chicken",                type:"Non-Veg", rating:4.8, badge:"Chef Choice"},
  {id:48,name:"Chicken Tikka",       category:"dinner",    price:340, image:"./images/Butter_Chicken.jpg",       description:"Boneless chicken grilled on skewers",                 type:"Non-Veg", rating:4.8, badge:"Popular"},
  {id:49,name:"Mutton Rogan Josh",   category:"dinner",    price:450, image:"./images/Butter_Chicken.jpg",       description:"Classic Kashmiri slow-cooked lamb curry",             type:"Non-Veg", rating:4.8, badge:"Premium"},
  {id:50,name:"Fish Fry",            category:"dinner",    price:390, image:"./images/Butter_Chicken.jpg",       description:"Crispy spiced whole fish fry",                        type:"Non-Veg", rating:4.7, badge:"Trending"},
  {id:51,name:"Veg Manchurian",      category:"dinner",    price:260, image:"./images/Paneer_Butter_Masala.jpg", description:"Crispy veg balls in Indo-Chinese sauce",              type:"Veg",     rating:4.5, badge:"Popular"},
  {id:52,name:"Hakka Noodles",       category:"dinner",    price:240, image:"./images/Paneer_Butter_Masala.jpg", description:"Wok-tossed noodles with vegetables",                  type:"Veg",     rating:4.4, badge:"Trending"},
  {id:53,name:"Chicken Noodles",     category:"dinner",    price:280, image:"./images/Butter_Chicken.jpg",       description:"Hakka noodles with shredded chicken",                 type:"Non-Veg", rating:4.6, badge:"Popular"},
  {id:54,name:"Egg Fried Rice",      category:"dinner",    price:250, image:"./images/Butter_Chicken.jpg",       description:"Wok-fried rice with scrambled egg",                   type:"Non-Veg", rating:4.5, badge:"Classic"},
  {id:55,name:"Paneer Lababdar",     category:"dinner",    price:300, image:"./images/Paneer_Butter_Masala.jpg", description:"Rich paneer in a cashew-tomato gravy",                type:"Veg",     rating:4.7, badge:"Premium"},
  {id:56,name:"Kadai Chicken",       category:"dinner",    price:350, image:"./images/Butter_Chicken.jpg",       description:"Spicy chicken cooked in a wok with bell peppers",     type:"Non-Veg", rating:4.8, badge:"Hot"},
  {id:57,name:"Veg Thali Deluxe",    category:"dinner",    price:380, image:"./images/Paneer_Butter_Masala.jpg", description:"Full-course dinner with 7 items",                     type:"Veg",     rating:4.8, badge:"Chef Choice"},
  {id:58,name:"Chicken Thali",       category:"dinner",    price:420, image:"./images/Butter_Chicken.jpg",       description:"Complete chicken meal with roti & rice",              type:"Non-Veg", rating:4.8, badge:"Popular"},
  {id:59,name:"Garlic Naan Basket",  category:"dinner",    price:180, image:"./images/Paneer_Butter_Masala.jpg", description:"Assorted garlic butter naans",                        type:"Veg",     rating:4.5, badge:"Side Dish"},
  {id:60,name:"Stuffed Kulcha",      category:"dinner",    price:190, image:"./images/Paneer_Butter_Masala.jpg", description:"Oven-baked bread stuffed with spiced potato",         type:"Veg",     rating:4.4, badge:"Classic"},

  //dessert
  {id:61,name:"Gulab Jamun",         category:"desserts",  price:120, image:"./images/Gulab_Jamun.jpg",          description:"Soft milk-solid dumplings soaked in rose syrup",     type:"Veg",     rating:4.8, badge:"Best Seller"},
  {id:62,name:"Rasmalai",            category:"desserts",  price:140, image:"./images/Rasmalai.jpg",             description:"Paneer discs in saffron-flavored cream",              type:"Veg",     rating:4.7, badge:"Popular"},
  {id:63,name:"Kesar Pista Kulfi",   category:"desserts",  price:130, image:"./images/Kulfi.jpg",                description:"Traditional saffron & pistachio frozen dessert",      type:"Veg",     rating:4.8, badge:"Popular"},
  {id:64,name:"Chocolate Brownie",   category:"desserts",  price:180, image:"./images/Kulfi.jpg",                description:"Warm fudgy chocolate brownie with vanilla ice cream", type:"Veg",     rating:4.9, badge:"Trending"},
  {id:65,name:"Ice Cream Sundae",    category:"desserts",  price:200, image:"./images/Kulfi.jpg",                description:"Three-scoop sundae with toppings & wafer",            type:"Veg",     rating:4.8, badge:"Kids Fav"},
  {id:66,name:"Cheesecake",          category:"desserts",  price:220, image:"./images/Kulfi.jpg",                description:"Creamy New York-style baked cheesecake",              type:"Veg",     rating:4.7, badge:"Premium"},
  {id:67,name:"Tiramisu",            category:"desserts",  price:250, image:"./images/Kulfi.jpg",                description:"Classic Italian espresso-soaked dessert",             type:"Veg",     rating:4.7, badge:"Premium"},
  {id:68,name:"Carrot Halwa",        category:"desserts",  price:150, image:"./images/Kulfi.jpg",                description:"Traditional slow-cooked gajar halwa",                 type:"Veg",     rating:4.6, badge:"Classic"},
  {id:69,name:"Moong Dal Halwa",     category:"desserts",  price:170, image:"./images/Kulfi.jpg",                description:"Rich festive split mung bean halwa",                  type:"Veg",     rating:4.7, badge:"Popular"},
  {id:70,name:"Fruit Custard",       category:"desserts",  price:130, image:"./images/Kulfi.jpg",                description:"Creamy vanilla custard with fresh fruits",            type:"Veg",     rating:4.5, badge:"Fresh"},
  {id:71,name:"Falooda",             category:"desserts",  price:180, image:"./images/Kulfi.jpg",                description:"Rose-flavored dessert with basil seeds & vermicelli", type:"Veg",     rating:4.8, badge:"Trending"},
  {id:72,name:"Mango Mousse",        category:"desserts",  price:190, image:"./images/Kulfi.jpg",                description:"Light chilled mango mousse",                          type:"Veg",     rating:4.6, badge:"Seasonal"},
  {id:73,name:"Red Velvet Pastry",   category:"desserts",  price:160, image:"./images/Kulfi.jpg",                description:"Soft red velvet cake slice with cream cheese",        type:"Veg",     rating:4.7, badge:"Popular"},
  {id:74,name:"Black Forest Cake",   category:"desserts",  price:180, image:"./images/Kulfi.jpg",                description:"Chocolate sponge with cherries & whipped cream",      type:"Veg",     rating:4.8, badge:"Best Seller"},
  {id:75,name:"Donut Delight",       category:"desserts",  price:120, image:"./images/Kulfi.jpg",                description:"Fresh glazed ring donut",                             type:"Veg",     rating:4.5, badge:"Sweet"},

  //deserts
  {id:76,name:"Mango Lassi",         category:"drinks",    price:110, image:"./images/Mango_Lassi.jpg",          description:"Sweet chilled yogurt drink with mango pulp",          type:"Veg",     rating:4.8, badge:"Popular"},
  {id:77,name:"Masala Chai",         category:"drinks",    price:70,  image:"./images/Masala_Chai.jpg",          description:"Aromatic spiced Indian tea with milk",                type:"Veg",     rating:4.9, badge:"Best Seller"},
  {id:78,name:"Fresh Lime Soda",     category:"drinks",    price:90,  image:"./images/Fresh_Lime_Soda.jpg",      description:"Fizzy lime soda — sweet, salted or mixed",            type:"Veg",     rating:4.7, badge:"Fresh"},
  {id:79,name:"Cold Coffee",         category:"drinks",    price:140, image:"./images/Mango_Lassi.jpg",          description:"Blended chilled coffee with ice cream",               type:"Veg",     rating:4.8, badge:"Trending"},
  {id:80,name:"Cappuccino",          category:"drinks",    price:160, image:"./images/Mango_Lassi.jpg",          description:"Double espresso topped with frothy milk foam",        type:"Veg",     rating:4.7, badge:"Premium"},
  {id:81,name:"Latte",               category:"drinks",    price:170, image:"./images/Mango_Lassi.jpg",          description:"Smooth espresso with steamed creamy milk",            type:"Veg",     rating:4.6, badge:"Popular"},
  {id:82,name:"Espresso",            category:"drinks",    price:130, image:"./images/Mango_Lassi.jpg",          description:"Strong concentrated single coffee shot",              type:"Veg",     rating:4.5, badge:"Classic"},
  {id:83,name:"Mocha",               category:"drinks",    price:180, image:"./images/Mango_Lassi.jpg",          description:"Espresso blended with rich chocolate sauce",          type:"Veg",     rating:4.7, badge:"Premium"},
  {id:84,name:"Watermelon Juice",    category:"drinks",    price:120, image:"./images/Fresh_Lime_Soda.jpg",      description:"Fresh cold-pressed watermelon juice",                 type:"Veg",     rating:4.6, badge:"Healthy"},
  {id:85,name:"Orange Juice",        category:"drinks",    price:130, image:"./images/Fresh_Lime_Soda.jpg",      description:"Freshly squeezed sweet orange juice",                 type:"Veg",     rating:4.6, badge:"Healthy"},
  {id:86,name:"Pineapple Juice",     category:"drinks",    price:130, image:"./images/Fresh_Lime_Soda.jpg",      description:"Tropical chilled pineapple juice",                    type:"Veg",     rating:4.5, badge:"Fresh"},
  {id:87,name:"Chocolate Shake",     category:"drinks",    price:180, image:"./images/Mango_Lassi.jpg",          description:"Thick creamy chocolate milkshake",                    type:"Veg",     rating:4.8, badge:"Kids Fav"},
  {id:88,name:"Strawberry Shake",    category:"drinks",    price:180, image:"./images/Mango_Lassi.jpg",          description:"Fresh strawberry blended milkshake",                  type:"Veg",     rating:4.7, badge:"Popular"},
  {id:89,name:"Green Tea",           category:"drinks",    price:90,  image:"./images/Masala_Chai.jpg",          description:"Antioxidant-rich hot green tea",                      type:"Veg",     rating:4.4, badge:"Healthy"},
  {id:90,name:"Mineral Water",       category:"drinks",    price:40,  image:"./images/Fresh_Lime_Soda.jpg",      description:"Chilled packaged drinking water",                     type:"Veg",     rating:4.3, badge:"Essential"},
];

// pagination state
const ITEMS_PER_PAGE = 6;
let currentPage   = 1;
let currentFilter = "all";
let searchTerm    = "";

// filtering items
function getFilteredItems() {
  return menuData.filter((item) => {
    const categoryMatch = currentFilter === "all" || item.category === currentFilter;
    const searchMatch   = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });
}

// render menu cards
function renderMenu() {
  const menuContainer = document.getElementById("menu-container");
  const noResults     = document.getElementById("no-results");
  const filtered      = getFilteredItems();

  if (filtered.length === 0) {
    menuContainer.innerHTML = "";
    if (noResults) noResults.style.display = "block";
    renderPagination(0);
    return;
  }

  if (noResults) noResults.style.display = "none";

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const items = filtered.slice(start, start + ITEMS_PER_PAGE);

  menuContainer.innerHTML = "";

  items.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "menu-item";
    card.dataset.category = item.category;

    card.innerHTML = `
      <div class="food-card">
        <img src="${item.image}" alt="${item.name}" class="food-image" loading="lazy" />
        <div class="food-content">
          <span class="badge">${item.badge}</span>
          <div class="rating">&#9733; ${item.rating}</div>
          <div class="menu-item-header">
            <h3>${item.name}</h3>
            <span class="menu-price">&#8377;${item.price}</span>
          </div>
          <span class="food-tag ${item.type === "Veg" ? "veg" : "nonveg"}">${item.type}</span>
          <p>${item.description}</p>
        </div>
      </div>
    `;

    menuContainer.appendChild(card);

    setTimeout(() => card.classList.add("show"), index * 100);
  });

  renderPagination(filtered.length);
}

//  Render pagination controls 
function renderPagination(totalItems) {
  const totalPages  = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const pageNumbers = document.getElementById("pageNumbers");

  pageNumbers.innerHTML = "";

  // Clamp currentPage in case filter reduced total pages
  if (currentPage > totalPages) currentPage = Math.max(1, totalPages);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.classList.add("page-btn");
    if (i === currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => {
      currentPage = i;
      renderMenu();
      // scorll menu section into view smoothly
      document.getElementById("menu").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    pageNumbers.appendChild(btn);
  }
}

// search
const searchInput = document.getElementById("menu-search");
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    searchTerm  = e.target.value.trim();
    currentPage = 1;
    renderMenu();
  });
}

// category filter btn
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".filter-btn.active")?.classList.remove("active");
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    currentPage   = 1;
    renderMenu();
  });
});

// previous page and current page
document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderMenu();
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  const totalPages = Math.ceil(getFilteredItems().length / ITEMS_PER_PAGE);
  if (currentPage < totalPages) {
    currentPage++;
    renderMenu();
  }
});

// Initial render
renderMenu();

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
  localStorage.setItem("theme", isLight ? "light" : "dark");
  themeToggle.textContent = isLight ? "☀️" : "🌙";
});

// smooth scroll for nav links
function smoothScroll(e) {
  e.preventDefault();
  const target = document.querySelector(this.getAttribute("href"));
  if (target) {
    window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
  }
  closeMobileMenu();
}

// form submission
function handleFormSubmit(e) {
  e.preventDefault();

  const inputs  = reservationForm.querySelectorAll("input, select, textarea");
  let isValid   = true;

  inputs.forEach((input) => {
    if (input.required && !input.value) {
      input.style.borderColor = "#c94a4a";
      isValid = false;
    } else {
      input.style.borderColor = "";
    }
  });

  if (isValid) {
    const submitBtn=reservationForm.querySelector('button[type="submit"]');
    const origText=submitBtn.textContent;
    submitBtn.textContent="Reservation Requested!";
    submitBtn.style.backgroundColor = "#4a9c6a";
    submitBtn.disabled= true;
    setTimeout(() => {
      reservationForm.reset();
      submitBtn.textContent= origText;
      submitBtn.style.backgroundColor = "";
      submitBtn.disabled= false;
    }, 3000);
  }
}

// fade-in for sections
function setupIntersectionObserver() {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
    {threshold: 0.1}
  );

  document.querySelectorAll(".about-content, .menu-panel, .reservation-form, .location-info").forEach((el) => {
      el.style.opacity   = "0";
      el.style.transform = "translateY(30px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(el);
    });
}

const visibleStyle = document.createElement("style");
visibleStyle.textContent =`.visible { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(visibleStyle);

//Auto-scroll
const heroScroll= document.querySelector(".hero-scroll");
let autoScrollInterval = null;

function startAutoScroll() {
  autoScrollInterval = setInterval(() => {
    window.scrollBy({ top: 2, behavior: "instant" });
    if (window.scrollY + window.innerHeight >= document.body.scrollHeight) stopAutoScroll();
  }, 15);
}

function stopAutoScroll() {
  if (autoScrollInterval) { clearInterval(autoScrollInterval); autoScrollInterval = null; }
}

if (heroScroll) {
  heroScroll.style.cursor = "pointer";
  heroScroll.addEventListener("click", () =>
    autoScrollInterval ? stopAutoScroll() : startAutoScroll()
  );
}

["mousemove","touchstart","keydown","wheel","pointerdown"].forEach((ev) =>
  window.addEventListener(ev, stopAutoScroll)
);

// event listerners
window.addEventListener("scroll", handleScroll);
navToggle.addEventListener("click", toggleMobileMenu);
navLinks.forEach((link) => link.addEventListener("click", smoothScroll));
document.querySelectorAll(".nav-cta, .hero-buttons a").forEach((link) =>
  link.addEventListener("click", smoothScroll)
);
if (reservationForm) reservationForm.addEventListener("submit", handleFormSubmit);

window.addEventListener("resize", () => { if (window.innerWidth > 768) closeMobileMenu(); });

document.addEventListener("DOMContentLoaded", () => {
  handleScroll();
  setupIntersectionObserver();
  updateAvailableTimes();
});

// back to top
const backToTopBtn = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  backToTopBtn.classList.toggle("visible", window.scrollY > 300);
});

backToTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// reviews
const STORAGE_KEY = "lighthouse_reviews";

const pinnedReview = {
  name: "Rasshi Srivastav",
  rating: 5,
  text: "Absolutely loved the food and ambience! Every dish was crafted with such care and the atmosphere was warm and elegant. A truly memorable dining experience — will definitely be coming back!",
  date: "14 May 2026",
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
  const grid = document.getElementById("reviews-grid");
  if (!grid) return;

  const allReviews = [pinnedReview, ...getReviews()];

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
        </div>`
    )
    .join("");
}

// Star rating widget
let selectedRating = 0;
const starBtns = document.querySelectorAll("#star-input .star-btn");

starBtns.forEach((btn) => {
  btn.addEventListener("mouseenter", () => {
    const val = +btn.dataset.value;
    starBtns.forEach((s) => s.classList.toggle("active", +s.dataset.value <= val));
  });
  btn.addEventListener("mouseleave", () => {
    starBtns.forEach((s) => s.classList.toggle("active", +s.dataset.value <= selectedRating));
  });
  btn.addEventListener("click", () => {
    selectedRating = +btn.dataset.value;
    document.getElementById("review-rating").value = selectedRating;
    starBtns.forEach((s) => s.classList.toggle("active", +s.dataset.value <= selectedRating));
  });
});

function isMeaningfulReview(text) {
  if (/^(.)\1+$|^[a-zA-Z]{1,6}$/.test(text.trim())) return false;
  return text.trim().split(/\s+/).length >= 3;
}

function isValidName(name) {
  return /^[A-Za-z\s]{3,30}$/.test(name.trim());
}

const reviewForm = document.getElementById("review-form");
const reviewMsg  = document.getElementById("review-msg");

if (reviewForm) {
  reviewForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name       = document.getElementById("review-name").value.trim();
    const reviewText = document.getElementById("review-text").value.trim();

    reviewMsg.style.display = "block";

    if (!selectedRating) {
      reviewMsg.textContent = "Please select a star rating.";
      reviewMsg.style.color = "#c94a4a";
      return;
    }
    if (!isValidName(name)) {
      reviewMsg.textContent = "Name should contain only letters and be 3–30 characters long.";
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

    const dateStr = new Date().toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });

    const newReview = { id: Date.now(), name, rating: selectedRating, text: reviewText, date: dateStr };
    const reviews   = getReviews();
    reviews.unshift(newReview);
    saveReviews(reviews);
    renderReviews();

    reviewForm.reset();
    selectedRating = 0;
    document.getElementById("review-rating").value = 0;
    starBtns.forEach((s) => s.classList.remove("active"));

    reviewMsg.textContent = "Review submitted successfully!";
    reviewMsg.style.color = "#4a9c6a";
    setTimeout(() => { reviewMsg.style.display = "none"; }, 3000);
  });
}

renderReviews();
