const RecommendationEngine = require('../services/recommendationEngine');
const Interaction = require('../models/Interaction');
const Dish = require('../models/Dish');

/**
 * Get personalized recommendations for logged-in user
 */
exports.getPersonalizedRecommendations = async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        const userId = req.user.id;
        
        const recommendations = await RecommendationEngine.getPersonalizedRecommendations(userId, parseInt(limit));
        
        res.status(200).json({
            success: true,
            count: recommendations.length,
            data: recommendations,
            type: 'personalized'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get trending dishes
 */
exports.getTrendingDishes = async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        
        const trending = await RecommendationEngine.getTrendingDishes(parseInt(limit));
        
        res.status(200).json({
            success: true,
            count: trending.length,
            data: trending,
            type: 'trending'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get similar dishes for a specific dish
 */
exports.getSimilarDishes = async (req, res) => {
    try {
        const { dishId } = req.params;
        const { limit = 4 } = req.query;
        
        const similar = await RecommendationEngine.getSimilarDishes(dishId, parseInt(limit));
        
        res.status(200).json({
            success: true,
            count: similar.length,
            data: similar,
            type: 'similar'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Track user interaction (click, view, favorite, etc.)
 */
exports.trackInteraction = async (req, res) => {
    try {
        const { dishId, action, metadata } = req.body;
        const userId = req.user.id;
        
        // Validate action
        const validActions = ['view', 'click', 'favorite', 'order', 'search', 'rating'];
        if (!validActions.includes(action)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid action type'
            });
        }
        
        const interaction = await RecommendationEngine.trackInteraction(
            userId,
            dishId,
            action,
            metadata || {}
        );
        
        res.status(201).json({
            success: true,
            data: interaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Rate a dish (1-5 stars)
 */
exports.rateDish = async (req, res) => {
    try {
        const { dishId, rating } = req.body;
        const userId = req.user.id;
        
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: 'Rating must be between 1 and 5'
            });
        }
        
        const interaction = await RecommendationEngine.trackInteraction(
            userId,
            dishId,
            'rating',
            { rating }
        );
        
        // Update dish rating
        await Dish.findByIdAndUpdate(dishId, {
            $push: { ratings: rating }
        });
        
        res.status(201).json({
            success: true,
            data: interaction,
            message: 'Rating submitted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get user's interaction history
 */
exports.getUserHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 10 } = req.query;
        
        const history = await RecommendationEngine.getUserHistory(userId, parseInt(limit));
        
        res.status(200).json({
            success: true,
            count: history.length,
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
 * Get admin analytics
 */
exports.getAnalytics = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        // Total interactions
        const totalInteractions = await Interaction.countDocuments({
            timestamp: { $gte: sevenDaysAgo }
        });
        
        // Interactions by action
        const actionStats = await Interaction.aggregate([
            {
                $match: {
                    timestamp: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Most liked dishes
        const topDishes = await Interaction.aggregate([
            {
                $match: {
                    timestamp: { $gte: sevenDaysAgo },
                    action: 'favorite'
                }
            },
            {
                $group: {
                    _id: '$dishId',
                    favorites: { $sum: 1 }
                }
            },
            {
                $sort: { favorites: -1 }
            },
            {
                $limit: 5
            }
        ]);
        
        // Get dish details for top dishes
        const dishIds = topDishes.map(d => d._id);
        const dishes = await Dish.find({ _id: { $in: dishIds } });
        
        const topDishesWithDetails = topDishes.map(td => ({
            ...td,
            dish: dishes.find(d => d._id.toString() === td._id.toString())
        }));
        
        res.status(200).json({
            success: true,
            data: {
                totalInteractions,
                actionStats,
                topDishes: topDishesWithDetails,
                period: '7 days'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};