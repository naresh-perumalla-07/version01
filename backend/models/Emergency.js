const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: true,
    },
    bloodGroup: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    unitsNeeded: {
        type: Number,
        required: true,
        min: 1,
    },
    condition: {
        type: String,
        required: true,
    },
    urgency: {
        type: String,
        enum: ['critical', 'urgent', 'severe'],
        required: true,
    },
    hospitalName: {
        type: String,
        required: true,
    },
    landmark: {
        type: String,
        required: true,
    },
    contactPerson: {
        type: String,
        required: true,
    },
    contactPhone: {
        type: String,
        required: true,
    },
    latitude: {
        type: Number,
    },
    longitude: {
        type: Number,
    },
    status: {
        type: String,
        enum: ['active', 'fulfilled', 'expired'],
        default: 'active',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    respondents: [
        {
            donorId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            status: {
                type: String,
                enum: ['responded', 'accepted', 'rejected', 'completed'],
                default: 'responded',
            },
            respondedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    expiresAt: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Emergency', emergencySchema);
