import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import projectRoutes from './src/routes/projectRoutes.js';
import featureRoutes from './src/routes/featureRoutes.js';

dotenv.config({ path: './backend/.env' });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/projetos', projectRoutes);
app.use('/api/funcs', featureRoutes);

app.get('/api', (req, res) => {
  res.send('GEP Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});