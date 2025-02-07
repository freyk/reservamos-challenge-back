import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { HttpModule } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

describe('WeatherService', () => {
  let service: WeatherService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        WeatherService,
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return weather from cache if available', async () => {
    const mockData = { temp: 25 };
    jest.spyOn(cacheManager, 'get').mockResolvedValue(mockData);

    const result = await service.getWeatherByCoords(
      '25.6866142',
      '-100.3161126',
    );
    expect(result).toEqual(mockData);
  });

  it('should make an API call if no cache is available', async () => {
    jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
    jest.spyOn(cacheManager, 'set').mockResolvedValue(undefined);

    const result = await service.getWeatherByCoords(
      '25.6866142',
      '-100.3161126',
    );
    expect(result).toBeDefined();
  });
});
