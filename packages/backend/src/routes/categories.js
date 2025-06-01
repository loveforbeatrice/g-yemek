const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, isBusiness } = require('../middleware/authMiddleware');

// Get all categories for the current business
router.get('/', protect, isBusiness, async (req, res) => {
  try {
    const businessName = req.user.name;
    const categories = await Category.findAll({ 
      where: { businessName },
      order: [['name', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new category
router.post('/', protect, isBusiness, async (req, res) => {
  try {
    const { name } = req.body;
    const businessName = req.user.name;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Check if a category with the same name already exists
    const existingCategory = await Category.findOne({ 
      where: { businessName, name }
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: 'A category with this name already exists' });
    }
    
    const category = await Category.create({
      name,
      businessName
    });
    
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a category
router.put('/:id', protect, isBusiness, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const businessName = req.user.name;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Check if the category exists and belongs to the business
    const category = await Category.findOne({ 
      where: { id, businessName }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if another category with the same name already exists
    const existingCategory = await Category.findOne({ 
      where: { businessName, name, id: { [require('sequelize').Op.ne]: id } }
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Another category with this name already exists' });
    }
    
    // Update the category
    category.name = name;
    await category.save();
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a category
router.delete('/:id', protect, isBusiness, async (req, res) => {
  try {
    const { id } = req.params;
    const businessName = req.user.name;
    
    // Check if the category exists and belongs to the business
    const category = await Category.findOne({ 
      where: { id, businessName }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Delete the category
    await category.destroy();
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
