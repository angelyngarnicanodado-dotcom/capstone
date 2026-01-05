import Device from "../models/device.model.js";
import User from "../models/user.model.js";
import { isDeviceIDExisting } from "../functions/functions.js";
import mongoose from "mongoose";

// Register a new device to a user
export const registerNewDevice = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ success: false, message: "Invalid values!" });
    }

    const { deviceID, _id: id } = req.body;

    if (!deviceID) {
        return res.status(200).json({ success: false, message: "Invalid Device ID!" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(200).json({ success: false, message: "Authentication Failed!" });
    }

    const session = await mongoose.startSession();
    try {
        const onRecordUser = await User.findById(id);
        if (!onRecordUser) {
            return res.status(200).json({ success: false, message: "Authentication Failed!" });
        }

        if (await isDeviceIDExisting(deviceID)) {
            return res.status(200).json({ success: false, message: "Device ID is already in use!" });
        }

        session.startTransaction();

        const newDevice = new Device({
            deviceID,
            owner: id
        });

        await newDevice.save({ session });

        await session.commitTransaction();
        res.status(200).json({ success: true, data: [newDevice] });
    } catch (error) {
        await session.abortTransaction();
        console.error("Error in registering Device! - " + error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    } finally {
        await session.endSession();
    }
};

// Fetch all devices belonging to the user
export const getMyDevices = async (req, res) => {
    const id = req.body?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(200).json({ success: false, message: "Authentication Failed!" });
    }

    try {
        const devices = await Device.find({ owner: id });
        res.status(200).json({ success: true, data: devices });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Update Device Settings (specifically the deviceID name)
export const updateDevice = async (req, res) => {
    const { deviceID, _id: id } = req.body;
    const { deviceDBID } = req.params;

    if (!mongoose.Types.ObjectId.isValid(deviceDBID) || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(200).json({ success: false, message: "Invalid IDs provided!" });
    }

    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        
        if (await isDeviceIDExisting(deviceID, deviceDBID)) {
            return res.status(200).json({ success: false, message: "Device ID is already in use!" });
        }

        const updatedDevice = await Device.findByIdAndUpdate(
            deviceDBID, 
            { deviceID }, 
            { runValidators: true, new: true, session }
        );

        await session.commitTransaction();
        res.status(200).json({ success: true, data: [updatedDevice] });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ success: false, message: "Server Error" });
    } finally {
        await session.endSession();
    }
};

// HEARTBEAT: Function called by the physical device to update its current status
export const deviceOnline = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ success: false, message: "Invalid values!" });
    }

    const { 
        deviceID, 
        temperature, 
        humidity, 
        daysElapsed, 
        incubationStarted,
        isTurning,
        doorIsClosed
    } = req.body;

    if (!deviceID) {
        return res.status(200).json({ success: false, message: "Invalid Device ID!" });
    }

    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        // Find the device
        const device = await Device.findOne({ deviceID });
        if (!device) {
            return res.status(404).json({ success: false, message: "Device Not found!" });
        }

        // Update fields based on your Device Schema
        device.isOnline = true;
        device.lastUpdate = Date.now();
        device.temperature = temperature ?? device.temperature;
        device.humidity = humidity ?? device.humidity;
        device.daysElapsed = daysElapsed ?? device.daysElapsed;
        device.incubationStarted = incubationStarted ?? device.incubationStarted;

        // Nested Egg Turning Data
        if (typeof isTurning === "boolean") {
            device.eggTurning.isTurning = isTurning;
        }

        // Nested Door Sensor Data
        if (typeof doorIsClosed === "boolean") {
            device.doorSensor.isClosed = doorIsClosed;
            if (doorIsClosed) device.doorSensor.lastClosedTime = Date.now();
        }

        const updatedDevice = await device.save({ session });
        await session.commitTransaction();

        res.status(200).json({ success: true, data: [updatedDevice] });
    } catch (error) {
        await session.abortTransaction();
        console.error("Device Online Error: " + error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    } finally {
        await session.endSession();
    }
};

// Fetch a single device details
export const getADevice = async (req, res) => {
    const id = req.body?._id;
    const { deviceID } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(200).json({ success: false, message: "Authentication Failed!" });
    }

    try {
        const device = await Device.findOne({ deviceID, owner: id });
        if (!device) {
            return res.status(404).json({ success: false, message: "No device found or access denied!" });
        }
        res.status(200).json({ success: true, data: [device] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Dashboard Stats: Get count of online/offline devices for a user
export const getNumberOfDevicesOnline = async (req, res) => {
    const ownerId = req.body?._id;

    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
        return res.status(200).json({ success: false, message: "Authentication Failed!" });
    }

    try {
        const response = await Device.aggregate([
            { $match: { owner: new mongoose.Types.ObjectId(ownerId) } },
            {
                $group: {
                    _id: null,
                    online: { $sum: { $cond: [{ $eq: ["$isOnline", true] }, 1, 0] } },
                    offline: { $sum: { $cond: [{ $eq: ["$isOnline", false] }, 1, 0] } }
                }
            },
            { $project: { _id: 0, online: 1, offline: 1 } }
        ]);

        const data = response.length > 0 ? response : [{ online: 0, offline: 0 }];
        res.status(200).json({ success: true, data });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};