import React from 'react';

// component to render a single row in the data table
function DataRow({
  char,
  visibleColumns,
  renderClickableCell,
  renderFlagCell,
  getNumericType,
  getDecompositionType,
  getCombiningClassName,
  handleCellClick,
  isFavorite,
  onToggleFavorite,
  isAuthenticated
}) {
  return (
    <tr key={char.codepoint} className="data-row">
      {isAuthenticated && (
        <td className="favorite-cell col-flag" onClick={() => onToggleFavorite(char.codepoint)}>
          <span className={`star ${isFavorite ? 'favorited' : ''}`}>★</span>
        </td>
      )}
      {visibleColumns.codepoint && <td className="col-codepoint mono clickable-cell" onClick={(e) => handleCellClick(String(char.codepoint), e)}>{char.codepoint}</td>}
      {visibleColumns.unicodeId && <td className="col-unicode-id mono clickable-cell" onClick={(e) => handleCellClick(char.unicode_id, e)}>{char.unicode_id}</td>}
      {visibleColumns.character && (
        <td className="col-char char-cell clickable-cell" onClick={(e) => handleCellClick(String.fromCodePoint(char.codepoint), e)}>
          {String.fromCodePoint(char.codepoint)}
        </td>
      )}
      {visibleColumns.name && renderClickableCell(char.name, 'col-name')}
      {visibleColumns.script && renderClickableCell(char.script)}
      {visibleColumns.category && renderClickableCell(char.general_category)}
      {visibleColumns.numericValue && renderClickableCell(char.numeric_value, 'numeric-cell')}
      {visibleColumns.decomposition && renderClickableCell(char.decomposition)}
      {visibleColumns.decompositionType && (
        <td className={char.decomposition ? "clickable-cell" : ""} onClick={(e) => {
          const dt = getDecompositionType(char.decomposition);
          handleCellClick(dt, e);
        }}>
          {getDecompositionType(char.decomposition)}
        </td>
      )}
      {visibleColumns.combiningClass && renderClickableCell(char.canonical_combining_class, 'numeric-cell')}
      {visibleColumns.cccName && (
        <td className={char.canonical_combining_class !== null && char.canonical_combining_class !== undefined ? "clickable-cell" : ""}
          onClick={(e) => {
            const cccName = getCombiningClassName(char.canonical_combining_class);
            if (cccName) handleCellClick(cccName, e);
          }}>
          {getCombiningClassName(char.canonical_combining_class)}
        </td>
      )}
      {visibleColumns.decimalValue && renderClickableCell(char.decimal_digit_value, 'numeric-cell')}
      {visibleColumns.digitValue && renderClickableCell(char.digit_value, 'numeric-cell')}
      {visibleColumns.numericType && renderClickableCell(getNumericType(char))}
      {visibleColumns.block && renderClickableCell(char.block)}
      {visibleColumns.age && renderClickableCell(char.age)}
      {visibleColumns.alphabetic && renderFlagCell(char.is_alphabetic)}
      {visibleColumns.whiteSpace && renderFlagCell(char.is_white_space)}
      {visibleColumns.dash && renderFlagCell(char.is_dash)}
      {visibleColumns.mirrored && (
        <td className={`char-cell ${char.bidi_mirrored_glyph ? 'clickable-cell' : ''}`} onClick={(e) => handleCellClick(char.bidi_mirrored_glyph ? String.fromCodePoint(char.bidi_mirrored_glyph) : '', e)}>
          {char.bidi_mirrored_glyph ? String.fromCodePoint(char.bidi_mirrored_glyph) : ''}
        </td>
      )}
      {visibleColumns.uppercase && (
        <td className={`char-cell ${char.uppercase_mapping ? 'clickable-cell' : ''}`} onClick={(e) => handleCellClick(char.uppercase_mapping ? String.fromCodePoint(char.uppercase_mapping) : '', e)}>
          {char.uppercase_mapping ? String.fromCodePoint(char.uppercase_mapping) : ''}
        </td>
      )}
      {visibleColumns.lowercase && (
        <td className={`char-cell ${char.lowercase_mapping ? 'clickable-cell' : ''}`} onClick={(e) => handleCellClick(char.lowercase_mapping ? String.fromCodePoint(char.lowercase_mapping) : '', e)}>
          {char.lowercase_mapping ? String.fromCodePoint(char.lowercase_mapping) : ''}
        </td>
      )}
      {visibleColumns.titlecase && (
        <td className={`char-cell ${char.titlecase_mapping ? 'clickable-cell' : ''}`} onClick={(e) => handleCellClick(char.titlecase_mapping ? String.fromCodePoint(char.titlecase_mapping) : '', e)}>
          {char.titlecase_mapping ? String.fromCodePoint(char.titlecase_mapping) : ''}
        </td>
      )}
      {visibleColumns.math && renderFlagCell(char.is_math)}
      {visibleColumns.cased && renderFlagCell(char.is_cased)}
      {visibleColumns.idStart && renderFlagCell(char.is_id_start)}
      {visibleColumns.xidStart && renderFlagCell(char.is_xid_start)}
      {visibleColumns.xidContinue && renderFlagCell(char.is_xid_continue)}
      {visibleColumns.idContinue && renderFlagCell(char.is_id_continue)}
      {visibleColumns.graphemeBase && renderFlagCell(char.is_grapheme_base)}
      {visibleColumns.graphemeLink && renderFlagCell(char.is_grapheme_link)}
      {visibleColumns.graphemeExtend && renderFlagCell(char.is_grapheme_extend)}
      {visibleColumns.caseIgnorable && renderFlagCell(char.is_case_ignorable)}
      {visibleColumns.changesWhenCasefolded && renderFlagCell(char.changes_when_casefolded)}
      {visibleColumns.changesWhenCasemapped && renderFlagCell(char.changes_when_casemapped)}
      {visibleColumns.changesWhenLowercased && renderFlagCell(char.changes_when_lowercased)}
      {visibleColumns.changesWhenTitlecased && renderFlagCell(char.changes_when_titlecased)}
      {visibleColumns.changesWhenUppercased && renderFlagCell(char.changes_when_uppercased)}
      {visibleColumns.defaultIgnorable && renderFlagCell(char.is_default_ignorable)}
      {visibleColumns.isLowercase && renderFlagCell(char.is_lowercase)}
      {visibleColumns.isUppercase && renderFlagCell(char.is_uppercase)}
      {visibleColumns.isTitlecase && renderFlagCell(char.is_titlecase)}
    </tr>
  );
}

export default DataRow;
