// Manejar errores
import { Request, Response, NextFunction } from "express";
import boom from "@hapi/boom";

// loguear los errores en consola
export const logError = (
  err: any,
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  console.error("Error", err);
  next(err);
};

// Manejador para errores lanzados con Boom
export const boomErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.isBoom) {
    const { statusCode, payload } = err.output;

    return res.status(statusCode).json({
      error: "InvalidParameters",
      message: payload.message,
    });
  }
  next(err);
};

// Manejador genérico para errores no controlados
export const genericErrorHandler = (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  res.status(503).json({
    error: "ServerError",
    message: "Error interno del servidor.",
  });
};
