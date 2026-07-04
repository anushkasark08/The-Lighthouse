const Interaction = require('../models/Interaction');
const Dish = require('../models/Dish');
const mongoose = require('mongoose');

class RecommendationEngine {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get personalized recommendations for a user
     */
    async getPersonalizedRecommendations(userId, limit = 6) {
        const cacheKey = `personal_${userId}`;
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            // Get user's interaction history
            const userHistory = await Interaction.find({ userId })
                .sort({ timestamp: -1 })
                .limit(50);
            
            if (userHistory.length === 0) {
                // No history - return trending dishes
                return await this.getTrendingDishes(limit);
            }

            // Get dish IDs user has interacted with
            const interactedDishIds = [...new Set(userHistory.map(i => i.dishId.toString()))];
            
            // Find similar users (collaborative filtering)
            const similarUsers = await this.findSimilarUsers(userId, interactedDishIds);
            
            if (similarUsers.length === 0) {
                // No similar users - fallback to content-based
                return await this.getContentBasedRecommendations(userId, limit);
            }

            // Get recommendations from similar users
            const recommendations = await this.getRecommendationsFromSimilarUsers(
                similarUsers,
                interactedDishIds,
                limit
            );

            // Cache results
            this.cache.set(cacheKey, {
                data: recommendations,
                timestamp: Date.now()
            });

            return recommendations;
        } catch (error) {
            console.error('Error getting recommendations:', error);
            return await this.getTrendingDishes(limit);
        }
    }

    /**
     * Find similar users using collaborative filtering
     */
    async findSimilarUsers(userId, interactedDishIds, limit = 5) {
        // Get all users who interacted with similar dishes
        const similarUsers = await Interaction.aggregate([
            {
                $match: {
                    dishId: { $in: interactedDishIds.map(id => new mongoose.Types.ObjectId(id)) },
                    userId: { $ne: new mongoose.Types.ObjectId(userId) }
                }
            },
            {
                $group: {
                    _id: '$userId',
                    commonInteractions: { $sum: 1 },
                    interactions: { $push: { dishId: '$dishId', action: '$action', weight: '$weight' } }
                }
            },
            {
                $sort: { commonInteractions: -1 }
            },
            {
                $limit: limit
            }
        ]);

        return similarUsers;
    }

    /**
     * Get recommendations from similar users
     */
    async getRecommendationsFromSimilarUsers(similarUsers, excludedDishIds, limit) {
        const dishScores = new Map();

        similarUsers.forEach(user => {
            user.interactions.forEach(interaction => {
                const dishId = interaction.dishId.toString();
                
                // Skip dishes user already interacted with
                if (excludedDishIds.includes(dishId)) return;
                
                const score = interaction.weight || 1.0;
                const currentScore = dishScores.get(dishId) || 0;
                dishScores.set(dishId, currentScore + score);
            });
        });

        // Sort by score and get top dishes
        const sortedDishes = Array.from(dishScores.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([dishId]) => dishId);

        // Fetch dish details
        const dishes = await Dish.find({
            _id: { $in: sortedDishes },
            isActive: true
        });

        // Preserve order
        const orderedDishes = sortedDishes
            .map(id => dishes.find(d => d._id.toString() === id))
            .filter(d => d);

        return orderedDishes;
    }

    /**
     * Get content-based recommendations
     */
    async getContentBasedRecommendations(userId, limit) {
        // Get user's favorite categories
        const userInteractions = await Interaction.find({ userId })
            .populate('dishId')
            .limit(20);

        if (userInteractions.length === 0) {
            return await this.getTrendingDishes(limit);
        }

        // Analyze user preferences
        const categoryScores = {};
        const priceRange = { min: Infinity, max: -Infinity };
        
        userInteractions.forEach(interaction => {
            const dish = interaction.dishId;
            if (!dish) return;
            
            // Track categories
            if (dish.category) {
                categoryScores[dish.category] = (categoryScores[dish.category] || 0) + interaction.weight;
            }
            
            // Track price range
            if (dish.price) {
                priceRange.min = Math.min(priceRange.min, dish.price);
                priceRange.max = Math.max(priceRange.max, dish.price);
            }
        });

        // Get top categories
        const topCategories = Object.entries(categoryScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([category]) => category);

        // Find dishes in top categories
        const recommendations = await Dish.find({
            category: { $in: topCategories },
            isActive: true,
            price: { $gte: priceRange.min * 0.8, $lte: priceRange.max * 1.2 }
        })
        .limit(limit);

        return recommendations;
    }

    /**
     * Get trending dishes
     */
    async getTrendingDishes(limit = 6) {
        const cacheKey = 'trending';
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 15 * 60 * 1000) { // 15 minutes
                return cached.data;
            }
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trending = await Interaction.aggregate([
            {
                $match: {
                    timestamp: { $gte: sevenDaysAgo },
                    action: { $in: ['click', 'favorite', 'order'] }
                }
            },
            {
                $group: {
                    _id: '$dishId',
                    score: { 
                        $sum: { 
                            $cond: [
                                { $eq: ['$action', 'order'] }, 2,
                                { $eq: ['$action', 'favorite'] }, 1.5,
                                1
                            ]
                        }
                    }
                }
            },
            {
                $sort: { score: -1 }
            },
            {
                $limit: limit
            }
        ]);

        const dishIds = trending.map(t => t._id);
        const dishes = await Dish.find({
            _id: { $in: dishIds },
            isActive: true
        });

        // Preserve order
        const orderedDishes = dishIds
            .map(id => dishes.find(d => d._id.toString() === id.toString()))
            .filter(d => d);

        this.cache.set(cacheKey, {
            data: orderedDishes,
            timestamp: Date.now()
        });

        return orderedDishes;
    }

    /**
     * Track user interaction
     */
    async trackInteraction(userId, dishId, action, metadata = {}) {
        try {
            const interaction = new Interaction({
                userId,
                dishId,
                action,
                metadata,
                weight: Interaction.getActionWeight(action)
            });
            
            await interaction.save();
            
            // Clear cache for this user
            this.cache.delete(`personal_${userId}`);
            
            return interaction;
        } catch (error) {
            console.error('Error tracking interaction:', error);
            throw error;
        }
    }

    /**
     * Get similar dishes
     */
    async getSimilarDishes(dishId, limit = 4) {
        const dish = await Dish.findById(dishId);
        if (!dish) return [];

        // Find dishes with similar tags/category
        const similar = await Dish.find({
            _id: { $ne: dishId },
            isActive: true,
            $or: [
                { category: dish.category },
                { tags: { $in: dish.tags || [] } }
            ]
        })
        .limit(limit);

        return similar;
    }

    /**
     * Get user's recent interactions
     */
    async getUserHistory(userId, limit = 10) {
        const interactions = await Interaction.find({ userId })
            .populate('dishId')
            .sort({ timestamp: -1 })
            .limit(limit);

        return interactions;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
}

module.exports = new RecommendationEngine();