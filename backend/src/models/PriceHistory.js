const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
    dishId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish',
        required: true
    },
    dishName: {
        type: String,
        required: true
    },
    basePrice: {
        type: Number,
        required: true
    },
    currentPrice: {
        type: Number,
        required: true
    },
    discountApplied: {
        type: Number,
        default: 0
    },
    demandFactor: {
        type: Number,
        default: 1.0
    },
    timeFactor: {
        type: Number,
        default: 1.0
    },
    inventoryFactor: {
        type: Number,
        default: 1.0
    },
    peakHours: {
        type: Boolean,
        default: false
    },
    season: {
        type: String,
        enum: ['normal', 'holiday', 'weekend', 'special'],
        default: 'normal'
    },
    ordersCount: {
        type: Number,
        default: 0
    },
    revenueGenerated: {
        type: Number,
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
priceHistorySchema.index({ dishId: 1, timestamp: -1 });
priceHistorySchema.index({ timestamp: -1 });

module.exports = mongoose.model('PriceHistory', priceHistorySchema);