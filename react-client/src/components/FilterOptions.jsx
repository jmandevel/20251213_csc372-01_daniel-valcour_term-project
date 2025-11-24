import MultiSelectPanel from './MultiSelectPanel';
import { categoryLabels, classLabels } from '../constants';
import './FilterOptions.css';

// component to render filter options for character data
function FilterOptions({ filters, onFilterChange, availableScripts, availableCategories, availableClasses, availableVersions, availableDecompositionTypes, show, onCancel, onConfirm, isAuthenticated }) {
    // map of property filter options to names
    const filterOptions = [
        { key: 'favorited', label: 'Favorited', requiresAuth: true },
        { key: 'isAlphabetic', label: 'Alphabetic' },
        { key: 'isWhiteSpace', label: 'White Space' },
        { key: 'isDash', label: 'Dash' },
        { key: 'isMirrored', label: 'Mirrored' },
        { key: 'hasName', label: 'Has Name' },
        { key: 'hasNumericValue', label: 'Has Numeric Value' },
        { key: 'hasDecomposition', label: 'Has Decomposition' },
        { key: 'hasCombiningClass', label: 'Has Combining Class' },
        { key: 'hasMirror', label: 'Has Mirror' },
        { key: 'math', label: 'Math' },
        { key: 'hasUppercaseMapping', label: 'Has Uppercase Mapping' },
        { key: 'hasLowercaseMapping', label: 'Has Lowercase Mapping' },
        { key: 'hasTitlecaseMapping', label: 'Has Titlecase Mapping' },
        { key: 'isLowercase', label: 'Is Lowercase' },
        { key: 'isUppercase', label: 'Is Uppercase' },
        { key: 'isTitlecase', label: 'Is Titlecase' },
        { key: 'caseIgnorable', label: 'Case Ignorable' },
        { key: 'changesWhenCasefolded', label: 'Changes When Casefolded' },
        { key: 'changesWhenCasemapped', label: 'Changes When Casemapped' },
        { key: 'changesWhenLowercased', label: 'Changes When Lowercased' },
        { key: 'changesWhenTitlecased', label: 'Changes When Titlecased' },
        { key: 'changesWhenUppercased', label: 'Changes When Uppercased' },
        { key: 'idStart', label: 'ID Start' },
        { key: 'xidStart', label: 'XID Start' },
        { key: 'xidContinue', label: 'XID Continue' },
        { key: 'idContinue', label: 'ID Continue' },
        { key: 'graphemeBase', label: 'Grapheme Base' },
        { key: 'graphemeLink', label: 'Grapheme Link' },
        { key: 'graphemeExtend', label: 'Grapheme Extend' },
        { key: 'defaultIgnorable', label: 'Default Ignorable Code Point' },
    ];

    // function to toggle filter state
    function handleToggle(filterKey) {
        const current = filters[filterKey] || 'off';
        let next;
        if (current === 'off') next = 'has';
        else if (current === 'has') next = 'not';
        else next = 'off';

        onFilterChange({
            ...filters,
            [filterKey]: next
        });
    }

    // click multi-select option
    function handleScriptToggle(script) {
        const currentScripts = filters.scripts || [];
        const newScripts = currentScripts.includes(script)
            ? currentScripts.filter(s => s !== script)
            : [...currentScripts, script];
        onFilterChange({
            ...filters,
            scripts: newScripts
        });
    }

    // click select all button
    function handleSelectAllScripts() {
        onFilterChange({
            ...filters,
            scripts: availableScripts
        });
    }

    // click deselect all button
    function handleDeselectAllScripts() {
        onFilterChange({
            ...filters,
            scripts: []
        });
    }

    // click category option
    function handleCategoryToggle(code) {
        const currentCategories = filters.categories || [];
        const newCategories = currentCategories.includes(code)
            ? currentCategories.filter(c => c !== code)
            : [...currentCategories, code];
        onFilterChange({
            ...filters,
            categories: newCategories
        });
    }

    // click select all categories button
    function handleSelectAllCategories() {
        onFilterChange({
            ...filters,
            categories: availableCategories || []
        });
    }

    // click deselect all categories button
    function handleDeselectAllCategories() {
        onFilterChange({
            ...filters,
            categories: []
        });
    }

    // click class option
    function handleClassToggle(code) {
        const currentClass = filters.classes || [];
        const newClasses = currentClass.includes(code)
            ? currentClass.filter(b => b !== code)
            : [...currentClass, code];
        onFilterChange({
            ...filters,
            classes: newClasses
        });
    }

    // click select all classes button
    function handleSelectAllClasses() {
        onFilterChange({
            ...filters,
            classes: availableClasses || []
        });
    }

    // click deselect all classes button
    function handleDeselectAllClasses() {
        onFilterChange({
            ...filters,
            classes: []
        });
    }

    // click version option
    function handleVersionToggle(version) {
        const currentVersions = filters.versions || [];
        const newVersions = currentVersions.includes(version)
            ? currentVersions.filter(v => v !== version)
            : [...currentVersions, version];
        onFilterChange({
            ...filters,
            versions: newVersions
        });
    }

    // click select all versions button
    function handleSelectAllVersions() {
        onFilterChange({
            ...filters,
            versions: availableVersions || []
        });
    }

    // click deselect all versions button
    function handleDeselectAllVersions() {
        onFilterChange({
            ...filters,
            versions: []
        });
    }

    // click decomposition type option
    function handleDecompositionTypeToggle(dtype) {
        const currentTypes = filters.decompositionTypes || [];
        const newTypes = currentTypes.includes(dtype)
            ? currentTypes.filter(t => t !== dtype)
            : [...currentTypes, dtype];
        onFilterChange({
            ...filters,
            decompositionTypes: newTypes
        });
    }

    // click select all decomposition types button
    function handleSelectAllDecompositionTypes() {
        onFilterChange({
            ...filters,
            decompositionTypes: availableDecompositionTypes || []
        });
    }

    // click deselect all decomposition types button
    function handleDeselectAllDecompositionTypes() {
        onFilterChange({
            ...filters,
            decompositionTypes: []
        });
    }

    return show ? (
        <div className="filter-overlay">
            <div className="filter-overlay-content">
                <div className="filter-overlay-scroll">
                    <div className="FilterOptions-container">
                        <section className="MultiSelectPanel">
                            <h3>Confusables</h3>
                            <div className="confusable-input-container">
                                <label className="confusable-label">Confusable With:</label>
                                <input
                                    type="text"
                                    value={filters.confusableWith || ''}
                                    onChange={(e) => {
                                        const value = Array.from(e.target.value).filter(char => char.trim()).join('');
                                        onFilterChange({ ...filters, confusableWith: value });
                                    }}
                                    placeholder="Characters..."
                                    className="confusable-input"
                                />
                            </div>
                            <div className="confusable-input-container">
                                <label className="confusable-label">Not Confusable With:</label>
                                <input
                                    type="text"
                                    value={filters.notConfusableWith || ''}
                                    onChange={(e) => {
                                        const value = Array.from(e.target.value).filter(char => char.trim()).join('');
                                        onFilterChange({ ...filters, notConfusableWith: value });
                                    }}
                                    placeholder="Characters..."
                                    className="confusable-input"
                                />
                            </div>
                        </section>

                        <section className="MultiSelectPanel properties-panel">
                            <h3>Properties</h3>
                            <div className="MultiSelectPanel-list">
                                {filterOptions.map((option) => {
                                    if (option.requiresAuth && !isAuthenticated) {
                                        return null;
                                    }

                                    const state = filters[option.key] || 'off';
                                    let displayLabel = option.label;
                                    let className = 'MultiSelectPanel-item';

                                    if (state === 'has') {
                                        displayLabel = '✓ ' + option.label;
                                        className += ' selected';
                                    } else if (state === 'not') {
                                        displayLabel = '✗ ' + option.label;
                                        className += ' selected-not';
                                    }

                                    return (
                                        <div
                                            key={option.key}
                                            onClick={() => handleToggle(option.key)}
                                            className={className}
                                        >
                                            {displayLabel}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {availableScripts.length > 0 && (
                            <MultiSelectPanel
                                title="Scripts"
                                items={availableScripts}
                                selected={filters.scripts || []}
                                onToggle={handleScriptToggle}
                                onSelectAll={handleSelectAllScripts}
                                onDeselectAll={handleDeselectAllScripts}
                                labelFor={(v) => v}
                            />
                        )}

                        <MultiSelectPanel
                            title="Category"
                            items={availableCategories || []}
                            selected={filters.categories || []}
                            onToggle={handleCategoryToggle}
                            onSelectAll={handleSelectAllCategories}
                            onDeselectAll={handleDeselectAllCategories}
                            labelFor={(code) => `${code} - ${categoryLabels[code] || code}`}
                        />

                        <MultiSelectPanel
                            title="Class"
                            items={availableClasses || []}
                            selected={filters.classes || []}
                            onToggle={handleClassToggle}
                            onSelectAll={handleSelectAllClasses}
                            onDeselectAll={handleDeselectAllClasses}
                            labelFor={(code) => `${code} - ${classLabels[code] || code}`}
                        />

                        <MultiSelectPanel
                            title="Unicode Version"
                            items={availableVersions || []}
                            selected={filters.versions || []}
                            onToggle={handleVersionToggle}
                            onSelectAll={handleSelectAllVersions}
                            onDeselectAll={handleDeselectAllVersions}
                            labelFor={(v) => v}
                        />

                        <MultiSelectPanel
                            title="Decomposition Type"
                            items={availableDecompositionTypes || []}
                            selected={filters.decompositionTypes || []}
                            onToggle={handleDecompositionTypeToggle}
                            onSelectAll={handleSelectAllDecompositionTypes}
                            onDeselectAll={handleDeselectAllDecompositionTypes}
                            labelFor={(dt) => dt}
                        />
                    </div>
                </div>
                <div className="filter-overlay-buttons">
                    <button className="filter-cancel-btn" onClick={onCancel}>Cancel</button>
                    <button className="filter-confirm-btn" onClick={onConfirm}>Confirm</button>
                </div>
            </div>
        </div>
    ) : null;
}

export default FilterOptions;
