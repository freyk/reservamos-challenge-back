import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CityWeather } from './weather/city-weather.interface';
import { PlacesService } from './places/places.service';
import { WeatherService } from './weather/weather.service';
import { Place } from './places/place.interface';

type DailyWeather = Array<{
  date: string;
  temp_min: number;
  temp_max: number;
  condition: string;
}>;

type WeatherListItem = Array<{
  dt: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{ description: string }>;
}>;

type ErrorResponse = {
  response: {
    message: string;
    status: number;
  };
};

@Injectable()
export class AppService {
  private readonly API_URL = 'https://search.reservamos.mx/api/v2/places';

  constructor(
    private readonly placesService: PlacesService,
    private readonly weatherService: WeatherService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getCitiesWithWeather(query: string): Promise<CityWeather[]> {
    const cacheKey = `cities_${query}`;
    const cachedData = await this.cacheManager.get<CityWeather[]>(cacheKey);

    if (cachedData) {
      console.log(`✅ City data retrieved from cache: ${cacheKey}`);
      return cachedData;
    }

    try {
      const cities = await this.placesService.getCities(query);
      if (cities.length === 0) {
        throw new HttpException('No cities found', HttpStatus.NOT_FOUND);
      }

      const citiesWithWeather = await Promise.all(
        cities.map(async (city: Place): Promise<CityWeather> => {
          try {
            const weather = await this.weatherService.getWeatherByCoords(
              city.lat,
              city.long,
            );

            return {
              name: city.display,
              slug: city.city_slug,
              country: city.country,
              state: city.state,
              lat: city.lat,
              long: city.long,
              temperature:
                (weather.list as WeatherListItem)[0]?.main.temp || 'N/A',
              condition:
                (weather.list as WeatherListItem)[0]?.weather[0]?.description ||
                'N/A',
            };
          } catch {
            return {
              ...city,
              name: city.display,
              temperature: 'N/A',
              condition: 'N/A',
            };
          }
        }),
      );

      await this.cacheManager.set(cacheKey, citiesWithWeather);
      console.log(`🌍 External API call for: ${cacheKey}`);

      return citiesWithWeather;
    } catch (error) {
      throw new HttpException(
        (error as ErrorResponse).response.message || 'Error retrieving data',
        (error as ErrorResponse).response.status ||
          HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getWeatherByCity(query: string): Promise<any> {
    const cities = await this.getCitiesWithWeather(query);
    const city = cities.shift();

    let dailyWeather: DailyWeather = [];

    if (!city) {
      return;
    }

    const weather = await this.weatherService.getWeatherByCoords(
      city.lat,
      city.long,
    );

    dailyWeather = (weather.list as WeatherListItem).reduce(
      (acc: DailyWeather, current) => {
        const date = new Date(current.dt * 1000).toISOString().split('T')[0];
        if (!acc.some((entry) => entry.date === date)) {
          acc.push({
            date,
            temp_min: current.main.temp_min,
            temp_max: current.main.temp_max,
            condition: current.weather[0].description,
          });
        }
        return acc;
      },
      [] as DailyWeather,
    );

    return {
      city_name: city?.name ?? 'Unknown',
      daily_weather: dailyWeather,
    };
  }
}
