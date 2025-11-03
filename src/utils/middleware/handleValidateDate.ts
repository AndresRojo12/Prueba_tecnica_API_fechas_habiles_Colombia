// Middleware para validar los parámetros de consulta relacionados con días y horas hábiles
import { Request, Response, NextFunction } from "express";
import { DateTime } from "luxon";
import boom from "@hapi/boom";

// Función para validar numero válido
const isValidNumber = (value: any): boolean =>
  value !== undefined && !isNaN(Number(value));

// Función para validar fecha ISO UTC
const isValidISODate = (value: any): boolean => {
  const parsed = DateTime.fromISO(value as string, { zone: "utc" });
  return parsed.isValid;
};

export const validateWorkingDays = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { days, hours, date } = req.query;
    // validacion de parametros obligatorios
    if (days === undefined && hours === undefined) {
      throw boom.badRequest(
        "Se deben propocionar los parametros 'days' y/o 'hours'"
      );
    }

    // Validaciones  de tipos numéricos
    const numericErrors: string[] = [];
    if (days !== undefined && !isValidNumber(days))
      numericErrors.push("'days'");
    if (hours !== undefined && !isValidNumber(hours))
      numericErrors.push("'hours'");
    if (numericErrors.length > 0) {
      throw boom.badRequest(
        `Los parámetros ${numericErrors.join(" y ")} deben ser números válidos.`
      );
    }

    // Validación de fecha ISO
    if (date !== undefined && !isValidISODate(date)) {
      throw boom.badRequest(
        "El parámetro 'date' debe estar en formato ISO 8601 válido."
      );
    }

    // Marcar el orden de la suma
    if (days !== undefined && hours !== undefined) {
      (req as any).sumOrder = "daysFirst";
    }

    next();
  } catch (error) {
    next(error);
  }
};
