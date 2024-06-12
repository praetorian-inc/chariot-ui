export function appendPeriodIfMissing(error: string) {
  const endsWithDot = error.endsWith('.');

  return error + (endsWithDot ? '' : '.');
}
