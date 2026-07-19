export interface CsvWord {
  term: string;
  turkishMeaning: string;
  cefrLevel: string;
  domain: string;
  exampleSentence: string;
}

export interface ImportResult {
  totalRows: number;
  imported: number;
  skipped: number;
  errors: string[];
}

const CSV_HEADERS = [
  'term',
  'turkishMeaning',
  'cefrLevel',
  'domain',
  'exampleSentence',
];

export const VocabularyCsvService = {
  exportToCsv(words: CsvWord[]): string {
    const header = CSV_HEADERS.join(',');
    const rows = words.map((w) =>
      CSV_HEADERS.map((h) => {
        const value = w[h as keyof CsvWord] ?? '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    );
    return [header, ...rows].join('\n');
  },

  downloadCsv(words: CsvWord[], filename?: string): void {
    const csv = this.exportToCsv(words);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download =
      filename ??
      `vocabulary-export-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  },

  parseCsv(csvContent: string): CsvWord[] {
    const lines = csvContent.split('\n').filter((line) => line.trim());
    if (lines.length < 2) return [];

    const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const termIdx = header.indexOf('term');
    const meaningIdx = header.indexOf('turkishmeaning');
    const cefrIdx = header.indexOf('cefrlevel');
    const domainIdx = header.indexOf('domain');
    const exampleIdx = header.indexOf('examplesentence');

    return lines.slice(1).map((line) => {
      const values = this.parseCsvLine(line);
      return {
        term: values[termIdx] ?? '',
        turkishMeaning: values[meaningIdx] ?? '',
        cefrLevel: values[cefrIdx] ?? 'A1',
        domain: values[domainIdx] ?? 'General',
        exampleSentence: values[exampleIdx] ?? '',
      };
    });
  },

  parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  },

  validateImport(words: CsvWord[]): ImportResult {
    const errors: string[] = [];
    let imported = 0;
    let skipped = 0;

    words.forEach((word, index) => {
      if (!word.term || word.term.length < 2) {
        errors.push(`Row ${index + 2}: Empty or too short term`);
        skipped++;
        return;
      }
      if (!word.turkishMeaning) {
        errors.push(`Row ${index + 2}: Missing Turkish meaning`);
        skipped++;
        return;
      }
      if (!['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(word.cefrLevel)) {
        errors.push(`Row ${index + 2}: Invalid CEFR level "${word.cefrLevel}"`);
        skipped++;
        return;
      }
      imported++;
    });

    return { totalRows: words.length, imported, skipped, errors };
  },

  formatImportSummary(result: ImportResult): string {
    const lines = [
      `Import Summary:`,
      `  Total rows: ${result.totalRows}`,
      `  Imported: ${result.imported}`,
      `  Skipped: ${result.skipped}`,
    ];
    if (result.errors.length > 0) {
      lines.push(`  Errors:`);
      result.errors.forEach((e) => lines.push(`    - ${e}`));
    }
    return lines.join('\n');
  },
};
