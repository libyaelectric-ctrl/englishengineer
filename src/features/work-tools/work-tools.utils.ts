export const restoreTurkish = (value: string): string => {
  const replacements: Array<[string, string]> = [
    ['Turkce', 'Türkçe'],
    ['duzelt', 'düzelt'],
    ['Duzelt', 'Düzelt'],
    ['kars', 'karş'],
    ['Kars', 'Karş'],
    ['uygunsuzlugu', 'uygunsuzluğu'],
    ['acik', 'açık'],
    ['Acik', 'Açık'],
    ['belirtir', 'belirtir'],
    ['olculebilir', 'ölçülebilir'],
    ['gecik', 'gecik'],
    ['Gecik', 'Gecik'],
    ['sorumlulugu', 'sorumluluğu'],
    ['dokuman', 'doküman'],
    ['onay', 'onay'],
    ['cik', 'çık'],
    ['sure', 'süre'],
    ['gerekli', 'gerekli'],
    ['teyit', 'teyit'],
    ['etkiliyor', 'etkiliyor'],
    ['planlanan', 'planlanan'],
    ['baslangic', 'başlangıç'],
    ['gosterilmedigi', 'gösterilmediği'],
    ['edilemez', 'edilemez'],
    ['oncelikli', 'öncelikli'],
    ['oldugunu', 'olduğunu'],
    ['icin', 'için'],
    ['icin', 'için'],
  ];
  return replacements.reduce(
    (result, [source, target]) => result.replaceAll(source, target),
    value
  );
};
