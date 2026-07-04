const socketIO = require('socket.io');
const Redis = require('ioredis');
const Order = require('../models/Order');
const User = require('../models/User');

class WebSocketServer {
    constructor(server) {
        this.io = socketIO(server, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:5500',
                methods: ['GET', 'POST'],
                credentials: true
            },
            pingTimeout: 60000,
            pingInterval: 25000
        });

        // Redis for pub/sub (for scaling)
        this.redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || undefined
        });

        // Store active connections
        this.activeConnections = new Map();
        this.orderRooms = new Map();

        this.setupMiddleware();
        this.setupEventListeners();
        this.setupRedisSubscriber();

        console.log('✅ WebSocket Server initialized');
    }

    setupMiddleware() {
        // Authentication middleware
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication required'));
                }

                // Verify token and get user
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id).select('-password');
                
                if (!user) {
                    return next(new Error('User not found'));
                }

                socket.userId = user._id;
                socket.userRole = user.role;
                socket.user = user;
                next();
            } catch (error) {
                next(new Error('Invalid token'));
            }
        });
    }

    setupEventListeners() {
        this.io.on('connection', (socket) => {
            console.log(`🔌 Client connected: ${socket.id} (User: ${socket.userId})`);

            // Store connection
            this.activeConnections.set(socket.id, {
                userId: socket.userId,
                role: socket.userRole,
                socketId: socket.id,
                connectedAt: new Date()
            });

            // Join user's personal room
            socket.join(`user-${socket.userId}`);

            // Track order
            socket.on('track-order', async (data) => {
                await this.handleTrackOrder(socket, data);
            });

            // Update order status (staff only)
            socket.on('update-order-status', async (data) => {
                await this.handleUpdateOrderStatus(socket, data);
            });

            // Join kitchen dashboard
            socket.on('join-kitchen', async () => {
                await this.handleJoinKitchen(socket);
            });

            // Get order history
            socket.on('get-order-history', async (data) => {
                await this.handleOrderHistory(socket, data);
            });

            // Disconnect
            socket.on('disconnect', () => {
                console.log(`🔌 Client disconnected: ${socket.id}`);
                this.activeConnections.delete(socket.id);
                
                // Leave kitchen room if was in it
                socket.leave('kitchen-dashboard');
            });

            // Error handling
            socket.on('error', (error) => {
                console.error('Socket error:', error);
            });
        });
    }

    async handleTrackOrder(socket, data) {
        const { orderId } = data;
        
        if (!orderId) {
            socket.emit('error', { message: 'Order ID required' });
            return;
        }

        try {
            // Verify order belongs to user or user is staff
            const order = await Order.findById(orderId);
            if (!order) {
                socket.emit('error', { message: 'Order not found' });
                return;
            }

            const isAuthorized = 
                order.userId.toString() === socket.userId.toString() ||
                socket.userRole === 'staff' ||
                socket.userRole === 'admin';

            if (!isAuthorized) {
                socket.emit('error', { message: 'Not authorized to track this order' });
                return;
            }

            // Join order room
            socket.join(`order-${orderId}`);
            this.orderRooms.set(orderId, socket.id);

            // Send initial order status
            socket.emit('order-status', {
                orderId: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                statusHistory: order.statusHistory,
                items: order.items,
                totalAmount: order.totalAmount,
                estimatedTime: order.estimatedTime,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            });

            console.log(`📦 User ${socket.userId} tracking order ${orderId}`);
        } catch (error) {
            console.error('Error tracking order:', error);
            socket.emit('error', { message: 'Failed to track order' });
        }
    }

    async handleUpdateOrderStatus(socket, data) {
        const { orderId, status, note } = data;

        // Verify staff/admin
        if (socket.userRole !== 'staff' && socket.userRole !== 'admin') {
            socket.emit('error', { message: 'Unauthorized: Staff only' });
            return;
        }

        if (!orderId || !status) {
            socket.emit('error', { message: 'Order ID and status required' });
            return;
        }

        try {
            const order = await Order.findById(orderId);
            if (!order) {
                socket.emit('error', { message: 'Order not found' });
                return;
            }

            // Update order status
            await order.updateStatus(status, note || '', socket.userId);

            // Get updated order
            const updatedOrder = await Order.findById(orderId);

            // Broadcast to customer
            this.io.to(`order-${orderId}`).emit('status-update', {
                orderId: order._id,
                orderNumber: order.orderNumber,
                status: updatedOrder.status,
                statusHistory: updatedOrder.statusHistory,
                timestamp: new Date(),
                note: note || '',
                estimatedTime: updatedOrder.estimatedRemainingTime
            });

            // Broadcast to kitchen dashboard
            this.io.to('kitchen-dashboard').emit('order-updated', {
                orderId: order._id,
                orderNumber: order.orderNumber,
                status: updatedOrder.status,
                tableId: order.tableId,
                items: order.items,
                timestamp: new Date()
            });

            // Send push notification to customer
            await this.sendPushNotification(order.userId, {
                title: 'Order Update',
                body: `Your order #${order.orderNumber} is now ${status}`,
                data: { orderId: order._id }
            });

            console.log(`📦 Order ${orderId} status updated to ${status}`);
        } catch (error) {
            console.error('Error updating order status:', error);
            socket.emit('error', { message: 'Failed to update order status' });
        }
    }

    async handleJoinKitchen(socket) {
        // Verify staff/admin
        if (socket.userRole !== 'staff' && socket.userRole !== 'admin') {
            socket.emit('error', { message: 'Unauthorized: Staff only' });
            return;
        }

        socket.join('kitchen-dashboard');
        console.log(`👨‍🍳 Staff ${socket.userId} joined kitchen dashboard`);

        // Send active orders
        try {
            const activeOrders = await Order.find({
                status: { $in: ['received', 'preparing'] }
            }).sort({ createdAt: 1 });

            socket.emit('kitchen-orders', {
                orders: activeOrders,
                count: activeOrders.length
            });
        } catch (error) {
            console.error('Error loading kitchen orders:', error);
        }
    }

    async handleOrderHistory(socket, data) {
        const { limit = 10 } = data;

        try {
            const orders = await Order.find({ userId: socket.userId })
                .sort({ createdAt: -1 })
                .limit(parseInt(limit));

            socket.emit('order-history', {
                orders: orders,
                count: orders.length
            });
        } catch (error) {
            console.error('Error loading order history:', error);
            socket.emit('error', { message: 'Failed to load order history' });
        }
    }

    async sendPushNotification(userId, notification) {
        // Store notification in database for later retrieval
        // In production, integrate with FCM/APNS
        try {
            // Get user's device tokens from database
            const user = await User.findById(userId);
            if (user && user.deviceTokens && user.deviceTokens.length > 0) {
                // Send to FCM/APNS (implement as needed)
                console.log(`📱 Notification sent to user ${userId}:`, notification);
            }
        } catch (error) {
            console.error('Error sending push notification:', error);
        }
    }

    setupRedisSubscriber() {
        // Subscribe to Redis channels for cross-server communication
        const subscriber = this.redis.duplicate();
        
        subscriber.subscribe('order-updates', 'kitchen-updates');
        
        subscriber.on('message', (channel, message) => {
            try {
                const data = JSON.parse(message);
                
                if (channel === 'order-updates') {
                    this.io.to(`order-${data.orderId}`).emit('status-update', data);
                } else if (channel === 'kitchen-updates') {
                    this.io.to('kitchen-dashboard').emit('order-updated', data);
                }
            } catch (error) {
                console.error('Error processing Redis message:', error);
            }
        });
    }

    // Broadcast order update across all servers
    broadcastOrderUpdate(orderId, data) {
        // Publish to Redis
        this.redis.publish('order-updates', JSON.stringify({
            orderId,
            ...data,
            timestamp: new Date()
        }));
    }

    // Get active connections count
    getActiveConnections() {
        return this.activeConnections.size;
    }

    // Disconnect a specific client
    disconnectClient(socketId) {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
            socket.disconnect(true);
            this.activeConnections.delete(socketId);
        }
    }
}

module.exports = WebSocketServer;