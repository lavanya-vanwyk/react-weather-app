import { describeWeather } from '../weatherCodes.js';

export default function DailyForecast({ data }) {
  const d = data.daily;
  // Week-wide range so each day's bar sits on a shared scale.
  const lo = Math.min(...d.temperature_2m_min);
  const hi = Math.max(...d.temperature_2m_max);
  const pct = (t) => ((t - lo) / (hi - lo || 1)) * 100;

  return (
    <section className="card">
      <h2>7-day forecast</h2>
      <ul className="daily">
        {d.time.map((day, i) => {
          const { label, icon } = describeWeather(d.weather_code[i]);
          const min = d.temperature_2m_min[i];
          const max = d.temperature_2m_max[i];
          const name =
            i === 0 ? 'Today' : new Date(`${day}T12:00`).toLocaleDateString([], { weekday: 'short' });
          return (
            <li key={day} title={label}>
              <span className="day-name">{name}</span>
              <span className="day-icon">{icon}</span>
              <span className="rain">{d.precipitation_probability_max[i] > 0 ? `💧${d.precipitation_probability_max[i]}%` : ''}</span>
              <span className="muted">{Math.round(min)}°</span>
              <span className="range" aria-hidden="true">
                <span style={{ left: `${pct(min)}%`, right: `${100 - pct(max)}%` }} />
              </span>
              <strong>{Math.round(max)}°</strong>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
