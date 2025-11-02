import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Load service-specific .env first so it can override root-level values
const serviceEnvPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: serviceEnvPath });

// Load root-level fallback if variables are still missing
dotenv.config({ override: false });

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 6002;

const app = express();

app.use(cors({
  origin: ['http://localhost:3000' , "http://localhost:3001"],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


app.use(express.json({ limit: '100mb' }));
app.use(cookieParser());



app.get('/', (req, res) => {
  res.send({ message: 'Hello from AUTH service' });
});


const server = app.listen(port, host, () => {
  console.log(`[ ready ] product service is running on  http://${host}:${port}`);
});


server.on('error', (err) => {
  console.error(err);
});