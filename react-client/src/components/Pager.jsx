import React from 'react';

// component to render the pager with navigation controls and page input
function Pager({
  page,
  minPage,
  maxPage,
  pageInput,
  onInputChange,
  onKeyDown,
  onGo,
  onFirst,
  onPrev,
  onNext,
  onLast,
  onToggleColumns,
  glyphRangeText
}) {
  return (
    <div className="Pager">
      <button onClick={onFirst} disabled={page <= minPage}>First</button>
      <button onClick={onPrev} disabled={page <= minPage}>Previous</button>
      <span>Page:</span>
      <input
        type="text"
        value={pageInput}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
      />
      <span>/ {maxPage}</span>
      <button onClick={onGo}>Go</button>
      <button onClick={onNext} disabled={page >= maxPage}>Next</button>
      <button onClick={onLast} disabled={page >= maxPage}>Last</button>
      <button onClick={onToggleColumns}>Columns</button>
      <span className="glyph-range">{glyphRangeText}</span>
    </div>
  );
}

export default Pager;
