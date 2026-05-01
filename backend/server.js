import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import logger from './middleware/logger.js';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import stationRoutes from './routes/stationRoutes.js';
import https from 'https';
import emergencyRoutes from './routes/emergencyRoutes.js'

dotenv.config();

// Render free dynos sleep after 15 minutes idle. Self-pinging keeps the
// instance warm. We only run this in production so it doesn't fire from a
// developer's laptop and cost free-tier minutes.
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    https.get('https://zappoint.onrender.com/ping');
  }, 9 * 60 * 1000);
}

const app = express();

app.set('trust proxy', 1); // trust the first proxy

// Connect to MongoDB
connectDB();

// Whitelist origins via CORS_ORIGINS env (comma-separated). Falls back to
// localhost for dev so the Vite dev server can hit the API. Previously this
// was wide-open `cors()` which let any origin call the API.
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:8080')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin / curl / server-to-server (no Origin header).
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(logger);
app.use(helmet()); // Set security-related HTTP headers

// Rate Limiting - limit each IP to 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);

// Health check route
app.get('/', (req, res) => {
  res.send('ZapPoint API is running...');
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/emergency', emergencyRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
