// Open-Meteo free API – no key required
// https://open-meteo.com/en/docs

const DEFAULT_LAT = -1.2921
const DEFAULT_LON = 36.8219

export interface WeatherForecastDay {
  day: string
  temp: number
  condition: string
  precipitation: number
}

export interface WeatherCurrent {
  temperature: number
  humidity: number
  windSpeed: number
  weatherCode: number
}

export interface WeatherData {
  current: WeatherCurrent
  forecast: WeatherForecastDay[]
}

function weatherCodeToCondition(code: number): string {
  if (code === 0) return 'Clear'
  if (code <= 3) return 'Cloudy'
  if (code <= 49) return 'Foggy'
  if (code <= 59) return 'Drizzle'
  if (code <= 69) return 'Rainy'
  if (code <= 79) return 'Snow'
  if (code <= 84) return 'Rainy'
  if (code <= 94) return 'Snow'
  return 'Thunderstorm'
}

export async function getWeatherData(lat = DEFAULT_LAT, lon = DEFAULT_LON): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Africa/Nairobi&past_days=0&forecast_days=7`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error('Weather fetch failed')
  const data = await res.json()

  const current = data.current as {
    temperature_2m: number
    relative_humidity_2m: number
    wind_speed_10m: number
    weather_code: number
  }
  const daily = data.daily as {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    weather_code: number[]
    precipitation_sum: number[]
  }

  const forecast: WeatherForecastDay[] = daily.time.slice(0, 7).map((_, i) => ({
    day: new Date(daily.time[i]).toLocaleDateString('en-US', { weekday: 'short' }),
    temp: Math.round((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2),
    condition: weatherCodeToCondition(daily.weather_code[i]),
    precipitation: Math.round((daily.precipitation_sum[i] ?? 0) * 10) / 10,
  }))

  return {
    current: {
      temperature: Math.round(current.temperature_2m),
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      weatherCode: current.weather_code,
    },
    forecast,
  }
}
