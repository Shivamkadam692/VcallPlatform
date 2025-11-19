import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";
import { connectToSocket } from "./controllers/socketManagers.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);



app.set("port", process.env.PORT || 8000);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/users", userRoutes);


const start = async () => {
  const connectionDb = await mongoose.connect("mongodb+srv://skeditzzone20_db_user:hMHKLF6pTSXROgmf@cluster0.xbh6h0w.mongodb.net/");

  console.log(`Mongo Connected DB: ${connectionDb.connection.host}`);
  server.listen(app.get("port"), () => {
    console.log(`Server is running on http://localhost:${app.get("port")}`);
  });
};

start();
