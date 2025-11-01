//Manejador de ruta personalisada para calcular fechas laborales
import {  Router  } from 'express';
import { calculateWorkingDate } from '../controllers/workingDays.controller';
const router = Router();

router.get('/calculate-date', calculateWorkingDate)

export default router;