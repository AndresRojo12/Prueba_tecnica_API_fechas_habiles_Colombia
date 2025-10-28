import axios from 'axios';

const HOLIDAYS_URL = 'https://content.capta.co/Recruitment/WorkingDays.json';

let holidaysCache: string[] = [];

export const getColombianHolidays = async (): Promise<string[]> => {
  if (holidaysCache.length > 0) return holidaysCache;
  const { data } = await axios.get(HOLIDAYS_URL);
  holidaysCache = data.map((h: string) => h.split('T')[0]);
  return holidaysCache;
};
