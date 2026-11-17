import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
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
      const allowed = [config.clientUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'];
      if (allowed.includes(origin) || origin.endsWith(':3000')) {
        return callback(null, true);
      }
      return callback(null, true); // Dev mode: allow client connection
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve local upload assets in development
const localUploadsPath = path.resolve(process.cwd(), '.local-uploads');
app.use('/api/media/local', express.static(localUploadsPath));

// API Routes
app.use('/api', apiRouter);

// Global Error Handler (Guarantees JSON response instead of plain text 500 HTML)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[API ERROR]', err);
  const status = typeof err.status === 'number' ? err.status : 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
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
});

app.get('/', (_req, res) => {
  res.json({
    name: 'Zimor Backend API Server',
    status: 'running',
    docs: '/api',
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`[ZIMOR BACKEND] API server running on http://0.0.0.0:${config.port} (accessible via localhost:${config.port})`);
    console.log(`[ZIMOR BACKEND] Database provider: ${config.useMockDb ? 'Local JSON' : 'MongoDB Atlas'}`);
    console.log(`[ZIMOR BACKEND] Media provider:    ${config.useMockMedia ? 'Local Storage' : 'Cloudinary'}`);
    console.log(`[ZIMOR BACKEND] Payment provider:  ${config.useMockPayment ? 'Mock Sandbox' : 'Razorpay'}`);
  });
}

export default app;
