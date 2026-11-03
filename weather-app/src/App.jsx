import { useCallback, useEffect, useState } from 'react';
import SearchBar from './components/SearchBar.jsx';
import CurrentWeather from './components/CurrentWeather.jsx';
import HourlyForecast from './components/HourlyForecast.jsx';
import DailyForecast from './components/DailyForecast.jsx';
import { getForecast, reverseGeocode } from './api.js';
import { themeFor } from './weatherCodes.js';

const REFRESH_MS = 10 * 60 * 1000; // Open-Meteo updates current conditions every 15 min
const DEFAULT_PLACE = { id: 2643743, name: 'London', region: 'England', country: 'United Kingdom', latitude: 51.50853, longitude: -0.12574 };

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export default function App() {
  const [place, setPlace] = useState(() => load('weather.place', DEFAULT_PLACE));
  const [units, setUnits] = useState(() => load('weather.units', 'metric'));
  const [recent, setRecent] = useState(() => load('weather.recent', []));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [, tick] = useState(0);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await getForecast(place, units));
      setUpdatedAt(Date.now());
    } catch (e) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [place, units]);

  // Fetch on place/unit change, then keep the data live.
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, REFRESH_MS);
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  // Re-render every 30s so the "updated x min ago" label stays accurate.
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => save('weather.place', place), [place]);
  useEffect(() => save('weather.units', units), [units]);
  useEffect(() => save('weather.recent', recent), [recent]);

  function selectPlace(city) {
    setPlace(city);
    setRecent((r) => [city, ...r.filter((c) => c.id !== city.id)].slice(0, 5));
  }

  function locate() {
    if (!navigator.geolocation) return setError('Geolocation is not supported by this browser');
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const name = await reverseGeocode(coords.latitude, coords.longitude);
        setPlace({ id: 'geo', latitude: coords.latitude, longitude: coords.longitude, ...name });
      },
      () => {
        setLoading(false);
        setError('Location permission was denied');
      }
    );
  }

  const theme = data ? themeFor(data.current.weather_code, data.current.is_day) : 'clear';
  const minutesAgo = updatedAt ? Math.floor((Date.now() - updatedAt) / 60000) : null;

  return (
    <div className={`app theme-${theme}`}>
      <div className="container">
        <header className="topbar">
          <SearchBar onSelect={selectPlace} onLocate={locate} recent={recent} />
          <div className="units" role="group" aria-label="Units">
            <button className={units === 'metric' ? 'on' : ''} onClick={() => setUnits('metric')}>°C</button>
            <button className={units === 'imperial' ? 'on' : ''} onClick={() => setUnits('imperial')}>°F</button>
          </div>
        </header>

        {error && (
          <div className="card error" role="alert">
            {error} <button onClick={refresh}>Retry</button>
          </div>
        )}

        {!data && loading && (
          <div className="loading">
            <span className="spinner" /> Loading weather…
          </div>
        )}

        {data && (
          <main className={loading ? 'is-refreshing' : ''}>
            <CurrentWeather place={place} data={data} />
            <HourlyForecast data={data} />
            <DailyForecast data={data} />
          </main>
        )}

        <footer>
          <span className="live-dot" aria-hidden="true" />
          {minutesAgo === null ? 'Connecting…' : minutesAgo < 1 ? 'Updated just now' : `Updated ${minutesAgo} min ago`}
          {' · '}
          <button className="link" onClick={refresh} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
          {' · '}Data by <a href="https://open-meteo.com" target="_blank" rel="noreferrer">Open-Meteo</a>
        </footer>
      </div>
    </div>
  );
}
