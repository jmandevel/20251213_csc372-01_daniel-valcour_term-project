import React from 'react';
import './ColumnSelector.css';

// component to select visible columns in a data table
function ColumnSelector({
  basicColumnOptions,
  advancedColumnOptions,
  visibleColumns,
  showAdvancedColumns,
  onToggleColumn,
  onShowMore
}) {
  return (
    <div className="ColumnSelector">
      <div className="ColumnSelector-list">
        {basicColumnOptions.map(col => (
          <label key={col.key} className="ColumnSelector-option">
            <input
              type="checkbox"
              checked={visibleColumns[col.key] || false}
              onChange={() => onToggleColumn(col.key)}
            />
            {' ' + col.label}
          </label>
        ))}
      </div>
      {!showAdvancedColumns && (
        <div className="ColumnSelector-actions">
          <button className="show-more-button" onClick={onShowMore}>Show More</button>
        </div>
      )}
      {showAdvancedColumns && (
        <div className="ColumnSelector-list">
          {advancedColumnOptions.map(col => (
            <label key={col.key} className="ColumnSelector-option">
              <input
                type="checkbox"
                checked={visibleColumns[col.key] || false}
                onChange={() => onToggleColumn(col.key)}
              />
              {' ' + col.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default ColumnSelector;
