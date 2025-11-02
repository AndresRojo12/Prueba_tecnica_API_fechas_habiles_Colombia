import { Request, Response } from 'express';
import { DateTime } from 'luxon';
import { calculateNextWorkingDate } from '../services/workingDays.service.js';
import { WorkingDaysQuery, ErrorResponse, SuccessResponse } from '../types/workingDays.types.js';

export const calculateWorkingDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { days, hours, date } = req.query as unknown as WorkingDaysQuery;

    if (!days && !hours) {
      const error: ErrorResponse = {
        error: 'InvalidParameters',
        message: 'Debe enviar days y/o hours',
      };
      res.status(400).json(error);
      return;
    }

    const parsedDays = days ? Number(days) : 0;
    const parsedHours = hours ? Number(hours) : 0;

    if (isNaN(parsedDays) || isNaN(parsedHours)) {
      const error: ErrorResponse = {
        error: 'InvalidParameters',
        message: 'days y hours deben ser numéricos',
      };
      res.status(400).json(error);
      return;
    }

    //se mantiene en UTC
    const startDate = date
      ? DateTime.fromISO(date, { zone: 'utc' })
      : DateTime.utc();

    const result = await calculateNextWorkingDate(startDate, parsedDays, parsedHours);

    // ya viene en UTC desde el servicio
    const utcDate = result.toISO({ suppressMilliseconds: true });

    const response: SuccessResponse = { date: utcDate! };
    res.status(200).json(response);
  } catch (error: any) {
    const err: ErrorResponse = {
      error: 'ServerError',
      message: error.message,
    };
    res.status(503).json(err);
  }
};
