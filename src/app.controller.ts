import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('cities')
  async getCitiesWithWeather(@Query('q') query: string) {
    return this.appService.getCitiesWithWeather(query);
  }

  @Get('weather')
  async getWeather(@Query('city') city: string): Promise<any> {
    return this.appService.getWeatherByCity(city);
  }
}
