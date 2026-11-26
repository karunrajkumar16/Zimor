import { app } from './server.js';
import type { Request, Response } from 'express';

/**
 * ZIMOR Serverless Express Handler
 * Entry point for Vercel Serverless Functions and cloud serverless runtimes.
 * Delegates incoming HTTP requests directly to the configured Express application.
 */
export default function handler(req: Request, res: Response) {
  return app(req, res);
}

export { app };
