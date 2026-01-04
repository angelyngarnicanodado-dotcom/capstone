import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema({
  // ===== DEVICE INFO =====
  deviceID: {
    type: String,
    required: true,
    unique: true,
  },

  owner:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
  isOnline: {
    type: Boolean,
    default: false,
  },

  lastUpdate: {
    type: Number,
    default: Date.now,
  },

  // ===== ENVIRONMENT DATA =====
  temperature: {
    type: Number,
    default: 0,
  },

  humidity: {
    type: Number,
    default: 0,
  },

  daysElapsed: {
    type: Number,
    default: 0,
  },

  incubationStarted: {
    type: Boolean,
    default: false,
  },

  // ===== EGG TURNING CONTROL =====
  eggTurning: {
    mode: {
      type: String,
      enum: ["OFF", "MANUAL", "AUTO"],
      default: "AUTO",
    },

    isTurning: {
      type: Boolean,
      default: false,
    },

    autoStopDay: {
      type: Number,
      default: 16, // stop turning at day 16
    },
  },

  // ===== LED LIGHT CONTROL =====
  ledLight: {
    mode: {
      type: String,
      enum: ["OFF", "MANUAL", "AUTO"],
      default: "AUTO",
    },

    isOn: {
      type: Boolean,
      default: false,
    },

    autoStopDay: {
      type: Number,
      default: 10, // stop LED at day 10
    },
  },

  // ===== MAGNETIC DOOR SENSOR =====
  doorSensor: {
    isClosed: {
      type: Boolean,
      default: false,
    },

    lastClosedTime: {
      type: Number,
      default: 0,
    },
  },
});

export default mongoose.model("Device", DeviceSchema);
