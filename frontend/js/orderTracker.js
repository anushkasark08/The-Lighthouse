// ============================================
//   ORDER TRACKER
// ============================================

class OrderTracker {
    constructor() {
        this.socket = null;
        this.orderId = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.statusHandlers = new Map();
        this.orderData = null;
        
        this.initialize();
    }

    initialize() {
        console.log('📦 Initializing Order Tracker...');
        this.setupEventListeners();
        this.loadOrderFromURL();
        console.log('✅ Order Tracker initialized');
    }

    loadOrderFromURL() {
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get('order');
        if (orderId) {
            this.connect(orderId);
        }
    }

    connect(orderId) {
        if (this.socket && this.socket.connected) {
            this.socket.disconnect();
        }

        this.orderId = orderId;
        this.showStatus('Connecting...', 'info');

        const token = localStorage.getItem('token');
        if (!token) {
            this.showStatus('Please login to track orders', 'error');
            return;
        }

        this.socket = io(process.env.WS_URL || window.location.origin, {
            auth: { token },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts
        });

        this.setupSocketListeners();
        this.socket.emit('track-order', { orderId });
        this.updateURL(orderId);
    }

    setupSocketListeners() {
        this.socket.on('connect', () => {
            console.log('🔗 Connected to WebSocket');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.showStatus('Connected', 'success');
            this.hideError();
        });

        this.socket.on('disconnect', () => {
            console.log('🔌 Disconnected from WebSocket');
            this.isConnected = false;
            this.showStatus('Reconnecting...', 'warning');
        });

        this.socket.on('order-status', (data) => {
            console.log('📦 Order status received:', data);
            this.orderData = data;
            this.renderOrder(data);
            this.updateTimeline(data.statusHistory);
        });

        this.socket.on('status-update', (data) => {
            console.log('🔄 Status update:', data);
            this.handleStatusUpdate(data);
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.showError(error.message);
        });

        this.socket.on('reconnect_attempt', (attempt) => {
            this.reconnectAttempts = attempt;
            this.showStatus(`Reconnecting (${attempt}/${this.maxReconnectAttempts})...`, 'warning');
        });

        this.socket.on('reconnect_failed', () => {
            this.showStatus('Connection failed. Please refresh.', 'error');
        });
    }

    handleStatusUpdate(data) {
        // Update order data
        if (this.orderData) {
            this.orderData.status = data.status;
            this.orderData.statusHistory = data.statusHistory || this.orderData.statusHistory;
        }

        // Update UI
        this.updateStatusDisplay(data);
        this.updateProgress(data);
        this.updateTimeline(data.statusHistory || [data]);
        this.playNotification(data);
        this.showToast(data);

        // Update URL with new status
        this.updateURL(this.orderId, data.status);
    }

    renderOrder(data) {
        const container = document.getElementById('order-container');
        if (!container) return;

        container.innerHTML = `
            <div class="order-tracking">
                <div class="order-header">
                    <h2>Order #${data.orderNumber}</h2>
                    <span class="order-status-badge status-${data.status}">${data.status.toUpperCase()}</span>
                </div>
                
                <div class="order-progress">
                    <div class="progress-steps">
                        <div class="step ${this.isStepActive('received', data.status)}">
                            <span class="step-icon">📋</span>
                            <span class="step-label">Received</span>
                        </div>
                        <div class="step ${this.isStepActive('preparing', data.status)}">
                            <span class="step-icon">👨‍🍳</span>
                            <span class="step-label">Preparing</span>
                        </div>
                        <div class="step ${this.isStepActive('ready', data.status)}">
                            <span class="step-icon">✅</span>
                            <span class="step-label">Ready</span>
                        </div>
                        <div class="step ${this.isStepActive('completed', data.status)}">
                            <span class="step-icon">🎉</span>
                            <span class="step-label">Completed</span>
                        </div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${this.getProgressPercentage(data.status)}%"></div>
                    </div>
                </div>

                <div class="order-details">
                    <div class="order-items">
                        <h3>Items</h3>
                        ${data.items.map(item => `
                            <div class="order-item">
                                <span class="item-name">${item.name}</span>
                                <span class="item-quantity">×${item.quantity}</span>
                                <span class="item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-total">
                        <strong>Total: ₹${data.totalAmount.toFixed(2)}</strong>
                    </div>
                    ${data.estimatedTime ? `
                        <div class="order-estimate">
                            ⏱️ Estimated: ${data.estimatedTime} minutes
                        </div>
                    ` : ''}
                </div>

                <div class="order-timeline">
                    <h3>Timeline</h3>
                    <div class="timeline-container">
                        ${data.statusHistory && data.statusHistory.length > 0 ? 
                            data.statusHistory.map(entry => `
                                <div class="timeline-item">
                                    <div class="timeline-dot ${entry.status}"></div>
                                    <div class="timeline-content">
                                        <span class="timeline-status">${entry.status.toUpperCase()}</span>
                                        <span class="timeline-time">${new Date(entry.timestamp).toLocaleString()}</span>
                                        ${entry.note ? `<p class="timeline-note">${entry.note}</p>` : ''}
                                    </div>
                                </div>
                            `).reverse().join('') : 
                            '<p>No timeline data available</p>'
                        }
                    </div>
                </div>

                ${data.status !== 'completed' && data.status !== 'cancelled' ? `
                    <div class="order-actions">
                        <button onclick="orderTracker.cancelOrder()" class="btn-cancel-order">
                            Cancel Order
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    updateStatusDisplay(data) {
        const badge = document.querySelector('.order-status-badge');
        if (badge) {
            badge.className = `order-status-badge status-${data.status}`;
            badge.textContent = data.status.toUpperCase();
        }
    }

    updateProgress(data) {
        const progress = document.querySelector('.progress-fill');
        if (progress) {
            progress.style.width = `${this.getProgressPercentage(data.status)}%`;
        }

        const steps = document.querySelectorAll('.step');
        const statusMap = ['received', 'preparing', 'ready', 'completed'];
        const currentIndex = statusMap.indexOf(data.status);
        
        steps.forEach((step, index) => {
            step.classList.toggle('active', index <= currentIndex);
            step.classList.toggle('completed', index < currentIndex);
        });
    }

    updateTimeline(history) {
        const container = document.querySelector('.timeline-container');
        if (!container || !history) return;

        container.innerHTML = history.map(entry => `
            <div class="timeline-item">
                <div class="timeline-dot ${entry.status}"></div>
                <div class="timeline-content">
                    <span class="timeline-status">${entry.status.toUpperCase()}</span>
                    <span class="timeline-time">${new Date(entry.timestamp).toLocaleString()}</span>
                    ${entry.note ? `<p class="timeline-note">${entry.note}</p>` : ''}
                </div>
            </div>
        `).reverse().join('');
    }

    getProgressPercentage(status) {
        const map = {
            'received': 25,
            'preparing': 50,
            'ready': 75,
            'completed': 100
        };
        return map[status] || 0;
    }

    isStepActive(step, currentStatus) {
        const order = ['received', 'preparing', 'ready', 'completed'];
        return order.indexOf(step) <= order.indexOf(currentStatus);
    }

    playNotification(data) {
        if (data.status === 'ready' || data.status === 'completed') {
            // Play sound
            const audio = new Audio('/sounds/notification.mp3');
            audio.play().catch(() => {});

            // Browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(`Order #${data.orderNumber}`, {
                    body: `Your order is now ${data.status}`,
                    icon: '/images/notification-icon.png'
                });
            }
        }
    }

    showToast(data) {
        const toastContainer = document.getElementById('toast-container') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast-notification ${data.status}`;
        toast.innerHTML = `
            <span class="toast-icon">${this.getStatusEmoji(data.status)}</span>
            <span class="toast-message">Order #${data.orderNumber} is now ${data.status}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
        `;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    getStatusEmoji(status) {
        const map = {
            'received': '📋',
            'preparing': '👨‍🍳',
            'ready': '✅',
            'completed': '🎉',
            'cancelled': '❌'
        };
        return map[status] || '📦';
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 350px;
        `;
        document.body.appendChild(container);
        return container;
    }

    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('connection-status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `status-${type}`;
        }
    }

    showError(message) {
        const errorEl = document.getElementById('error-message');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }

    hideError() {
        const errorEl = document.getElementById('error-message');
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    }

    updateURL(orderId, status = '') {
        const url = new URL(window.location);
        url.searchParams.set('order', orderId);
        if (status) {
            url.searchParams.set('status', status);
        }
        window.history.replaceState({}, '', url);
    }

    async cancelOrder() {
        if (!this.orderId) return;
        if (!confirm('Are you sure you want to cancel this order?')) return;

        try {
            const response = await fetch(`/api/orders/${this.orderId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ reason: 'Cancelled by user' })
            });

            const result = await response.json();
            if (result.success) {
                this.showToast({
                    orderNumber: this.orderData?.orderNumber || this.orderId,
                    status: 'cancelled'
                });
                this.renderOrder({ ...this.orderData, status: 'cancelled' });
            } else {
                alert('Failed to cancel order: ' + result.error);
            }
        } catch (error) {
            alert('Error cancelling order');
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    setupEventListeners() {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
}

// Initialize tracker
document.addEventListener('DOMContentLoaded', () => {
    window.orderTracker = new OrderTracker();
});

export default OrderTracker;