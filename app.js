// ============================================
// SKYLINE WEATHER — PREMIUM EDITION
// Full-featured weather engine
// ============================================

const API_KEY = "3340332a5cc822f566cac18b32ad98c4";

// ─── DOM REFS ───
const cityInput       = document.getElementById("cityInput");
const searchBtn       = document.getElementById("searchBtn");
const locationBtn     = document.getElementById("locationBtn");
const weatherContent  = document.getElementById("weatherContent");
const emptyState      = document.getElementById("emptyState");
const loadingEl       = document.getElementById("loading");
const errorBox        = document.getElementById("error");

const cityNameEl      = document.getElementById("cityName");
const countryEl       = document.getElementById("country");
const coordText       = document.getElementById("coordText");
const tempEl          = document.getElementById("temp");
const feelsLikeEl     = document.getElementById("feelsLike");
const tempMaxEl       = document.getElementById("tempMax");
const tempMinEl       = document.getElementById("tempMin");
const descriptionEl   = document.getElementById("description");
const weatherIconEl   = document.getElementById("weatherIcon");
const conditionTagEl  = document.getElementById("conditionTag");
const sunriseEl       = document.getElementById("sunrise");
const sunsetEl        = document.getElementById("sunset");
const lastUpdatedEl   = document.getElementById("lastUpdated");

const humidityEl      = document.getElementById("humidity");
const humidityBar     = document.getElementById("humidityBar");
const windEl          = document.getElementById("wind");
const windDirEl       = document.getElementById("windDir");
const visibilityEl    = document.getElementById("visibility");
const visLabelEl      = document.getElementById("visLabel");
const pressureEl      = document.getElementById("pressure");
const cloudsEl        = document.getElementById("clouds");
const cloudDescEl     = document.getElementById("cloudDesc");
const seaLevelEl      = document.getElementById("seaLevel");

const forecastContainer = document.getElementById("forecastContainer");
const hourlyContainer   = document.getElementById("hourlyContainer");

const gustEl          = document.getElementById("gust");
const dewPointEl      = document.getElementById("dewPoint");
const uvEl            = document.getElementById("uv");
const aqiEl           = document.getElementById("aqi");
const rainChanceEl    = document.getElementById("rainChance");
const precipEl        = document.getElementById("precip");
const narrativeText   = document.getElementById("narrativeText");

const celsiusBtn      = document.getElementById("celsiusBtn");
const fahrenheitBtn   = document.getElementById("fahrenheitBtn");
const currentTimeEl   = document.getElementById("currentTime");
const currentDateEl   = document.getElementById("currentDate");
const appBg           = document.getElementById("appBg");

// ─── STATE ───
let currentWeatherData = null;
let currentUnit = "C";

// ─── PARTICLES ───
function initParticles() {
  const container = document.getElementById("particles");
  for (let i = 0; i < 18; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const size = Math.random() * 3 + 1;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      animation-duration:${Math.random()*20+12}s;
      animation-delay:-${Math.random()*20}s;
      opacity:${Math.random()*0.5+0.1};
    `;
    container.appendChild(p);
  }
}
initParticles();

// ─── CLOCK ───
function updateClock() {
  const now = new Date();
  currentTimeEl.textContent = now.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
  currentDateEl.textContent = now.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" });
}
setInterval(updateClock, 1000);
updateClock();

// ─── ICONS ───
function getWeatherIcon(code) {
  if (code >= 200 && code < 300) return "⛈️";
  if (code >= 300 && code < 400) return "🌦️";
  if (code >= 500 && code < 504) return "🌧️";
  if (code === 511) return "🌨️";
  if (code >= 520 && code < 600) return "🌧️";
  if (code >= 600 && code < 700) return "❄️";
  if (code >= 700 && code < 800) return "🌫️";
  if (code === 800) return "☀️";
  if (code === 801) return "🌤️";
  if (code === 802) return "⛅";
  if (code >= 803) return "☁️";
  return "🌤️";
}

// ─── BACKGROUND ───
function setBackground(code, isDay = true) {
  appBg.className = "app-bg";
  if (!isDay) { appBg.classList.add("night"); return; }
  if (code >= 200 && code < 300) appBg.classList.add("thunder");
  else if (code >= 300 && code < 600) appBg.classList.add("rain");
  else if (code >= 600 && code < 700) appBg.classList.add("snow");
  else if (code >= 700 && code < 800) appBg.classList.add("mist");
  else if (code === 800) appBg.classList.add("clear");
  else appBg.classList.add("clouds");
}

// ─── LOADING / ERROR ───
function showLoading() {
  loadingEl.classList.remove("hidden");
  weatherContent.classList.add("hidden");
  emptyState.classList.add("hidden");
  errorBox.classList.add("hidden");
}
function hideLoading() { loadingEl.classList.add("hidden"); }
function showError(msg) {
  errorBox.classList.remove("hidden");
  errorBox.textContent = "⚠️ " + msg;
  weatherContent.classList.add("hidden");
}
function hideError() { errorBox.classList.add("hidden"); }

// ─── TEMP UTILS ───
function toF(c) { return c * 9/5 + 32; }
function displayTemp(c) { return currentUnit === "C" ? Math.round(c) : Math.round(toF(c)); }
function tempUnit() { return currentUnit === "C" ? "°C" : "°F"; }

// ─── WIND DIRECTION ───
function windDirection(deg) {
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

// ─── VISIBILITY LABEL ───
function visLabel(km) {
  if (km >= 10) return "Excellent";
  if (km >= 7) return "Good";
  if (km >= 4) return "Moderate";
  if (km >= 1) return "Poor";
  return "Very Poor";
}

// ─── CLOUD DESCRIPTION ───
function cloudDesc(pct) {
  if (pct < 10) return "Clear";
  if (pct < 30) return "Mostly Clear";
  if (pct < 60) return "Partly Cloudy";
  if (pct < 85) return "Mostly Cloudy";
  return "Overcast";
}

// ─── UV INDEX ───
function uvLabel(uvi) {
  if (uvi <= 2) return "Low";
  if (uvi <= 5) return "Moderate";
  if (uvi <= 7) return "High";
  if (uvi <= 10) return "Very High";
  return "Extreme";
}

// ─── DEW POINT ESTIMATE ───
function calcDewPoint(tempC, humidity) {
  // Magnus formula approximation
  const a = 17.27, b = 237.7;
  const alpha = (a * tempC / (b + tempC)) + Math.log(humidity / 100);
  return (b * alpha / (a - alpha)).toFixed(1);
}

// ─── RAIN CHANCE from forecast ───
function calcRainChance(forecastList) {
  const upcoming = forecastList.slice(0, 8);
  const maxPop = Math.max(...upcoming.map(f => (f.pop || 0) * 100));
  return Math.round(maxPop) + "%";
}

// ─── NARRATIVE ───
function buildNarrative(current, forecastList) {
  const code = current.weather[0].id;
  const temp = current.main.temp;
  const humidity = current.main.humidity;
  const wind = current.wind.speed;
  const city = current.name;

  let feeling = temp > 35 ? "scorching hot" : temp > 28 ? "warm and humid" : temp > 20 ? "pleasantly mild" : temp > 10 ? "cool" : "cold";
  let weatherDesc = current.weather[0].description;

  // Look at next 24h for precipitation
  const rainSoon = forecastList.slice(0, 8).some(f => f.weather[0].id >= 300 && f.weather[0].id < 700);
  let rainMsg = rainSoon ? " Rain or precipitation is expected within the next 24 hours — carry an umbrella." : "";

  let windMsg = wind > 10 ? ` Winds are strong at ${Math.round(wind)} m/s, so expect gusty conditions outdoors.` : "";
  let humidMsg = humidity > 80 ? " High humidity levels may make it feel warmer than the actual temperature." : humidity < 30 ? " Low humidity — stay hydrated." : "";

  return `Currently in ${city}, conditions are ${weatherDesc} with ${feeling} temperatures around ${Math.round(temp)}°C.${rainMsg}${windMsg}${humidMsg} Overall, plan your outdoor activities accordingly.`;
}

// ─── SUNRISE / SUNSET FORMAT ───
function formatTime(unixTs, offsetSec) {
  const date = new Date((unixTs + offsetSec) * 1000);
  return date.toUTCString().slice(17, 22);
}

// ─── FETCH BY CITY ───
async function fetchWeatherByCity(city) {
  if (!city || city.trim().length < 2) { showError("Please enter a valid city name."); return; }
  try {
    hideError(); showLoading();
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.trim())}&appid=${API_KEY}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city.trim())}&appid=${API_KEY}&units=metric`)
    ]);
    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();
    if (currentData.cod !== 200) throw new Error(currentData.message || "City not found.");
    currentWeatherData = { current: currentData, forecast: forecastData };
    updateUI();
  } catch (e) {
    showError(e.message);
  } finally {
    hideLoading();
  }
}

// ─── FETCH BY COORDS ───
async function fetchWeatherByCoords(lat, lon) {
  try {
    hideError(); showLoading();
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
    ]);
    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();
    currentWeatherData = { current: currentData, forecast: forecastData };
    updateUI();
  } catch (e) {
    showError("Unable to fetch weather for your location.");
  } finally {
    hideLoading();
  }
}

// ─── MAIN UI UPDATE ───
function updateUI() {
  if (!currentWeatherData) return;
  const { current, forecast } = currentWeatherData;
  const code = current.weather[0].id;
  const nowTs = Math.floor(Date.now() / 1000);
  const isDay = nowTs > current.sys.sunrise && nowTs < current.sys.sunset;

  weatherContent.classList.remove("hidden");
  emptyState.classList.add("hidden");

  setBackground(code, isDay);

  // Location
  cityNameEl.textContent = current.name;
  countryEl.textContent = current.sys.country;
  coordText.textContent = `${current.coord.lat.toFixed(2)}°N, ${current.coord.lon.toFixed(2)}°E`;

  // Temperature
  tempEl.textContent = displayTemp(current.main.temp);
  feelsLikeEl.textContent = displayTemp(current.main.feels_like);
  tempMaxEl.textContent = displayTemp(current.main.temp_max);
  tempMinEl.textContent = displayTemp(current.main.temp_min);

  // Description
  descriptionEl.textContent = current.weather[0].description;
  weatherIconEl.textContent = getWeatherIcon(code);
  conditionTagEl.textContent = current.weather[0].description;

  // Sun times
  const offset = current.timezone;
  sunriseEl.textContent = formatTime(current.sys.sunrise, offset);
  sunsetEl.textContent = formatTime(current.sys.sunset, offset);

  // Last updated
  const updatedAt = new Date(current.dt * 1000);
  lastUpdatedEl.textContent = "Updated: " + updatedAt.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });

  // Stats
  humidityEl.textContent = current.main.humidity + "%";
  humidityBar.style.width = current.main.humidity + "%";

  windEl.textContent = Math.round(current.wind.speed) + " m/s";
  windDirEl.textContent = windDirection(current.wind.deg || 0);

  const visKm = (current.visibility / 1000).toFixed(1);
  visibilityEl.textContent = visKm + " km";
  visLabelEl.textContent = visLabel(parseFloat(visKm));

  pressureEl.textContent = current.main.pressure;

  cloudsEl.textContent = (current.clouds?.all || 0) + "%";
  cloudDescEl.textContent = cloudDesc(current.clouds?.all || 0);

  seaLevelEl.textContent = current.main.sea_level || current.main.pressure;

  // Insights strip
  gustEl.textContent = current.wind.gust ? Math.round(current.wind.gust) + " m/s" : "N/A";
  const dp = calcDewPoint(current.main.temp, current.main.humidity);
  dewPointEl.textContent = displayTemp(parseFloat(dp)) + "°";
  uvEl.textContent = "N/A"; // UV not in free tier
  aqiEl.textContent = "Good"; // placeholder

  const rainChance = calcRainChance(forecast.list);
  rainChanceEl.textContent = rainChance;

  // Precipitation from rain/snow field
  const rain1h = current.rain?.["1h"] || current.snow?.["1h"] || 0;
  precipEl.textContent = rain1h ? rain1h.toFixed(1) + " mm" : "0 mm";

  // Narrative
  narrativeText.textContent = buildNarrative(current, forecast.list);

  // Forecast
  buildForecast(forecast.list);

  // Hourly
  buildHourly(forecast.list);
}

// ─── 5-DAY FORECAST ───
function buildForecast(list) {
  forecastContainer.innerHTML = "";
  // Pick one reading per day (closest to noon)
  const days = {};
  list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const key = date.toLocaleDateString("en-US");
    const hour = date.getHours();
    if (!days[key] || Math.abs(hour - 12) < Math.abs(new Date(days[key].dt * 1000).getHours() - 12)) {
      days[key] = item;
    }
  });

  const entries = Object.values(days).slice(0, 5);
  entries.forEach((day, i) => {
    const date = new Date(day.dt * 1000);
    const dayName = i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "long" });
    const pop = Math.round((day.pop || 0) * 100);

    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <div class="fc-left">
        <div class="fc-icon">${getWeatherIcon(day.weather[0].id)}</div>
        <div>
          <div class="fc-day">${dayName}</div>
          <div class="fc-desc">${day.weather[0].description}</div>
        </div>
      </div>
      <div class="fc-right">
        <div class="fc-max">${displayTemp(day.main.temp_max)}°</div>
        <div class="fc-min">${displayTemp(day.main.temp_min)}°</div>
        ${pop > 0 ? `<div class="fc-pop">💧 ${pop}%</div>` : ""}
      </div>
    `;
    forecastContainer.appendChild(card);
  });
}

// ─── HOURLY FORECAST ───
function buildHourly(list) {
  hourlyContainer.innerHTML = "";
  list.slice(0, 8).forEach(item => {
    const date = new Date(item.dt * 1000);
    const time = date.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
    const pop = Math.round((item.pop || 0) * 100);

    const card = document.createElement("div");
    card.className = "hourly-card";
    card.innerHTML = `
      <div class="hc-time">${time}</div>
      <div class="hc-icon">${getWeatherIcon(item.weather[0].id)}</div>
      <div class="hc-desc">${item.weather[0].description}</div>
      <div>
        <div class="hc-temp">${displayTemp(item.main.temp)}°</div>
        ${pop > 0 ? `<div class="hc-pop">💧 ${pop}%</div>` : ""}
      </div>
    `;
    hourlyContainer.appendChild(card);
  });
}

// ─── GEOLOCATION ───
function detectLocation(initialLoad = false) {
  if (!navigator.geolocation) {
    if (initialLoad) fetchWeatherByCity("Hyderabad");
    else showError("Geolocation is not supported by your browser.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
    () => { if (initialLoad) fetchWeatherByCity("Hyderabad"); else showError("Location access denied."); },
    { timeout: 7000 }
  );
}

// ─── EVENTS ───
searchBtn.addEventListener("click", () => fetchWeatherByCity(cityInput.value));
cityInput.addEventListener("keydown", e => { if (e.key === "Enter") fetchWeatherByCity(cityInput.value); });
locationBtn.addEventListener("click", () => detectLocation(false));

document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    cityInput.value = chip.dataset.city;
    fetchWeatherByCity(chip.dataset.city);
  });
});

celsiusBtn.addEventListener("click", () => {
  if (currentUnit === "C") return;
  currentUnit = "C";
  celsiusBtn.classList.add("active");
  fahrenheitBtn.classList.remove("active");
  updateUI();
});

fahrenheitBtn.addEventListener("click", () => {
  if (currentUnit === "F") return;
  currentUnit = "F";
  fahrenheitBtn.classList.add("active");
  celsiusBtn.classList.remove("active");
  updateUI();
});

// ─── STARTUP ───
window.addEventListener("load", () => detectLocation(true));