import express from 'express';
import { dbConnection } from './config/db_access.js';
import { config as dotenvConfig } from 'dotenv';
import fs from 'fs';
import deviceRouter from './routers/device.router.js';
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;
const secretPath =
  fs.existsSync('/etc/secrets/.env')
    ? '/etc/secrets/.env'
    : './.env';
dotenvConfig({ path: secretPath});
app.use("/device", deviceRouter);
app.get("/", (req, res) =>{
    res.json({message: "Server is working!"})
});
app.use("/device", deviceRouter)
app.listen(PORT, ()=>{
    dbConnection();
    console.log("Server started at http://localhost:"+PORT);
});