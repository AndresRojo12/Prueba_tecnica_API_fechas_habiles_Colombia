import { Request, Response } from "express";
import { DateTime } from "luxon";
import { calculateNextWorkingDate } from "../services/workingDays.service.js";
import {
  WorkingDaysQuery,
  SuccessResponse,
  ErrorResponse,
} from "../types/workingDays.types.js";

export const calculateWorkingDate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { days, hours, date } = req.query as unknown as WorkingDaysQuery;

    const parsedDays = days ? Number(days) : 0;
    const parsedHours = hours ? Number(hours) : 0;

    // Ya validado por el middleware: si no viene date, usamos UTC actual
    const startDate = date
      ? DateTime.fromISO(date, { zone: "utc" })
      : DateTime.utc();

    const result = await calculateNextWorkingDate(
      startDate,
      parsedDays,
      parsedHours
    );
    const utcDate = result.toISO({ suppressMilliseconds: true });

    const response: SuccessResponse = { date: utcDate! };
    res.status(200).json(response);
  } catch (error: any) {
    const err: ErrorResponse = {
      error: "ServerError",
      message: error.message || "Error interno del servidor.",
    };
    res.status(503).json(err);
  }
};
