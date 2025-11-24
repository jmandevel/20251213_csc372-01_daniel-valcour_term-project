import React from 'react';
import DataRow from './DataRow';

// component to render the data table with sortable columns

function DataTable({
  characters,
  visibleColumns,
  renderClickableCell,
  renderFlagCell,
  getNumericType,
  getDecompositionType,
  getCombiningClassName,
  handleCellClick,
  sortColumn,
  sortDirection,
  onSort,
  favorites,
  onToggleFavorite,
  isAuthenticated
}) {
  const getSortIndicator = (column) => {
    if (sortColumn !== column) return '';
    return sortDirection === 'asc' ? ' ▼' : ' ▲';
  };

  const handleHeaderClick = (column) => {
    if (onSort) {
      onSort(column);
    }
  };

  return (
    <table className="data-table">
      <colgroup>
        {isAuthenticated && <col className="col-flag" style={{ width: '42px' }} />}
        {visibleColumns.codepoint && <col className="col-codepoint" style={{ width: '80px' }} />}
        {visibleColumns.unicodeId && <col className="col-unicode-id" style={{ width: '90px' }} />}
        {visibleColumns.character && <col className="col-char" style={{ width: '60px' }} />}
        {visibleColumns.name && <col className="col-name" style={{ width: '250px' }} />}
        {visibleColumns.script && <col />}
        {visibleColumns.category && <col />}
        {visibleColumns.numericValue && <col />}
        {visibleColumns.decomposition && <col />}
        {visibleColumns.decompositionType && <col />}
        {visibleColumns.combiningClass && <col />}
        {visibleColumns.cccName && <col />}
        {visibleColumns.decimalValue && <col />}
        {visibleColumns.digitValue && <col />}
        {visibleColumns.numericType && <col />}
        {visibleColumns.block && <col />}
        {visibleColumns.age && <col />}
        {visibleColumns.alphabetic && <col />}
        {visibleColumns.whiteSpace && <col />}
        {visibleColumns.dash && <col />}
        {visibleColumns.mirrored && <col className="col-flag" style={{ width: '42px' }} />}
        {visibleColumns.uppercase && <col className="col-case-char" style={{ width: '60px' }} />}
        {visibleColumns.lowercase && <col className="col-case-char" style={{ width: '60px' }} />}
        {visibleColumns.titlecase && <col />}
        {visibleColumns.math && <col />}
        {visibleColumns.cased && <col />}
        {visibleColumns.idStart && <col />}
        {visibleColumns.xidStart && <col />}
        {visibleColumns.xidContinue && <col />}
        {visibleColumns.idContinue && <col />}
        {visibleColumns.graphemeBase && <col />}
        {visibleColumns.graphemeLink && <col />}
        {visibleColumns.graphemeExtend && <col />}
        {visibleColumns.caseIgnorable && <col />}
        {visibleColumns.changesWhenCasefolded && <col />}
        {visibleColumns.changesWhenCasemapped && <col />}
        {visibleColumns.changesWhenLowercased && <col />}
        {visibleColumns.changesWhenTitlecased && <col />}
        {visibleColumns.changesWhenUppercased && <col />}
        {visibleColumns.defaultIgnorable && <col />}
        {visibleColumns.isLowercase && <col />}
        {visibleColumns.isUppercase && <col />}
        {visibleColumns.isTitlecase && <col />}
      </colgroup>
      <thead>
        <tr className="table-header-row">
          {isAuthenticated && <th>★</th>}
          {visibleColumns.codepoint && <th className="col-codepoint sortable" onClick={() => handleHeaderClick('codepoint')}>Codepoint{getSortIndicator('codepoint')}</th>}
          {visibleColumns.unicodeId && <th className="col-unicode-id sortable" onClick={() => handleHeaderClick('unicodeId')}>ID{getSortIndicator('unicodeId')}</th>}
          {visibleColumns.character && <th className="col-char">Character</th>}
          {visibleColumns.name && <th className="col-name sortable" onClick={() => handleHeaderClick('name')}>Name{getSortIndicator('name')}</th>}
          {visibleColumns.script && <th>Script</th>}
          {visibleColumns.category && <th>Category</th>}
          {visibleColumns.numericValue && <th>Numeric</th>}
          {visibleColumns.decomposition && <th>Decomp.</th>}
          {visibleColumns.decompositionType && <th>Decomp. Type</th>}
          {visibleColumns.combiningClass && <th>Comb. Class</th>}
          {visibleColumns.cccName && <th>CCC Name</th>}
          {visibleColumns.decimalValue && <th>Decimal</th>}
          {visibleColumns.digitValue && <th>Digit</th>}
          {visibleColumns.numericType && <th>Numeric Type</th>}
          {visibleColumns.block && <th>Block</th>}
          {visibleColumns.age && <th>Age</th>}
          {visibleColumns.alphabetic && <th className="center">Alpha</th>}
          {visibleColumns.whiteSpace && <th className="center">WS</th>}
          {visibleColumns.dash && <th className="center">Dash</th>}
          {visibleColumns.mirrored && <th className="col-flag">Mirror</th>}
          {visibleColumns.uppercase && <th className="col-case-char">Upper</th>}
          {visibleColumns.lowercase && <th className="col-case-char">Lower</th>}
          {visibleColumns.titlecase && <th>Title</th>}
          {visibleColumns.math && <th className="center">Math</th>}
          {visibleColumns.cased && <th className="center">Cased</th>}
          {visibleColumns.idStart && <th className="center">ID Start</th>}
          {visibleColumns.xidStart && <th className="center">XID Start</th>}
          {visibleColumns.xidContinue && <th className="center">XID Cont.</th>}
          {visibleColumns.idContinue && <th className="center">ID Cont.</th>}
          {visibleColumns.graphemeBase && <th className="center">Graph. Base</th>}
          {visibleColumns.graphemeLink && <th className="center">Graph. Link</th>}
          {visibleColumns.graphemeExtend && <th className="center">Graph. Extend</th>}
          {visibleColumns.caseIgnorable && <th className="center">Case Ignore</th>}
          {visibleColumns.changesWhenCasefolded && <th className="center">Change Folded</th>}
          {visibleColumns.changesWhenCasemapped && <th className="center">Change Mapped</th>}
          {visibleColumns.changesWhenLowercased && <th className="center">Change Lower</th>}
          {visibleColumns.changesWhenTitlecased && <th className="center">Change Title</th>}
          {visibleColumns.changesWhenUppercased && <th className="center">Change Upper</th>}
          {visibleColumns.defaultIgnorable && <th className="center">Default Ignore</th>}
          {visibleColumns.isLowercase && <th className="center">Is Lower</th>}
          {visibleColumns.isUppercase && <th className="center">Is Upper</th>}
          {visibleColumns.isTitlecase && <th className="center">Is Title</th>}
        </tr>
      </thead>
      <tbody>
        {characters.map((char) => (
          <DataRow
            key={char.codepoint}
            char={char}
            visibleColumns={visibleColumns}
            renderClickableCell={renderClickableCell}
            renderFlagCell={renderFlagCell}
            getNumericType={getNumericType}
            getDecompositionType={getDecompositionType}
            getCombiningClassName={getCombiningClassName}
            handleCellClick={handleCellClick}
            isFavorite={favorites.includes(char.codepoint)}
            onToggleFavorite={onToggleFavorite}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </tbody>
    </table>
  );
}

export default DataTable;
