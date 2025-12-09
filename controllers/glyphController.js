"use strict";
const glyphModel = require('../models/glyphModel');

let SCRIPTS = [];
let CATEGORIES = [];
let CLASSES = [];
let VERSIONS = [];
let DECOMPOSITION_TYPES = [];

// cache data on server startup so dont have to query db every time
async function initializeCache() {
  try {
    SCRIPTS = await glyphModel.getAllScripts();
    CATEGORIES = await glyphModel.getAllCategories();
    CLASSES = await glyphModel.getAllClasses();
    VERSIONS = await glyphModel.getAllVersions();
    DECOMPOSITION_TYPES = await glyphModel.getAllDecompositionTypes();
  } catch (error) {
    console.error('Error initializing cache:', error);
  }
}

// get list of all scripts
function getScripts(req, res) {
  res.json({ scripts: SCRIPTS });
}

// get list of all categories
function getCategories(req, res) {
  res.json({ categories: CATEGORIES });
}

// get list of all classes  
function getClasses(req, res) {
  res.json({ classes: CLASSES });
}

// get list of all unicode versions
function getVersions(req, res) {
  res.json({ versions: VERSIONS });
}

// get list of all decomposition types
function getDecompositionTypes(req, res) {
  res.json({ decompositionTypes: DECOMPOSITION_TYPES });
}

// get list of all characters with filters, pagination, and sorting
async function getCharacters(req, res) {
  const { filters } = req.query;
  const pageRaw = req.query.page;
  const sortColumn = req.query.sort || 'codepoint';
  const sortDirection = req.query.dir === 'desc' ? 'desc' : 'asc';

  // page number to present to user
  let page = Number.isFinite(Number(pageRaw)) ? parseInt(pageRaw, 10) : 0;
  if (isNaN(page)) page = 0;
  if (page < 0) page = 0;

  // decode and parse filters from query string
  const decodedFilters = filters ? decodeURIComponent(filters) : '';
  // create array of individual filters
  const filterArray = decodedFilters.split(',').map(f => f.trim()).filter(f => f);

  // helper to get list of values after a specific prefix
  const getListAfter = (prefix) => {
    const part = filterArray.find(f => f.startsWith(prefix));
    if (!part) return null;
    const raw = part.slice(prefix.length);
    if (!raw) return [];
    const list = raw.split('|').map(s => s.trim()).filter(Boolean);
    return list;
  };

  // extract specific filter lists
  const scriptsList = getListAfter('scripts:');
  const categoriesList = getListAfter('categories:');
  const classesList = getListAfter('classes:');
  const versionsList = getListAfter('versions:');
  const decompositionTypesList = getListAfter('decompositionTypes:');

  try {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (scriptsList !== null) { // if there are script filters...
      if (scriptsList.length === 0) {
        return res.json({ characters: [], totalCount: 0 });
      }
      // filter by unicode scripts
      const placeholders = scriptsList.map(() => `$${paramIndex++}`).join(', ');
      conditions.push(`script IN (${placeholders})`);
      values.push(...scriptsList);
    }

    if (categoriesList !== null) { // if there are category filters...
      if (categoriesList.length === 0) {
        return res.json({ characters: [], totalCount: 0 });
      }
      // filter by unicode general categories
      const placeholders = categoriesList.map(() => `$${paramIndex++}`).join(', ');
      conditions.push(`general_category IN (${placeholders})`);
      values.push(...categoriesList);
    }

    if (classesList !== null) { // if there are class filters...
      if (classesList.length === 0) {
        return res.json({ characters: [], totalCount: 0 });
      }
      // filter by unicode bidi classes
      const placeholders = classesList.map(() => `$${paramIndex++}`).join(', ');
      conditions.push(`properties->>'Bidi_Class' IN (${placeholders})`);
      values.push(...classesList);
    }

    if (versionsList !== null) { // if there are version filters...
      if (versionsList.length === 0) {
        return res.json({ characters: [], totalCount: 0 });
      }
      // filter by unicode versions
      const placeholders = versionsList.map(() => `$${paramIndex++}`).join(', ');
      conditions.push(`properties->>'Age' IN (${placeholders})`);
      values.push(...versionsList);
    }

    if (decompositionTypesList !== null) { // if there are decomposition type filters...
      if (decompositionTypesList.length === 0) {
        return res.json({ characters: [], totalCount: 0 });
      }
      // filter by unicode decomposition types
      const orConditions = decompositionTypesList.map(dtype => {
        if (dtype === 'canonical') {
          return `(decomposition IS NOT NULL AND decomposition NOT LIKE '<%')`;
        } else {
          const placeholder = `$${paramIndex++}`;
          values.push(`<${dtype}>%`);
          return `decomposition LIKE ${placeholder}`;
        }
      });
      conditions.push(`(${orConditions.join(' OR ')})`);
    }

    for (const filter of filterArray) { // for each remaining filter...
      if (filter.startsWith('scripts:') ||
        filter.startsWith('categories:') ||
        filter.startsWith('classes:') ||
        filter.startsWith('versions:') ||
        filter.startsWith('decompositionTypes:')) {
        continue; // these were already processed before this loop
      } else if (filter.startsWith('confusableWith:')) { // confusable with filter
        const termRaw = filter.substring(15);
        let term = termRaw.trim();
        if (term.length > 0) {
          const chars = Array.from(term);
          const codepoints = chars.map(char => char.codePointAt(0)).filter(cp => cp !== undefined);
          if (codepoints.length > 0) {
            const orConditions = codepoints.map(() => {
              const idx = paramIndex++;
              return `(c.codepoint IN (SELECT codepoint FROM confusables WHERE confusable_with = $${idx}) OR c.codepoint IN (SELECT confusable_with FROM confusables WHERE codepoint = $${idx}))`;
            });
            conditions.push(`(${orConditions.join(' OR ')})`);
            codepoints.forEach(cp => values.push(cp));
          }
        }
      } else if (filter.startsWith('notConfusableWith:')) { // not confusable with filter
        const termRaw = filter.substring(18);
        let term = termRaw.trim();
        if (term.length > 0) {
          const chars = Array.from(term);
          const codepoints = chars.map(char => char.codePointAt(0)).filter(cp => cp !== undefined);
          if (codepoints.length > 0) {
            const andConditions = codepoints.map(() => {
              const idx = paramIndex++;
              return `(c.codepoint NOT IN (SELECT codepoint FROM confusables WHERE confusable_with = $${idx}) AND c.codepoint NOT IN (SELECT confusable_with FROM confusables WHERE codepoint = $${idx}))`;
            });
            conditions.push(`(${andConditions.join(' AND ')})`);
            codepoints.forEach(cp => values.push(cp));
          }
        }
      } else if (filter.startsWith('search:')) {  // search bar text filter
        const termRaw = filter.substring(7);
        let term = termRaw.trim();
        if (term.length > 200) {
          term = term.slice(0, 200);
        }
        let searchCond = '';
        const chars = Array.from(term);
        let codepoint = null;
        let nameForCp = null;

        if (chars.length === 1) {
          codepoint = chars[0].codePointAt(0);
        } else {
          const hexMatch = term.match(/^(?:U\+|0x)?([0-9A-Fa-f]{1,6})$/);
          if (hexMatch) {
            const hex = hexMatch[1];
            const cpFromHex = parseInt(hex, 16);
            if (!Number.isNaN(cpFromHex)) codepoint = cpFromHex;
          }
        }

        if (codepoint !== null) { // if the searchbar contains a codepoint value
          // get the name of the codepoint and use it for searching
          nameForCp = await glyphModel.getNameByCodepoint(codepoint);
        }

        if (nameForCp) {
          searchCond = `(lower(c.name) % lower($${paramIndex}))`;
          values.push(nameForCp);
          term = nameForCp;
          paramIndex++;
        } else {
          searchCond = `(lower(c.name) % lower($${paramIndex}) OR c.code ILIKE $${paramIndex + 1})`;
          values.push(term, `%${term}%`);
          paramIndex += 2;
        }
        conditions.push(searchCond);
      } else {
        const isNegated = filter.startsWith('not_');
        const filterName = isNegated ? filter.substring(4) : filter;

        const filterMap = { // mapping of filter names to property keys
          isAlphabetic: 'Alphabetic',
          isWhiteSpace: 'White_Space',
          isDash: 'Dash',
          isMirrored: 'Mirrored',
          hasName: 'hasName',
          hasNumericValue: 'hasNumericValue',
          hasDecomposition: 'hasDecomposition',
          hasUppercaseMapping: 'hasUppercaseMapping',
          hasLowercaseMapping: 'hasLowercaseMapping',
          hasTitlecaseMapping: 'hasTitlecaseMapping',
          hasCombiningClass: 'hasCombiningClass',
          hasMirror: 'hasMirror',
          math: 'Math',
          favorited: 'hasFavorited',
          idStart: 'ID_Start',
          xidStart: 'XID_Start',
          xidContinue: 'XID_Continue',
          idContinue: 'ID_Continue',
          graphemeBase: 'Grapheme_Base',
          graphemeLink: 'Grapheme_Link',
          graphemeExtend: 'Grapheme_Extend',
          caseIgnorable: 'Case_Ignorable',
          changesWhenCasefolded: 'Changes_When_Casefolded',
          changesWhenCasemapped: 'Changes_When_Casemapped',
          changesWhenLowercased: 'Changes_When_Lowercased',
          changesWhenTitlecased: 'Changes_When_Titlecased',
          changesWhenUppercased: 'Changes_When_Uppercased',
          defaultIgnorable: 'Default_Ignorable_Code_Point',
          isLowercase: 'Lowercase',
          isUppercase: 'Uppercase',
          isTitlecase: 'Titlecase',
        };

        const filterKey = filterMap[filterName];
        if (!filterKey) {
          throw new Error(`Unknown filter: ${filter}`);
        }

        // construct sql condition for this filter and add it to query
        let condition;
        if (filterKey === 'hasFavorited') {
          if (isNegated) {
            const placeholder = `$${paramIndex++}`;
            condition = `c.codepoint NOT IN (SELECT f.codepoint FROM favorites f JOIN users u ON f.user_id = u.id WHERE u.google_id = ${placeholder})`;
            values.push(req.user.id);
          } else {
            const placeholder = `$${paramIndex++}`;
            condition = `c.codepoint IN (SELECT f.codepoint FROM favorites f JOIN users u ON f.user_id = u.id WHERE u.google_id = ${placeholder})`;
            values.push(req.user.id);
          }
        } else if (filterKey === 'hasName') {
          condition = isNegated ? `name IS NULL` : `name IS NOT NULL`;
        } else if (filterKey === 'hasNumericValue') {
          condition = isNegated ? `numeric_value IS NULL` : `numeric_value IS NOT NULL`;
        } else if (filterKey === 'hasDecomposition') {
          condition = isNegated ? `decomposition IS NULL` : `decomposition IS NOT NULL`;
        } else if (filterKey === 'hasUppercaseMapping') {
          condition = isNegated ? `uppercase_mapping IS NULL` : `uppercase_mapping IS NOT NULL`;
        } else if (filterKey === 'hasLowercaseMapping') {
          condition = isNegated ? `lowercase_mapping IS NULL` : `lowercase_mapping IS NOT NULL`;
        } else if (filterKey === 'hasTitlecaseMapping') {
          condition = isNegated ? `titlecase_mapping IS NULL` : `titlecase_mapping IS NOT NULL`;
        } else if (filterKey === 'hasCombiningClass') {
          condition = isNegated
            ? `(canonical_combining_class IS NULL OR canonical_combining_class = 0)`
            : `canonical_combining_class IS NOT NULL AND canonical_combining_class > 0`;
        } else if (filterKey === 'hasMirror') {
          condition = isNegated
            ? `(properties->>'Bidi_Mirrored' IS NULL OR properties->>'Bidi_Mirrored' != 'true')`
            : `properties->>'Bidi_Mirrored' = 'true'`;
        } else if (filterName === 'isTitlecase') {
          condition = isNegated ? `general_category != 'Lt'` : `general_category = 'Lt'`;
        } else {
          condition = isNegated
            ? `(properties->>'${filterKey}' IS NULL OR properties->>'${filterKey}' != 'true')`
            : `properties->>'${filterKey}' = 'true'`;
        }
        conditions.push(condition);
      }
    }

    const whereClause = conditions.join(' AND ');
    const result = await glyphModel.queryCharacters(conditions.join(' AND '), values, page, sortColumn, sortDirection, term);
    res.json(result);
  } catch (error) {
    console.error('Error querying characters:', error);
    res.status(500).json({ error: 'Failed to query characters' });
  }
}

// get data for a single character by codepoint
async function getCharacter(req, res) {
  const { codepoint } = req.params;
  const codepointNum = parseInt(codepoint, 10);

  if (isNaN(codepointNum) || codepointNum < 0) {
    return res.status(400).json({ error: 'Invalid codepoint' });
  }

  try {
    const char = await glyphModel.getCharacterByCodepoint(codepointNum);

    if (!char) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const props = char.properties || {};

    res.json({
      codepoint: char.codepoint,
      code: char.code,
      name: char.name,
      general_category: char.general_category,
      canonical_combining_class: char.canonical_combining_class,
      decomposition: char.decomposition,
      script: char.script,
      numeric_value: char.numeric_value,
      digit_value: char.digit_value,
      decimal_digit_value: char.decimal_digit_value,
      uppercase_mapping: char.uppercase_mapping,
      lowercase_mapping: char.lowercase_mapping,
      titlecase_mapping: char.titlecase_mapping,
      bidi_mirrored_glyph: char.bidi_mirrored_glyph,
      alphabetic: props.Alphabetic || false,
      white_space: props.White_Space || false,
      dash: props.Dash || false,
      bidi_class: props.Bidi_Class || null,
      bidi_mirrored: props.Mirrored || false,
    });
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ error: 'Failed to fetch character' });
  }
}

module.exports = {
  initializeCache,
  getScripts,
  getCategories,
  getClasses,
  getVersions,
  getDecompositionTypes,
  getCharacters,
  getCharacter
};
