export const getCefrColor = (band: string) => {
  if (band.startsWith('C'))
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (band.startsWith('B'))
    return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-blue-600 bg-blue-50 border-blue-200';
};
