const fs = require('fs/promises');

function normalizeLine(line) {
  return line.replace(/\uFEFF/g, '').trim();
}

async function readText(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return raw.replace(/\r\n/g, '\n');
}

function parseSingleOrRangeProperty(text) {
  const map = new Map();
  const lines = text.split('\n');
  for (const raw of lines) {
    const line = normalizeLine(raw);
    if (!line || line.startsWith('#')) continue;
    const parts = line.split(';');
    if (parts.length < 2) continue;
    const rangePart = parts[0].trim();
    const valuePart = parts[1].trim().split('#')[0].trim();
    const m = rangePart.match(/^([0-9A-Fa-f]+)(?:\.\.([0-9A-Fa-f]+))?$/);
    if (!m) continue;
    const start = parseInt(m[1], 16);
    const end = m[2] ? parseInt(m[2], 16) : start;
    for (let cp = start; cp <= end; cp++) map.set(cp, valuePart);
  }
  return map;
}

function parseFlagRanges(text) {
  const map = new Map();
  const lines = text.split('\n');
  for (const raw of lines) {
    const line = normalizeLine(raw);
    if (!line || line.startsWith('#')) continue;
    const parts = line.split(';');
    if (parts.length < 2) continue;
    const rangePart = parts[0].trim();
    const propName = parts[1].trim().split('#')[0].trim();
    const m = rangePart.match(/^([0-9A-Fa-f]+)(?:\.\.([0-9A-Fa-f]+))?$/);
    if (!m) continue;
    const start = parseInt(m[1], 16);
    const end = m[2] ? parseInt(m[2], 16) : start;
    for (let cp = start; cp <= end; cp++) {
      const arr = map.get(cp) ?? [];
      arr.push(propName);
      map.set(cp, arr);
    }
  }
  return map;
}

function parseUnicodeData(text) {
  const lines = text.split('\n');
  const entries = new Map();
  let rangeStart = null;
  let rangeFields = null;

  for (const raw of lines) {
    const line = normalizeLine(raw);
    if (!line || line.startsWith('#')) continue;
    const fields = line.split(';');
    if (fields.length < 3) continue;
    const cp = parseInt(fields[0], 16);
    const name = fields[1];
    const gc = fields[2];
    const ccc = fields[3] ? parseInt(fields[3].trim()) : 0;
    const bidi_class = fields[4] ? fields[4].trim() : null;
    const decomposition = fields[5] ? fields[5].trim() : null;
    const decimal_digit_value = fields[6] ? fields[6].trim() : null;
    const digit_value = fields[7] ? fields[7].trim() : null;
    const numeric_value = fields[8] ? fields[8].trim() : null;
    const mirrored = fields[9] ? fields[9].trim() === 'Y' : false;
    const uppercase_mapping = fields[12] && fields[12].trim() ? parseInt(fields[12].trim(), 16) : null;
    const lowercase_mapping = fields[13] && fields[13].trim() ? parseInt(fields[13].trim(), 16) : null;
    const titlecase_mapping = fields[14] && fields[14].trim() ? parseInt(fields[14].trim(), 16) : null;

    if (name.includes('First>')) {
      rangeStart = cp;
      rangeFields = { name, gc };
      continue;
    }
    if (name.includes('Last>') && rangeStart !== null && rangeFields) {
      for (let c = rangeStart; c <= cp; c++) {
        entries.set(c, {
          codepoint: c,
          code: `U+${c.toString(16).toUpperCase().padStart(4, '0')}`,
          name: null,
          general_category: rangeFields.gc,
          canonical_combining_class: 0,
          bidi_class: null,
          decomposition: null,
          decimal_digit_value: null,
          digit_value: null,
          numeric_value: null,
          mirrored: false,
          uppercase_mapping: null,
          lowercase_mapping: null,
          titlecase_mapping: null,
        });
      }
      rangeStart = null;
      rangeFields = null;
      continue;
    }

    entries.set(cp, {
      codepoint: cp,
      code: `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`,
      name: name === '<control>' || name.startsWith('<') ? null : name,
      general_category: gc,
      canonical_combining_class: ccc,
      bidi_class,
      decomposition,
      decimal_digit_value,
      digit_value,
      numeric_value,
      mirrored,
      uppercase_mapping,
      lowercase_mapping,
      titlecase_mapping,
    });
  }
  return entries;
}

function parseBidiMirroring(text) {
  const map = new Map();
  const lines = text.split('\n');
  for (const raw of lines) {
    const line = normalizeLine(raw);
    if (!line || line.startsWith('#')) continue;
    const parts = line.split(';');
    if (parts.length < 2) continue;
    const cpHex = parts[0].trim();
    const mirroredHex = parts[1].trim().split('#')[0].trim();
    if (!cpHex || !mirroredHex) continue;
    const cp = parseInt(cpHex, 16);
    const mirrored = parseInt(mirroredHex, 16);
    if (!isNaN(cp) && !isNaN(mirrored)) {
      map.set(cp, mirrored);
    }
  }
  return map;
}

function parseConfusables(text) {
  const confusables = [];
  const lines = text.split('\n');
  
  for (const raw of lines) {
    const line = normalizeLine(raw);
    if (!line || line.startsWith('#')) continue;
    
    const parts = line.split(';');
    if (parts.length < 2) continue;
    
    const sourcePart = parts[0].trim();
    const targetPart = parts[1].trim().split('#')[0].trim();
    
    if (!sourcePart || !targetPart) continue;
    
    const sourceMatch = sourcePart.match(/^([0-9A-Fa-f]+)$/);
    if (!sourceMatch) continue;
    
    const source = parseInt(sourceMatch[1], 16);
    
    const targetCodes = targetPart.split(/\s+/).filter(h => h);
    for (const targetHex of targetCodes) {
      const target = parseInt(targetHex, 16);
      if (!isNaN(source) && !isNaN(target) && source !== target) {
        confusables.push({ source, target });
      }
    }
  }
  
  return confusables;
}

function parseBlocks(text) {
  const map = new Map();
  const lines = text.split('\n');
  for (const raw of lines) {
    const line = normalizeLine(raw);
    if (!line || line.startsWith('#')) continue;
    const parts = line.split(';');
    if (parts.length < 2) continue;
    const rangePart = parts[0].trim();
    const blockName = parts[1].trim();
    const m = rangePart.match(/^([0-9A-Fa-f]+)\.\.([0-9A-Fa-f]+)$/);
    if (!m) continue;
    const start = parseInt(m[1], 16);
    const end = parseInt(m[2], 16);
    for (let cp = start; cp <= end; cp++) {
      map.set(cp, blockName);
    }
  }
  return map;
}

module.exports = {
  readText,
  parseSingleOrRangeProperty,
  parseFlagRanges,
  parseUnicodeData,
  parseBidiMirroring,
  parseConfusables,
  parseBlocks,
};
