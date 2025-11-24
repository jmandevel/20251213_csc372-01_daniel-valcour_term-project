import './MultiSelectPanel.css';

// component to render a multi-select panel with select/deselect all functionality
function MultiSelectPanel({
    title,
    items = [],
    selected = [],
    onToggle,
    onSelectAll,
    onDeselectAll,
    labelFor = (v) => v,
}) {
    return (
        <section
            className="MultiSelectPanel"
        >
            <h3>{title}</h3>
            <div className="MultiSelectPanel-actions">
                <button onClick={onSelectAll}>Select All</button>
                <button onClick={onDeselectAll}>Deselect All</button>
            </div>
            <div className="MultiSelectPanel-list">
                {items.map((code) => {
                    const isSelected = (selected || []).includes(code);
                    return (
                        <div
                            key={code}
                            onClick={() => onToggle && onToggle(code)}
                            className={`MultiSelectPanel-item${isSelected ? ' selected' : ''}`}
                        >
                            {labelFor(code)}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default MultiSelectPanel;
