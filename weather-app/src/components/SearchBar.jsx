import { useEffect, useRef, useState } from 'react';
import { searchCities } from '../api.js';

export default function SearchBar({ onSelect, onLocate, recent }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);

  // Debounced autocomplete; aborts the previous request when the query changes.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(() => {
      searchCities(q, controller.signal)
        .then((r) => {
          setResults(r);
          setActive(r.length ? 0 : -1);
        })
        .catch((err) => err.name !== 'AbortError' && setResults([]))
        .finally(() => !controller.signal.aborted && setLoading(false));
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const close = (e) => boxRef.current && !boxRef.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const showRecent = query.trim().length < 2 && recent.length > 0;
  const items = showRecent ? recent : results;

  function choose(city) {
    onSelect(city);
    setQuery('');
    setResults([]);
    setOpen(false);
  }

  function onKeyDown(e) {
    if (!open || !items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(items[Math.max(active, 0)]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="search" ref={boxRef}>
      <div className="search-row">
        <div className="search-input">
          <span aria-hidden="true">🔍</span>
          <input
            type="search"
            placeholder="Search for a city…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            aria-label="Search for a city"
            aria-autocomplete="list"
            aria-expanded={open && items.length > 0}
          />
          {loading && <span className="spinner small" aria-label="Searching" />}
        </div>
        <button className="icon-btn" onClick={onLocate} title="Use my location" aria-label="Use my location">
          📍
        </button>
      </div>

      {open && (items.length > 0 || (!loading && query.trim().length >= 2)) && (
        <ul className="suggestions" role="listbox">
          {showRecent && <li className="suggestions-label">Recent</li>}
          {items.map((c, i) => (
            <li
              key={`${c.id}-${c.latitude}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'active' : ''}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(c);
              }}
            >
              <strong>{c.name}</strong>
              <span>{[c.region, c.country].filter(Boolean).join(', ')}</span>
            </li>
          ))}
          {!showRecent && !items.length && <li className="suggestions-empty">No cities found</li>}
        </ul>
      )}
    </div>
  );
}
