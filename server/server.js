import path from 'path';
import { CONFIG_DIR, CLIENT_DIR, UPLOADS_DIR } from './config/dir.js';

import dotenv from 'dotenv';
dotenv.config({ path: path.join(CONFIG_DIR, 'config.env') });

import connectDB from './config/db.js';

import express from 'express';
import cookieParser from 'cookie-parser';

import cors from 'cors';
import { xss } from 'express-xss-sanitizer';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import morgan from 'morgan';
import colors from 'colors';

import errorHandler from './middleware/errorHandler.js';

import ingredientsRoutes from './routes/ingredientsRoutes.js';
import sandwichesRoutes from './routes/sandwichesRoutes.js';
import authRoutes from './routes/authRoutes.js';
import usersRoutes from './routes/usersRoutes.js';

connectDB();

const app = express();

// Rate limiter
app.use(
  '/api/',
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 500 requests per windowMs
    message: 'Too many requests, please try again later',
  }),
);
// CORS cross-domain access
app.use(
  cors({
    origin: (origin, callback) => {
      const isOriginAllowed = process.env.CLIENT_URL === origin || !origin;
      callback(null, isOriginAllowed);
    },
    credentials: true,
  }),
);

// ==== Logging ==== //
const morganFormat = process.env.NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(morgan(morganFormat));

// Body parser middleware
app.use(express.json({ limit: '5kb' }));
// Cookies parser
app.use(cookieParser());

// ==== Security ==== //
// parse URL-encoded data received from the client
app.use(express.urlencoded({ extended: true }));
// helmet: A middleware for securing Express apps by setting various HTTP headers
app.use(helmet({ crossOriginResourcePolicy: false }));
// xss-clean: A middleware for sanitizing user input (req.body, req.query, and req.params) to prevent XSS attacks
app.use(xss());
// hpp: A middleware for preventing HTTP Parameter Pollution attacks.
app.use(hpp());

// === Main routes === //
app.use('/api/v1/ingredients', ingredientsRoutes);
app.use('/api/v1/sandwiches', sandwichesRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);

// === Middleware === //
app.use(errorHandler);

// === Forward static content === //
// Front-End
app.use('/', express.static(CLIENT_DIR));
// Uploads folder
app.use('/uploads', express.static(UPLOADS_DIR));

// Logging
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Start server
const PORT = process.env.PORT || 5001;

const server = app.listen(
  PORT,
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.brightYellow.underline),
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});
