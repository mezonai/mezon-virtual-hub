import moment from 'moment-timezone';

export function generateExampleDateTz(): string {
  const guessedTz = moment.tz.guess();
  return moment().tz(guessedTz).format();
}
