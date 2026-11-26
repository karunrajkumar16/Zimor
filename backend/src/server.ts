// Initialize DNS resilience and IPv4 prioritization before any network requests
import './utils/networkDiagnostic.js';
import { diagnoseGoogleOAuthConnectivity } from './utils/networkDiagnostic.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { validateOrigin } from './auth/originValidator.js';
import apiRouter from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use((req, _res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      if (validateOrigin(origin)) {
        return callback(null, true);
      }
      if (!config.isProduction) {
        return callback(null, true); // Dev mode fallback
      }
      return callback(new Error(`CORS blocked for untrusted origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
app.use(cookieParser());
app.use(
  express.json({
    limit: '50mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve local upload assets in development only
if (!config.isProduction) {
  const localUploadsPath = path.resolve(process.cwd(), '.local-uploads');
  app.use('/api/media/local', express.static(localUploadsPath));
}

// Health check endpoints (available on /health, /api/health, /, and /api)
const healthHandler = (_req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    service: 'Zimor Luxury Backend API',
    providers: {
      database: config.useMockDb ? 'json' : 'mongodb',
      media: config.useMockMedia ? 'local' : 'cloudinary',
      payment: config.useMockPayment ? 'mock' : 'razorpay',
    },
    timestamp: new Date().toISOString(),
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

const rootHandler = (_req: express.Request, res: express.Response) => {
  res.json({
    name: 'Zimor Backend API Server',
    status: 'running',
    docs: '/api',
  });
};

app.get('/', rootHandler);
app.get('/api', rootHandler);

// API Routes: Dual mounted to support direct /api/* calls as well as serverless rewrite paths
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Global Error Handler (Guarantees JSON response instead of plain text 500 HTML)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[API ERROR]', err);
  const status = typeof err.status === 'number' ? err.status : 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Start Server: Only start HTTP listener when running as a standalone server, never in Vercel or test environment
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const isTest = process.env.NODE_ENV === 'test';

if (!isServerless && !isTest) {
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`[ZIMOR BACKEND] API server running on http://0.0.0.0:${config.port} (accessible via localhost:${config.port})`);
    console.log(`[ZIMOR BACKEND] Database provider: ${config.useMockDb ? 'Local JSON' : 'MongoDB Atlas'}`);
    console.log(`[ZIMOR BACKEND] Media provider:    ${config.useMockMedia ? 'Local Storage' : 'Cloudinary'}`);
    console.log(`[ZIMOR BACKEND] Payment provider:  ${config.useMockPayment ? 'Mock Sandbox' : 'Razorpay'}`);

    // Asynchronously verify Google OAuth endpoint reachability on startup (non-blocking)
    diagnoseGoogleOAuthConnectivity().catch((err) => {
      console.warn('[ZIMOR BACKEND] Startup connectivity diagnostic warning:', err?.message || err);
    });
  });
}

export { app };
export default app;
