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
  
     // ===== ENVIRONMENT DATA (Matches Serial Print) =====
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
    default: 0, // Maps to eggDay in Arduino
  },
  incubationStarted: {
    type: Boolean,
    default: false, // Maps to incubationRunning in Arduino
  },

  // ===== EGG TURNING CONTROL =====
  eggTurning: {
    enabled: {
      type: Boolean,
      default: true, // Maps to turningEnabled (Serial 'A' or 'O')
    },
    autoStopDay: {
      type: Number,
      default: 16, // Logic in Arduino: SIXTEEN_DAYS
    },
    // We remove "mode" since your Arduino code currently treats it as a simple Toggle
  },

  // ===== LED LIGHT CONTROL =====
  ledLight: {
    status: {
      type: Boolean,
      default: false, // Serial '1' or '0'
    },
  },

  // ===== MAGNETIC DOOR SENSOR =====
  doorSensor: {
    isClosed: {
      type: Boolean,
      default: false, // 1 = Closed, 0 = Open
    }
  },
});
const Event=mongoose.model('Event', EventSchema);

export default Event;