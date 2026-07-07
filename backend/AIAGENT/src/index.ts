import readline from "readline";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import app from "./app";
import { config } from "./config";
import { connectDatabase, disconnectDatabase } from "./database";
import { logger } from "./utils/logger";
import { processManager } from "./services/processManager";
import { cronService } from "./services/cron.service";
import { MessageRepository } from "./database/message.repository";
import { LeadRepository } from "./database/lead.repository";

const messageRepository = new MessageRepository();
const leadRepository = new LeadRepository();

let server: any;

/**
 * Clean shutdown of all services
 */
const shutdown = async () => {
  logger.info("Gracefully shutting down services...");

  if (server) {
    server.close();
    logger.info("Express server closed.");
  }

  // Stop Python process
  await processManager.stop();
  logger.info("Telegram microservice process stopped.");

  // Disconnect Database
  await disconnectDatabase();

  logger.info("Shutdown complete. Goodbye!");
  process.exit(0);
};

// Handle process termination signals
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

/**
 * Setup Admin CLI loop
 */
const startCLI = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  logger.info(
    "Admin Command Line Interface started. Available commands: status, restart, logout, sessions, stats"
  );

  rl.on("line", async (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Check if the input is a known admin command
    const args = trimmed.split(" ");
    const command = args[0].toLowerCase();

    switch (command) {
      case "status":
        await handleStatus();
        break;

      case "restart":
        logger.info("Initiating Telegram client restart...");
        await processManager.restart();
        break;

      case "logout": {
        logger.info("Logging out from Telegram...");
        const success = await processManager.logout();
        if (success) {
          logger.info("Logged out successfully. Process will restart to prompt for new login.");
        } else {
          logger.error("Logout request failed or process was force killed.");
        }
        break;
      }

      case "sessions":
        handleSessions();
        break;

      case "stats":
        await handleStats();
        break;

      default:
        // Forward unknown commands directly to Python stdin (for OTP/2FA inputs)
        processManager.sendInput(trimmed);
        break;
    }
  });
};

/**
 * Handle 'status' command
 */
const handleStatus = async () => {
  console.log("\n=================== SYSTEM STATUS ===================");

  // 1. MongoDB Status
  const mongoState = mongoose.connection.readyState;
  const mongoStates = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
  console.log(`MongoDB State:   ${mongoStates[mongoState] || "Unknown"}`);

  // 2. Express Server Status
  console.log(`Express API:     Running on port ${config.PORT}`);

  // 3. Python Client Status
  const clientStatus = await processManager.getStatus();
  console.log(`Telegram Client: ${clientStatus.connected ? "Connected" : "Disconnected"}`);
  console.log(
    `Authorized:      ${clientStatus.authorized ? "Yes (Active)" : "No (Pending Login)"}`
  );
  if (clientStatus.authorized) {
    console.log(
      `Logged in as:    ${clientStatus.first_name} ${clientStatus.last_name || ""} (@${clientStatus.username || "none"})`
    );
    console.log(`Phone:           ${clientStatus.phone}`);
  } else if (clientStatus.error) {
    console.log(`Client Error:    ${clientStatus.error}`);
  }
  console.log("=====================================================\n");
};

/**
 * Handle 'sessions' command
 */
const handleSessions = () => {
  console.log("\n=================== ACTIVE SESSIONS ===================");
  const sessionsDir = path.join(process.cwd(), "sessions");
  if (!fs.existsSync(sessionsDir)) {
    console.log("No sessions directory exists yet.");
    console.log("=======================================================\n");
    return;
  }

  const files = fs.readdirSync(sessionsDir);
  const sessionFiles = files.filter((f) => f.endsWith(".session"));

  if (sessionFiles.length === 0) {
    console.log("No active session files found.");
  } else {
    sessionFiles.forEach((file) => {
      const stats = fs.statSync(path.join(sessionsDir, file));
      console.log(
        `- File: ${file} (Size: ${(stats.size / 1024).toFixed(2)} KB, Last Modified: ${stats.mtime.toLocaleString()})`
      );
    });
  }
  console.log("=======================================================\n");
};

/**
 * Handle 'stats' command
 */
const handleStats = async () => {
  try {
    console.log("\n=================== ASSISTANT STATS ===================");
    const msgStats = await messageRepository.getStats();
    const leadCount = await leadRepository.count();
    const leads = await leadRepository.findAll(5);

    console.log(`Total Messages Logged:  ${msgStats.total}`);
    console.log(`Incoming Messages:      ${msgStats.incoming}`);
    console.log(`AI Replies Sent:        ${msgStats.outgoing}`);
    console.log(`CRM Leads Captured:     ${leadCount}`);

    if (leads.length > 0) {
      console.log("\nRecent Leads Captured:");
      leads.forEach((lead, idx) => {
        console.log(`  ${idx + 1}. Name: ${lead.name} (@${lead.username || "none"})`);
        console.log(`     Keywords Matched: [${lead.keywordsMatched.join(", ")}]`);
        console.log(
          `     Last Message: "${lead.lastMessage.substring(0, 40)}${lead.lastMessage.length > 40 ? "..." : ""}"`
        );
        console.log(`     Status: ${lead.status} | Added: ${lead.createdAt.toLocaleString()}`);
      });
    } else {
      console.log("\nNo leads captured yet.");
    }
    console.log("=======================================================\n");
  } catch (error) {
    logger.error(`Error fetching statistics: ${error}`);
  }
};

/**
 * Bootstrap the application
 */
const bootstrap = async () => {
  try {
    logger.info("Bootstrapping Telegram Personal AI Assistant...");

    // 1. Connect to MongoDB
    await connectDatabase();

    // 2. Start Express API Server
    server = app.listen(config.PORT, () => {
      logger.info(`Express API Server listening on port ${config.PORT}`);
    });

    // 3. Start Python Telethon Microservice
    processManager.start();

    // 4. Start Cron Background Jobs
    cronService.start();

    // 5. Start Admin Command Line Interface
    startCLI();
  } catch (error) {
    logger.error(`Failed to bootstrap application: ${error}`);
    process.exit(1);
  }
};

bootstrap();
