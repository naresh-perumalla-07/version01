const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bloodGroups: [
      {
        type: {
          type: String,
          enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
        },
        units: {
          type: Number,
          min: 0,
          default: 0,
        },
        expiryDate: Date,
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    criticalLevel: {
      type: Number,
      default: 5,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inventory', InventorySchema);
