// Open-Meteo: free, no API key required. https://open-meteo.com
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export async function searchCities(query, signal) {
  const params = new URLSearchParams({ name: query, count: '8', language: 'en', format: 'json' });
  const res = await fetch(`${GEO_URL}?${params}`, { signal });
  if (!res.ok) throw new Error('City search failed');
  const data = await res.json();
  return (data.results || []).map((r) => ({
    id: r.id,
    name: r.name,
    region: r.admin1 || '',
    country: r.country || '',
    countryCode: r.country_code || '',
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

// Best-effort name lookup for "use my location"; falls back to coordinates.
export async function reverseGeocode(latitude, longitude) {
  try {
    const params = new URLSearchParams({ lat: latitude, lon: longitude, format: 'json', zoom: '10' });
    const res = await fetch(`${REVERSE_URL}?${params}`);
    const data = await res.json();
    const a = data.address || {};
    return {
      name: a.city || a.town || a.village || a.suburb || 'Current location',
      region: a.state || '',
      country: a.country || '',
    };
  } catch {
    return { name: 'Current location', region: '', country: '' };
  }
}

export async function getForecast({ latitude, longitude }, units) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    timezone: 'auto',
    forecast_days: '7',
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'is_day',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'pressure_msl',
    ].join(','),
    hourly: ['temperature_2m', 'precipitation_probability', 'weather_code', 'is_day'].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'sunrise',
      'sunset',
      'uv_index_max',
    ].join(','),
    temperature_unit: units === 'imperial' ? 'fahrenheit' : 'celsius',
    wind_speed_unit: units === 'imperial' ? 'mph' : 'kmh',
  });
  const res = await fetch(`${FORECAST_URL}?${params}`);
  if (!res.ok) throw new Error('Could not load the forecast');
  return res.json();
}
