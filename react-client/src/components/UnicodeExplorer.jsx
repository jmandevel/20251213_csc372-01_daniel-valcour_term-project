import React, { useState, useEffect } from 'react';
import FilterOptions from './FilterOptions';
import SearchBar from './SearchBar';
import OutputView from './OutputView';
import AuthButton from './AuthButton';
import GitHubButton from './GitHubButton';
import './UnicodeExplorer.css';

// determine API base URL from environment variable or default to localhost
const API_BASE_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_BACKEND_API_BASE_URL || 'http://localhost:3000');

// main component for exploring Unicode characters (all other components are children of this)
function UnicodeExplorer() {
    const [filters, setFilters] = useState({
        isAlphabetic: 'off',
        isWhiteSpace: 'off',
        isDash: 'off',
        isMirrored: 'off',
        hasName: 'off',
        hasNumericValue: 'off',
        hasDecomposition: 'off',
        hasUppercaseMapping: 'off',
        hasLowercaseMapping: 'off',
        hasTitlecaseMapping: 'off',
        hasCombiningClass: 'off',
        math: 'off',
        cased: 'off',
        idStart: 'off',
        xidStart: 'off',
        xidContinue: 'off',
        idContinue: 'off',
        graphemeBase: 'off',
        graphemeLink: 'off',
        graphemeExtend: 'off',
        caseIgnorable: 'off',
        changesWhenCasefolded: 'off',
        changesWhenCasemapped: 'off',
        changesWhenLowercased: 'off',
        changesWhenTitlecased: 'off',
        changesWhenUppercased: 'off',
        defaultIgnorable: 'off',
        isLowercase: 'off',
        isUppercase: 'off',
        isTitlecase: 'off',
        favorited: 'off',
        search: '',
        confusableWith: '',
        notConfusableWith: '',
        scripts: [],
        categories: [],
        classes: [],
        versions: [],
        decompositionTypes: [],
    });
    const [availableScripts, setAvailableScripts] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [availableVersions, setAvailableVersions] = useState([]);
    const [availableDecompositionTypes, setAvailableDecompositionTypes] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [user, setUser] = useState(null);
    const [characters, setCharacters] = useState([]);
    const [serverError, setServerError] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);
    const [page, setPage] = useState(0);
    const [sortColumn, setSortColumn] = useState('codepoint');
    const [sortDirection, setSortDirection] = useState('asc');
    const [showFilters, setShowFilters] = useState(false);
    const [tempFilters, setTempFilters] = useState(filters);
    const [visibleColumns, setVisibleColumns] = useState({
        codepoint: true,
        unicodeId: true,
        character: true,
        name: true,
        script: false,
        category: false,
        numericValue: false,
        decomposition: false,
        decompositionType: false,
        combiningClass: false,
        cccName: false,
        decimalValue: false,
        digitValue: false,
        numericType: false,
        block: false,
        age: false,
        alphabetic: false,
        whiteSpace: false,
        dash: false,
        mirrored: true,
        uppercase: true,
        lowercase: true,
        titlecase: false,
        math: false,
        cased: false,
        idStart: false,
        xidStart: false,
        xidContinue: false,
        idContinue: false,
        graphemeBase: false,
        graphemeLink: false,
        graphemeExtend: false,
        caseIgnorable: false,
        changesWhenCasefolded: false,
        changesWhenCasemapped: false,
        changesWhenLowercased: false,
        changesWhenTitlecased: false,
        changesWhenUppercased: false,
        defaultIgnorable: false,
        isLowercase: false,
        isUppercase: false,
    isTitlecase: false,
  });    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        const queryParts = [];
        
        Object.entries(filters).forEach(([key, value]) => {
            if (key === 'scripts' || key === 'categories' || key === 'classes' || key === 'versions' || key === 'decompositionTypes' || key === 'search' || key === 'confusableWith' || key === 'notConfusableWith') {
                return;
            }
            if (value === 'has') {
                queryParts.push(key);
            } else if (value === 'not') {
                queryParts.push(`not_${key}`);
            }
        });

        if (filters.scripts && filters.scripts.length > 0 && filters.scripts.length < availableScripts.length) {
            queryParts.push(`scripts:${filters.scripts.join('|')}`);
        }
        if (filters.categories && filters.categories.length > 0 && filters.categories.length < availableCategories.length) {
            queryParts.push(`categories:${filters.categories.join('|')}`);
        }
        if (filters.classes && filters.classes.length > 0 && filters.classes.length < availableClasses.length) {
            queryParts.push(`classes:${filters.classes.join('|')}`);
        }
        if (filters.versions && filters.versions.length > 0 && filters.versions.length < availableVersions.length) {
            queryParts.push(`versions:${filters.versions.join('|')}`);
        }
        if (filters.decompositionTypes && filters.decompositionTypes.length > 0 && filters.decompositionTypes.length < availableDecompositionTypes.length) {
            queryParts.push(`decompositionTypes:${filters.decompositionTypes.join('|')}`);
        }
        if (filters.search && filters.search.trim().length > 0) {
            queryParts.push(`search:${filters.search.trim()}`);
        }
        if (filters.confusableWith && filters.confusableWith.trim().length > 0) {
            queryParts.push(`confusableWith:${filters.confusableWith.trim()}`);
        }
        if (filters.notConfusableWith && filters.notConfusableWith.trim().length > 0) {
            queryParts.push(`notConfusableWith:${filters.notConfusableWith.trim()}`);
        }

        if (queryParts.length > 0) {
            params.set('filters', queryParts.join(','));
        } else {
            params.delete('filters');
        }
        
        params.set('page', String(page));
        params.set('sort', sortColumn);
        params.set('dir', sortDirection);

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
    }, [filters, page, sortColumn, sortDirection]);

    useEffect(() => {
        async function initializeData() {
            try {
                const responses = await Promise.all([
                    fetch(`${API_BASE_URL}/api/scripts`),
                    fetch(`${API_BASE_URL}/api/categories`),
                    fetch(`${API_BASE_URL}/api/classes`),
                    fetch(`${API_BASE_URL}/api/versions`),
                    fetch(`${API_BASE_URL}/api/decomposition-types`)
                ]);

                for (const res of responses) {
                    if (!res.ok) {
                        const text = await res.text();
                        throw new Error(`API Error ${res.status} ${res.url}: ${text.substring(0, 100)}`);
                    }
                }

                const [scriptsData, categoriesData, classesData, versionsData, decompositionTypesData] = await Promise.all(
                    responses.map(res => res.json())
                );

                const fetchedScripts = scriptsData.scripts || [];
                const fetchedCategories = categoriesData.categories || [];
                const fetchedClasses = classesData.classes || [];
                const fetchedVersions = versionsData.versions || [];
                const fetchedDecompositionTypes = ['canonical', ...(decompositionTypesData.decompositionTypes || [])];

                setAvailableScripts(fetchedScripts);
                setAvailableCategories(fetchedCategories);
                setAvailableClasses(fetchedClasses);
                setAvailableVersions(fetchedVersions);
                setAvailableDecompositionTypes(fetchedDecompositionTypes);

                setFilters((prev) => ({
                    ...prev,
                    scripts: fetchedScripts,
                    categories: fetchedCategories,
                    classes: fetchedClasses,
                    versions: fetchedVersions,
                    decompositionTypes: fetchedDecompositionTypes
                }));

                try {
                    const userRes = await fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' });
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        setUser(userData);

                        const favoritesRes = await fetch(`${API_BASE_URL}/api/favorites`, { credentials: 'include' });
                        if (favoritesRes.ok) {
                            const favoritesData = await favoritesRes.json();
                            setFavorites(favoritesData.favorites || []);
                        }
                    }
                } catch (error) {
                    console.error('Error loading user/favorites:', error);
                }

                const params = new URLSearchParams(window.location.search);
                const filtersParam = params.get('filters');
                const pageParam = params.get('page');
                const sortParam = params.get('sort');
                const dirParam = params.get('dir');

                if (filtersParam) {
                    const newFilters = {
                        isAlphabetic: false,
                        isWhiteSpace: false,
                        isDash: false,
                        isMirrored: false,
                        hasName: false,
                        hasNumericValue: false,
                        hasDecomposition: false,
                        hasUppercaseMapping: false,
                        hasLowercaseMapping: false,
                        hasTitlecaseMapping: false,
                        hasCombiningClass: false,
                        math: false,
                        cased: false,
                        idStart: false,
                        xidStart: false,
                        xidContinue: false,
                        idContinue: false,
                        graphemeBase: false,
                        graphemeLink: false,
                        graphemeExtend: false,
                        caseIgnorable: false,
                        changesWhenCasefolded: false,
                        changesWhenCasemapped: false,
                        changesWhenLowercased: false,
                        changesWhenTitlecased: false,
                        changesWhenUppercased: false,
                        defaultIgnorable: false,
                        isLowercase: false,
                        isUppercase: false,
                        isTitlecase: false,
                        search: '',
                        confusableWith: '',
                        notConfusableWith: '',
                        scripts: fetchedScripts,
                        categories: fetchedCategories,
                        classes: fetchedClasses,
                        versions: fetchedVersions,
                        decompositionTypes: fetchedDecompositionTypes
                    };
                    const filterArray = filtersParam.split(',').map(f => f.trim()).filter(f => f);
                    for (const filter of filterArray) {
                        if (filter.startsWith('scripts:')) {
                            newFilters.scripts = filter.substring(8).split('|').filter(Boolean);
                        } else if (filter.startsWith('categories:')) {
                            newFilters.categories = filter.substring(11).split('|').filter(Boolean);
                        } else if (filter.startsWith('classes:')) {
                            newFilters.classes = filter.substring(8).split('|').filter(Boolean);
                        } else if (filter.startsWith('versions:')) {
                            newFilters.versions = filter.substring(9).split('|').filter(Boolean);
                        } else if (filter.startsWith('decompositionTypes:')) {
                            newFilters.decompositionTypes = filter.substring(19).split('|').filter(Boolean);
                        } else if (filter.startsWith('search:')) {
                            newFilters.search = filter.substring(7);
                        } else if (filter.startsWith('confusableWith:')) {
                            newFilters.confusableWith = filter.substring(15);
                        } else if (filter.startsWith('notConfusableWith:')) {
                            newFilters.notConfusableWith = filter.substring(18);
                        } else if (filter.startsWith('not_')) {
                            newFilters[filter.substring(4)] = 'not';
                        } else {
                            newFilters[filter] = 'has';
                        }
                    }
                    setFilters(newFilters);
                }

                if (pageParam) {
                    const pageNum = parseInt(pageParam, 10);
                    if (!isNaN(pageNum) && pageNum >= 0) {
                        setPage(pageNum);
                    }
                }
                if (sortParam) {
                    setSortColumn(sortParam);
                }
                if (dirParam && (dirParam === 'asc' || dirParam === 'desc')) {
                    setSortDirection(dirParam);
                }
            } catch (error) {
                console.error('Error initializing data:', error);
                setServerError(true);
            }
        }

        initializeData();
    }, []);

    function handleOpenFilters(currentSearchText) {
        const newFilters = { ...filters };
        if (typeof currentSearchText === 'string') {
            newFilters.search = currentSearchText;
        }
        setTempFilters(newFilters);
        setShowFilters(true);
    }

    function handleCancelFilters() {
        setTempFilters(filters);
        setShowFilters(false);
    }

    function handleConfirmFilters() {
        setFilters(tempFilters);
        setPage(0);
        setShowFilters(false);
        if (tempFilters.search && tempFilters.search.trim() !== '') {
            setSortColumn('similarity');
            setSortDirection('asc');
        } else {
            setSortColumn('codepoint');
            setSortDirection('asc');
        }
    }

    function handleTempFilterChange(newFilters) {
        setTempFilters(newFilters);
    }

    useEffect(() => {
        async function fetchCharacters() {
            try {
                if (!filters.scripts?.length || !filters.categories?.length || !filters.classes?.length || !filters.versions?.length || !filters.decompositionTypes?.length) {
                    setCharacters([]);
                    return;
                }

                const queryParts = [];
                
                Object.entries(filters).forEach(([key, value]) => {
                    if (key === 'scripts' || key === 'categories' || key === 'classes' || key === 'versions' || key === 'decompositionTypes' || key === 'search' || key === 'confusableWith' || key === 'notConfusableWith') {
                        return;
                    }
                    if (value === 'has') {
                        queryParts.push(key);
                    } else if (value === 'not') {
                        queryParts.push(`not_${key}`);
                    }
                });
                if (filters.scripts && filters.scripts.length > 0 && filters.scripts.length < availableScripts.length) {
                    queryParts.push(`scripts:${filters.scripts.join('|')}`);
                }
                if (filters.categories && filters.categories.length > 0 && filters.categories.length < availableCategories.length) {
                    queryParts.push(`categories:${filters.categories.join('|')}`);
                }
                if (filters.classes && filters.classes.length > 0 && filters.classes.length < availableClasses.length) {
                    queryParts.push(`classes:${filters.classes.join('|')}`);
                }
                if (filters.versions && filters.versions.length > 0 && filters.versions.length < availableVersions.length) {
                    queryParts.push(`versions:${filters.versions.join('|')}`);
                }
                if (filters.decompositionTypes && filters.decompositionTypes.length > 0 && filters.decompositionTypes.length < availableDecompositionTypes.length) {
                    queryParts.push(`decompositionTypes:${filters.decompositionTypes.join('|')}`);
                }
                if (filters.search && filters.search.trim().length > 0) {
                    queryParts.push(`search:${filters.search.trim()}`);
                }
                if (filters.confusableWith && filters.confusableWith.trim().length > 0) {
                    queryParts.push(`confusableWith:${filters.confusableWith.trim()}`);
                }
                if (filters.notConfusableWith && filters.notConfusableWith.trim().length > 0) {
                    queryParts.push(`notConfusableWith:${filters.notConfusableWith.trim()}`);
                }

                const query = queryParts.join(',');
                const baseUrl = `${API_BASE_URL}/api/characters`;
                const urlParams = new URLSearchParams();
                if (query.length > 0) {
                    urlParams.set('filters', query);
                }
                urlParams.set('page', page);
                urlParams.set('sort', sortColumn);
                urlParams.set('dir', sortDirection);
                const url = `${baseUrl}?${urlParams.toString()}`;
                const response = await fetch(url, { credentials: 'include' });
                const data = await response.json();
                setCharacters(data.characters || []);
                setTotalCount(data.totalCount || 0);
            } catch (error) {
                console.error('Error fetching characters:', error);
                setCharacters([]);
                setServerError(true);
            }
        }

        fetchCharacters();
    }, [filters, page, sortColumn, sortDirection, refreshKey]);

    async function handleToggleFavorite(codepoint) {
        if (!user) return;
        
        const isFavorited = favorites.includes(codepoint);
        
        setFavorites(prev => {
            if (isFavorited) {
                return prev.filter(cp => cp !== codepoint);
            } else {
                return [...prev, codepoint];
            }
        });
        
        try {
            if (isFavorited) {
                const res = await fetch(`${API_BASE_URL}/api/favorites/${codepoint}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (!res.ok) throw new Error('Failed to delete');

                if (filters && filters.favorited === 'has') {
                    setRefreshKey(k => k + 1);
                }
            } else {
                const res = await fetch(`${API_BASE_URL}/api/favorites`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ codepoint }),
                    credentials: 'include'
                });
                if (!res.ok) throw new Error('Failed to add');

                if (filters && filters.favorited === 'not') {
                    setRefreshKey(k => k + 1);
                }
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            setFavorites(prev => {
                if (isFavorited) {
                    return [...prev, codepoint];
                } else {
                    return prev.filter(cp => cp !== codepoint);
                }
            });
        }
    }

    async function handleLogout() {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            setUser(null);
            setFavorites([]);
            if (filters.favorited) {
                const newFilters = { ...filters };
                delete newFilters.favorited;
                setFilters(newFilters);
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }

    return (
        <div className="UnicodeExplorer">
            {serverError ? (
                <div className="error-message">something is broken ¯\_(ツ)_/¯</div>
            ) : (
                <>
                    <div className="header-row">
                        <SearchBar
                            value={filters.search}
                            onSearch={(term) => { 
                                setFilters({ ...filters, search: term }); 
                                setPage(0); 
                                if (term && term.trim() !== '') {
                                    setSortColumn('similarity');
                                    setSortDirection('asc');
                                } else {
                                    setSortColumn('codepoint');
                                    setSortDirection('asc');
                                }
                            }}
                            showFilters={showFilters}
                            onToggleFilters={handleOpenFilters}
                        />
                        <div className="header-actions">
                            <GitHubButton />
                            <AuthButton user={user} onLogout={handleLogout} />
                        </div>
                    </div>
                    <FilterOptions
                        filters={tempFilters}
                        onFilterChange={handleTempFilterChange}
                        availableScripts={availableScripts}
                        availableCategories={availableCategories}
                        availableClasses={availableClasses}
                        availableVersions={availableVersions}
                        availableDecompositionTypes={availableDecompositionTypes}
                        show={showFilters}
                        onCancel={handleCancelFilters}
                        onConfirm={handleConfirmFilters}
                        isAuthenticated={!!user}
                    />
                    <OutputView 
                        characters={characters} 
                        totalCount={totalCount} 
                        page={page} 
                        onChangePage={setPage}
                        visibleColumns={visibleColumns}
                        onVisibleColumnsChange={setVisibleColumns}
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={(column) => {
                            if (column === sortColumn) {
                                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                            } else {
                                setSortColumn(column);
                                setSortDirection('asc');
                            }
                            setPage(0);
                        }}
                        favorites={favorites}
                        onToggleFavorite={handleToggleFavorite}
                        isAuthenticated={!!user}
                    />
                </>
            )}
        </div>
    );
}

export default UnicodeExplorer;
