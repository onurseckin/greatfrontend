#!/usr/bin/env bun

/**
 * Clean Build Script
 *
 * This script cleans all build artifacts, caches, and node_modules,
 * then reinstalls dependencies for a fresh start.
 */

/* eslint-env node */
/* global Bun, process */

import { $ } from 'bun';

// Directories and files to clean
const CLEAN_TARGETS = [
  // Build outputs (root level)
  'dist',
  'out',
  'build',

  // Build outputs (all apps)
  'apps/*/dist',
  'apps/*/out',
  'apps/*/build',
  'apps/frontend/dist',
  'apps/backend/dist',

  // Node modules (root and all apps)
  'node_modules',
  'apps/*/node_modules',
  'apps/frontend/node_modules',
  'apps/backend/node_modules',

  // Cache files (root and apps)
  '.cache',
  '.eslintcache',
  '*.tsbuildinfo',
  'apps/*/*.tsbuildinfo',
  'apps/frontend/*.tsbuildinfo',
  'apps/backend/*.tsbuildinfo',

  // Coverage
  'coverage',
  '*.lcov',
  'apps/*/coverage',

  // Logs
  'logs',
  '*.log',
  'apps/*/*.log',
  'report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json',

  // Lock files (will be regenerated)
  'bun.lockb',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'apps/*/bun.lockb',
  'apps/*/package-lock.json',
  'apps/*/yarn.lock',
  'apps/*/pnpm-lock.yaml',

  // Temporary files
  '*.tmp',
  '*.temp',
  '.tmp',
  '.temp',
  'apps/*/*.tmp',
  'apps/*/*.temp',

  // NX cache and artifacts
  '.nx',
  '**/.nx/**',
  'nx.json.bak',
  'apps/*/.nx',
  'apps/*/nx.json.bak',

  // Vite cache
  'apps/frontend/.vite',
  'apps/frontend/node_modules/.vite',

  // TypeScript cache
  'apps/frontend/.tsbuildinfo',
  'apps/backend/.tsbuildinfo',

  // Debug output
  'debug/*.html',

  // Development artifacts
  'apps/frontend/.turbo',
  'apps/backend/.turbo',
];

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

  console.log(`${colors[type]}[CLEANER] ${message}${colors.reset}`);
}

async function cleanTarget(target: string): Promise<void> {
  try {
    // Check if it's a glob pattern
    if (target.includes('*')) {
      await $`rm -rf ${target}`.quiet();
      log(`Cleaned: ${target}`, 'success');
    } else {
      const file = Bun.file(target);
      if (await file.exists()) {
        await $`rm -rf ${target}`.quiet();
        log(`Cleaned: ${target}`, 'success');
      } else {
        log(`Skipped (not found): ${target}`, 'warn');
      }
    }
  } catch (error) {
    log(`Failed to clean ${target}: ${error}`, 'error');
  }
}

async function main() {
  log('🧹 Starting cleanup process...', 'info');

  // Step 1: Clean all targets
  log('📁 Cleaning build artifacts and caches...', 'info');
  for (const target of CLEAN_TARGETS) {
    await cleanTarget(target);
  }

  // Step 2: Clean Nx cache using CLI
  log('🧹 Cleaning Nx cache using CLI...', 'info');
  try {
    await $`npx nx reset`.quiet();
    log('Nx cache reset successfully', 'success');
  } catch (error) {
    log(`Warning: Could not reset Nx cache via CLI: ${error}`, 'warn');
    log('Continuing with manual cleanup...', 'info');
  }

  // Step 3: Clean any remaining cache directories
  log('🗑️  Cleaning additional cache directories...', 'info');
  try {
    await $`find . -name "*.tsbuildinfo" -delete`.quiet();
    await $`find . -name ".DS_Store" -delete`.quiet();
    log('Cleaned TypeScript build info and system files', 'success');
  } catch (error) {
    log(`Warning: Could not clean some cache files: ${error}`, 'warn');
  }

  // Step 4: Reinstall dependencies for all projects
  log('📦 Installing fresh dependencies...', 'info');
  try {
    // Install root dependencies
    await $`bun install --force`;
    log('Root dependencies installed', 'success');

    // Install frontend dependencies
    await $`cd apps/frontend && bun install --force`;
    log('Frontend dependencies installed', 'success');

    // Install backend dependencies
    await $`cd apps/backend && bun install --force`;
    log('Backend dependencies installed', 'success');

    log('All dependencies installed successfully', 'success');
  } catch (error) {
    log(`Failed to install dependencies: ${error}`, 'error');
    process.exit(1);
  }

  log('✨ Cleanup completed successfully!', 'success');
  log('🚀 Your project is now ready for a fresh start.', 'info');
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
