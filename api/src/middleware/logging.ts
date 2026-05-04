import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  // Capture the original send function
  const originalSend = res.send;
  res.send = function (data: any) {
    const duration = Date.now() - startTime;
    logger.access(req.method, req.path, res.statusCode, duration, ip);
    return originalSend.call(this, data);
  };

  next();
}
