const PricingEngine = require('../services/pricingEngine');
const DemandForecaster = require('../services/demandForecaster');
const PriceHistory = require('../models/PriceHistory');

/**
 * Get current price for a dish
 */
exports.getCurrentPrice = async (req, res) => {
    try {
        const { dishId } = req.params;
        
        const price = await PricingEngine.getCurrentPrice(dishId);
        
        if (!price) {
            return res.status(404).json({
                success: false,
                error: 'Dish not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                dishId,
                price,
                timestamp: new Date()
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
 * Get detailed price information with factors
 */
exports.getPriceDetails = async (req, res) => {
    try {
        const { dishId } = req.params;
        const Dish = require('../models/Dish');
        
        const dish = await Dish.findById(dishId);
        if (!dish) {
            return res.status(404).json({
                success: false,
                error: 'Dish not found'
            });
        }

        const result = await PricingEngine.calculatePrice(dish);
        
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get price history for a dish
 */
exports.getPriceHistory = async (req, res) => {
    try {
        const { dishId } = req.params;
        const { days = 7 } = req.query;
        
        const history = await PricingEngine.getPriceHistory(dishId, parseInt(days));
        
        res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get demand forecast for a dish
 */
exports.getDemandForecast = async (req, res) => {
    try {
        const { dishId } = req.params;
        const { days = 7 } = req.query;
        
        const forecast = await DemandForecaster.forecastDemand(dishId, parseInt(days));
        
        res.status(200).json({
            success: true,
            data: forecast
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get pricing recommendations
 */
exports.getPricingRecommendations = async (req, res) => {
    try {
        const { dishId } = req.params;
        const Dish = require('../models/Dish');
        
        const dish = await Dish.findById(dishId);
        if (!dish) {
            return res.status(404).json({
                success: false,
                error: 'Dish not found'
            });
        }

        const recommendations = await DemandForecaster.getPricingRecommendations(
            dishId,
            dish.basePrice || dish.price
        );
        
        res.status(200).json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get pricing analytics
 */
exports.getPricingAnalytics = async (req, res) => {
    try {
        const { dishId } = req.params;
        
        const analytics = await PricingEngine.getPricingAnalytics(dishId);
        
        if (!analytics) {
            return res.status(404).json({
                success: false,
                error: 'No pricing data found for this dish'
            });
        }

        res.status(200).json({
            success: true,
            data: analytics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Batch update all prices (admin only)
 */
exports.batchUpdatePrices = async (req, res) => {
    try {
        // In production, this should be admin-only
        const results = await PricingEngine.batchUpdatePrices();
        
        res.status(200).json({
            success: true,
            message: `Updated ${results.length} prices`,
            data: results,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get overall pricing summary
 */
exports.getPricingSummary = async (req, res) => {
    try {
        const Dish = require('../models/Dish');
        const dishes = await Dish.find({ isActive: true });
        
        const summaries = [];
        for (const dish of dishes) {
            const price = await PricingEngine.getCurrentPrice(dish._id);
            if (price) {
                summaries.push({
                    dishId: dish._id,
                    name: dish.name,
                    basePrice: dish.basePrice || dish.price,
                    currentPrice: price,
                    discount: (dish.basePrice || dish.price) - price
                });
            }
        }
        
        const totalBase = summaries.reduce((sum, s) => sum + s.basePrice, 0);
        const totalCurrent = summaries.reduce((sum, s) => sum + s.currentPrice, 0);
        const totalDiscount = totalBase - totalCurrent;
        const avgDiscountPercent = totalBase > 0 ? (totalDiscount / totalBase * 100) : 0;
        
        res.status(200).json({
            success: true,
            data: {
                totalDishes: summaries.length,
                totalBasePrice: totalBase,
                totalCurrentPrice: totalCurrent,
                totalDiscount: totalDiscount,
                averageDiscountPercent: avgDiscountPercent.toFixed(1),
                dishes: summaries
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};