import Device from "../models/device.model.js";
import Event from '../models/event.model.js';
import mongoose from "mongoose";

export const submitData = async (req, res) => {
    // 1. Basic Validation
    if (!req.body || !req.body.deviceID) {
        return res.status(400).json({ success: false, message: "Invalid values or missing Device ID!" });
    }

    // Extracting fields sent from the Arduino communication bridge
    // Based on Arduino Serial Order: Humidity, Temperature, Turning, LED, Door, Day
    const {
        deviceID,
        temperature,
        humidity,
        turningEnabled, // Received as 1 or 0
        ledStatus,      // Received as 1 or 0
        doorIsClosed,   // Received as 1 or 0
        daysElapsed
    } = req.body;

    const session = await mongoose.startSession();
    try {
        // 2. Find the device first
        const onRecordDevice = await Device.findOne({ "deviceID": deviceID });
        
        if (!onRecordDevice) {
            return res.status(404).json({ success: false, message: "Device not found!" });
        }

        session.startTransaction();

        // 3. Update the Device document with current status
        onRecordDevice.temperature = temperature ?? onRecordDevice.temperature;
        onRecordDevice.humidity = humidity ?? onRecordDevice.humidity;
        onRecordDevice.daysElapsed = daysElapsed ?? onRecordDevice.daysElapsed;
        onRecordDevice.isOnline = true;
        onRecordDevice.lastUpdate = Date.now();
        
        // Logical check: If the door is closed, incubation is active
        onRecordDevice.incubationStarted = (doorIsClosed === 1 || doorIsClosed === true);

        // Update Nested Objects (Convert 1/0 to Boolean)
        onRecordDevice.eggTurning.enabled = (turningEnabled === 1 || turningEnabled === true);
        onRecordDevice.ledLight.status = (ledStatus === 1 || ledStatus === true);
        
        // Update Door Sensor logic
        const currentDoorState = (doorIsClosed === 1 || doorIsClosed === true);
        if (onRecordDevice.doorSensor.isClosed !== currentDoorState) {
            onRecordDevice.doorSensor.isClosed = currentDoorState;
            if (currentDoorState) {
                onRecordDevice.doorSensor.lastClosedTime = Date.now();
            }
        }

        await onRecordDevice.save({ session });

        // 4. Create an Event record for historical tracking (Graphing)
        const newEvent = new Event({
            device: onRecordDevice._id,
            eventDate: Date.now(),
            eventType: 'Periodic Sync',
            temperature: temperature,
            humidity: humidity,
            daysElapsed: daysElapsed,
            incubationStarted: onRecordDevice.incubationStarted,
            // Saving current snapshots into the event historical record
            eggTurning: { enabled: onRecordDevice.eggTurning.enabled },
            ledLight: { status: onRecordDevice.ledLight.status },
            doorSensor: { isClosed: currentDoorState }
        });

        await newEvent.save({ session });

        await session.commitTransaction();
        return res.status(200).json({ success: true, message: "Incubator data successfully synced!" });

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        console.error("Error in saving Data from device! - " + error.message);
        return res.status(500).json({ success: false, message: "Server Error" });
    } finally {
        await session.endSession();
    }
};

// --- Historical Records Retrieval (Stays largely the same) ---
export const getSensorReadingRecords = async(req, res) =>{
    if(!req.body) return res.status(400).json({success: false, message: "Invalid values!"});

    const { deviceID, startDate, endDate, _id: ownerID } = req.body;
    const pipeline = [];
    const initialMatch = {};

    if (startDate || endDate) {
        initialMatch.eventDate = {}; 
        if (startDate) {
            const sDate = new Date(startDate);
            sDate.setHours(0, 0, 0, 0); 
            initialMatch.eventDate.$gte = sDate.getTime();
        }
        if (endDate) {
            const eDate = new Date(endDate);
            eDate.setHours(23, 59, 59, 999);
            initialMatch.eventDate.$lte = eDate.getTime();
        }
    }

    if (!mongoose.isValidObjectId(ownerID)) return res.status(401).json({ success: false, message: "Auth failed!" });

    if (Object.keys(initialMatch).length > 0) pipeline.push({ $match: initialMatch });

    pipeline.push({
        $lookup: {
            from: "devices",
            localField: "device",
            foreignField: "_id",
            as: "device"
        }
    }, { $unwind: "$device" });

    const secondaryMatch = { "device.owner": new mongoose.Types.ObjectId(ownerID) };
    if (deviceID && deviceID !== "null") secondaryMatch["device.deviceID"] = deviceID;

    pipeline.push({ $match: secondaryMatch });

    try {
        const response = await Event.aggregate(pipeline);
        res.status(200).json({ success: true, data: response });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// --- Hourly Temperature Summary for Dashboard Graphs ---
export const getTemperatureSummary = async (req, res) => {
  const ownerID = req.body._id;
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  if (!mongoose.isValidObjectId(ownerID)) return res.status(401).json({ success: false, message: "Auth failed!" });

  try {
    const response = await Event.aggregate([
      { $addFields: { eventDateObj: { $toDate: "$eventDate" } } },
      { $match: { eventDateObj: { $gte: twentyFourHoursAgo } } },
      { $lookup: { from: "devices", localField: "device", foreignField: "_id", as: "device" } },
      { $unwind: "$device" },
      { $match: { "device.owner": new mongoose.Types.ObjectId(ownerID) } },
      {
        $group: {
          _id: {
            device: "$device._id",
            hour: { $dateTrunc: { date: "$eventDateObj", unit: "hour" } }
          },
          avgTemp: { $avg: "$temperature" },
          device: { $first: "$device" }
        }
      },
      { $sort: { "_id.hour": 1 } },
      {
        $group: {
          _id: "$_id.device",
          device: { $first: "$device" },
          temperatures: {
            $push: {
              hour: { $dateToString: { format: "%H:00", date: "$_id.hour" } },
              value: { $round: ["$avgTemp", 1] }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          device: { _id: "$device._id", deviceID: "$device.deviceID" },
          temperatures: 1
        }
      }
    ]);

    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error!" });
  }
};