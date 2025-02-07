import { Test, TestingModule } from '@nestjs/testing';
import { PlacesService } from './places.service';
import { HttpModule } from '@nestjs/axios';

describe('PlacesService', () => {
  let service: PlacesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [PlacesService],
    }).compile();

    service = module.get<PlacesService>(PlacesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of cities', async () => {
    const result = await service.getCities('monterrey');
    expect(Array.isArray(result)).toBe(true);
  });
});
