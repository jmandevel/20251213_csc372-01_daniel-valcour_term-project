
const { Client } = require('pg');
const path = require('path');
const {
  readText,
  parseSingleOrRangeProperty,
  parseFlagRanges,
  parseUnicodeData,
  parseBidiMirroring,
  parseConfusables,
  parseBlocks,
} = require('./unicode_parsers.js');
require('dotenv').config();
const DATA_DIR = __dirname;

function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || (process.env.PGHOST &&
    `postgresql:
    ${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || ''}@${process.env.PGHOST}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'postgres'}`)
  );
}

async function main() {
  const dbUrl = getDatabaseUrl();
  if (!dbUrl) {
    console.error('No DATABASE_URL or NEON_DATABASE_URL found in environment. Set it and retry.');
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  try {
    console.log('Reading Unicode data files...');
    const [unicodeText, scriptsText, propListText, derivedText, bidiMirroringText, confusablesText, blocksText, ageText] = await Promise.all([
      readText(path.join(DATA_DIR, 'UnicodeData.txt')),
      readText(path.join(DATA_DIR, 'Scripts.txt')),
      readText(path.join(DATA_DIR, 'PropList.txt')),
      readText(path.join(DATA_DIR, 'DerivedCoreProperties.txt')),
      readText(path.join(DATA_DIR, 'BidiMirroring.txt')),
      readText(path.join(DATA_DIR, 'confusables.txt')).catch(() => ''),
      readText(path.join(DATA_DIR, 'Blocks.txt')).catch(() => ''),
      readText(path.join(DATA_DIR, 'DerivedAge.txt')).catch(() => ''),
    ]);

    console.log('Parsing files...');
    const unicodeEntries = parseUnicodeData(unicodeText);
    const scriptsMap = parseSingleOrRangeProperty(scriptsText);
    const propListMap = parseFlagRanges(propListText);
    const derivedMap = parseFlagRanges(derivedText);
    const bidiMirroringMap = parseBidiMirroring(bidiMirroringText);
    const confusablesList = confusablesText ? parseConfusables(confusablesText) : [];
    const blocksMap = blocksText ? parseBlocks(blocksText) : new Map();
    const ageMap = ageText ? parseSingleOrRangeProperty(ageText) : new Map();
    console.log(`Parsed ${confusablesList.length} confusable pairs`);
    console.log(`Parsed ${blocksMap.size} block assignments`);
    console.log(`Parsed ${ageMap.size} age assignments`);

    console.log('Creating database tables...');
    
    await client.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id text UNIQUE NOT NULL,
        email text,
        name text,
        created_at timestamp DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        codepoint integer NOT NULL,
        created_at timestamp DEFAULT NOW(),
        UNIQUE(user_id, codepoint)
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS confusables (
        id SERIAL PRIMARY KEY,
        codepoint integer NOT NULL,
        confusable_with integer NOT NULL,
        UNIQUE(codepoint, confusable_with)
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS characters (
        codepoint integer PRIMARY KEY,
        code text NOT NULL,
        name text,
        general_category text,
        canonical_combining_class integer,
        decomposition text,
        script text,
        numeric_value text,
        digit_value text,
        decimal_digit_value text,
        uppercase_mapping integer,
        lowercase_mapping integer,
        titlecase_mapping integer,
        bidi_mirrored_glyph integer,
        properties jsonb
      );
    `);

    const charRows = [];
    const derivedProps = new Set();
    for (const arr of derivedMap.values()) for (const p of arr) derivedProps.add(p);

    for (const [cp, entry] of unicodeEntries) {
      const script = scriptsMap.get(cp) || null;
      const propListFlags = new Set(propListMap.get(cp) || []);
      const derivedFlagsForCp = new Set(derivedMap.get(cp) || []);
      const blockName = blocksMap.get(cp) || null;
      const age = ageMap.get(cp) || null;

      const properties_obj = {};
      if (entry.general_category) {
        for (const dp of derivedProps) {
          properties_obj[dp] = derivedFlagsForCp.has(dp);
        }
      }
      if (entry.general_category === 'Lt') {
        properties_obj['Titlecase'] = true;
      }
      for (const flag of propListFlags) {
        properties_obj[flag] = true;
      }
      if (entry.mirrored) {
        properties_obj['Mirrored'] = true;
      }
      if (entry.bidi_class) {
        properties_obj['Bidi_Class'] = entry.bidi_class;
      }
      if (blockName) {
        properties_obj['Block'] = blockName;
      }
      if (age) {
        properties_obj['Age'] = age;
      }

      let numeric_value = entry.numeric_value;
      let decimal_digit_value = entry.decimal_digit_value;
      if (decimal_digit_value && decimal_digit_value.includes('/')) {
        [numeric_value, decimal_digit_value] = [decimal_digit_value, numeric_value];
      }
      if (numeric_value && /^[0-9]$/.test(numeric_value) && (!decimal_digit_value || decimal_digit_value === '')) {
        decimal_digit_value = numeric_value;
        numeric_value = null;
      }
      charRows.push({
        codepoint: cp,
        code: entry.code,
        name: entry.name,
        general_category: entry.general_category,
        canonical_combining_class: entry.canonical_combining_class,
        decomposition: entry.decomposition,
        script,
        numeric_value,
        digit_value: entry.digit_value,
        decimal_digit_value,
        uppercase_mapping: entry.uppercase_mapping,
        lowercase_mapping: entry.lowercase_mapping,
        titlecase_mapping: entry.titlecase_mapping,
        bidi_mirrored_glyph: bidiMirroringMap.get(cp) || null,
        properties: Object.keys(properties_obj).length > 0 ? properties_obj : null,
      });
    }

    console.log(`Preparing to upsert ${charRows.length} characters (batched)...`);

    const charBatchSize = 500;
    for (let i = 0; i < charRows.length; i += charBatchSize) {
      const batch = charRows.slice(i, i + charBatchSize);
      const values = [];
      const placeholders = batch.map((r, idx) => {
        const base = idx * 15;
        values.push(r.codepoint, r.code, r.name, r.general_category, r.canonical_combining_class, r.decomposition, r.script, r.numeric_value, r.digit_value, r.decimal_digit_value, r.uppercase_mapping, r.lowercase_mapping, r.titlecase_mapping, r.bidi_mirrored_glyph, JSON.stringify(r.properties));
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13}, $${base + 14}, $${base + 15}::jsonb)`;
      });
      const sql = `
        INSERT INTO characters (codepoint, code, name, general_category, canonical_combining_class, decomposition, script, numeric_value, digit_value, decimal_digit_value, uppercase_mapping, lowercase_mapping, titlecase_mapping, bidi_mirrored_glyph, properties)
        VALUES ${placeholders.join(',')}
        ON CONFLICT (codepoint) DO UPDATE SET
          code = EXCLUDED.code,
          name = EXCLUDED.name,
          general_category = EXCLUDED.general_category,
          canonical_combining_class = EXCLUDED.canonical_combining_class,
          decomposition = EXCLUDED.decomposition,
          script = EXCLUDED.script,
          numeric_value = EXCLUDED.numeric_value,
          digit_value = EXCLUDED.digit_value,
          decimal_digit_value = EXCLUDED.decimal_digit_value,
          uppercase_mapping = EXCLUDED.uppercase_mapping,
          lowercase_mapping = EXCLUDED.lowercase_mapping,
          titlecase_mapping = EXCLUDED.titlecase_mapping,
          bidi_mirrored_glyph = EXCLUDED.bidi_mirrored_glyph,
          properties = EXCLUDED.properties;
      `;
      await client.query(sql, values);
      console.log(`Upserted characters ${i + 1}..${i + batch.length}`);
    }

    console.log('Creating indexes...');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_characters_name_trgm ON characters USING gin(lower(name) gin_trgm_ops);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_characters_general_category ON characters(general_category);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_characters_script ON characters(script);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_characters_properties_gin ON characters USING gin(properties);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_confusables_codepoint ON confusables(codepoint);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_confusables_confusable_with ON confusables(confusable_with);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_favorites_codepoint ON favorites(codepoint);`);

    if (confusablesList.length > 0) {
      console.log(`Inserting ${confusablesList.length} confusable pairs...`);
      await client.query('DELETE FROM confusables;');
      
      const confusablesBatchSize = 1000;
      for (let i = 0; i < confusablesList.length; i += confusablesBatchSize) {
        const batch = confusablesList.slice(i, i + confusablesBatchSize);
        const values = [];
        const placeholders = batch.map((conf, idx) => {
          const base = idx * 2;
          values.push(conf.source, conf.target);
          return `($${base + 1}, $${base + 2})`;
        });
        const sql = `
          INSERT INTO confusables (codepoint, confusable_with)
          VALUES ${placeholders.join(',')}
          ON CONFLICT (codepoint, confusable_with) DO NOTHING;
        `;
        await client.query(sql, values);
        console.log(`Inserted confusables ${i + 1}..${Math.min(i + batch.length, confusablesList.length)}`);
      }
    }

    console.log('Seeding complete.');
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exitCode = 2;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main();
}
