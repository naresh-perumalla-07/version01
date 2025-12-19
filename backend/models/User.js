const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    // --- Phase 2: Enhanced Profile ---
    age: { type: Number },
    gender: { type: String },
    height: { type: Number }, // in cm
    weight: { type: Number }, // in kg
    unitsNeeded: { type: Number, default: 0 },
    // bloodGroup defined below with validation
    address: {
        street: String,
        state: String,
        pincode: String, // Requirement: Pincode
        zip: String // Legacy support
    },
    healthIssues: {
        type: String,
        default: 'None'
    },
    role: {
      type: String,
      enum: ['donor', 'hospital', 'person', 'admin'],
      default: 'person',
    },
    bloodGroup: {
      type: String,
      enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
      required: function() {
        return this.role === 'donor' || this.role === 'person';
      },
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    totalDonations: {
      type: Number,
      default: 0,
    },
    lastDonationDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notifications: [{
        type: { type: String, enum: ['request', 'system'], default: 'request' },
        message: String,
        details: Object, // { requesterName, phone, location, bloodGroup }
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
    sent_requests: [{
        donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        donorName: String,
        donorPhone: String,
        donorLocation: String,
        donorAddress: Object,
        donorBloodGroup: String,
        status: { type: String, enum: ['sent', 'accepted', 'rejected'], default: 'sent' },
        createdAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
