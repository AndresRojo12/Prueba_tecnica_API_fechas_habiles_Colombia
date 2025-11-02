import axios from "axios";
import * as dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
const HOLIDAYS_URL = process.env.HOLIDAYS_URL as string;

let holidaysCache: string[] = [];

export const getColombianHolidays = async (): Promise<string[]> => {
  if (holidaysCache.length > 0) return holidaysCache;
  const { data } = await axios.get(HOLIDAYS_URL);
  holidaysCache = data.map((h: string) => h.split("T")[0]);
  return holidaysCache;
};
