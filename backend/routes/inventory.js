const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const auth = require('../middleware/auth');

// @route   GET /api/inventory
router.get('/', auth, inventoryController.getInventory);

// @route   PUT /api/inventory
router.put('/', auth, inventoryController.updateInventory);

module.exports = router;
