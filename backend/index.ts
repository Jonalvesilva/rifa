import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { connectDB } from "./db/db";
import http from "http";
import { Server } from "socket.io";
import RaffleEntryRoute from "./routes/RaffleEntryRoute";
import RaffleScanRoute from "./routes/RaffleScanRoute";
import CheckInRoute from "./routes/CheckInRoute";

dotenv.config();

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(bodyParser.json());
app.use("/", RaffleEntryRoute);
app.use("/scan", RaffleScanRoute);
app.use("/check-in", CheckInRoute);

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
};

startServer();
