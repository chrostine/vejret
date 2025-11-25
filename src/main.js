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

// **********************
//  VIS/ SKJUL SVG-LAG
// **********************

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

// **********************
//  WEATHER API DEL
// **********************

const API_KEY = '7d7d91c7a4a22c8e8bb2501ab77012e9'
const DEFAULT_CITY = 'Copenhagen,DK'

async function fetchWeather(city = DEFAULT_CITY) {
  const url =
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=da`

  const res = await fetch(url)
  if (!res.ok) {
    console.error('Fejl ved hentning af vejr', res.status, res.statusText)
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
    // klar himmel → sol
    return 'sol1'
  }

  if (main === 'Clouds') {
    if (desc.includes('few') || desc.includes('scattered')) {
      // let/ spredt skydække
      return 'sol sky glowSkygge'
    }
    if (desc.includes('broken') || desc.includes('overcast')) {
      // mere massiv skydække
      return 'sky morkSkygge'
    }
    return 'sky morkSkygge'
  }

  if (main === 'Rain' || main === 'Drizzle') {
    if (desc.includes('light') || desc.includes('shower')) {
      // lidt regn, måske sol
      return 'sol sky glowSkygge regn1'
    }
    // kraftigere regn
    return 'morkSky regn1'
  }

  if (main === 'Thunderstorm') {
    return 'morkSky lyn_x5F_regn'
  }

  if (main === 'Snow') {
    return 'sky morkSkygge sne'
  }

  if (main === 'Mist' || main === 'Fog' || main === 'Haze') {
    return 'overskyet'
  }

  // fallback
  return 'sky morkSkygge'
}

// Skriv tekst under ikonet
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

// Hent vejret og opdater ikon + tekst
async function loadAndShowWeather(city) {
  const data = await fetchWeather(city)
  const preset = mapWeatherToIconPreset(data)
  console.log('API-vejrtype → preset:', data?.weather?.[0], '→', preset)
  showWeatherParts(preset)
  updateWeatherText(data)
}

// **********************
//  INIT VED SIDEN LOAD
// **********************

hideAllWeatherElements()

// Kald API’en når siden loader
loadAndShowWeather()   // bruger DEFAULT_CITY

// (valgfrit) genindlæs fx hvert 10. minut
// setInterval(() => loadAndShowWeather(), 10 * 60 * 1000)
