import { useState, useEffect } from 'react';
import './SearchBar.css';

// component to render a search bar with input and buttons
function SearchBar({ value = '', onSearch, showFilters, onToggleFilters }) {
  const [text, setText] = useState(value || '');

  useEffect(() => {
    setText(value || '');
  }, [value]);

  // handle search submission
  function handleSubmit() {
    onSearch && onSearch((text || '').trim());
  }

  return (
    <div className="SearchBar">
      <input
        className="SearchBar-input"
        type="text"
        placeholder="Search name or U+... or character"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
      />
      <button className="SearchBar-search-button" onClick={handleSubmit}>Search</button>
      <button className="SearchBar-button" onClick={onToggleFilters}>Filters</button>
    </div>
  );
}

export default SearchBar;
