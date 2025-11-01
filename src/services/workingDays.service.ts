// luxon para manejo de fechas y zonas horarias
import { DateTime } from 'luxon';
// Función para obtener festivos colombianos
import { getColombianHolidays } from '../utils/holidays.js';

//Definición de constantes principales de horario laboral en Colombia
const TIMEZONE = 'America/Bogota';// zona horaria de Colombia
const WORK_START = 8;// inicio jornada laboral
const LUNCH_START = 12;// inicio almuerzo
const LUNCH_END = 13; // fin almuerzo
const WORK_END = 17;  // fin jornada laboral

// función principal para calcular la siguiente fecha laboral
export async function calculateNextWorkingDate(
  date: DateTime,// fecha inicial
  days: number = 0,// días hábiles a sumar
  hours: number = 0 // horas hábiles a sumar
): Promise<DateTime> {
  // Simular un error
 // throw new Error('Error simulado del servicio')

 // se mapean los festivos colombianos
  const holidays = await getColombianHolidays();

  // Convertir la fecha inicial a zona horaria de Colombia
  let current = date.setZone(TIMEZONE);

  // si la hora inicial no está en horario laboral, mover hacia atrás al último instante laboral válido
  // si la fecha/hora inicial cae un sado/domingo o festivo, o fuera de horario laboral 
  // se ajusta hacia atrás al último instante laboral válido
  current = moveBackToNearestWorkingTime(current, holidays);

  // 3) Primero sumar días hábiles: conservar la hora del current
  if (days > 0) {
    current = addWorkingDaysPreserveTime(current, days, holidays);
  }

  // 4) Luego sumar horas hábiles continuas
  if (hours > 0) {
    current = addWorkingHours(current, hours, holidays);
  }

  // 5) Convertir a UTC y retornar (sin ms)
  return current.toUTC().set({ millisecond: 0 });
}

/* ---------------- Helpers ---------------- */

function isHoliday(dt: DateTime, holidays: string[]): boolean {
  const ymd = dt.toISODate();
  return ymd ? holidays.includes(ymd) : false;
}

function isWeekend(dt: DateTime): boolean {
  return dt.weekday === 6 || dt.weekday === 7;
}

function isWorkingDay(dt: DateTime, holidays: string[]): boolean {
  return !isWeekend(dt) && !isHoliday(dt, holidays);
}

function isWithinWorkingHours(dt: DateTime): boolean {
  const minutes = dt.hour * 60 + dt.minute;
  const start = WORK_START * 60;
  const lunchStart = LUNCH_START * 60;
  const lunchEnd = LUNCH_END * 60;
  const end = WORK_END * 60;
  if (minutes >= start && minutes < lunchStart) return true;
  if (minutes >= lunchEnd && minutes < end) return true;
  return false;
}

/**
 * Aproxima hacia atrás al último momento laboral válido según reglas:
 * - si día no hábil -> retrocede al día anterior a las 17:00 y repite hasta día hábil
 * - si hora >= 17:00 -> set 17:00 mismo día
 * - si entre 12:00-12:59 -> set 12:00 (inicio del almuerzo)
 * - si hora < 8:00 -> retrocede al día anterior 17:00
 */
function moveBackToNearestWorkingTime(dtInput: DateTime, holidays: string[]): DateTime {
  let dt = dtInput.setZone(TIMEZONE);
  while (true) {
    if (!isWorkingDay(dt, holidays)) {
      dt = dt.minus({ days: 1 }).set({ hour: WORK_END, minute: 0, second: 0, millisecond: 0 });
      continue;
    }
    if (dt.hour >= WORK_END) {
      dt = dt.set({ hour: WORK_END, minute: 0, second: 0, millisecond: 0 });
      return dt;
    }
    if (dt.hour >= LUNCH_START && dt.hour < LUNCH_END) {
      dt = dt.set({ hour: LUNCH_START, minute: 0, second: 0, millisecond: 0 });
      return dt;
    }
    if (dt.hour < WORK_START) {
      dt = dt.minus({ days: 1 }).set({ hour: WORK_END, minute: 0, second: 0, millisecond: 0 });
      continue;
    }
    // ya está dentro de un periodo laboral válido
    return dt.set({ second: 0, millisecond: 0 });
  }
}

/**
 * Añade N días hábiles preservando la hora del 'current' (la ajusta si cae en almuerzo/after-work)
 */
function addWorkingDaysPreserveTime(dtInput: DateTime, daysToAdd: number, holidays: string[]): DateTime {
  let dt = dtInput.setZone(TIMEZONE);
  let remaining = daysToAdd;
  while (remaining > 0) {
    dt = dt.plus({ days: 1 });
    if (isWorkingDay(dt, holidays)) {
      remaining--;
    }
  }
  // Preservar hora/minuto original
  const origHour = dtInput.hour;
  const origMinute = dtInput.minute;
  let candidate = dt.set({ hour: origHour, minute: origMinute, second: 0, millisecond: 0 });

  // Ajustes si cae en almuerzo o fuera de horario
  if (candidate.hour >= LUNCH_START && candidate.hour < LUNCH_END) {
    candidate = candidate.set({ hour: LUNCH_START, minute: 0 });
  }
  if (candidate.hour >= WORK_END) {
    candidate = candidate.set({ hour: WORK_END, minute: 0 });
  }
  if (candidate.hour < WORK_START) {
    // si queda antes de la jornada, retroceder al día previo a las 17:00 y re-aproximar hacia atrás
    candidate = candidate.minus({ days: 1 }).set({ hour: WORK_END, minute: 0 });
    candidate = moveBackToNearestWorkingTime(candidate, holidays);
  }
  return candidate;
}

/**
 * Añade X horas hábiles desde dtInput (que se asume ya ajustado a un momento laboral)
 * Respeta segmentos (8-12, 13-17), salta a siguiente día hábil cuando sea necesario.
 */
function addWorkingHours(dtInput: DateTime, hoursToAdd: number, holidays: string[]): DateTime {
  let dt = dtInput.setZone(TIMEZONE);
  let remainingMinutes = Math.round(hoursToAdd * 60);

  while (remainingMinutes > 0) {
    // Si no es día hábil o no está en working hours -> mover hacia atrás al último instante laboral (especificación)
    if (!isWorkingDay(dt, holidays) || !isWithinWorkingHours(dt)) {
      dt = moveBackToNearestWorkingTime(dt, holidays);
    }

    // determinar fin del segmento actual
    let segmentEnd: DateTime;
    if (dt.hour < LUNCH_START || (dt.hour === LUNCH_START && dt.minute === 0)) {
      segmentEnd = dt.set({ hour: LUNCH_START, minute: 0, second: 0, millisecond: 0 });
    } else {
      segmentEnd = dt.set({ hour: WORK_END, minute: 0, second: 0, millisecond: 0 });
    }

    const minutesAvailable = Math.max(0, Math.floor(segmentEnd.diff(dt, 'minutes').minutes));
    if (minutesAvailable >= remainingMinutes) {
      dt = dt.plus({ minutes: remainingMinutes });
      remainingMinutes = 0;
      break;
    } else {
      // consumir segmento y saltar al siguiente inicio válido
      remainingMinutes -= minutesAvailable;
      dt = segmentEnd;
      if (dt.hour === LUNCH_START) {
        dt = dt.set({ hour: LUNCH_END, minute: 0 });
      } else if (dt.hour === WORK_END) {
        // ir al siguiente día laboral a las 8:00
        dt = dt.plus({ days: 1 }).set({ hour: WORK_START, minute: 0, second: 0, millisecond: 0 });
        while (!isWorkingDay(dt, holidays)) {
          dt = dt.plus({ days: 1 });
        }
      }
    }
  }

  return dt;
}
