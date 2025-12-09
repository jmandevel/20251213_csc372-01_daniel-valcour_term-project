"use strict";
const pool = require('./db');

// get all distinct scripts from characters table
async function getAllScripts() {
  const query = `
    SELECT DISTINCT script
    FROM characters
    WHERE script IS NOT NULL
    ORDER BY script
  `;
  const result = await pool.query(query);
  return result.rows.map(row => row.script);
}


// get all distinct general categories from characters table
async function getAllCategories() {
  const query = `
    SELECT DISTINCT general_category
    FROM characters
    WHERE general_category IS NOT NULL
    ORDER BY general_category
  `;
  const result = await pool.query(query);
  return result.rows.map(row => row.general_category);
}
// get all distinct bidi classes from characters table
async function getAllClasses() {
  const query = `
    SELECT DISTINCT properties->>'Bidi_Class' as bidi_class
    FROM characters
    WHERE properties->>'Bidi_Class' IS NOT NULL
    ORDER BY properties->>'Bidi_Class'
  `;
  const result = await pool.query(query);
  return result.rows.map(row => row.bidi_class);
}

// get all distinct Unicode versions from characters table
async function getAllVersions() {
  const query = `
    SELECT DISTINCT 
      properties->>'Age' as age,
      (STRING_TO_ARRAY(properties->>'Age', '.'))[1]::int as major,
      COALESCE((STRING_TO_ARRAY(properties->>'Age', '.'))[2]::int, 0) as minor
    FROM characters
    WHERE properties->>'Age' IS NOT NULL
    ORDER BY major, minor
  `;
  const result = await pool.query(query);
  return result.rows.map(row => row.age);
}

// get all distinct decomposition types from characters table
async function getAllDecompositionTypes() {
  const query = `
    SELECT DISTINCT 
      SUBSTRING(decomposition FROM '<([^>]+)>') as dtype
    FROM characters
    WHERE decomposition IS NOT NULL 
      AND decomposition LIKE '<%'
    ORDER BY dtype
  `;
  const result = await pool.query(query);
  return result.rows.map(row => row.dtype).filter(Boolean);
}

// get information for a single character with its codepoint
async function getCharacterByCodepoint(codepoint) {
  const query = `
    SELECT 
      codepoint,
      code,
      name,
      general_category,
      canonical_combining_class,
      decomposition,
      script,
      numeric_value,
      digit_value,
      decimal_digit_value,
      uppercase_mapping,
      lowercase_mapping,
      titlecase_mapping,
      bidi_mirrored_glyph,
      properties
    FROM characters
    WHERE codepoint = $1
  `;
  const result = await pool.query(query, [codepoint]);
  return result.rows[0];
}
// query characters with optional filtering, pagination, and sorting
async function queryCharacters(whereClause, values, page = 0, sortColumn = 'codepoint', sortDirection = 'asc', term = null) {
  const offset = page * 256;
  
  const whereSQL = whereClause ? `WHERE ${whereClause}` : '';
  
  const columnMap = {
    'codepoint': 'c.codepoint',
    'unicodeId': 'c.codepoint',
    'name': 'c.name',
    'similarity': 'similarity'
  };
  
  const dbColumn = columnMap[sortColumn] || 'c.codepoint';

  const countQuery = `SELECT COUNT(*) FROM characters c ${whereSQL}`;
  const countResult = await pool.query(countQuery, values);
  const totalCount = parseInt(countResult.rows[0].count, 10);
  
  let orderByClause;
  if (sortColumn === 'similarity' && similarityTerm) {
    values.push(similarityTerm);
    const termIndex = values.length;
    const direction = sortDirection === 'desc' ? 'DESC' : 'ASC';
    orderByClause = `ORDER BY (lower(c.name) <-> lower($${termIndex})) ${direction}, c.codepoint ASC`;
  } else {
    const direction = sortDirection === 'desc' ? 'DESC' : 'ASC';
    orderByClause = `ORDER BY ${dbColumn} ${direction}, c.codepoint ${direction}`;
  }
  
  // mega query to get character details along with computed properties
  const query = `
    SELECT 
      c.codepoint,
      c.code,
      'U+' || lpad(upper(to_hex(c.codepoint)), 4, '0') AS unicode_id,
      c.name,
      c.general_category,
      c.script,
      c.numeric_value,
      c.digit_value,
      c.decimal_digit_value,
      c.decomposition,
      c.canonical_combining_class,
      c.properties,
      c.properties->>'Block' AS block,
      c.properties->>'Age' AS age,
      (c.properties->>'Alphabetic')::boolean AS is_alphabetic,
      (c.properties->>'White_Space')::boolean AS is_white_space,
      (c.properties->>'Dash')::boolean AS is_dash,
      (c.properties->>'Mirrored')::boolean AS is_mirrored,
      (c.properties->>'Math')::boolean AS is_math,
      (c.properties->>'Cased')::boolean AS is_cased,
      (c.properties->>'ID_Start')::boolean AS is_id_start,
      (c.properties->>'XID_Start')::boolean AS is_xid_start,
      (c.properties->>'XID_Continue')::boolean AS is_xid_continue,
      (c.properties->>'ID_Continue')::boolean AS is_id_continue,
      (c.properties->>'Grapheme_Base')::boolean AS is_grapheme_base,
      (c.properties->>'Grapheme_Link')::boolean AS is_grapheme_link,
      (c.properties->>'Grapheme_Extend')::boolean AS is_grapheme_extend,
      (c.properties->>'Case_Ignorable')::boolean AS is_case_ignorable,
      (c.properties->>'Changes_When_Casefolded')::boolean AS changes_when_casefolded,
      (c.properties->>'Changes_When_Casemapped')::boolean AS changes_when_casemapped,
      (c.properties->>'Changes_When_Lowercased')::boolean AS changes_when_lowercased,
      (c.properties->>'Changes_When_Titlecased')::boolean AS changes_when_titlecased,
      (c.properties->>'Changes_When_Uppercased')::boolean AS changes_when_uppercased,
      (c.properties->>'Default_Ignorable_Code_Point')::boolean AS is_default_ignorable,
      (c.properties->>'Lowercase')::boolean AS is_lowercase,
      (c.properties->>'Uppercase')::boolean AS is_uppercase,
      (CASE WHEN c.general_category = 'Lt' THEN true ELSE false END) AS is_titlecase,
      c.uppercase_mapping,
      c.lowercase_mapping,
      c.titlecase_mapping,
      c.bidi_mirrored_glyph,
      CASE WHEN c.uppercase_mapping IS NOT NULL THEN 'U+' || lpad(upper(to_hex(c.uppercase_mapping)), 4, '0') END AS uppercase_unicode_id,
      CASE WHEN c.lowercase_mapping IS NOT NULL THEN 'U+' || lpad(upper(to_hex(c.lowercase_mapping)), 4, '0') END AS lowercase_unicode_id,
      CASE WHEN c.titlecase_mapping IS NOT NULL THEN 'U+' || lpad(upper(to_hex(c.titlecase_mapping)), 4, '0') END AS titlecase_unicode_id,
      (SELECT name FROM characters u WHERE u.codepoint = c.uppercase_mapping) AS uppercase_name,
      (SELECT name FROM characters l WHERE l.codepoint = c.lowercase_mapping) AS lowercase_name,
      (SELECT name FROM characters t WHERE t.codepoint = c.titlecase_mapping) AS titlecase_name
    FROM characters c
    ${whereSQL}
    ${orderByClause}
    LIMIT 256 OFFSET ${offset}
  `;
  
  const result = await pool.query(query, values);
  return {
    characters: result.rows,
    totalCount: totalCount
  };
}

// get character name by codepoint
async function getNameByCodepoint(codepoint) {
  const query = 'SELECT name FROM characters WHERE codepoint = $1';
  const result = await pool.query(query, [codepoint]);
  return result.rows.length > 0 ? result.rows[0].name : null;
}

module.exports = {
  getAllScripts,
  getAllCategories,
  getAllClasses,
  getAllVersions,
  getAllDecompositionTypes,
  getCharacterByCodepoint,
  queryCharacters,
  getNameByCodepoint
};
