import { getWeatherData } from '@/lib/weather'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function WeatherPage() {
  let weather: Awaited<ReturnType<typeof getWeatherData>> | null = null
  let weatherError: string | null = null
  try {
    weather = await getWeatherData()
  } catch (e) {
    weatherError = e instanceof Error ? e.message : 'Failed to load weather'
  }

  const condition = weather ? (weather.current.weatherCode === 0 ? 'Sunny' : weather.current.weatherCode <= 3 ? 'Cloudy' : 'Rainy') : '—'

  return (
    <div className="flex flex-col pt-16 lg:pt-0">
      <div className="border-b border-gray-200 bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Weather & Climate</h1>
          <p className="mt-2 text-gray-600">
            Stay informed with real-time weather forecasts and climate insights
          </p>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {weatherError && (
            <Alert className="mb-6 bg-yellow-50 border-yellow-200">
              <AlertDescription className="text-yellow-800">
                ⚠️ {weatherError} Showing sample data below.
              </AlertDescription>
            </Alert>
          )}

          {weather && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7-Day Forecast</h2>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3 mb-8">
                {weather.forecast.map((day, idx) => (
                  <Card key={idx} className="text-center">
                    <CardContent className="pt-6">
                      <p className="font-semibold mb-2">{day.day}</p>
                      <p className="text-2xl font-bold text-blue-600 mb-2">{day.temp}°C</p>
                      <p className="text-sm text-gray-600 mb-2">{day.condition}</p>
                      <p className="text-xs text-gray-500">Rain: {day.precipitation}mm</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Conditions (Nairobi region)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Conditions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temperature</span>
                      <span className="font-semibold">{weather.current.temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Humidity</span>
                      <span className="font-semibold">{weather.current.humidity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wind Speed</span>
                      <span className="font-semibold">{weather.current.windSpeed} km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conditions</span>
                      <span className="font-semibold">{condition}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Farming Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex gap-3">
                        <span className="text-green-600 font-bold">✓</span>
                        <span className="text-gray-700">
                          Check the 7-day forecast above and plan irrigation for dry days.
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-green-600 font-bold">✓</span>
                        <span className="text-gray-700">
                          Apply fungicides before expected rainfall to prevent crop diseases.
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-green-600 font-bold">✓</span>
                        <span className="text-gray-700">
                          Delay fertilizer application until after rainfall for better absorption.
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {!weather && !weatherError && (
            <p className="text-gray-600">Loading weather data...</p>
          )}

          <div className="mt-8">
            <Link href="/protected/advisory">
              <Button variant="outline">Browse Advisory Library</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
