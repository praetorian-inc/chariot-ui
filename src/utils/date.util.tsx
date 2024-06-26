import {
  addDays as addDaysDateFns,
  format,
  formatDistanceToNow,
  parseISO,
  subDays,
} from 'date-fns';

/**
 * Formats a UTC date string to show relative time for recent dates up to a month ago,
 * and a fixed date format for older dates.
 *
 * @param {string} utcTimestamp - The UTC date string to format.
 * @return {string} - The formatted date string.
 */
export function formatDate(utcTimestamp: string, formatType = 'MMM d, yyyy') {
  // Check if the input is a valid UTC timestamp
  if (!utcTimestamp?.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)) {
    // check for YYYY-MM-DD format and return a nice format
    if (utcTimestamp?.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return format(parseISO(utcTimestamp), formatType);
    } else {
      return utcTimestamp; // Return the input as is
    }
  }

  // Convert the UTC string to a Date object
  const date = parseISO(utcTimestamp);

  // Calculate the date 30 days ago from now
  const currentDate = new Date();
  const thirtyDaysAgo = subDays(currentDate, 30);
  const oneDaysAgo = subDays(currentDate, 1);

  // If the date is more recent than 30 days ago, use relative formatting
  if (date > thirtyDaysAgo) {
    if (date > oneDaysAgo) {
      const hoursAgo = Math.abs(date.getHours() - currentDate.getHours());

      if (hoursAgo === 0) {
        const minutesAgo = Math.abs(
          currentDate.getMinutes() - date.getMinutes()
        );

        if (minutesAgo === 0) {
          return 'now';
        }

        const unit = minutesAgo === 1 ? 'minute' : 'minutes';
        return `${minutesAgo} ${unit} ago`;
      }
      const unit = hoursAgo === 1 ? 'hour' : 'hours';
      return `${hoursAgo} ${unit} ago`;
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } else {
    // Otherwise, use a fixed date format
    return format(date, formatType);
  }
}

/**
 * Sorts an array of objects by the date field 'updated' considering dates are in UTC.
 * Assumes 'updated' is a date in a string format that can be parsed by Date.parse.
 *
 * @param {Array<Object>} data - The array of objects to sort.
 * @return {Array<Object>} - Sorted array of objects.
 */
export function sortByDate<TData extends { updated: string }>(
  data: TData[]
): TData[] {
  if (!Array.isArray(data)) return [];
  return [...data].toSorted(
    (a, b) => Date.parse(b.updated) - Date.parse(a.updated)
  );
}

export function sToMs(seconds: number) {
  return seconds * 1000;
}

export function mToMs(minutes: number) {
  return sToMs(minutes * 60);
}

export function sToM(seconds: number) {
  return Math.floor(seconds / 60);
}

export function msToM(ms: number) {
  return Math.floor(ms / 60000);
}

export function subtractDays(date: Date, days: number) {
  return subDays(date, days);
}

export function addDays(date: Date, days: number) {
  return addDaysDateFns(date, days);
}
