import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PlacesService } from './places.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [PlacesService],
  exports: [PlacesService],
})
export class PlacesModule {}
