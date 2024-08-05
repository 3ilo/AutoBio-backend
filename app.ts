import express, { Express } from 'express';
import mongoose from 'mongoose';
import "express-async-errors";

const cookieParser = require('cookie-parser');
const app: Express = express();
const cors = require('cors');
const config = require('./utils/config')
const logger = require('./utils/logger')
const whitelist = ['http://localhost:5173'];
const rootRouter = require('./controllers/root')
const authRouter = require('./controllers/auth')
const memoriesRouter = require('./controllers/memories')
const illustrationsRouter = require('./controllers/illustrations')
const errorHandler = require('./utils/middleware/errorHandler')
const path = require('path');

// Middlewares
app.use(express.json());
app.use(cors({ origin: whitelist, credentials: true }));
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, 'dist')));
app.use('/api/', rootRouter)
app.use('/api/auth/', authRouter)
app.use('/api/memories/', memoriesRouter)
app.use('/api/illustrations/', illustrationsRouter)

// Static serve frontend
app.get('*', function (req, res) {
    res.sendFile(path.resolve(__dirname, 'dist/index.html'));
  });

// DB connection
mongoose.set('strictQuery', false)

logger.info('connecting to ' + config.MONGODB_URI ?? '')

mongoose
  .connect(config.MONGODB_URI ?? '')
  .then((_: any) => {
    logger.info('connected to MongoDB');
  })
  .catch((error: any) => {
    logger.error('error connecting to MongoDB:', error.message);
  });

// Handle errors
app.use(errorHandler);

module.exports = app