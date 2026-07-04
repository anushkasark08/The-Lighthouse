// ============================================
//   3D MENU CONTROLLER
// ============================================

import ThreeDViewer from './threeDViewer.js';
import ARViewer from './arViewer.js';

console.log('🍽️ Initializing 3D Menu...');

// Initialize 3D Viewer
const viewer = new ThreeDViewer('viewer-container');

// Initialize AR Viewer
const arViewer = new ARViewer();
window.arViewer = arViewer; // Make globally accessible

// Dish data
const dishes = {
    'truffle-burger': {
        name: 'Truffle Burger',
        model: '/models/truffle-burger.glb',
        price: 'Rs. 890',
        description: 'Premium Angus beef with black truffle, aged cheddar, and caramelized onions. Served with truffle fries.'
    },
    'lobster-thermidor': {
        name: 'Lobster Thermidor',
        model: '/models/lobster-thermidor.glb',
        price: 'Rs. 2,490',
        description: 'Succulent lobster in creamy cognac sauce, gratinated with Parmesan. A classic French delicacy.'
    },
    'chocolate-fondant': {
        name: 'Chocolate Fondant',
        model: '/models/chocolate-fondant.glb',
        price: 'Rs. 590',
        description: 'Warm dark chocolate cake with a liquid center, served with vanilla bean ice cream and berry coulis.'
    }
};

// Current selected dish
let currentDish = 'truffle-burger';

// Load initial dish
loadDish('truffle-burger');

// ============================================
//   DISH SELECTION
// ============================================

document.querySelectorAll('.dish-selector button').forEach(btn => {
    btn.addEventListener('click', function() {
        const dishId = this.dataset.dish;
        if (dishId && dishId !== currentDish) {
            // Update active state
            document.querySelectorAll('.dish-selector button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadDish(dishId);
        }
    });
});

function loadDish(dishId) {
    const dish = dishes[dishId];
    if (!dish) {
        console.error(`❌ Dish not found: ${dishId}`);
        return;
    }
    
    currentDish = dishId;
    console.log(`🍽️ Loading dish: ${dish.name}`);
    
    // Update dish info
    const nameEl = document.getElementById('dish-name-3d');
    const priceEl = document.getElementById('dish-price-3d');
    const descEl = document.getElementById('dish-description-3d');
    
    if (nameEl) nameEl.textContent = dish.name;
    if (priceEl) priceEl.textContent = dish.price;
    if (descEl) descEl.textContent = dish.description;
    
    // Load 3D model
    viewer.loadModel(dish.model, dish.name);
    
    // Update AR button
    const arBtn = document.getElementById('ar-button');
    if (arBtn) {
        arBtn.dataset.model = dish.model;
        arBtn.disabled = false;
    }
}

// ============================================
//   AR BUTTON HANDLER
// ============================================

document.getElementById('ar-button')?.addEventListener('click', async function() {
    const modelUrl = this.dataset.model;
    if (!modelUrl) {
        alert('No 3D model available for AR preview.');
        return;
    }
    
    // Check if AR is supported
    const supported = await arViewer.checkARSupport();
    if (!supported) {
        alert('AR is not supported on this device. Please use a WebXR-compatible browser on a mobile device.');
        return;
    }
    
    // Start AR
    const started = await arViewer.startAR(modelUrl);
    if (!started) {
        alert('Failed to start AR. Please try again.');
    }
});

// ============================================
//   CONTROL BUTTONS
// ============================================

document.getElementById('toggle-rotate')?.addEventListener('click', () => {
    viewer.toggleAutoRotate();
});

document.getElementById('reset-view')?.addEventListener('click', () => {
    viewer.resetView();
});

document.getElementById('fullscreen-btn')?.addEventListener('click', () => {
    viewer.toggleFullscreen();
});

// ============================================
//   KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
    // 'R' key - Toggle auto-rotate
    if (e.key === 'r' || e.key === 'R') {
        viewer.toggleAutoRotate();
        e.preventDefault();
    }
    
    // 'F' key - Toggle fullscreen
    if (e.key === 'f' || e.key === 'F') {
        viewer.toggleFullscreen();
        e.preventDefault();
    }
    
    // 'ESC' key - Close AR
    if (e.key === 'Escape' && arViewer.isRunning) {
        arViewer.stopAR();
        e.preventDefault();
    }
    
    // Number keys 1-3 for dish selection
    if (e.key >= '1' && e.key <= '3') {
        const buttons = document.querySelectorAll('.dish-selector button');
        const index = parseInt(e.key) - 1;
        if (buttons[index]) {
            buttons[index].click();
            e.preventDefault();
        }
    }
});

console.log('✅ 3D Menu initialized!');
console.log('🎮 Keyboard shortcuts:');
console.log('  R - Toggle auto-rotate');
console.log('  F - Toggle fullscreen');
console.log('  ESC - Close AR');
console.log('  1,2,3 - Select dishes');