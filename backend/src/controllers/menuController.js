const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');

// @desc    Get all menu items (with optional filters)
// @route   GET /api/menu
// @access  Public
exports.getMenuItems = async (req, res) => {
  try {
    const filter = {};

    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Filter by dietary preference
    if (req.query.isVeg !== undefined) {
      filter.isVeg = req.query.isVeg === 'true';
    }

    // Filter by tag
    if (req.query.tag) {
      filter.tags = req.query.tag;
    }
    // Filter by workout fit (e.g. ?workout=Post-Workout Fuel)
    if (req.query.workout) {
      filter.workoutTags = req.query.workout;
    }
    // Filter by energy band (e.g. ?energy=light|moderate|heavy)
    if (req.query.energy) {
      if (req.query.energy === 'light') {
        filter.calories = { $lt: 250 };
      } else if (req.query.energy === 'moderate') {
        filter.calories = { $gte: 250, $lte: 450 };
      } else if (req.query.energy === 'heavy') {
        filter.calories = { $gt: 450 };
      }
    }

    // Curate Your Dining filters (comma-separated values)
    if (req.query.chefSelection) {
      filter.chefSelection = { $in: req.query.chefSelection.split(',') };
    }
    if (req.query.flavorProfile) {
      filter.flavorProfile = { $in: req.query.flavorProfile.split(',') };
    }
    if (req.query.diningOccasion) {
      filter.diningOccasion = { $in: req.query.diningOccasion.split(',') };
    }

    // By default, public users only see available items
    // Admin can pass ?showAll=true to see unavailable items too
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin || req.query.showAll !== 'true') {
      filter.isAvailable = true;
    }

    const menuItems = await MenuItem.aggregate([
      { $match: filter },
      { $sort: { category: 1, sortOrder: 1, name: 1 } },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'menuItem',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          reviewCount: { $size: '$reviews' },
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: '$reviews' }, 0] },
              then: { $round: [{ $avg: '$reviews.rating' }, 1] },
              else: 0
            }
          }
        }
      },
      {
        $project: {
          reviews: 0
        }
      }
    ]);

    const formattedMenuItems = menuItems.map((item) => ({
      ...item,
      id: item._id
    }));

    res.status(200).json({
      success: true,
      count: formattedMenuItems.length,
      data: formattedMenuItems
    });
  } catch (error) {
    console.error('Menu Operation Error [getMenuItems]:', error);
    res.status(500).json({ 
      success: false, 
      error: 'An unexpected server error occurred. Please try again later.' 
    });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
exports.getMenuItem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid menu item ID format' });
    }

    const itemObjectId = new mongoose.Types.ObjectId(req.params.id);
    const items = await MenuItem.aggregate([
      { $match: { _id: itemObjectId } },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'menuItem',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          reviewCount: { $size: '$reviews' },
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: '$reviews' }, 0] },
              then: { $round: [{ $avg: '$reviews.rating' }, 1] },
              else: 0
            }
          }
        }
      },
      {
        $project: {
          reviews: 0
        }
      }
    ]);

    if (!items || items.length === 0) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }

    const item = { ...items[0], id: items[0]._id };
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.error('Menu Operation Error [getMenuItem]:', error);
    res.status(500).json({ 
      success: false, 
      error: 'An unexpected server error occurred. Please try again later.' 
    });
  }
};

// @desc    Create menu item
// @route   POST /api/menu
// @access  Admin
exports.createMenuItem = async (req, res) => {
  try {
    const allowed = ['name', 'description', 'price', 'category', 'isVeg', 'allergens', 'tags',
      'customizations', 'isAvailable', 'image', 'preparationTime', 'sortOrder', 'calories',
      'workoutTags', 'badge', 'cookingOptions', 'allowCustomInstructions', 'customInstructionsMaxLength',
      'chefSelection', 'flavorProfile', 'diningOccasion'];
    const filtered = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) filtered[key] = req.body[key];
    }
    const item = await MenuItem.create(filtered);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Validation failed' });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Admin
exports.updateMenuItem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid menu item ID format' });
    }

    const allowed = ['name', 'description', 'price', 'category', 'isVeg', 'allergens', 'tags',
      'customizations', 'isAvailable', 'image', 'preparationTime', 'sortOrder', 'calories',
      'workoutTags', 'badge', 'cookingOptions', 'allowCustomInstructions', 'customInstructionsMaxLength',
      'chefSelection', 'flavorProfile', 'diningOccasion'];
    const filtered = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) filtered[key] = req.body[key];
    }

    const item = await MenuItem.findByIdAndUpdate(req.params.id, filtered, {
      new: true,
      runValidators: true
    });
    if (!item) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Failed to update menu item' });
  }
};

// @desc    Toggle menu item availability (the key differentiator)
// @route   PATCH /api/menu/:id/toggle
// @access  Admin
exports.toggleAvailability = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid menu item ID format' });
    }

    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.status(200).json({
      success: true,
      data: item,
      message: `${item.name} is now ${item.isAvailable ? 'available' : 'unavailable'}`
    });
  } catch (error) {
    console.error('Menu Operation Error [toggleAvailability]:', error);
    res.status(500).json({ 
      success: false, 
      error: 'An unexpected server error occurred. Please try again later.' 
    });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Admin
exports.deleteMenuItem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid menu item ID format' });
    }

    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    res.status(200).json({ success: true, data: {}, message: 'Menu item deleted' });
  } catch (error) {
    console.error('deleteMenuItem error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete menu item' });
  }
};

// @desc    Get tonight's available menu (used in reservation preview)
// @route   GET /api/menu/tonight
// @access  Public
exports.getTonightMenu = async (req, res) => {
  try {
    let hour;

    if (req.query.time && typeof req.query.time === 'string') {
      const parts = req.query.time.split(':');
      const parsedHour = parseInt(parts[0], 10);
      if (!isNaN(parsedHour) && parsedHour >= 0 && parsedHour < 24) {
        hour = parsedHour;
      }
    }

    if (hour === undefined && req.query.date && typeof req.query.date === 'string') {
      if (req.query.date.includes('T') || req.query.date.includes(':')) {
        const parsedDate = new Date(req.query.date);
        if (!isNaN(parsedDate.getTime())) {
          const timezone = req.headers['x-timezone'] || req.query.timezone || 'Asia/Kolkata';
          const localHourString = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: '2-digit',
            hour12: false
          }).format(parsedDate);
          hour = parseInt(localHourString, 10);
        }
      }
    }

    if (hour === undefined) {
      // 1. Resolve target timezone (client header, query parameter, or standard Asia/Kolkata)
      const timezone = req.headers['x-timezone'] || req.query.timezone || 'Asia/Kolkata';

      // 2. Format the current time to the target timezone and safely parse the 24-hour value
      const localHourString = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        hour12: false
      }).format(new Date());

      hour = parseInt(localHourString, 10);
    }

    let categories;

    if (hour < 11) {
      categories = ['breakfast'];
    } else if (hour < 15) {
      categories = ['lunch'];
    } else {
      categories = ['dinner', 'desserts', 'drinks'];
    }

    const items = await MenuItem.find({
      isAvailable: true,
      category: { $in: categories }
    }).sort({ sortOrder: 1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
      categories
    });
  } catch (error) {
    console.error('Menu Operation Error [getTonightMenu]:', error);
    res.status(500).json({ 
      success: false, 
      error: 'An unexpected server error occurred. Please try again later.' 
    });
  }
};
