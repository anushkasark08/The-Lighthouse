const PriceHistory = require('../models/PriceHistory');
const DemandForecaster = require('./demandForecaster');

class PricingEngine {
    constructor() {
        this.updateInterval = 30 * 60 * 1000; // 30 minutes
        this.lastUpdate = null;
        this.priceCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Calculate optimal price for a dish
     */
    async calculatePrice(dish) {
        const cacheKey = `${dish._id}_${Date.now()}`;
        
        // Check cache
        if (this.priceCache.has(dish._id)) {
            const cached = this.priceCache.get(dish._id);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.price;
            }
        }

        // Get demand factor
        const demandFactor = await DemandForecaster.calculateDemandFactor(dish._id);
        
        // Get time factor
        const timeFactor = DemandForecaster.getTimeFactor();
        
        // Get inventory factor (if inventory management is implemented)
        const inventoryFactor = await this.getInventoryFactor(dish);
        
        // Get elasticity
        const elasticity = await DemandForecaster.analyzePriceElasticity(dish._id);
        
        // Calculate base adjustments
        let priceMultiplier = 1.0;
        let adjustments = [];
        
        // 1. Demand adjustment
        if (demandFactor > 1.2) {
            const increase = Math.min(0.20, (demandFactor - 1) * 0.4);
            priceMultiplier += increase;
            adjustments.push({
                factor: 'demand',
                value: demandFactor,
                adjustment: increase,
                reason: `High demand (${demandFactor.toFixed(2)})`
            });
        } else if (demandFactor < 0.8) {
            const decrease = Math.min(0.20, (1 - demandFactor) * 0.3);
            priceMultiplier -= decrease;
            adjustments.push({
                factor: 'demand',
                value: demandFactor,
                adjustment: -decrease,
                reason: `Low demand (${demandFactor.toFixed(2)})`
            });
        }

        // 2. Time adjustment
        if (timeFactor > 1.1) {
            const increase = (timeFactor - 1) * 0.6;
            priceMultiplier += increase;
            adjustments.push({
                factor: 'time',
                value: timeFactor,
                adjustment: increase,
                reason: 'Peak hours'
            });
        } else if (timeFactor < 0.9) {
            const decrease = (1 - timeFactor) * 0.5;
            priceMultiplier -= decrease;
            adjustments.push({
                factor: 'time',
                value: timeFactor,
                adjustment: -decrease,
                reason: 'Off-peak hours'
            });
        }

        // 3. Inventory adjustment
        if (inventoryFactor) {
            if (inventoryFactor > 1.5) {
                const increase = 0.10;
                priceMultiplier += increase;
                adjustments.push({
                    factor: 'inventory',
                    value: inventoryFactor,
                    adjustment: increase,
                    reason: 'Low inventory'
                });
            } else if (inventoryFactor < 0.7) {
                const decrease = 0.15;
                priceMultiplier -= decrease;
                adjustments.push({
                    factor: 'inventory',
                    value: inventoryFactor,
                    adjustment: -decrease,
                    reason: 'High inventory - clearance'
                });
            }
        }

        // 4. Elasticity adjustment
        if (Math.abs(elasticity.elasticity) > 0.5) {
            if (elasticity.elasticity > 0) {
                const decrease = 0.05;
                priceMultiplier -= decrease;
                adjustments.push({
                    factor: 'elasticity',
                    value: elasticity.elasticity,
                    adjustment: -decrease,
                    reason: 'Elastic demand'
                });
            } else {
                const increase = 0.05;
                priceMultiplier += increase;
                adjustments.push({
                    factor: 'elasticity',
                    value: elasticity.elasticity,
                    adjustment: increase,
                    reason: 'Inelastic demand'
                });
            }
        }

        // Calculate final price
        const basePrice = dish.basePrice || dish.price;
        let finalPrice = basePrice * priceMultiplier;
        
        // Round to nearest rupee
        finalPrice = Math.round(finalPrice);
        
        // Ensure price doesn't go below minimum
        const minPrice = basePrice * 0.7;
        const maxPrice = basePrice * 1.5;
        finalPrice = Math.max(minPrice, Math.min(maxPrice, finalPrice));

        // Save price history
        await this.savePriceHistory(dish, finalPrice, priceMultiplier, adjustments);

        // Cache result
        this.priceCache.set(dish._id, {
            price: finalPrice,
            timestamp: Date.now()
        });

        return {
            dishId: dish._id,
            dishName: dish.name,
            basePrice: basePrice,
            finalPrice: finalPrice,
            discount: basePrice - finalPrice,
            discountPercent: ((basePrice - finalPrice) / basePrice * 100).toFixed(1),
            priceMultiplier,
            adjustments,
            demandFactor,
            timeFactor,
            inventoryFactor,
            elasticity: elasticity.elasticity,
            timestamp: new Date()
        };
    }

    /**
     * Get inventory factor (simplified)
     */
    async getInventoryFactor(dish) {
        // In a real implementation, this would check actual inventory levels
        // For now, return a default factor
        if (!dish.inventory) return null;
        
        const stock = dish.inventory || 100;
        const capacity = dish.inventoryCapacity || 200;
        
        if (capacity === 0) return 1.0;
        
        const inventoryRatio = stock / capacity;
        
        // Inventory factor: lower ratio = lower factor (discount)
        if (inventoryRatio < 0.3) return 0.7;
        if (inventoryRatio < 0.6) return 1.0;
        if (inventoryRatio < 0.8) return 1.2;
        return 1.5;
    }

    /**
     * Save price history
     */
    async savePriceHistory(dish, finalPrice, priceMultiplier, adjustments) {
        try {
            const history = new PriceHistory({
                dishId: dish._id,
                dishName: dish.name,
                basePrice: dish.basePrice || dish.price,
                currentPrice: finalPrice,
                discountApplied: (dish.basePrice || dish.price) - finalPrice,
                demandFactor: adjustments.find(a => a.factor === 'demand')?.value || 1.0,
                timeFactor: adjustments.find(a => a.factor === 'time')?.value || 1.0,
                inventoryFactor: adjustments.find(a => a.factor === 'inventory')?.value || 1.0,
                peakHours: adjustments.some(a => a.factor === 'time' && a.reason === 'Peak hours'),
                season: 'normal', // Could be dynamically determined
                ordersCount: 0, // Would come from order tracking
                revenueGenerated: 0
            });
            
            await history.save();
        } catch (error) {
            console.error('Error saving price history:', error);
        }
    }

    /**
     * Get current price for a dish (public facing)
     */
    async getCurrentPrice(dishId) {
        if (this.priceCache.has(dishId)) {
            const cached = this.priceCache.get(dishId);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.price;
            }
        }
        
        // If not in cache, calculate
        const Dish = require('../models/Dish');
        const dish = await Dish.findById(dishId);
        if (!dish) return null;
        
        const result = await this.calculatePrice(dish);
        return result.finalPrice;
    }

    /**
     * Get price history for a dish
     */
    async getPriceHistory(dishId, days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const history = await PriceHistory.find({
            dishId: dishId,
            timestamp: { $gte: cutoffDate }
        }).sort({ timestamp: -1 });
        
        return history.map(h => ({
            price: h.currentPrice,
            basePrice: h.basePrice,
            discount: h.discountApplied,
            demandFactor: h.demandFactor,
            timestamp: h.timestamp
        }));
    }

    /**
     * Batch update all dish prices
     */
    async batchUpdatePrices() {
        const Dish = require('../models/Dish');
        const dishes = await Dish.find({ isActive: true });
        
        const results = [];
        for (const dish of dishes) {
            try {
                const result = await this.calculatePrice(dish);
                results.push(result);
            } catch (error) {
                console.error(`Error updating price for dish ${dish._id}:`, error);
            }
        }
        
        this.lastUpdate = new Date();
        return results;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.priceCache.clear();
    }

    /**
     * Get pricing analytics
     */
    async getPricingAnalytics(dishId) {
        const history = await PriceHistory.find({ dishId })
            .sort({ timestamp: -1 })
            .limit(30);
        
        if (history.length === 0) {
            return null;
        }

        const prices = history.map(h => h.currentPrice);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        const currentPrice = history[0].currentPrice;
        
        const discounts = history.map(h => h.discountApplied);
        const avgDiscount = discounts.reduce((a, b) => a + b, 0) / discounts.length;
        
        return {
            dishId,
            currentPrice,
            averagePrice: avgPrice,
            maxPrice,
            minPrice,
            avgDiscount,
            priceVariation: ((maxPrice - minPrice) / avgPrice * 100).toFixed(1),
            dataPoints: history.length,
            lastUpdated: history[0].timestamp
        };
    }
}

module.exports = new PricingEngine();