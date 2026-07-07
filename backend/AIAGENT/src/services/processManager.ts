import { spawn, ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import axios from "axios";
import { config } from "../config";
import { logger } from "../utils/logger";

export class TelegramProcessManager {
  private pythonProcess: ChildProcess | null = null;
  private isShuttingDown = false;

  /**
   * Start the Python Telethon microservice
   */
  start(): void {
    if (this.pythonProcess) {
      logger.warn("Telegram Python process is already running.");
      return;
    }

    const scriptPath = path.join(process.cwd(), "src", "telegram", "client.py");
    
    // Check if local virtualenv exists
    const venvPythonPath = process.platform === "win32"
      ? path.join(process.cwd(), ".venv", "Scripts", "python.exe")
      : path.join(process.cwd(), ".venv", "bin", "python");
    
    const pythonCommand = fs.existsSync(venvPythonPath) ? venvPythonPath : "python";
    logger.info(`Spawning Telegram Python microservice: ${pythonCommand} "${scriptPath}"`);

    // Spawn python process
    // We pipe stdin, stdout, and stderr so we can monitor output and write confirmation codes.
    this.pythonProcess = spawn(pythonCommand, [scriptPath], {
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env,
    });

    // Pipe Python stdout to Node.js logger/console
    this.pythonProcess.stdout?.on("data", (data) => {
      const output = data.toString().trim();
      if (output) {
        // Direct print to console since it might contain prompts like "Please enter your phone:"
        console.log(`[Telegram Client] ${output}`);
      }
    });

    // Pipe Python stderr to Node.js logger
    this.pythonProcess.stderr?.on("data", (data) => {
      const errorOutput = data.toString().trim();
      if (errorOutput) {
        logger.error(`[Telegram Client Error] ${errorOutput}`);
      }
    });

    // Handle process exit
    this.pythonProcess.on("exit", (code, signal) => {
      logger.warn(`Telegram Python process exited with code ${code} and signal ${signal}`);
      this.pythonProcess = null;

      // Auto-restart if we are not shutting down intentionally
      if (!this.isShuttingDown) {
        logger.info("Restarting Telegram Python microservice in 3 seconds...");
        setTimeout(() => this.start(), 3000);
      }
    });
  }

  /**
   * Send input (like login code) to the Python process stdin
   */
  sendInput(text: string): void {
    if (this.pythonProcess && this.pythonProcess.stdin) {
      logger.info(`Sending input to Telegram client...`);
      this.pythonProcess.stdin.write(text + "\n");
    } else {
      logger.warn("Cannot send input: Telegram Python process is not running.");
    }
  }

  /**
   * Terminate the Python process
   */
  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.pythonProcess) {
        resolve();
        return;
      }

      logger.info("Stopping Telegram Python process...");
      this.isShuttingDown = true;

      this.pythonProcess.once("exit", () => {
        this.isShuttingDown = false;
        resolve();
      });

      this.pythonProcess.kill("SIGTERM");
      // Fallback kill after 3 seconds
      setTimeout(() => {
        if (this.pythonProcess) {
          this.pythonProcess.kill("SIGKILL");
        }
      }, 3000);
    });
  }

  /**
   * Trigger a clean restart
   */
  async restart(): Promise<void> {
    logger.info("Restarting Telegram Python process...");
    this.isShuttingDown = true;
    await this.stop();
    this.isShuttingDown = false;
    this.start();
  }

  /**
   * Check microservice status via HTTP
   */
  async getStatus(): Promise<any> {
    const url = `http://${config.TELEGRAM_CLIENT_HOST}:${config.TELEGRAM_CLIENT_PORT}/status`;
    try {
      const response = await axios.get(url, { timeout: 2000 });
      return response.data;
    } catch (error: any) {
      return { connected: false, authorized: false, error: error.message };
    }
  }

  /**
   * Trigger logout via HTTP API
   */
  async logout(): Promise<boolean> {
    const url = `http://${config.TELEGRAM_CLIENT_HOST}:${config.TELEGRAM_CLIENT_PORT}/logout`;
    try {
      this.isShuttingDown = true; // prevent auto restart on exit
      logger.info(`Sending logout request to client...`);
      const response = await axios.post(url, {}, { timeout: 5000 });
      await this.stop();
      this.isShuttingDown = false;
      return response.data?.success || false;
    } catch (error: any) {
      logger.error(`Failed to send logout request: ${error.message}`);
      // Force kill process and manually clean session files
      await this.stop();
      this.isShuttingDown = false;
      return false;
    }
  }
}

export const processManager = new TelegramProcessManager();
