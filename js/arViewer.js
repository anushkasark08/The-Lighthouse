// ============================================
//   AR VIEWER
// ============================================

class ARViewer {
    constructor() {
        this.arSession = null;
        this.isARSupported = false;
        this.modelUrl = null;
        this.isRunning = false;
        this.onStatusChange = null;
        this.xrRefSpace = null;
        
        console.log('📱 Initializing AR Viewer...');
        this.checkARSupport();
    }

    async checkARSupport() {
        try {
            if ('xr' in navigator) {
                this.isARSupported = await navigator.xr.isSessionSupported('immersive-ar');
                console.log(`📱 AR Support: ${this.isARSupported ? '✅ Supported' : '❌ Not supported'}`);
                return this.isARSupported;
            }
            console.log('📱 WebXR not available');
            return false;
        } catch (error) {
            console.error('❌ AR check failed:', error);
            return false;
        }
    }

    async startAR(modelUrl) {
        if (!this.isARSupported) {
            this.showMessage('AR is not supported on this device. Please use a WebXR-compatible browser.', 'error');
            return false;
        }

        if (!modelUrl) {
            this.showMessage('No 3D model available for AR preview.', 'error');
            return false;
        }

        try {
            // Request camera permission
            await navigator.mediaDevices.getUserMedia({ video: true });
            
            // Create AR session
            this.arSession = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['hit-test', 'dom-overlay'],
                domOverlay: { root: document.getElementById('ar-overlay') }
            });

            this.modelUrl = modelUrl;
            this.isRunning = true;
            
            this.setupARScene();
            this.showMessage('📱 Point your camera at a flat surface to place the dish!', 'info');
            
            if (this.onStatusChange) {
                this.onStatusChange('running');
            }
            
            console.log('✅ AR session started');
            return true;
        } catch (error) {
            console.error('❌ Failed to start AR:', error);
            this.showMessage('Failed to start AR. Please try again.', 'error');
            return false;
        }
    }

    async stopAR() {
        if (this.arSession) {
            try {
                await this.arSession.end();
            } catch (e) {
                console.error('Error ending AR session:', e);
            }
            this.arSession = null;
        }
        this.isRunning = false;
        this.hideAROverlay();
        if (this.onStatusChange) {
            this.onStatusChange('stopped');
        }
        console.log('📱 AR session stopped');
    }

    setupARScene() {
        // Show AR overlay
        const overlay = document.getElementById('ar-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.classList.add('active');
        }
        
        // Add AR controls
        this.addARControls();
        
        // Setup AR session handlers
        this.arSession.addEventListener('end', () => {
            this.isRunning = false;
            this.hideAROverlay();
            if (this.onStatusChange) {
                this.onStatusChange('stopped');
            }
        });
    }

    addARControls() {
        const controls = document.getElementById('ar-controls');
        if (controls) {
            controls.innerHTML = `
                <button class="ar-close-btn" onclick="window.arViewer && window.arViewer.stopAR()">
                    ✕ Close AR
                </button>
                <button class="ar-rotate-btn" onclick="window.arViewer && window.arViewer.toggleModel()">
                    🔄 Rotate Model
                </button>
            `;
        }
    }

    hideAROverlay() {
        const overlay = document.getElementById('ar-overlay');
        if (overlay) {
            overlay.style.display = 'none';
            overlay.classList.remove('active');
        }
    }

    showMessage(message, type = 'error') {
        const msgContainer = document.getElementById('ar-message');
        if (msgContainer) {
            msgContainer.textContent = message;
            msgContainer.className = `ar-message ${type}`;
            msgContainer.style.display = 'block';
            
            // Auto-hide after 10 seconds for non-error messages
            if (type !== 'error') {
                setTimeout(() => {
                    msgContainer.style.display = 'none';
                }, 10000);
            }
        }
    }

    toggleModel() {
        // Toggle model rotation in AR
        console.log('🔄 Toggle AR model rotation');
        const btn = document.querySelector('.ar-rotate-btn');
        if (btn) {
            const isRotating = btn.dataset.rotating === 'true';
            btn.dataset.rotating = !isRotating;
            btn.textContent = isRotating ? '🔄 Rotate Model' : '⏹ Stop Rotation';
        }
    }

    isSupported() {
        return this.isARSupported;
    }
}

// Make available globally
window.ARViewer = ARViewer;

export default ARViewer;