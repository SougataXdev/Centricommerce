/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import cors from 'cors';
import express from 'express';
import proxy from 'express-http-proxy';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const app = express();

app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: Request) => (req.user ? 1000 : 100),
  message: { error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req: Request) => ipKeyGenerator(req.ip ?? '127.0.0.1'),
});

app.use(limiter);

app.use(
  cors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(morgan('dev'));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());

app.get('/gateway', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});
const SERVICE_URL = process.env.SERVICE_URL || "http://localhost:6001";
app.use("/", proxy(SERVICE_URL));

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/gateway`);
  console.log(`Proxying requests to: ${SERVICE_URL}`);
});
server.on('error', console.error);
