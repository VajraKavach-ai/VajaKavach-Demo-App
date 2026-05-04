import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '../../..', 'logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  meta?: any;
}

function getLogFile(type: 'access' | 'error' | 'audit' | 'performance' | 'application' | 'frontend') {
  const today = new Date().toISOString().split('T')[0];
  const dayDir = path.join(logsDir, today);
  if (!fs.existsSync(dayDir)) {
    fs.mkdirSync(dayDir, { recursive: true });
  }
  return path.join(dayDir, `${type}.log`);
}

function maskSensitiveFields(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  const masked = { ...obj };
  if (masked.password) masked.password = '***REDACTED***';
  if (masked.email) masked.email = masked.email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
  if (masked.token) masked.token = '***REDACTED***';
  return masked;
}

function formatLogEntry(level: LogLevel, message: string, meta?: any): string {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    message,
    ...(meta && { meta: maskSensitiveFields(meta) }),
  };
  return JSON.stringify(entry);
}

export const logger = {
  access: (method: string, path: string, statusCode: number, duration: number, ip?: string) => {
    const msg = formatLogEntry('info', `${method} ${path} - ${statusCode}`, { duration, ip });
    console.log(msg);
    fs.appendFileSync(getLogFile('access'), msg + '\n');
  },

  error: (message: string, meta?: any) => {
    const msg = formatLogEntry('error', message, meta);
    console.error(msg);
    fs.appendFileSync(getLogFile('error'), msg + '\n');
  },

  warn: (message: string, meta?: any) => {
    const msg = formatLogEntry('warn', message, meta);
    console.warn(msg);
    fs.appendFileSync(getLogFile('error'), msg + '\n');
  },

  info: (message: string, meta?: any) => {
    const msg = formatLogEntry('info', message, meta);
    console.log(msg);
    fs.appendFileSync(getLogFile('application'), msg + '\n');
  },

  audit: (action: string, user: string, details: any) => {
    const msg = formatLogEntry('info', `AUDIT: ${action} by ${user}`, details);
    console.log(msg);
    fs.appendFileSync(getLogFile('audit'), msg + '\n');
  },

  performance: (operation: string, duration: number, meta?: any) => {
    const msg = formatLogEntry('warn', `PERF: ${operation} took ${duration}ms`, meta);
    if (duration > 100) console.warn(msg);
    fs.appendFileSync(getLogFile('performance'), msg + '\n');
  },

  frontend: (level: LogLevel, message: string, meta?: any) => {
    const msg = formatLogEntry(level, `[FRONTEND] ${message}`, meta);
    console.log(msg);
    fs.appendFileSync(getLogFile('frontend'), msg + '\n');
  },

  debug: (message: string, meta?: any) => {
    const msg = formatLogEntry('debug', message, meta);
    console.log(msg);
  },
};
