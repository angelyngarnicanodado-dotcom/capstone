import express from 'express';

import { registerNewDevice, getDevices, deviceOnline } from '../controllers/device.controller.js';

const router= express.Router();

router.post("/register", registerNewDevice);
router.get("/get",getDevices);
router.post("/online", deviceOnline);

export default router;