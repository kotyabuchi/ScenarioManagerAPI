export const parseNumber = (str: string): number => {
  if (typeof str !== 'string') return NaN;
  if (str.length === 0) return NaN;
  return Number(str);
};
