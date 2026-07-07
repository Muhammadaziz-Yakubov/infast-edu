import express from "express";
import cors from "cors";
import { TelegramController } from "./controllers/telegram.controller";

const app = express();
const telegramController = new TelegramController();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.post("/api/telegram/incoming", telegramController.handleIncoming);
app.post("/api/telegram/sent", telegramController.handleSent);

// Agent Control APIs
app.get("/api/telegram/status", telegramController.getStatus);
app.post("/api/telegram/start", telegramController.startAgent);
app.post("/api/telegram/stop", telegramController.stopAgent);
app.post("/api/telegram/submit-code", telegramController.submitCode);
app.post("/api/telegram/logout", telegramController.logoutAgent);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

export default app;
