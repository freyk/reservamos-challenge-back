import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/cities?q=monterrey (GET) should return a list of cities with weather', async () => {
    const response = await request(app.getHttpServer())
      .get('/cities?q=monterrey')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('name');
    expect(response.body[0]).toHaveProperty('temperature');
  });

  it('/weather?lat=25.6866142&lon=-100.3161126 (GET) should return weather data', async () => {
    const response = await request(app.getHttpServer())
      .get('/weather?lat=25.6866142&lon=-100.3161126')
      .expect(200);

    expect(response.body).toHaveProperty('list');
    expect(response.body.list).toBeInstanceOf(Array);
  });

  afterAll(async () => {
    await app.close();
  });
});
