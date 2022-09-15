import { zonedTimeToUtc } from 'date-fns-tz';

export const sleep = async (t) => new Promise((r) => setTimeout(r, t));

/**
 * Parses an ISO8601-compatible datetime string from our server.
 */
export const parseDatetimeString = (value) => {
  const loc = 'UTC';
  return zonedTimeToUtc(value, loc);
};

/**
 * Formats UTC dates in a consistent format for UI display.
 * */
export const formatDatetime = (datetime) => datetime
  .toISOString()
  .replace(/T/, ' ')
  .replace(/-/g, '/')
  .replace(/\..+/, ' UTC');
