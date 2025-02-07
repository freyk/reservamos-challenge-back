import { HttpService } from '@nestjs/axios';
import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Weather } from './weather.interface';

@Injectable()
export class WeatherService {
  private readonly API_URL = 'https://api.openweathermap.org/data/2.5/forecast';
  private readonly API_KEY = '0eebd1fcf852d29ca0340c5c451d4c9a';

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getWeatherByCoords(lat: string, lon: string): Promise<Weather> {
    const cacheKey = `weather_${lat}_${lon}`;
    const cachedWeather = await this.cacheManager.get<Weather>(cacheKey);

    if (cachedWeather) {
      console.log(`✅ Data from cache: ${cacheKey}`);
      return cachedWeather;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(this.API_URL, {
          params: {
            lat,
            lon,
            appid: this.API_KEY,
            units: 'metric',
            lang: 'es',
          },
        }),
      );

      await this.cacheManager.set(cacheKey, response.data, 3600);
      console.log(`🌍 External API call for: ${cacheKey}`);

      return response.data as Weather;
    } catch {
      throw new HttpException(
        'Error retrieving weather',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
