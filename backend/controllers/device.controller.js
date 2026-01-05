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
            owner: id,
            // Initialize with default values from Arduino logic
            eggTurning: { enabled: true },
            ledLight: { status: false }
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

// HEARTBEAT / UPDATE: Function used to update status from the physical device
// Arduino Serial Order: Humidity, Temperature, Turning, LED, Door, Day
export const deviceOnline = async (req, res) => {
    const { 
        deviceID, 
        humidity, 
        temperature, 
        turningEnabled, 
        ledStatus, 
        doorIsClosed,
        daysElapsed
    } = req.body;

    if (!deviceID) {
        return res.status(400).json({ success: false, message: "Device ID required" });
    }

    try {
        // We find the device and update it based on the Arduino's current logic
        const updatedDevice = await Device.findOneAndUpdate(
            { deviceID },
            {
                $set: {
                    isOnline: true,
                    lastUpdate: Date.now(),
                    humidity: humidity,
                    temperature: temperature,
                    "eggTurning.enabled": turningEnabled === 1 || turningEnabled === true,
                    "ledLight.status": ledStatus === 1 || ledStatus === true,
                    "doorSensor.isClosed": doorIsClosed === 1 || doorIsClosed === true,
                    daysElapsed: daysElapsed,
                    incubationStarted: doorIsClosed === 1 || doorIsClosed === true // Arduino starts logic if door closed
                }
            },
            { new: true }
        );

        if (!updatedDevice) {
            return res.status(404).json({ success: false, message: "Device not found" });
        }

        res.status(200).json({ success: true, data: [updatedDevice] });
    } catch (error) {
        console.error("Device Online Error: " + error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Toggle Controls (Called from Mobile App)
// This sends the 'A'/'O' or '1'/'0' commands to your communication bridge
export const toggleDeviceFeature = async (req, res) => {
    const { deviceDBID } = req.params;
    const { feature, value } = req.body; // feature: "turning" or "led", value: true/false

    try {
        let update = {};
        if (feature === "turning") update = { "eggTurning.enabled": value };
        if (feature === "led") update = { "ledLight.status": value };

        const updatedDevice = await Device.findByIdAndUpdate(deviceDBID, update, { new: true });
        
        // Note: Your communication bridge (Python/ESP) must monitor this DB change 
        // to send the Serial command ('A','O','1','0') to the Arduino.
        
        res.status(200).json({ success: true, data: [updatedDevice] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Toggle Failed" });
    }
};

// --- REST OF YOUR FUNCTIONS (Stay mostly the same) ---

export const getMyDevices = async (req, res) => {
    const id = req.body?._id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(200).json({ success: false, message: "Auth Failed" });
    try {
        const devices = await Device.find({ owner: id });
        res.status(200).json({ success: true, data: devices });
    } catch (error) { res.status(500).json({ success: false, message: "Server Error" }); }
};

export const updateDevice = async (req, res) => {
    const { deviceID } = req.body;
    const { deviceDBID } = req.params;
    try {
        const updatedDevice = await Device.findByIdAndUpdate(deviceDBID, { deviceID }, { new: true });
        res.status(200).json({ success: true, data: [updatedDevice] });
    } catch (error) { res.status(500).json({ success: false, message: "Server Error" }); }
};

export const getADevice = async (req, res) => {
    const id = req.body?._id;
    const { deviceID } = req.params;
    try {
        const device = await Device.findOne({ deviceID, owner: id });
        res.status(200).json({ success: true, data: [device] });
    } catch (error) { res.status(500).json({ success: false, message: "Server Error" }); }
};

export const getNumberOfDevicesOnline = async (req, res) => {
    const ownerId = req.body?._id;
    try {
        const response = await Device.aggregate([
            { $match: { owner: new mongoose.Types.ObjectId(ownerId) } },
            { $group: { _id: null, online: { $sum: { $cond: ["$isOnline", 1, 0] } }, offline: { $sum: { $cond: ["$isOnline", 0, 1] } } } }
        ]);
        res.status(200).json({ success: true, data: response.length > 0 ? response : [{ online: 0, offline: 0 }] });
    } catch (error) { res.status(500).json({ success: false, message: "Server Error" }); }
};