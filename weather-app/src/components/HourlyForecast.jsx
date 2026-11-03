import { describeWeather } from '../weatherCodes.js';

export default function HourlyForecast({ data }) {
  const h = data.hourly;
  // Times are in the location's local timezone; start from the current hour there.
  const nowHour = data.current.time.slice(0, 13);
  const start = Math.max(0, h.time.findIndex((t) => t.slice(0, 13) === nowHour));
  const hours = h.time.slice(start, start + 24).map((t, i) => ({
    time: t,
    temp: h.temperature_2m[start + i],
    rain: h.precipitation_probability[start + i],
    ...describeWeather(h.weather_code[start + i], h.is_day[start + i]),
  }));

  return (
    <section className="card">
      <h2>Next 24 hours</h2>
      <div className="hourly">
        {hours.map((hr, i) => (
          <div className="hour" key={hr.time} title={hr.label}>
            <span className="muted">{i === 0 ? 'Now' : `${Number(hr.time.slice(11, 13))}:00`}</span>
            <span className="hour-icon">{hr.icon}</span>
            <strong>{Math.round(hr.temp)}°</strong>
            <span className="rain">{hr.rain > 0 ? `💧${hr.rain}%` : ' '}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
