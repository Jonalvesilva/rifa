import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { connectDB } from "./db/db";
import RaffleEntryRoute from "./routes/RaffleEntryRoute";
import RaffleScanRoute from "./routes/RaffleScanRoute";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/", RaffleEntryRoute);
app.use("/scan", RaffleScanRoute);

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
};

startServer();
