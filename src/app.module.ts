// Core
import { Module } from '@nestjs/common';
import { CacheModuleOptions } from '@nestjs/cache-manager';

// Modules
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';
import { PlacesModule } from './places/places.module';
import { WeatherModule } from './weather/weather.module';

// Controllers
import { AppController } from './app.controller';

// Services
import { AppService } from './app.service';

@Module({
  imports: [
    HttpModule,
    CacheModule.register<CacheModuleOptions>({
      isGlobal: true,
    }),
    PlacesModule,
    WeatherModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
