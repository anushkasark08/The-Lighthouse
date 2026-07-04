// ============================================
//   KITCHEN DASHBOARD
// ============================================

class KitchenDashboard {
    constructor() {
        this.socket = null;
        this.orders = new Map();
        this.isConnected = false;
        this.filterStatus = 'all';
        this.searchQuery = '';
        
        this.initialize();
    }

    initialize() {
        console.log('👨‍🍳 Initializing Kitchen Dashboard...');
        this.setupUI();
        this.connect();
        this.setupEventListeners();
        console.log('✅ Kitchen Dashboard initialized');
    }

    setupUI() {
        // Create dashboard UI
        const dashboard = document.getElementById('kitchen-dashboard');
        if (!dashboard) return;

        dashboard.innerHTML = `
            <div class="kitchen-header">
                <h1>👨‍🍳 Kitchen Dashboard</h1>
                <div class="kitchen-stats">
                    <div class="stat-item">
                        <span class="stat-value" id="total-orders">0</span>
                        <span class="stat-label">Total Orders</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" id="pending-orders">0</span>
                        <span class="stat-label">Pending</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" id="preparing-orders">0</span>
                        <span class="stat-label">Preparing</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" id="ready-orders">0</span>
                        <span class="stat-label">Ready</span>
                    </div>
                </div>
                <div class="kitchen-controls">
                    <div class="filter-group">
                        <button class="filter-btn active" data-filter="all">All</button>
                        <button class="filter-btn" data-filter="received">📋 Received</button>
                        <button class="filter-btn" data-filter="preparing">👨‍🍳 Preparing</button>
                        <button class="filter-btn" data-filter="ready">✅ Ready</button>
                        <button class="filter-btn" data-filter="completed">🎉 Completed</button>
                    </div>
                    <div class="search-group">
                        <input type="text" id="search-orders" placeholder="🔍 Search orders..." />
                    </div>
                </div>
                <div class="connection-status">
                    <span id="ws-status">Connecting...</span>
                </div>
            </div>
            <div class="kitchen-orders" id="orders-container">
                <div class="loading-state">Loading orders...</div>
            </div>
            <div class="kitchen-sound">
                <button id="toggle-sound" class="sound-btn">🔊 Sound On</button>
            </div>
        `;
    }

    connect() {
        const token = localStorage.getItem('token');
        if (!token) {
            this.showStatus('Please login to access kitchen dashboard', 'error');
            return;
        }

        this.socket = io(process.env.WS_URL || window.location.origin, {
            auth: { token },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000
        });

        this.setupSocketListeners();
        this.socket.emit('join-kitchen');
    }

    setupSocketListeners() {
        this.socket.on('connect', () => {
            console.log('🔗 Kitchen connected to WebSocket');
            this.isConnected = true;
            this.showStatus('Connected', 'success');
        });

        this.socket.on('disconnect', () => {
            console.log('🔌 Kitchen disconnected');
            this.isConnected = false;
            this.showStatus('Disconnected', 'error');
        });

        this.socket.on('kitchen-orders', (data) => {
            console.log('📦 Kitchen orders received:', data);
            data.orders.forEach(order => {
                this.orders.set(order._id, order);
            });
            this.renderOrders();
            this.updateStats();
        });

        this.socket.on('new-order', (data) => {
            console.log('🆕 New order:', data);
            this.orders.set(data.orderId, data);
            this.renderOrders();
            this.updateStats();
            this.playNotification('new-order');
        });

        this.socket.on('order-updated', (data) => {
            console.log('🔄 Order updated:', data);
            const existing = this.orders.get(data.orderId);
            if (existing) {
                this.orders.set(data.orderId, { ...existing, ...data });
            } else {
                this.orders.set(data.orderId, data);
            }
            this.renderOrders();
            this.updateStats();
            this.playNotification('order-updated');
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.showStatus('Error: ' + error.message, 'error');
        });
    }

    renderOrders() {
        const container = document.getElementById('orders-container');
        if (!container) return;

        let filteredOrders = Array.from(this.orders.values());

        // Apply status filter
        if (this.filterStatus !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.status === this.filterStatus);
        }

        // Apply search
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filteredOrders = filteredOrders.filter(order => 
                order.orderNumber.toLowerCase().includes(query) ||
                order.items.some(item => item.name.toLowerCase().includes(query))
            );
        }

        // Sort by creation time (newest first)
        filteredOrders.sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));

        if (filteredOrders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📭</span>
                    <p>No orders to display</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredOrders.map(order => `
            <div class="order-card" data-order-id="${order.orderId || order._id}">
                <div class="order-card-header">
                    <span class="order-number">#${order.orderNumber}</span>
                    <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
                    <span class="order-time">${new Date(order.timestamp || order.createdAt).toLocaleTimeString()}</span>
                </div>
                <div class="order-card-body">
                    <div class="order-items-list">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <span class="item-name">${item.name}</span>
                                <span class="item-quantity">×${item.quantity}</span>
                                ${item.specialInstructions ? `<span class="item-notes">📝 ${item.specialInstructions}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                    ${order.specialRequests ? `<div class="order-requests">📝 ${order.specialRequests}</div>` : ''}
                    ${order.tableId ? `<div class="order-table">Table #${order.tableId}</div>` : ''}
                </div>
                <div class="order-card-footer">
                    <div class="order-actions">
                        ${this.getStatusButtons(order.status, order.orderId || order._id)}
                    </div>
                    ${order.estimatedTime ? `<span class="order-estimate">⏱️ ${order.estimatedTime} min</span>` : ''}
                </div>
            </div>
        `).join('');
    }

    getStatusButtons(currentStatus, orderId) {
        const statusFlow = ['received', 'preparing', 'ready', 'completed'];
        const currentIndex = statusFlow.indexOf(currentStatus);
        
        if (currentIndex === -1 || currentIndex === statusFlow.length - 1) {
            return '';
        }

        const nextStatus = statusFlow[currentIndex + 1];
        const btnLabels = {
            'preparing': '👨‍🍳 Start Preparing',
            'ready': '✅ Mark Ready',
            'completed': '🎉 Complete'
        };

        return `
            <button class="status-btn" onclick="kitchenDashboard.updateOrderStatus('${orderId}', '${nextStatus}')">
                ${btnLabels[nextStatus] || nextStatus}
            </button>
        `;
    }

    async updateOrderStatus(orderId, status) {
        try {
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status })
            });

            const result = await response.json();
            if (result.success) {
                const order = this.orders.get(orderId);
                if (order) {
                    this.orders.set(orderId, { ...order, status });
                    this.renderOrders();
                    this.updateStats();
                }
            } else {
                alert('Failed to update order: ' + result.error);
            }
        } catch (error) {
            alert('Error updating order');
        }
    }

    updateStats() {
        const orders = Array.from(this.orders.values());
        const total = orders.length;
        const received = orders.filter(o => o.status === 'received').length;
        const preparing = orders.filter(o => o.status === 'preparing').length;
        const ready = orders.filter(o => o.status === 'ready').length;
        const completed = orders.filter(o => o.status === 'completed').length;

        document.getElementById('total-orders').textContent = total;
        document.getElementById('pending-orders').textContent = received;
        document.getElementById('preparing-orders').textContent = preparing;
        document.getElementById('ready-orders').textContent = ready;
    }

    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('ws-status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `status-${type}`;
        }
    }

    playNotification(type) {
        const soundEnabled = document.getElementById('toggle-sound')?.dataset.sound !== 'off';
        if (!soundEnabled) return;

        const audioMap = {
            'new-order': '/sounds/new-order.mp3',
            'order-updated': '/sounds/update.mp3'
        };

        const audioFile = audioMap[type];
        if (audioFile) {
            const audio = new Audio(audioFile);
            audio.play().catch(() => {});
        }
    }

    setupEventListeners() {
        // Filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.filterStatus = e.target.dataset.filter;
                this.renderOrders();
            }
        });

        // Search
        const searchInput = document.getElementById('search-orders');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.renderOrders();
            });
        }

        // Sound toggle
        const soundBtn = document.getElementById('toggle-sound');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                const isOff = soundBtn.dataset.sound === 'off';
                soundBtn.dataset.sound = isOff ? 'on' : 'off';
                soundBtn.textContent = isOff ? '🔊 Sound On' : '🔇 Sound Off';
            });
        }

        // Auto-refresh every 30 seconds
        setInterval(() => {
            if (this.socket && this.socket.connected) {
                this.socket.emit('join-kitchen');
            }
        }, 30000);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.kitchenDashboard = new KitchenDashboard();
});

export default KitchenDashboard;