const PriceHistory = require('../models/PriceHistory');

class DemandForecaster {
    constructor() {
        this.historyDays = 30;
        this.peakHours = {
            lunch: { start: 12, end: 14 },
            dinner: { start: 19, end: 21 }
        };
        this.seasonalMultipliers = {
            weekend: 1.3,
            holiday: 1.5,
            normal: 1.0
        };
    }

    /**
     * Calculate demand factor for a dish
     */
    async calculateDemandFactor(dishId) {
        const history = await this.getDishHistory(dishId);
        
        if (history.length === 0) {
            return 1.0; // Default demand
        }

        // Calculate recent demand (last 7 days)
        const recentOrders = history.slice(0, 7);
        const avgOrders = recentOrders.reduce((sum, h) => sum + h.ordersCount, 0) / recentOrders.length;
        
        // Calculate historical average (all time)
        const totalOrders = history.reduce((sum, h) => sum + h.ordersCount, 0);
        const historicalAvg = totalOrders / history.length;
        
        // Demand factor = recent / historical
        const demandFactor = historicalAvg > 0 ? avgOrders / historicalAvg : 1.0;
        
        // Clamp between 0.5 and 2.0
        return Math.max(0.5, Math.min(2.0, demandFactor));
    }

    /**
     * Get time-based factor
     */
    getTimeFactor() {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay(); // 0 = Sunday, 6 = Saturday
        
        // Check if weekend
        const isWeekend = day === 0 || day === 6;
        const isHoliday = this.isHoliday(now);
        
        // Peak hours check
        const isLunchPeak = hour >= this.peakHours.lunch.start && hour < this.peakHours.lunch.end;
        const isDinnerPeak = hour >= this.peakHours.dinner.start && hour < this.peakHours.dinner.end;
        const isPeak = isLunchPeak || isDinnerPeak;
        
        // Calculate time factor
        let timeFactor = 1.0;
        
        if (isPeak) {
            timeFactor += 0.15; // 15% premium during peak
        } else {
            timeFactor -= 0.10; // 10% discount off-peak
        }
        
        if (isWeekend) {
            timeFactor += 0.20; // 20% weekend premium
        }
        
        if (isHoliday) {
            timeFactor += 0.30; // 30% holiday premium
        }
        
        return Math.max(0.7, Math.min(1.5, timeFactor));
    }

    /**
     * Check if current date is a holiday
     */
    isHoliday(date) {
        const holidays = [
            '01-01', // New Year
            '01-26', // Republic Day
            '08-15', // Independence Day
            '10-02', // Gandhi Jayanti
            '12-25'  // Christmas
        ];
        
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${month}-${day}`;
        
        return holidays.includes(dateStr);
    }

    /**
     * Get demand forecast for upcoming period
     */
    async forecastDemand(dishId, days = 7) {
        const history = await this.getDishHistory(dishId);
        
        if (history.length === 0) {
            return {
                dishId,
                forecast: [],
                confidence: 'low',
                trend: 'stable'
            };
        }

        // Simple moving average forecast
        const dailyOrders = history.map(h => h.ordersCount);
        const avgDaily = dailyOrders.reduce((a, b) => a + b, 0) / dailyOrders.length;
        
        // Calculate trend (last 7 days vs previous 7 days)
        const lastWeek = dailyOrders.slice(0, 7);
        const prevWeek = dailyOrders.slice(7, 14);
        const lastAvg = lastWeek.reduce((a, b) => a + b, 0) / lastWeek.length;
        const prevAvg = prevWeek.reduce((a, b) => a + b, 0) / prevWeek.length;
        const trend = lastAvg > prevAvg ? 'increasing' : (lastAvg < prevAvg ? 'decreasing' : 'stable');
        
        // Generate forecast
        const forecast = [];
        const now = new Date();
        
        for (let i = 0; i < days; i++) {
            const forecastDate = new Date(now);
            forecastDate.setDate(forecastDate.getDate() + i);
            
            const timeFactor = this.getTimeFactorForDate(forecastDate);
            const seasonFactor = this.getSeasonFactor(forecastDate);
            
            forecast.push({
                date: forecastDate.toISOString().split('T')[0],
                predictedOrders: Math.round(avgDaily * timeFactor * seasonFactor),
                confidence: history.length > 30 ? 'high' : (history.length > 15 ? 'medium' : 'low')
            });
        }
        
        return {
            dishId,
            forecast,
            confidence: history.length > 30 ? 'high' : (history.length > 15 ? 'medium' : 'low'),
            trend,
            averageDaily: avgDaily
        };
    }

    /**
     * Get time factor for a specific date
     */
    getTimeFactorForDate(date) {
        const hour = date.getHours();
        const day = date.getDay();
        const isWeekend = day === 0 || day === 6;
        const isPeak = (hour >= 12 && hour < 14) || (hour >= 19 && hour < 21);
        
        let factor = 1.0;
        if (isPeak) factor += 0.15;
        if (isWeekend) factor += 0.20;
        
        return factor;
    }

    /**
     * Get season factor for a specific date
     */
    getSeasonFactor(date) {
        const month = date.getMonth();
        // December (holiday season)
        if (month === 11) return 1.4;
        // January (New Year)
        if (month === 0) return 1.2;
        // Summer months (June-August)
        if (month >= 5 && month <= 7) return 1.1;
        return 1.0;
    }

    /**
     * Get dish history
     */
    async getDishHistory(dishId) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.historyDays);
        
        const history = await PriceHistory.find({
            dishId: dishId,
            timestamp: { $gte: cutoffDate }
        }).sort({ timestamp: -1 });
        
        return history;
    }

    /**
     * Analyze price elasticity
     */
    async analyzePriceElasticity(dishId) {
        const history = await PriceHistory.find({ dishId })
            .sort({ timestamp: 1 })
            .limit(50);
        
        if (history.length < 10) {
            return { elasticity: 0, confidence: 'low' };
        }

        // Calculate price elasticity: % change in demand / % change in price
        let priceChanges = [];
        let demandChanges = [];
        
        for (let i = 1; i < history.length; i++) {
            const prev = history[i - 1];
            const curr = history[i];
            
            if (prev.currentPrice > 0) {
                const priceChange = (curr.currentPrice - prev.currentPrice) / prev.currentPrice;
                const demandChange = prev.ordersCount > 0 ? 
                    (curr.ordersCount - prev.ordersCount) / prev.ordersCount : 0;
                
                if (Math.abs(priceChange) > 0.01) {
                    priceChanges.push(priceChange);
                    demandChanges.push(demandChange);
                }
            }
        }
        
        if (priceChanges.length === 0) {
            return { elasticity: 0, confidence: 'low' };
        }
        
        // Calculate average elasticity
        let totalElasticity = 0;
        for (let i = 0; i < priceChanges.length; i++) {
            if (priceChanges[i] !== 0) {
                totalElasticity += demandChanges[i] / priceChanges[i];
            }
        }
        
        const elasticity = totalElasticity / priceChanges.length;
        const confidence = history.length > 30 ? 'high' : (history.length > 20 ? 'medium' : 'low');
        
        return {
            elasticity: Math.round(elasticity * 100) / 100,
            confidence,
            dataPoints: priceChanges.length
        };
    }

    /**
     * Get recommendations for pricing
     */
    async getPricingRecommendations(dishId, currentPrice) {
        const demandFactor = await this.calculateDemandFactor(dishId);
        const timeFactor = this.getTimeFactor();
        const elasticity = await this.analyzePriceElasticity(dishId);
        
        let recommendedPrice = currentPrice;
        let reasoning = [];
        
        // Adjust based on demand
        if (demandFactor > 1.2) {
            const increase = Math.min(0.15, (demandFactor - 1) * 0.3);
            recommendedPrice *= (1 + increase);
            reasoning.push(`High demand (${demandFactor.toFixed(2)}x) -> ${(increase * 100).toFixed(0)}% increase`);
        } else if (demandFactor < 0.8) {
            const decrease = Math.min(0.20, (1 - demandFactor) * 0.25);
            recommendedPrice *= (1 - decrease);
            reasoning.push(`Low demand (${demandFactor.toFixed(2)}x) -> ${(decrease * 100).toFixed(0)}% decrease`);
        }
        
        // Adjust based on time
        if (timeFactor > 1.1) {
            const increase = (timeFactor - 1) * 0.5;
            recommendedPrice *= (1 + increase);
            reasoning.push(`Peak time -> ${(increase * 100).toFixed(0)}% premium`);
        } else if (timeFactor < 0.9) {
            const decrease = (1 - timeFactor) * 0.5;
            recommendedPrice *= (1 - decrease);
            reasoning.push(`Off-peak -> ${(decrease * 100).toFixed(0)}% discount`);
        }
        
        // Consider price elasticity
        if (Math.abs(elasticity.elasticity) > 0.5) {
            if (elasticity.elasticity > 0) {
                // Elastic demand - price sensitive
                recommendedPrice *= 0.95;
                reasoning.push(`High elasticity (${elasticity.elasticity}) -> 5% discount recommended`);
            } else {
                // Inelastic demand - can increase price
                recommendedPrice *= 1.05;
                reasoning.push(`Low elasticity (${elasticity.elasticity}) -> 5% increase possible`);
            }
        }
        
        // Round to nearest rupee
        recommendedPrice = Math.round(recommendedPrice);
        
        return {
            currentPrice,
            recommendedPrice,
            change: recommendedPrice - currentPrice,
            changePercent: ((recommendedPrice - currentPrice) / currentPrice * 100).toFixed(1),
            reasoning,
            demandFactor,
            timeFactor,
            elasticity: elasticity.elasticity
        };
    }
}

module.exports = new DemandForecaster();