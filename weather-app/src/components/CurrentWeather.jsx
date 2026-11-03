import { describeWeather } from '../weatherCodes.js';

const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const compass = (deg) => DIRECTIONS[Math.round(deg / 45) % 8];
const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export default function CurrentWeather({ place, data }) {
  const c = data.current;
  const u = data.current_units;
  const today = data.daily;
  const { label, icon } = describeWeather(c.weather_code, c.is_day);

  const stats = [
    ['Feels like', `${Math.round(c.apparent_temperature)}°`],
    ['Humidity', `${c.relative_humidity_2m}%`],
    ['Wind', `${Math.round(c.wind_speed_10m)} ${u.wind_speed_10m} ${compass(c.wind_direction_10m)}`],
    ['Pressure', `${Math.round(c.pressure_msl)} hPa`],
    ['UV index', Math.round(today.uv_index_max[0])],
    ['Precipitation', `${c.precipitation} ${u.precipitation}`],
    ['Sunrise', formatTime(today.sunrise[0])],
    ['Sunset', formatTime(today.sunset[0])],
  ];

  return (
    <section className="card current">
      <div className="current-main">
        <div>
          <h1>{place.name}</h1>
          <p className="muted">{[place.region, place.country].filter(Boolean).join(', ')}</p>
          <div className="temp">
            {Math.round(c.temperature_2m)}
            <span>{u.temperature_2m}</span>
          </div>
          <p className="condition">{label}</p>
          <p className="muted">
            H: {Math.round(today.temperature_2m_max[0])}° · L: {Math.round(today.temperature_2m_min[0])}°
          </p>
        </div>
        <div className="current-icon" aria-hidden="true">
          {icon}
        </div>
      </div>
      <dl className="stats">
        {stats.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
