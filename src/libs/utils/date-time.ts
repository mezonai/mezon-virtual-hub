import moment from 'moment-timezone';

export function generateExampleDateTz(): string {
  const guessedTz = 'Asia/Ho_Chi_Minh';
  return moment().tz(guessedTz).format();
}
