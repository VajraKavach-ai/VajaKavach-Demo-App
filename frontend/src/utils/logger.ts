export const frontendLogger = {
  info: (message: string, meta?: any) => {
    sendLog('info', message, meta);
  },

  warn: (message: string, meta?: any) => {
    sendLog('warn', message, meta);
  },

  error: (message: string, meta?: any) => {
    sendLog('error', message, meta);
  },

  debug: (message: string, meta?: any) => {
    sendLog('debug', message, meta);
  },
};

async function sendLog(level: string, message: string, meta?: any) {
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, message, meta, timestamp: new Date().toISOString() }),
    });
  } catch (e) {
    // Silently fail to avoid recursion
    console.error('Failed to send log:', e);
  }
}
