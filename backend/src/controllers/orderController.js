const Order = require('../models/Order');
const Dish = require('../models/Dish');

/**
 * Create a new order
 */
exports.createOrder = async (req, res) => {
    try {
        const { items, tableId, orderType, specialRequests, paymentMethod } = req.body;
        const userId = req.user.id;

        // Validate items
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Order must have at least one item'
            });
        }

        // Calculate total and validate items
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const dish = await Dish.findById(item.dishId);
            if (!dish) {
                return res.status(404).json({
                    success: false,
                    error: `Dish ${item.dishId} not found`
                });
            }

            const price = dish.price || dish.basePrice || 0;
            totalAmount += price * item.quantity;

            orderItems.push({
                dishId: dish._id,
                name: dish.name,
                quantity: item.quantity,
                price: price,
                specialInstructions: item.specialInstructions || ''
            });
        }

        // Create order
        const order = new Order({
            userId,
            tableId: tableId || null,
            items: orderItems,
            totalAmount,
            orderType: orderType || 'dine-in',
            specialRequests: specialRequests || '',
            paymentMethod: paymentMethod || 'cash',
            paymentStatus: 'pending'
        });

        await order.save();

        // Notify kitchen via WebSocket
        const webSocketServer = req.app.get('webSocketServer');
        if (webSocketServer) {
            webSocketServer.io.to('kitchen-dashboard').emit('new-order', {
                orderId: order._id,
                orderNumber: order.orderNumber,
                items: order.items,
                tableId: order.tableId,
                timestamp: new Date()
            });
        }

        res.status(201).json({
            success: true,
            data: order,
            message: `Order #${order.orderNumber} created successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get order by ID
 */
exports.getOrder = async (req, res) => {
    try {
        const { id } = req.params;
        
        const order = await Order.findById(id)
            .populate('userId', 'name email phone')
            .populate('tableId', 'tableNumber section');

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Check authorization
        const isAuthorized = 
            order.userId._id.toString() === req.user.id ||
            req.user.role === 'staff' ||
            req.user.role === 'admin';

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this order'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get user's orders
 */
exports.getUserOrders = async (req, res) => {
    try {
        const { limit = 20, page = 1 } = req.query;
        const userId = req.user.id;

        const skip = (page - 1) * limit;

        const orders = await Order.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('tableId', 'tableNumber section');

        const total = await Order.countDocuments({ userId });

        res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get all orders (admin/staff)
 */
exports.getAllOrders = async (req, res) => {
    try {
        const { status, limit = 50, page = 1 } = req.query;

        const filter = {};
        if (status && status !== 'all') {
            filter.status = status;
        }

        const skip = (page - 1) * limit;

        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'name email')
            .populate('tableId', 'tableNumber section');

        const total = await Order.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Update order status
 */
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        await order.updateStatus(status, note || '', req.user.id);

        // Notify via WebSocket
        const webSocketServer = req.app.get('webSocketServer');
        if (webSocketServer) {
            webSocketServer.io.to(`order-${order._id}`).emit('status-update', {
                orderId: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                statusHistory: order.statusHistory,
                timestamp: new Date(),
                note: note || '',
                estimatedTime: order.estimatedRemainingTime
            });

            webSocketServer.io.to('kitchen-dashboard').emit('order-updated', {
                orderId: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                timestamp: new Date()
            });
        }

        res.status(200).json({
            success: true,
            data: order,
            message: `Order status updated to ${status}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Cancel order
 */
exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Check if order can be cancelled
        if (order.status === 'completed') {
            return res.status(400).json({
                success: false,
                error: 'Cannot cancel completed order'
            });
        }

        await order.updateStatus('cancelled', reason || 'Cancelled by user', req.user.id);

        res.status(200).json({
            success: true,
            data: order,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};