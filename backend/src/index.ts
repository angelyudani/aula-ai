import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import diagnosticRoutes from './routes/diagnosticRoutes';
import tutorRoutes from './routes/tutorRoutes';
import teacherRoutes from './routes/teacherRoutes';
import chatRoutes from './routes/chat';

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
app.use('/', teacherRoutes);
app.use('/api/chat', chatRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});