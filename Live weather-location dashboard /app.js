
const searchForm = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const gpsBtn = document.getElementById('gpsBtn');
const unitToggle = document.getElementById('unitToggle');
const saveCityBtn = document.getElementById('saveCityBtn');
const savedCitiesEl = document.getElementById('savedCities');
const statusMsg = document.getElementById('statusMsg');
const currentDateEl = document.getElementById('currentDate');

const cityNameEl = document.getElementById('cityName');
const coordsTextEl = document.getElementById('coordsText');
const weatherIconEl = document.getElementById('weatherIcon');
const tempValueEl = document.getElementById('tempValue');
const weatherDescEl = document.getElementById('weatherDesc');
const feelsValEl = document.getElementById('feelsVal');
const humidityValEl = document.getElementById('humidityVal');
const windValEl = document.getElementById('windVal');
const uvValEl = document.getElementById('uvVal');
const pressureValEl = document.getElementById('pressureVal');
const sunValEl = document.getElementById('sunVal');
const forecastListEl = document.getElementById('forecastList');

let isCelsius = true;
let savedCities = JSON.parse(localStorage.getItem('weather_saved_cities')) || ['Nairobi', 'Kericho', 'Mombasa'];

let state = {
  shortName: 'Nairobi',
  city: 'Nairobi, Kenya',
  lat: -1.29,
  lon: 36.82,
  tempC: 23,
  feelsC: 24,
  humidity: 58,
  wind: 14,
  uv: 6,
  pressure: 1016,
  sunrise: '06:18',
  sunset: '18:24',
  desc: 'Partly Cloudy',
  icon: '⛅',
  forecast: [
    { day: 'Tomorrow', icon: '🌦️', rain: 40, maxC: 23, minC: 14 },
    { day: 'Tue', icon: '⛅', rain: 20, maxC: 24, minC: 13 },
    { day: 'Wed', icon: '☀️', rain: 10, maxC: 25, minC: 14 },
    { day: 'Thu', icon: '🌧️', rain: 70, maxC: 21, minC: 13 },
    { day: 'Fri', icon: '⛅', rain: 25, maxC: 23, minC: 14 }
  ]
};

const offlinePresets = {
  nairobi: { ...state },
  kericho: {
    shortName: 'Kericho',
    city: 'Kericho, Kenya',
    lat: -0.37,
    lon: 35.28,
    tempC: 19,
    feelsC: 19,
    humidity: 78,
    wind: 11,
    uv: 5,
    pressure: 1018,
    sunrise: '06:23',
    sunset: '18:30',
    desc: 'Light Rain Showers',
    icon: '🌦️',
    forecast: [
      { day: 'Tomorrow', icon: '🌧️', rain: 80, maxC: 19, minC: 11 },
      { day: 'Tue', icon: '🌦️', rain: 60, maxC: 20, minC: 11 },
      { day: 'Wed', icon: '⛅', rain: 30, maxC: 21, minC: 12 },
      { day: 'Thu', icon: '🌧️', rain: 75, maxC: 19, minC: 11 },
      { day: 'Fri', icon: '🌦️', rain: 50, maxC: 20, minC: 12 }
    ]
  },
  mombasa: {
    shortName: 'Mombasa',
    city: 'Mombasa, Kenya',
    lat: -4.04,
    lon: 39.67,
    tempC: 30,
    feelsC: 34,
    humidity: 74,
    wind: 19,
    uv: 9,
    pressure: 1012,
    sunrise: '06:05',
    sunset: '18:15',
    desc: 'Sunny & Breezy',
    icon: '☀️',
    forecast: [
      { day: 'Tomorrow', icon: '☀️', rain: 10, maxC: 31, minC: 24 },
      { day: 'Tue', icon: '⛅', rain: 20, maxC: 30, minC: 24 },
      { day: 'Wed', icon: '☀️', rain: 10, maxC: 31, minC: 25 },
      { day: 'Thu', icon: '🌦️', rain: 45, maxC: 29, minC: 24 },
      { day: 'Fri', icon: '☀️', rain: 15, maxC: 30, minC: 24 }
    ]
  }
};

currentDateEl.textContent = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});

function formatTemp(c) {
  if (isCelsius) return `${Math.round(c)}°C`;
  return `${Math.round((c * 9) / 5 + 32)}°F`;
}

function getUVLabel(uv) {
  if (uv <= 2) return `${uv} (Low)`;
  if (uv <= 5) return `${uv} (Mod)`;
  if (uv <= 7) return `${uv} (High)`;
  return `${uv} (Very High)`;
}

function mapWeatherCode(code) {
  if (code === 0) return { desc: 'Clear Sky', icon: '☀️' };
  if (code <= 3) return { desc: 'Partly Cloudy', icon: '⛅' };
  if (code <= 48) return { desc: 'Foggy', icon: '🌫️' };
  if (code <= 67) return { desc: 'Rain Showers', icon: '🌧️' };
  if (code <= 77) return { desc: 'Snowfall', icon: '❄️' };
  return { desc: 'Thunderstorms', icon: '⛈️' };
}

function renderSavedCities() {
  savedCitiesEl.innerHTML = '';
  savedCities.forEach((city) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'city-chip';
    chip.innerHTML = `${city} <span class="remove-chip" data-city="${city}">×</span>`;

    chip.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-chip')) {
        savedCities = savedCities.filter((c) => c !== city);
        localStorage.setItem('weather_saved_cities', JSON.stringify(savedCities));
        renderSavedCities();
        updateSaveButton();
      } else {
        fetchByCityName(city);
      }
    });

    savedCitiesEl.appendChild(chip);
  });
}

function updateSaveButton() {
  const isSaved = savedCities.some(
    (c) => c.toLowerCase() === state.shortName.toLowerCase()
  );
  saveCityBtn.textContent = isSaved ? '★ Saved' : '☆ Save';
}

function renderDashboard(sourceLabel) {
  cityNameEl.textContent = state.city;
  coordsTextEl.textContent = `Lat: ${state.lat.toFixed(2)}, Lon: ${state.lon.toFixed(2)}`;
  weatherIconEl.textContent = state.icon;
  tempValueEl.textContent = formatTemp(state.tempC);
  weatherDescEl.textContent = state.desc;
  feelsValEl.textContent = formatTemp(state.feelsC);
  humidityValEl.textContent = `${state.humidity}%`;
  windValEl.textContent = `${state.wind} km/h`;
  uvValEl.textContent = getUVLabel(state.uv);
  pressureValEl.textContent = `${state.pressure} hPa`;
  sunValEl.textContent = `${state.sunrise} / ${state.sunset}`;
  statusMsg.textContent = sourceLabel;

  forecastListEl.innerHTML = '';
  state.forecast.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'forecast-row';
    row.innerHTML = `
      <span class="forecast-day">${item.day}</span>
      <span>${item.icon}</span>
      <span class="forecast-rain">💧 ${item.rain}%</span>
      <span class="forecast-temps">${formatTemp(item.maxC)} <span>/ ${formatTemp(item.minC)}</span></span>
    `;
    forecastListEl.appendChild(row);
  });

  updateSaveButton();
}

async function fetchWeatherByCoords(lat, lon, displayTitle, shortName) {
  statusMsg.textContent = `Loading live forecast for ${displayTitle}...`;

  try {
    const url = `https://open-meteo.com{lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset&timezone=auto&forecast_days=6`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API unavailable');
    const data = await res.json();

    const cur = data.current;
    const daily = data.daily;
    const mapped = mapWeatherCode(cur.weather_code);

    const next5Days = [];
    for (let i = 1; i <= 5; i++) {
      const dateObj = new Date(daily.time[i] + 'T00:00:00');
      const dayLabel =
        i === 1
          ? 'Tomorrow'
          : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const dayWeather = mapWeatherCode(daily.weather_code[i]);

      next5Days.push({
        day: dayLabel,
        icon: dayWeather.icon,
        rain: daily.precipitation_probability_max[i] ?? 0,
        maxC: daily.temperature_2m_max[i],
        minC: daily.temperature_2m_min[i]
      });
    }

    state = {
      shortName,
      city: displayTitle,
      lat,
      lon,
      tempC: cur.temperature_2m,
      feelsC: cur.apparent_temperature,
      humidity: cur.relative_humidity_2m,
      wind: Math.round(cur.wind_speed_10m),
      uv: Math.round(daily.uv_index_max[0] ?? 5),
      pressure: Math.round(cur.surface_pressure),
      sunrise: daily.sunrise[0].split('T')[1],
      sunset: daily.sunset[0].split('T')[1],
      desc: mapped.desc,
      icon: mapped.icon,
      forecast: next5Days
    };

    renderDashboard('Live Open-Meteo Satellite Data');
  } catch (err) {
    const key = shortName.toLowerCase();
    if (offlinePresets[key]) {
      state = { ...offlinePresets[key] };
    } else {
      state.shortName = shortName;
      state.city = displayTitle;
      state.lat = lat;
      state.lon = lon;
    }
    renderDashboard('Offline Reference Data (Preview Mode)');
  }
}

async function fetchByCityName(query) {
  const clean = query.trim();
  if (!clean) return;
  statusMsg.textContent = `Searching "${clean}"...`;

  try {
    const geoRes = await fetch(
      `https://open-meteo.com{encodeURIComponent(clean)}&count=1`
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      statusMsg.textContent = `City "${clean}" not found.`;
      return;
    }

    const place = geoData.results[0];
    await fetchWeatherByCoords(
      place.latitude,
      place.longitude,
      `${place.name}, ${place.country}`,
      place.name
    );
  } catch (err) {
    const key = clean.toLowerCase();
    if (offlinePresets[key]) {
      state = { ...offlinePresets[key] };
    } else {
      state = {
        ...state,
        shortName: clean.charAt(0).toUpperCase() + clean.slice(1),
        city: clean.charAt(0).toUpperCase() + clean.slice(1)
      };
    }
    renderDashboard('Offline Reference Data (Preview Mode)');
  }
}

gpsBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    statusMsg.textContent = 'GPS not supported on this browser.';
    return;
  }

  statusMsg.textContent = 'Detecting your GPS coordinates...';
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      fetchWeatherByCoords(
        pos.coords.latitude,
        pos.coords.longitude,
        'My Current Location',
        'My Location'
      );
    },
    () => {
      statusMsg.textContent = 'Location permission denied. Showing Kericho.';
      fetchByCityName('Kericho');
    }
  );
});

saveCityBtn.addEventListener('click', () => {

const exists = savedCities.some(
(c) => c.toLowerCase() === state.shortName.toLowerCase()
);
if (!exists) {
savedCities.push(state.shortName);
localStorage.setItem('weather_saved_cities', JSON.stringify(savedCities));
renderSavedCities();
updateSaveButton();
}
});
searchForm.addEventListener('submit', (e) => {
e.preventDefault();
fetchByCityName(cityInput.value);
cityInput.value = '';
});
unitToggle.addEventListener('click', () => {
isCelsius = !isCelsius;
renderDashboard(statusMsg.textContent);
});
renderSavedCities();
fetchByCityName('Nairobi');