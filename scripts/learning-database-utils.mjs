import fs from 'node:fs/promises';
import path from 'node:path';
import readXlsxFile from 'read-excel-file/node';
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import prettier from 'prettier';

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const normalizeEmptyInlineStrings = (buffer) => {
  const archive = unzipSync(new Uint8Array(buffer));
  for (const [name, bytes] of Object.entries(archive)) {
    if (!name.startsWith('xl/worksheets/') || !name.endsWith('.xml')) continue;
    const xml = strFromU8(bytes);
    const normalized = xml
      .replace(/<c([^>]*?)\s+t="inlineStr"([^>]*)>\s*<\/c>/g, '<c$1$2></c>')
      .replace(/<c([^>]*?)\s+t="inlineStr"([^>]*)\/>/g, '<c$1$2/>');
    archive[name] = strToU8(normalized);
  }
  return Buffer.from(zipSync(archive));
};

export const readDatabaseSheet = async (filePath, sheetName) => {
  const source = await fs.readFile(filePath);
  const rows = await readXlsxFile(normalizeEmptyInlineStrings(source), {
    sheet: sheetName,
  });
  if (rows.length < 2) throw new Error(`${sheetName} has no data rows.`);

  const headers = rows[0].map((value) => String(value ?? '').trim());
  const records = rows
    .slice(1)
    .map((row) =>
      Object.fromEntries(
        headers.map((header, columnIndex) => [header, row[columnIndex] ?? null])
      )
    );
  return { headers, records, sourceRowOffset: 2 };
};

export const requireColumns = (headers, required, databaseName) => {
  const missing = required.filter((column) => !headers.includes(column));
  if (missing.length > 0) {
    throw new Error(
      `${databaseName} is missing required columns: ${missing.join(', ')}`
    );
  }
};

export const text = (value) => String(value ?? '').trim();

export const number = (value) => {
  const parsed = Number.parseFloat(text(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const boolean = (value) =>
  value === true || ['true', 'yes', '1'].includes(text(value).toLowerCase());

export const list = (value) =>
  text(value)
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean);

export const unique = (values) => [...new Set(values)].sort();

export const distribution = (records, field) =>
  Object.fromEntries(
    unique(records.map((record) => record[field])).map((value) => [
      value,
      records.filter((record) => record[field] === value).length,
    ])
  );

export const duplicateValues = (records, field) => {
  const counts = new Map();
  for (const record of records) {
    const value = record[field];
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([value, count]) => ({ value, count }));
};

export const writeJson = async (filePath, value) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const source = await prettier.format(JSON.stringify(value), {
    parser: 'json',
  });
  await fs.writeFile(filePath, source, 'utf8');
};

export const writeSeedFile = async ({
  filePath,
  typeImport,
  typeName,
  exportName,
  records,
}) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const serialized = JSON.stringify(records);
  const chunks = [];
  for (let index = 0; index < serialized.length; index += 16_000) {
    let end = Math.min(index + 16_000, serialized.length);
    if (
      end < serialized.length &&
      serialized.charCodeAt(end - 1) >= 0xd800 &&
      serialized.charCodeAt(end - 1) <= 0xdbff
    ) {
      end -= 1;
    }
    chunks.push(serialized.slice(index, end));
    index = end - 16_000;
  }
  const serializedParts = chunks
    .map((chunk) => JSON.stringify(chunk))
    .join(',\n');
  const source = await prettier.format(
    `import type { ${typeName} } from '${typeImport}';\n\nconst serializedParts: string[] = [\n${serializedParts}\n];\n\nexport const ${exportName} = JSON.parse(serializedParts.join('')) as ${typeName}[];\n`,
    {
      parser: 'typescript',
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
    }
  );
  await fs.writeFile(filePath, source, 'utf8');
};

export const assertValidLevels = (records, databaseName) => {
  const invalid = records.filter(
    (record) => !CEFR_LEVELS.includes(record.cefrLevel)
  );
  if (invalid.length > 0) {
    throw new Error(
      `${databaseName} has ${invalid.length} records with invalid CEFR levels.`
    );
  }
};
