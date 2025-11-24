import React, { useState, useEffect, useRef } from 'react';
import './OutputView.css';
import { combiningClassNames } from '../constants';
import Pager from './Pager';
import ColumnSelector from './ColumnSelector';
import DataTable from './DataTable';

// component to render the output view with pagination, column selection, and data table
function OutputView({ characters, totalCount = 0, page = 0, onChangePage, visibleColumns = {}, onVisibleColumnsChange, sortColumn, sortDirection, onSort, favorites = [], onToggleFavorite, isAuthenticated = false }) {
    const [pageInput, setPageInput] = useState(String(page));
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [showAdvancedColumns, setShowAdvancedColumns] = useState(false);
    const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0 });
    const tableContainerRef = useRef(null);
    const tooltipRef = useRef(null);

    const MIN_PAGE = 0;
    const MAX_PAGE = Math.max(0, Math.ceil(totalCount / 256) - 1);
    const pageStartGlyph = page * 256;
    const pageEndGlyph = Math.min(pageStartGlyph + 255, totalCount - 1);

    useEffect(() => {
        setPageInput(String(page));
    }, [page]);

    useEffect(() => {
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollTop = 0;
        }
    }, [characters]);

    useEffect(() => {
        if (tooltipRef.current && tooltip.show) {
            tooltipRef.current.style.left = `${tooltip.x}px`;
            tooltipRef.current.style.top = `${tooltip.y}px`;
        }
    }, [tooltip]);

    const clampPage = (p) => Math.max(MIN_PAGE, Math.min(MAX_PAGE, p));

    const handleFirst = () => onChangePage && onChangePage(MIN_PAGE);
    const handlePrev = () => onChangePage && onChangePage(clampPage(page - 1));
    const handleNext = () => onChangePage && onChangePage(clampPage(page + 1));
    const handleLast = () => onChangePage && onChangePage(MAX_PAGE);
    const handleInputChange = (e) => {
        const raw = e.target.value;
        setPageInput(raw);
    };
    const handleGo = () => {
        const parsed = parseInt(pageInput, 10);
        const val = clampPage(isNaN(parsed) ? 0 : parsed);
        onChangePage && onChangePage(val);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleGo();
    };

    const handleToggleColumns = () => {
        setShowColumnSelector(!showColumnSelector);
        setShowAdvancedColumns(false);
    };

    const handleShowMore = () => setShowAdvancedColumns(true);

    const basicColumnOptions = [
        { key: 'codepoint', label: 'Codepoint' },
        { key: 'unicodeId', label: 'Unicode ID' },
        { key: 'character', label: 'Character' },
        { key: 'name', label: 'Name' },
        { key: 'script', label: 'Script' },
        { key: 'numericValue', label: 'Numeric Value' },
        { key: 'alphabetic', label: 'Alphabetic' },
        { key: 'whiteSpace', label: 'White Space' },
        { key: 'mirrored', label: 'Mirrored' },
        { key: 'uppercase', label: 'Uppercase' },
        { key: 'lowercase', label: 'Lowercase' },
    ];

    const advancedColumnOptions = [
        { key: 'category', label: 'Category' },
        { key: 'decomposition', label: 'Decomposition' },
        { key: 'decompositionType', label: 'Decomposition Type' },
        { key: 'combiningClass', label: 'Combining Class' },
        { key: 'cccName', label: 'Combining Class Name' },
        { key: 'decimalValue', label: 'Decimal Value' },
        { key: 'digitValue', label: 'Digit Value' },
        { key: 'numericType', label: 'Numeric Type' },
        { key: 'block', label: 'Block' },
        { key: 'age', label: 'Age' },
        { key: 'titlecase', label: 'Titlecase' },
        { key: 'dash', label: 'Dash' },
        { key: 'math', label: 'Math' },
        { key: 'hasMirror', label: 'Has Mirror' },
        { key: 'hasLowercase', label: 'Has Lowercase' },
        { key: 'hasUppercase', label: 'Has Uppercase' },
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
        { key: 'defaultIgnorable', label: 'Default Ignorable' },
    ];

    function toggleColumn(key) {
        if (!onVisibleColumnsChange) return;
        const next = { ...visibleColumns, [key]: !visibleColumns[key] };
        onVisibleColumnsChange(next);
    }

    function handleCellClick(value, e) {
        if (!value) return;
        try {
            if (navigator?.clipboard?.writeText) {
                navigator.clipboard.writeText(String(value));
            }
        } catch {}
        const x = e?.clientX ?? 0;
        const y = e?.clientY ?? 0;
        setTooltip({ show: true, x, y });
        window.clearTimeout(handleCellClick._t);
        handleCellClick._t = window.setTimeout(() => setTooltip({ show: false, x: 0, y: 0 }), 700);
    }

    function renderClickableCell(value, extraClass = '') {
        const display = value === null || value === undefined ? '' : value;
        const hasContent = display !== '';
        return (
            <td className={hasContent ? `clickable-cell ${extraClass}`.trim() : extraClass} onClick={(e) => hasContent && handleCellClick(display, e)}>
                {display}
            </td>
        );
    }

    function renderFlagCell(flag) {
        return <td className="flag-cell">{flag ? '🗸' : ''}</td>;
    }

    function getNumericType(char) {
        if (!char) return '';
        if (char.decimal_digit_value !== null && char.decimal_digit_value !== undefined) return 'Decimal';
        if (char.digit_value !== null && char.digit_value !== undefined) return 'Digit';
        if (char.numeric_value !== null && char.numeric_value !== undefined) return 'Numeric';
        return '';
    }

    function getDecompositionType(decomposition) {
        if (!decomposition) return '';
        const m = /^<([^>]+)>/.exec(decomposition);
        return m ? m[1] : '';
    }

    function getCombiningClassName(ccc) {
        if (ccc === null || ccc === undefined) return '';
        return combiningClassNames[ccc] || '';
    }
    return (
        <section className="OutputView">
            {tooltip.show && (
                <div 
                    ref={tooltipRef}
                    className="copy-tooltip"
                >
                    Copied!
                </div>
            )}
            <Pager
                page={page}
                minPage={MIN_PAGE}
                maxPage={MAX_PAGE}
                pageInput={pageInput}
                onInputChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onGo={handleGo}
                onFirst={handleFirst}
                onPrev={handlePrev}
                onNext={handleNext}
                onLast={handleLast}
                onToggleColumns={handleToggleColumns}
                glyphRangeText={totalCount > 0 ? `Glyphs ${pageStartGlyph}–${pageEndGlyph} / ${totalCount} total` : ''}
            />
            {showColumnSelector && (
                <ColumnSelector
                    basicColumnOptions={basicColumnOptions}
                    advancedColumnOptions={advancedColumnOptions}
                    visibleColumns={visibleColumns}
                    showAdvancedColumns={showAdvancedColumns}
                    onToggleColumn={toggleColumn}
                    onShowMore={handleShowMore}
                />
            )}
            {characters.length === 0 ? (
                <p className="empty-state"></p>
            ) : (
                <div className="table-container" ref={tableContainerRef}>
                    <DataTable
                        characters={characters}
                        visibleColumns={visibleColumns}
                        renderClickableCell={renderClickableCell}
                        renderFlagCell={renderFlagCell}
                        getNumericType={getNumericType}
                        getDecompositionType={getDecompositionType}
                        getCombiningClassName={getCombiningClassName}
                        handleCellClick={handleCellClick}
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={onSort}
                        favorites={favorites}
                        onToggleFavorite={onToggleFavorite}
                        isAuthenticated={isAuthenticated}
                    />
                </div>
            )}
        </section>
    );
}

export default OutputView;
