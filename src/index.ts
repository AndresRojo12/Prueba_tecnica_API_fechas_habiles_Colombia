import express from 'express';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

import workingDaysRoutes from './routes/workingDays.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Configurar __dirname

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(express.json());

// Puerto desde .env
const PORT = process.env.PORT || 3000;

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Rutas del módulo de días hábiles
app.use('/', workingDaysRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
