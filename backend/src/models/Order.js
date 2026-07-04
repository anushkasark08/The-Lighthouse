const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table'
    },
    items: [{
        dishId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dish',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        specialInstructions: {
            type: String,
            maxlength: 200
        },
        status: {
            type: String,
            enum: ['pending', 'preparing', 'ready', 'served'],
            default: 'pending'
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['received', 'preparing', 'ready', 'completed', 'cancelled'],
        default: 'received'
    },
    statusHistory: [{
        status: {
            type: String,
            enum: ['received', 'preparing', 'ready', 'completed', 'cancelled']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: {
            type: String,
            maxlength: 200
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    orderType: {
        type: String,
        enum: ['dine-in', 'takeaway', 'delivery'],
        default: 'dine-in'
    },
    estimatedTime: {
        type: Number, // in minutes
        default: 30
    },
    specialRequests: {
        type: String,
        maxlength: 500
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'online', 'upi'],
        default: 'cash'
    },
    notifiedAt: {
        received: { type: Date },
        preparing: { type: Date },
        ready: { type: Date },
        completed: { type: Date }
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
    if (this.isNew) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `ORD-${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

// Virtual for estimated remaining time
orderSchema.virtual('estimatedRemainingTime').get(function() {
    if (this.status === 'completed' || this.status === 'cancelled') return 0;
    
    const startTime = this.createdAt;
    const elapsed = (Date.now() - startTime) / (1000 * 60); // in minutes
    const estimated = this.estimatedTime || 30;
    const remaining = Math.max(0, estimated - elapsed);
    return Math.round(remaining);
});

// Method to update status with history
orderSchema.methods.updateStatus = async function(newStatus, note = '', userId = null) {
    const validStatuses = ['received', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
        throw new Error('Invalid status');
    }
    
    this.status = newStatus;
    this.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        note: note,
        updatedBy: userId
    });
    
    // Update notification timestamps
    if (this.notifiedAt) {
        this.notifiedAt[newStatus] = new Date();
    }
    
    if (newStatus === 'completed') {
        this.completedAt = new Date();
    }
    
    await this.save();
    return this;
};

// Indexes for faster queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ tableId: 1, status: 1 });

// Ensure virtuals are included
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);