import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema({
    deviceID: {
        type: String,
        required: true,
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    lastUpdate: {
        type: Number,
        required: true,
        default: 0
    },

    temperature: {
        type: Number,
        required: true,
        default: 0
    },

    Humidity: {
        type: Number,
        required: true,
        default: 0
    },

    Days_Elapse: {
        type: Number,
        required: true,
        default: 0
    }
});

// ===== VIRTUAL: Turning Status =====
// Turning stops AFTER day 16
DeviceSchema.virtual('turningStatus').get(function () {
    if (this.Days_Elapse >= 17) return "Stopped";
    return "Active";
});

// ===== VIRTUAL: Day Status =====
// Day 21 → "Ready for Hatching"
DeviceSchema.virtual('dayStatus').get(function () {
    if (this.Days_Elapse >= 21) return "Ready for Hatching";
    return `Day ${this.Days_Elapse}`;
});

// Enable virtuals in JSON
DeviceSchema.set('toJSON', { virtuals: true });
DeviceSchema.set('toObject', { virtuals: true });

const Device = mongoose.model('Device', DeviceSchema);
export default Device;
