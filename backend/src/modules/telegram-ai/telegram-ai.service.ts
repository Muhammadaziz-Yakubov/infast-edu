import { Injectable, OnApplicationBootstrap, OnApplicationShutdown, Logger } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class TelegramAiService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger('TelegramAiService');
  private agentProcess: ChildProcess | null = null;
  private readonly agentUrl = 'http://127.0.0.1:5000/api/telegram';

  onApplicationBootstrap() {
    this.startAgentProcess();
  }

  onApplicationShutdown() {
    this.stopAgentProcess();
  }

  private startAgentProcess() {
    if (this.agentProcess) {
      this.logger.warn('AI Agent process is already running.');
      return;
    }

    const agentDir = path.join(process.cwd(), 'AIAGENT');
    this.logger.log(`Starting AI Agent Node process from: ${agentDir}`);

    if (!fs.existsSync(agentDir)) {
      this.logger.error(`AIAGENT directory not found at: ${agentDir}`);
      return;
    }

    const isDev = fs.existsSync(path.join(process.cwd(), 'src'));
    const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const args = isDev ? ['run', 'dev'] : ['run', 'start'];

    try {
      this.agentProcess = spawn(command, args, {
        cwd: agentDir,
        stdio: 'inherit',
        shell: true,
        env: process.env,
      });

      this.agentProcess.on('error', (err) => {
        this.logger.error(`Failed to start AI Agent process: ${err.message}`);
      });

      this.agentProcess.on('exit', (code, signal) => {
        this.logger.warn(`AI Agent process exited with code ${code} and signal ${signal}`);
        this.agentProcess = null;
      });
    } catch (error) {
      this.logger.error(`Error spawning AI Agent process: ${error.message}`);
    }
  }

  private stopAgentProcess() {
    if (this.agentProcess) {
      this.logger.log('Shutting down AI Agent process...');
      this.agentProcess.kill('SIGTERM');
      this.agentProcess = null;
    }
  }

  async getStatus() {
    try {
      const res = await fetch(`${this.agentUrl}/status`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (error) {
      return { connected: false, authorized: false, error: error.message };
    }
  }

  async startAgent() {
    try {
      const res = await fetch(`${this.agentUrl}/start`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async stopAgent() {
    try {
      const res = await fetch(`${this.agentUrl}/stop`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async submitCode(code: string) {
    try {
      const res = await fetch(`${this.agentUrl}/submit-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      const res = await fetch(`${this.agentUrl}/logout`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
