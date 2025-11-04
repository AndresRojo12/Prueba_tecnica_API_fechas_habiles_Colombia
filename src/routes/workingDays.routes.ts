//Manejador de ruta personalisada para calcular fechas laborales
import { Router } from "express";
import { calculateWorkingDate } from "../controllers/workingDays.controller.js";
import { validateWorkingDays } from "../utils/middleware/handleValidateDate.js";
const router = Router();

router.get("/calculate-date", validateWorkingDays, calculateWorkingDate);

export default router;
