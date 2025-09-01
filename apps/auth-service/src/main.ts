import express from 'express';
import cors from "cors"

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const app = express();

app.use(cors({
  origin: ['http://localhost:3000'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


app.get('/', (req, res) => {
  res.send({ message: 'Hello from AUTH service' });
});

const server = app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});


server.on('error', (err) => {
  console.error(err);
});