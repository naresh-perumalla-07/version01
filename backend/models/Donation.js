const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    emergencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Emergency',
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
      required: true,
    },
    unitsProvided: {
      type: Number,
      min: 0.5,
      max: 5,
      required: true,
    },
    donationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donation', DonationSchema);
