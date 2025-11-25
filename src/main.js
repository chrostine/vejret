
import './style.css'

const WEATHER_IDS = [
  'sol',
  'vind',
  'sne',
  'regn1',
  'lyn_x5F_regn',
  'overskyet',
  'morkSky',
  'sky',
  'morkSkygge',
  'glowSkygge',
  'sol1',
]

function getEl(id) {
  return document.getElementById(id)
}

function setVisible(id, visible) {
  const el = getEl(id)
  if (!el) return

  if (visible) {
    el.classList.remove('hidden')
  } else {
    el.classList.add('hidden')
  }
}
function hideAllWeatherElements() {
  WEATHER_IDS.forEach(id => setVisible(id, false))
}

function showWeatherParts(partsString) {
  hideAllWeatherElements()

  const ids = partsString.split(' ').filter(Boolean)
  ids.forEach(id => setVisible(id, true))
}

window.enableSemanticIcon = function (partsToEnable) {
  showWeatherParts(partsToEnable)
}

// --------------------------------------
//  WEATHER API
// --------------------------------------

const API_KEY = 'd5d7678dc16f0c0d6044768ea7540ad8'
const DEFAULT_CITY = 'Copenhagen,DK'

async function fetchWeather(city = DEFAULT_CITY) {
  const url =
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city,
    )}&appid=${API_KEY}&units=metric&lang=da`

  const res = await fetch(url)
  if (!res.ok) {
    console.error('Fejl ved hentning af vejr (by):', res.status, res.statusText)
    return null
  }

  const data = await res.json()
  return data
}

async function fetchWeatherByCoords(lat, lon) {
  const url =
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=da`

  const res = await fetch(url)
  if (!res.ok) {
    console.error('Fejl ved hentning af vejr (coords):', res.status, res.statusText)
    return null
  }

  const data = await res.json()
  return data
}

function mapWeatherToIconPreset(weatherData) {
  if (!weatherData || !weatherData.weather || !weatherData.weather.length) {
    return 'sky morkSkygge'
  }

  const w = weatherData.weather[0]
  const main = w.main
  const desc = (w.description || '').toLowerCase()

  if (main === 'Clear') {
    return 'sol1'
  }

  if (main === 'Clouds') {
    if (desc.includes('few') || desc.includes('scattered')) {

      return 'sol sky glowSkygge'
    }
    if (desc.includes('broken') || desc.includes('overcast')) {

      return 'morkSky overskyet'
    }
    return 'sky morkSkygge'
  }

  if (main === 'Rain' || main === 'Drizzle') {
    if (desc.includes('light') || desc.includes('shower')) {
      return 'sol sky glowSkygge regn1'
    }
    return 'morkSky regn1'
  }

  if (main === 'Thunderstorm') {
    return 'morkSky lyn_x5F_regn'
  }

  if (main === 'Snow') {
    return 'sky morkSkygge sne'
  }

  if (main === 'Mist' || main === 'Fog' || main === 'Haze') {
    return 'morkSky overskyet'
  }

  // fallback
  return 'sky morkSkygge'
}

// --------------------------------------
//  OPDATER TEKST
// --------------------------------------
function updateWeatherText(weatherData) {
  const locEl = document.getElementById('weatherLocation')
  const descEl = document.getElementById('weatherDescription')
  const tempEl = document.getElementById('weatherTemp')

  if (!weatherData) {
    if (descEl) descEl.textContent = 'Kunne ikke hente vejret 😅'
    return
  }

  const name = weatherData.name
  const country = weatherData.sys?.country
  const temp = Math.round(weatherData.main?.temp)
  const desc = weatherData.weather?.[0]?.description

  if (locEl) locEl.textContent = `${name}, ${country}`
  if (descEl) descEl.textContent = desc
  if (tempEl) tempEl.textContent = `${temp}°C`
}

async function loadAndShowWeather(city) {
  const data = await fetchWeather(city)
  const preset = mapWeatherToIconPreset(data)
  console.log('API-vejrtype → preset:', data?.weather?.[0], '→', preset)
  showWeatherParts(preset)
  updateWeatherText(data)
}

// --------------------------------------
//  GEOLOCATION 
// --------------------------------------
function getUserPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation er ikke understøttet i denne browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        })
      },
      err => {
        reject(err)
      },
    )
  })
}

async function initWeather() {
  hideAllWeatherElements()

  try {
    const { lat, lon } = await getUserPosition()
    console.log('Brugerens lokation:', lat, lon)

    const data = await fetchWeatherByCoords(lat, lon)
    const preset = mapWeatherToIconPreset(data)
    console.log('API-vejrtype (coords) → preset:', data?.weather?.[0], '→', preset)

    showWeatherParts(preset)
    updateWeatherText(data)
  } catch (err) {
    console.warn('Kunne ikke få brugerens lokation, bruger fallback city:', err)
    await loadAndShowWeather()
  }
}

window.refreshWeatherFromLocation = function () {
  initWeather()
}
initWeather()
