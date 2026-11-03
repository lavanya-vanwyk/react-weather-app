# Weather App

A React + Vite weather app that shows live data from [Open-Meteo](https://open-meteo.com).

## Features
- City search with autocomplete. Searches are debounced and stale requests are cancelled. You can pick a result with the arrow keys and Enter.
- 📍 Use my location (browser geolocation)
- Current conditions: temperature, feels like, humidity, wind, pressure, UV, sunrise and sunset
- Hourly forecast for the next 24 hours and a 7-day forecast with temperature range bars
- Live data: refreshes every 10 minutes and when you return to the tab, and shows when it last updated
- °C / °F toggle, recent searches, and your last city is remembered
- The background changes with the weather and the time of day

## Run it
Requires Node.js 18+.

```bash
npm install
npm run dev
```

## Structure
```
src/
  api.js              # Open-Meteo geocoding + forecast calls
  weatherCodes.js     # WMO code → label / icon / theme
  App.jsx             # state, live refresh, layout
  components/
    SearchBar.jsx
    CurrentWeather.jsx
    HourlyForecast.jsx
    DailyForecast.jsx
```
Created in fulfilment of the project requirements for the SheCodes React Workshop