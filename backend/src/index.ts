import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import diagnosticRoutes from './routes/diagnosticRoutes';
import tutorRoutes from './routes/tutorRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'AULA AI Backend' });
});

app.use('/', diagnosticRoutes);
app.use('/tutor', tutorRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});