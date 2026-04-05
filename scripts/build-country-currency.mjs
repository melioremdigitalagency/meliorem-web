/**
 * Reads temp/country_to_currency_map.csv and writes data/country-currency.json.
 * Duplicate CountryCode rows: last row wins.
 * Run from repo root: node scripts/build-country-currency.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const csvPath = path.join(root, 'temp', 'country_to_currency_map.csv');
const outPath = path.join(root, 'data', 'country-currency.json');

const text = fs.readFileSync(csvPath, 'utf8');
const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');

const map = {};
for (let i = 1; i < lines.length; i++) {
  let line = lines[i].trim();
  if (line.startsWith('"') && line.endsWith('"')) {
    line = line.slice(1, -1);
  }
  const parts = line.split(',');
  if (parts.length !== 4) {
    console.warn(`Skipping line ${i + 1}: expected 4 columns, got ${parts.length}: ${line.slice(0, 80)}`);
    continue;
  }
  const [countryRaw, codeRaw, currencyName, code4217] = parts;
  let countryName = countryRaw;
  if (countryName === 'Australian') {
    countryName = 'Australia';
  }
  const key = codeRaw.trim().toUpperCase();
  map[key] = {
    countryName,
    currencyName: currencyName.trim(),
    currencyCode: code4217.trim().toUpperCase(),
  };
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(map, null, 0) + '\n', 'utf8');
console.log(`Wrote ${Object.keys(map).length} entries to ${path.relative(root, outPath)}`);
