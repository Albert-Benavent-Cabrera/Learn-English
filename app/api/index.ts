import type { Application, Request, Response } from 'express';
import { createServer } from '../server/index.js';

// Cache the Express app instance
let appInstance: Application | undefined;

export default async function handler(req: Request, res: Response) {
    if (!appInstance) {
        const { app } = await createServer();
        appInstance = app;
    }

    // Pass the request to Express
    appInstance(req, res);
}
