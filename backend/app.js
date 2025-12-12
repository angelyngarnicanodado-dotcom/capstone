import express from 'express';
import { dbConnection } from './config/db_access.js';
import { config as dotenvConfig } from 'dotenv';
import fs from 'fs';
import deviceRouter from './routers/device.router.js';
import checkOfflineDevices from './functions/checkOfflineDevices.js';
import cors from 'cors';

const app = express();
app.use(express.json());

app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
}));


const PORT = process.env.PORT || 5000;
const secretPath =
  fs.existsSync('/etc/secrets/.env')
    ? '/etc/secrets/.env'
    : './.env';
dotenvConfig({ path: secretPath });

app.get("/", (req, res)=>{
    res.json({message: "Server is working!"})
});
app.use("/device", deviceRouter);

setInterval(checkOfflineDevices, 30000);

app.listen(PORT, ()=>{
    dbConnection();
    console.log("server started at http://localhost:"+PORT);
});