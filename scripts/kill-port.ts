#!/usr/bin/env bun

/**
 * Cross-Platform Port Killer Script
 *
 * This script kills processes running on specified ports.
 * It works on Windows, macOS, and Linux without stalling.
 */

/* eslint-env node */
/* global Bun, process */

import { $ } from 'bun';

async function log(
  message: string,
  type: 'info' | 'success' | 'error' | 'warn' = 'info'
) {
  const colors = {
    info: '\x1b[36m', // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m', // Red
    warn: '\x1b[33m', // Yellow
    reset: '\x1b[0m',
  };

  console.log(`${colors[type]}[KILL-PORT] ${message}${colors.reset}`);
}

async function killPort(port: number): Promise<boolean> {
  try {
    const platform = process.platform;
    let command: string;
    let pidExtractor: string;

    if (platform === 'win32') {
      // Windows
      command = `netstat -ano | findstr :${port}`;
      pidExtractor = `for /f "tokens=5" %a in ('${command}') do taskkill /PID %a /F`;
    } else {
      // macOS and Linux
      command = `lsof -ti:${port}`;
      pidExtractor = `lsof -ti:${port} | xargs -r kill -9 2>/dev/null || true`;
    }

    if (platform === 'win32') {
      // Windows approach
      try {
        const result = await $`netstat -ano | findstr :${port}`.quiet();
        if (result.exitCode === 0 && result.stdout.toString().trim()) {
          const lines = result.stdout.toString().trim().split('\n');
          for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 5) {
              const pid = parts[parts.length - 1];
              if (pid && !isNaN(Number(pid))) {
                try {
                  await $`taskkill /PID ${pid} /F`.quiet();
                  log(`Killed process ${pid} on port ${port}`, 'success');
                } catch (error) {
                  log(`Failed to kill process ${pid}: ${error}`, 'warn');
                }
              }
            }
          }
          return true;
        } else {
          log(`No processes running on port ${port}`, 'info');
          return false;
        }
      } catch (error) {
        log(`No processes running on port ${port}`, 'info');
        return false;
      }
    } else {
      // macOS and Linux approach
      try {
        const result = await $`lsof -ti:${port}`.quiet();

        if (result.exitCode === 0 && result.stdout.toString().trim()) {
          const pids = result.stdout
            .toString()
            .trim()
            .split('\n')
            .filter(Boolean);

          for (const pid of pids) {
            try {
              // Try graceful termination first
              await $`kill -TERM ${pid}`.quiet();
              log(`Sent TERM signal to PID ${pid} on port ${port}`, 'info');

              // Wait a bit for graceful shutdown
              await new Promise(resolve => setTimeout(resolve, 500));

              // Check if process is still running
              const stillRunning = await $`kill -0 ${pid}`.quiet();
              if (stillRunning.exitCode === 0) {
                // Force kill if still running
                await $`kill -KILL ${pid}`.quiet();
                log(`Force killed PID ${pid} on port ${port}`, 'warn');
              }
            } catch (error) {
              log(`Failed to kill PID ${pid}: ${error}`, 'error');
            }
          }

          log(`Killed processes on port ${port}`, 'success');
          return true;
        } else {
          log(`No processes running on port ${port}`, 'info');
          return false;
        }
      } catch (error) {
        log(`No processes running on port ${port}`, 'info');
        return false;
      }
    }
  } catch (error) {
    log(`Error checking port ${port}: ${error}`, 'error');
    return false;
  }
}

async function main() {
  const ports = process.argv
    .slice(2)
    .map(Number)
    .filter(n => !isNaN(n));

  if (ports.length === 0) {
    log('Usage: bun scripts/kill-port.ts <port1> [port2] [port3] ...', 'error');
    log('Example: bun scripts/kill-port.ts 5173 3000', 'info');
    process.exit(1);
  }

  log(`Killing processes on ports: ${ports.join(', ')}`, 'info');

  let killedAny = false;
  for (const port of ports) {
    const killed = await killPort(port);
    if (killed) killedAny = true;
  }

  if (killedAny) {
    log('Port cleanup completed', 'success');
  } else {
    log('No processes were running on the specified ports', 'info');
  }
}

// Handle errors gracefully
process.on('uncaughtException', error => {
  log(`Uncaught error: ${error.message}`, 'error');
  process.exit(1);
});

process.on('unhandledRejection', reason => {
  log(`Unhandled rejection: ${reason}`, 'error');
  process.exit(1);
});

// Run the main function
main().catch(error => {
  log(`Script failed: ${error.message}`, 'error');
  process.exit(1);
});
