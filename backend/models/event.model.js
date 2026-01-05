import mongoose from 'mongoose';

const types = [ 'Data Submission', 'Seedling Sow', 'Seedling Ready'];

const EventSchema = new mongoose.Schema({
    device:{
        type: mongoose.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    eventDate:{
        type: Number,
        required: true,
        default: Date.now()
    },
    eventType:{
        type: String,
        enum: types,
        required: true,
        default: 'Data Submission'
    },
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
  //Simple toggle: true for ON, false for OFF
   manualStatus: {
      type: boolean,
      default: false,
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
  }
});

const Event=mongoose.model('Event', EventSchema);

export default Event;