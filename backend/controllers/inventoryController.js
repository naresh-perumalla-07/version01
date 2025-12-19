const Inventory = require('../models/Inventory');

// IN-MEMORY MOCK DATABASE (Fallback)
// Key: hospitalId, Value: Inventory Object
const mockInventory = {};

const isDbConnected = () => require('mongoose').connection.readyState === 1;

// @route   GET /api/inventory
// @desc    Get inventory for the logged-in hospital
// @access  Private (Hospital Only)
exports.getInventory = async (req, res, next) => {
  try {
    const hospitalId = req.userId;

    if (isDbConnected()) {
      let inventory = await Inventory.findOne({ hospitalId });
      
      if (!inventory) {
        // Create empty inventory if not exists
        inventory = new Inventory({
          hospitalId,
          bloodGroups: [
            { type: 'A+', units: 0 }, { type: 'A-', units: 0 },
            { type: 'B+', units: 0 }, { type: 'B-', units: 0 },
            { type: 'AB+', units: 0 }, { type: 'AB-', units: 0 },
            { type: 'O+', units: 0 }, { type: 'O-', units: 0 },
          ]
        });
        await inventory.save();
      }

      return res.status(200).json({
        success: true,
        data: inventory
      });
    } else {
      // MOCK FALLBACK
      let inventory = mockInventory[hospitalId];
      if (!inventory) {
         inventory = {
            hospitalId,
            criticalLevel: 5,
            bloodGroups: [
                { type: 'A+', units: 10 }, { type: 'A-', units: 5 },
                { type: 'B+', units: 8 }, { type: 'B-', units: 3 },
                { type: 'AB+', units: 12 }, { type: 'AB-', units: 2 },
                { type: 'O+', units: 15 }, { type: 'O-', units: 4 },
            ],
            lastUpdated: new Date()
         };
         mockInventory[hospitalId] = inventory;
      }

      return res.status(200).json({
        success: true,
        data: inventory,
        mode: 'mock'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/inventory
// @desc    Update specific blood group units
// @access  Private (Hospital Only)
exports.updateInventory = async (req, res, next) => {
  try {
    const hospitalId = req.userId;
    const { bloodGroup, units, action } = req.body; // action: 'set', 'add', 'remove'

    if (!bloodGroup || units === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide bloodGroup and units' });
    }

    if (isDbConnected()) {
      let inventory = await Inventory.findOne({ hospitalId });
      if (!inventory) {
        return res.status(404).json({ success: false, message: 'Inventory not found' });
      }

      const item = inventory.bloodGroups.find(bg => bg.type === bloodGroup);
      if (!item) {
        // Add if not exists (should rarely happen if initialized correctly)
        inventory.bloodGroups.push({ type: bloodGroup, units: Math.max(0, parseInt(units)) });
      } else {
         let current = item.units;
         let val = parseInt(units);
         
         if (action === 'add') item.units = current + val;
         else if (action === 'remove') item.units = Math.max(0, current - val);
         else item.units = Math.max(0, val); // default 'set'
         
         item.lastUpdated = Date.now();
      }

      await inventory.save();
      return res.status(200).json({ success: true, message: 'Inventory updated', data: inventory });

    } else {
      // MOCK
      let inventory = mockInventory[hospitalId];
      if (!inventory) return res.status(404).json({ success: false, message: 'Inventory not found (Mock)' });

      const item = inventory.bloodGroups.find(bg => bg.type === bloodGroup);
      if (item) {
         let current = item.units;
         let val = parseInt(units);
         
         if (action === 'add') item.units = current + val;
         else if (action === 'remove') item.units = Math.max(0, current - val);
         else item.units = Math.max(0, val); // default 'set'
      }

      return res.status(200).json({ success: true, message: 'Inventory updated (Mock)', data: inventory });
    }

  } catch (error) {
    next(error);
  }
};
