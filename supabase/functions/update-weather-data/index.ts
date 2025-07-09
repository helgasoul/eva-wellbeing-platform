import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LocationData {
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  region?: string;
}

interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    pressure: number;
    uv_index: number;
    wind_speed: number;
    weather_condition: string;
  };
  daily: {
    temperature_max: number;
    temperature_min: number;
    precipitation: number;
    sunrise: string;
    sunset: string;
  };
  air_quality: {
    pm2_5: number;
    pm10: number;
    o3: number;
    no2: number;
    aqi: number;
  };
  biometric_factors: {
    barometric_trend: 'rising' | 'falling' | 'stable';
    heat_index: number;
    comfort_level: 'low' | 'moderate' | 'high' | 'extreme';
    menopause_impact_score: number;
  };
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🌤️ Starting daily weather update...')

    // Получаем всех активных пользователей с местоположением
    const { data: userLocations, error: locationError } = await supabase
      .from('user_locations')
      .select('user_id, location_data')
      .eq('is_active', true)

    if (locationError) {
      console.error('Error fetching user locations:', locationError)
      throw locationError
    }

    console.log(`📍 Found ${userLocations?.length || 0} users with locations`)

    const today = new Date().toISOString().split('T')[0]
    let successCount = 0
    let errorCount = 0

    // Обрабатываем каждого пользователя
    for (const userLocation of userLocations || []) {
      try {
        const location = userLocation.location_data as LocationData
        
        // Проверяем, есть ли уже данные за сегодня
        const { data: existingRecord } = await supabase
          .from('daily_weather_records')
          .select('id')
          .eq('user_id', userLocation.user_id)
          .eq('date', today)
          .single()

        if (existingRecord) {
          console.log(`⏭️ Weather data already exists for user ${userLocation.user_id}`)
          continue
        }

        // Получаем текущие погодные данные
        const weatherData = await getCurrentWeatherData(location)

        // Сохраняем в базу данных
        const { error: insertError } = await supabase
          .from('daily_weather_records')
          .insert({
            user_id: userLocation.user_id,
            date: today,
            location_data: location,
            weather_data: weatherData
          })

        if (insertError) {
          console.error(`Error saving weather data for user ${userLocation.user_id}:`, insertError)
          errorCount++
        } else {
          console.log(`✅ Weather data saved for user ${userLocation.user_id}`)
          successCount++
        }

        // Добавляем небольшую задержку, чтобы не перегружать API
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`Error processing user ${userLocation.user_id}:`, error)
        errorCount++
      }
    }

    console.log(`🎉 Weather update completed: ${successCount} success, ${errorCount} errors`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Weather update completed: ${successCount} success, ${errorCount} errors`,
        processed: userLocations?.length || 0,
        successCount,
        errorCount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Weather update function error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function getCurrentWeatherData(location: LocationData): Promise<WeatherData> {
  const baseUrl = 'https://api.open-meteo.com/v1'
  const airQualityUrl = 'https://air-quality-api.open-meteo.com/v1'

  // Основные погодные данные
  const weatherResponse = await fetch(
    `${baseUrl}/forecast?` +
    `latitude=${location.latitude}&longitude=${location.longitude}&` +
    `current=temperature_2m,relative_humidity_2m,pressure_msl,uv_index,wind_speed_10m,weather_code&` +
    `daily=temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset&` +
    `timezone=${location.timezone}&forecast_days=1`
  )

  if (!weatherResponse.ok) {
    throw new Error(`Weather API error: ${weatherResponse.status}`)
  }

  const weatherData = await weatherResponse.json()

  // Качество воздуха
  let airQualityData = null
  try {
    const airQualityResponse = await fetch(
      `${airQualityUrl}/air-quality?` +
      `latitude=${location.latitude}&longitude=${location.longitude}&` +
      `current=pm2_5,pm10,ozone,nitrogen_dioxide,european_aqi&` +
      `timezone=${location.timezone}`
    )

    if (airQualityResponse.ok) {
      airQualityData = await airQualityResponse.json()
    }
  } catch (error) {
    console.warn('Air quality data unavailable:', error)
  }

  return processWeatherData(weatherData, airQualityData)
}

function processWeatherData(weatherData: any, airQualityData: any): WeatherData {
  const current = weatherData.current
  const daily = weatherData.daily
  
  const temperature = current.temperature_2m
  const humidity = current.relative_humidity_2m
  const pressure = current.pressure_msl

  // Определение тенденции барометрического давления
  let barometricTrend: 'rising' | 'falling' | 'stable' = 'stable'
  if (pressure > 1020) barometricTrend = 'rising'
  else if (pressure < 1010) barometricTrend = 'falling'

  // Расчет индекса жары
  const heatIndex = calculateHeatIndex(temperature, humidity)

  // Оценка уровня комфорта
  const comfortLevel = calculateComfortLevel(temperature, humidity, current.wind_speed_10m)

  // Расчет влияния на симптомы менопаузы
  const menopauseImpactScore = calculateMenopauseImpact({
    temperature,
    humidity,
    pressure,
    uvIndex: current.uv_index,
    airQuality: airQualityData?.current?.pm2_5 || 0,
    barometricTrend
  })

  return {
    current: {
      temperature: Math.round(temperature),
      humidity: humidity,
      pressure: Math.round(pressure),
      uv_index: current.uv_index || 0,
      wind_speed: Math.round(current.wind_speed_10m || 0),
      weather_condition: getWeatherDescription(current.weather_code)
    },
    daily: {
      temperature_max: Math.round(daily.temperature_2m_max[0]),
      temperature_min: Math.round(daily.temperature_2m_min[0]),
      precipitation: daily.precipitation_sum[0] || 0,
      sunrise: daily.sunrise[0],
      sunset: daily.sunset[0]
    },
    air_quality: {
      pm2_5: airQualityData?.current?.pm2_5 || 0,
      pm10: airQualityData?.current?.pm10 || 0,
      o3: airQualityData?.current?.ozone || 0,
      no2: airQualityData?.current?.nitrogen_dioxide || 0,
      aqi: airQualityData?.current?.european_aqi || 0
    },
    biometric_factors: {
      barometric_trend: barometricTrend,
      heat_index: heatIndex,
      comfort_level: comfortLevel,
      menopause_impact_score: menopauseImpactScore
    }
  }
}

function calculateHeatIndex(temperature: number, humidity: number): number {
  if (temperature < 27) return temperature
  
  const T = temperature
  const RH = humidity
  
  const HI = -8.78469475556 + 
             1.61139411 * T +
             2.33854883889 * RH +
             -0.14611605 * T * RH +
             -0.012308094 * T * T +
             -0.0164248277778 * RH * RH +
             0.002211732 * T * T * RH +
             0.00072546 * T * RH * RH +
             -0.000003582 * T * T * RH * RH
  
  return Math.round(Math.max(HI, T))
}

function calculateComfortLevel(
  temperature: number, 
  humidity: number, 
  windSpeed: number
): 'low' | 'moderate' | 'high' | 'extreme' {
  const heatIndex = calculateHeatIndex(temperature, humidity)
  
  if (heatIndex >= 40 || temperature <= 0) return 'extreme'
  if (heatIndex >= 32 || temperature <= 5) return 'high'
  if (heatIndex >= 27 || temperature <= 10) return 'moderate'
  return 'low'
}

function calculateMenopauseImpact(factors: {
  temperature: number;
  humidity: number;
  pressure: number;
  uvIndex: number;
  airQuality: number;
  barometricTrend: string;
}): number {
  let score = 0

  // Высокая температура усиливает приливы
  if (factors.temperature > 25) score += (factors.temperature - 25) * 2
  if (factors.temperature > 30) score += 20

  // Высокая влажность усиливает дискомфорт
  if (factors.humidity > 60) score += (factors.humidity - 60) / 2

  // Изменения давления влияют на головные боли и настроение
  if (factors.barometricTrend === 'falling') score += 15
  if (factors.barometricTrend === 'rising') score += 5

  // Низкое давление
  if (factors.pressure < 1010) score += 10

  // Высокий УФ-индекс
  if (factors.uvIndex > 6) score += factors.uvIndex

  // Качество воздуха
  if (factors.airQuality > 25) score += 10
  if (factors.airQuality > 50) score += 20

  return Math.min(Math.round(score), 100)
}

function getWeatherDescription(code: number): string {
  const weatherCodes: { [key: number]: string } = {
    0: 'Ясно',
    1: 'Преимущественно ясно',
    2: 'Переменная облачность',
    3: 'Облачно',
    45: 'Туман',
    48: 'Изморозь',
    51: 'Слабая морось',
    53: 'Умеренная морось',
    55: 'Сильная морось',
    61: 'Слабый дождь',
    63: 'Умеренный дождь',
    65: 'Сильный дождь',
    71: 'Слабый снег',
    73: 'Умеренный снег',
    75: 'Сильный снег',
    95: 'Гроза'
  };
  return weatherCodes[code] || 'Неизвестно';
}