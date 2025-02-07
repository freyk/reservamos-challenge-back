import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Place } from './place.interface';

@Injectable()
export class PlacesService {
  private readonly API_URL = 'https://search.reservamos.mx/api/v2/places';

  constructor(private readonly httpService: HttpService) {}

  async getCities(query: string): Promise<Place[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<Place[]>(this.API_URL, {
          params: { q: query },
        }),
      );

      return response.data.filter(
        (place: Place) => place.result_type === 'city',
      );
    } catch {
      throw new HttpException(
        'Error retrieving cities',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
