import { getCache } from "./cache";

const cache = getCache();
const PER_MINUTE_MAX = Number(process.env.RATE_LIMIT_MAX_PER_MIN || 20);
const PER_MONTH_MAX = Number(process.env.RATE_LIMIT_MAX_PER_MONTH || 500);

function minuteKey() {
  const now = new Date();
  const k = `${now.getUTCFullYear()}${now.getUTCMonth()+1}${now.getUTCDate()}${now.getUTCHours()}${now.getUTCMinutes()}`;
  return `rl:minute:${k}`;
}
function monthKey() {
  const now = new Date();
  const k = `${now.getUTCFullYear()}${now.getUTCMonth()+1}`;
  return `rl:month:${k}`;
}

export async function assertWithinLimits() {
  const perMin = await cache.incr(minuteKey());
  const perMonth = await cache.incr(monthKey());
  if (perMin > PER_MINUTE_MAX) throw new Error(`Per-minute limit exceeded.`);
  if (perMonth > PER_MONTH_MAX) throw new Error(`Monthly budget exceeded.`);
}
