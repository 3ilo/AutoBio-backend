import express, { Express } from 'express';
import mongoose from 'mongoose';
const cookieParser = require('cookie-parser');
const app: Express = express();
const cors = require('cors');
const config = require('./utils/config');
const logger = require('./utils/logger');
const whitelist = ['http://localhost:5173'];
const rootRouter = require('./controllers/root');
const authRouter = require('./controllers/auth');

// Middlewares
app.use(express.json());
app.use(cors({ origin: whitelist, credentials: true }));
app.use(cookieParser());
app.use(express.static('dist'));
app.use('/api/', rootRouter);
app.use('/api/auth/', authRouter);

// DB connection
mongoose.set('strictQuery', false);

logger.info('connecting to', config.MONGODB_URI ?? '');

mongoose
  .connect(config.MONGODB_URI ?? '')
  .then((_: any) => {
    logger.info('connected to MongoDB');
  })
  .catch((error: any) => {
    logger.error('error connecting to MongoDB:', error.message);
  });

module.exports = app;
